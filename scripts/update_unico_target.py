import requests
from bs4 import BeautifulSoup
import re
import json
import subprocess
import os
import time

# ===============================
# Settings
# ===============================
URL = "https://devcenter.unico.io/unico-idcloud/by-client-integration/pt/sdk/sdks-disponiveis/sdk-web/release-notes"
DEPENDENCY = "unico-webframe"
REPO_PATH = "."  # Path to the local repository

# ===============================
# Step 1: Fetch version, release date and notes from the website
# ===============================
response = requests.get(URL)
soup = BeautifulSoup(response.text, "html.parser")

site_version = None
release_date = None
# ✅ Bloco Corrigido: Lógica de extração e formatação das notas
raw_notes = [] # Lista temporária para coletar os textos brutos

header = soup.find(
    lambda tag: tag.name in ["h2", "h3", "h4"] and "Versão" in tag.get_text()
)

if header:
    match = re.search(r"Versão\s+([\d.]+)\s*-\s*(\d{2}/\d{2}/\d{4})", header.get_text())
    if match:
        site_version = match.group(1)
        release_date = match.group(2)

    for sib in header.find_next_siblings():
        if sib.name in ["h2", "h3", "h4"] and "Versão" in sib.get_text():
            break
        
        # 1. Coleta todos os textos brutos da lista <ul>
        if sib.name in ["ul", "ol"]:
            for li in sib.find_all("li"):
                note_text = li.get_text(strip=True)
                if note_text:
                    raw_notes.append(note_text)
        elif sib.name in ["p", "div"]:
            note_text = sib.get_text(strip=True)
            if note_text:
                raw_notes.append(note_text)

# 2. Processa a lista bruta para agrupar sub-itens
release_notes = []
if raw_notes:
    # Adiciona o primeiro item como ponto de partida
    release_notes.append(raw_notes[0])
    
    # Itera sobre o restante das notas para verificar se são sub-itens
    for i in range(1, len(raw_notes)):
        current_note = raw_notes[i]
        
        # Se a nota atual começar com um padrão numérico (ex: "117 - ..."),
        # ela é um sub-item e deve ser anexada à nota anterior.
        if re.match(r'^\d+\s*-\s*', current_note):
            release_notes[-1] += f"\n      {current_note}" # Adiciona com indentação
        else:
            # Caso contrário, é um novo item principal
            release_notes.append(current_note)

if not site_version:
    print("❌ Could not capture the version from the website")
    exit(0)

print(f"📦 Latest version on the website: {site_version}")
print(f"🗓️ Release date: {release_date}")

if release_notes:
    print("\n📝 Release notes found:")
    # O print agora mostrará a formatação correta no console
    formatted_notes_for_print = '\n'.join(f"- {note}" for note in release_notes)
    print(formatted_notes_for_print)
else:
    print("⚠️ No release notes were found.")

# ===============================
# Step 2: Read package.json from the target repository
# ===============================
package_json_path = os.path.join(REPO_PATH, "package.json")
with open(package_json_path, "r", encoding="utf-8") as f:
    package_json = json.load(f)

current_version = package_json["dependencies"].get(DEPENDENCY)
print(f"📂 Current version in package.json: {current_version}")

# ===============================
# Step 3: Update dependency if necessary
# ===============================
if current_version != site_version:
    package_json["dependencies"][DEPENDENCY] = site_version
    with open(package_json_path, "w", encoding="utf-8") as f:
        json.dump(package_json, f, indent=2, ensure_ascii=False)

    print(f"✅ Updated {DEPENDENCY} to version {site_version}")

    timestamp = int(time.time())
    branch = f"update-{DEPENDENCY}-v{site_version}-{timestamp}"
    tag = f"{DEPENDENCY}-v{site_version}-{timestamp}"

    subprocess.run(["git", "checkout", "-b", branch], check=True)
    subprocess.run(["git", "config", "user.name", "github-actions"], check=True)
    subprocess.run(["git", "config", "user.email", "github-actions@github.com"], check=True)
    subprocess.run(["git", "add", "package.json"], check=True)
    subprocess.run(["git", "commit", "-m", f"chore: bump {DEPENDENCY} to v{site_version}"], check=True)
    subprocess.run(["git", "push", "origin", branch], check=True)
    subprocess.run(["git", "tag", "-a", tag, "-m", f"Release {DEPENDENCY} {site_version} ({release_date})"], check=True)
    subprocess.run(["git", "push", "origin", tag], check=True)

    # Cria a string formatada para o corpo do PR e para o Slack
    formatted_notes_body = '\n'.join(f"- {note}" for note in release_notes)

    body = f"""
    Automatic update of `{DEPENDENCY}` to version **{site_version}** 📅 Release date: **{release_date}** 🔗 [Official Release Notes]({URL})

    📝 Release notes:
    {formatted_notes_body}
    """

    pr_process = subprocess.run([
        "gh", "pr", "create",
        "--title", f"Update {DEPENDENCY} to v{site_version}",
        "--body", body,
        "--head", branch
    ], check=True, capture_output=True, text=True)

    pr_url = pr_process.stdout.strip()
    print(f"✅ Pull Request created: {pr_url}")

    # ✅ Bloco Corrigido: Exporta as variáveis para o GitHub Actions de forma correta e unificada
    github_output_path = os.getenv("GITHUB_OUTPUT")
    if github_output_path:
        with open(github_output_path, "a") as f:
            f.write(f"updated=true\n")
            f.write(f"new_version={site_version}\n")
            f.write(f"release_date={release_date}\n")
            f.write(f"pr_url={pr_url}\n")
            # Usa a string já formatada e a encapsula corretamente para o GITHUB_OUTPUT
            f.write("release_notes<<EOF\n")
            f.write(f"{formatted_notes_body}\n")
            f.write("EOF\n")

else:
    print("🔄 Already at the latest version, nothing to do.")
    github_output_path = os.getenv("GITHUB_OUTPUT")
    if github_output_path:
        with open(github_output_path, "a") as f:
            f.write(f"updated=false\n")