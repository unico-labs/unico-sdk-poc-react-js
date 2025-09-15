import requests
from bs4 import BeautifulSoup
import re
import json
import subprocess
import os
from datetime import datetime

# ===============================
# Settings
# ===============================
URL = "https://devcenter.unico.io/idcloud/integracao/sdk/integracao-sdks/sdk-web/release-notes"
DEPENDENCY = "unico-webframe"
REPO_PATH = "."  # Path to the local repository

# ===============================
# 1️⃣ Fetch version + date from the website
# ===============================
response = requests.get(URL)
soup = BeautifulSoup(response.text, "html.parser")
div = soup.find("div", class_="flex-1 z-1 max-w-full break-words text-start justify-self-start leading-snug")

site_version = None
release_date = None

if div:
    text_content = div.get_text(strip=True)
    match = re.search(r"Versão\s+([\d.]+)\s*-\s*(\d{2}/\d{2}/\d{4})", text_content)
    if match:
        site_version = match.group(1)
        release_date = match.group(2)

if not site_version:
    print("❌ Could not capture the version from the website")
    # Export empty outputs for GitHub Actions
    print("::set-output name=pr_url::")
    print("::set-output name=version::")
    print("::set-output name=release_date::")
    exit(0)

print(f"📦 Latest version on the website: {site_version}")
print(f"🗓️ Release date: {release_date}")

# ===============================
# 2️⃣ Read package.json from the target repo
# ===============================
package_json_path = os.path.join(REPO_PATH, "package.json")
with open(package_json_path, "r", encoding="utf-8") as f:
    package_json = json.load(f)

current_version = package_json["dependencies"].get(DEPENDENCY)
print(f"📂 Current version in package.json: {current_version}")

# ===============================
# 3️⃣ Update if necessary
# ===============================
if current_version != site_version:
    package_json["dependencies"][DEPENDENCY] = site_version
    with open(package_json_path, "w", encoding="utf-8") as f:
        json.dump(package_json, f, indent=2, ensure_ascii=False)

    print(f"✅ Updated {DEPENDENCY} to version {site_version}")

    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    branch = f"update-{DEPENDENCY}-v{site_version}-{timestamp}"
    tag = f"{DEPENDENCY}-v{site_version}"

    # Create branch, commit, push
    subprocess.run(["git", "checkout", "-b", branch], check=True)
    subprocess.run(["git", "config", "user.name", "github-actions"], check=True)
    subprocess.run(["git", "config", "user.email", "github-actions@github.com"], check=True)
    subprocess.run(["git", "add", "package.json"], check=True)
    subprocess.run(["git", "commit", "-m", f"chore: bump {DEPENDENCY} to v{site_version}"], check=True)
    subprocess.run(["git", "push", "origin", branch], check=True)

    # Create tag
    subprocess.run(["git", "tag", "-a", tag, "-m", f"Release {DEPENDENCY} {site_version} ({release_date})"], check=True)
    subprocess.run(["git", "push", "origin", tag], check=True)

    # Create PR using GitHub CLI and capture URL
    body = f"""
Automatic update of `{DEPENDENCY}` to version **{site_version}** 📅 Release date: **{release_date}** 🔗 [Official Release Notes]({URL})
    """

    result = subprocess.run([
        "gh", "pr", "create",
        "--title", f"Update {DEPENDENCY} to v{site_version}",
        "--body", body,
        "--head", branch,
        "--json", "url",
        "--jq", ".url"
    ], check=True, capture_output=True, text=True)

    pr_url = result.stdout.strip()
    print(f"🔗 Pull Request criada: {pr_url}")

    # Export outputs for GitHub Actions
    print(f"::set-output name=pr_url::{pr_url}")
    print(f"::set-output name=version::{site_version}")
    print(f"::set-output name=release_date::{release_date}")

else:
    print("🔄 Already at the latest version, nothing to do.")
    print("::set-output name=pr_url::")
    print("::set-output name=version::")
    print("::set-output name=release_date::")
