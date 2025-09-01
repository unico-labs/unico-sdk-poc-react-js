import requests
from bs4 import BeautifulSoup
import re
import json
import subprocess
import os

# ===============================
# Configurações
# ===============================
URL = "https://devcenter.unico.io/idcloud/integracao/sdk/integracao-sdks/sdk-web/release-notes"
DEPENDENCY = "unico-webframe"
REPO_PATH = "target-repo"  # Repo destino clonado pelo workflow

# ===============================
# 1️⃣ Buscar versão + data no site
# ===============================
response = requests.get(URL)
soup = BeautifulSoup(response.text, "html.parser")
div = soup.find("div", class_="flex-1 z-1 max-w-full break-words text-start justify-self-start leading-snug")

versao_site = None
data_release = None

if div:
    texto = div.get_text(strip=True)
    match = re.search(r"Versão\s+([\d.]+)\s*-\s*(\d{2}/\d{2}/\d{4})", texto)
    if match:
        versao_site = match.group(1)
        data_release = match.group(2)

if not versao_site:
    print("❌ Não foi possível capturar a versão do site")
    exit(0)

print("📦 Versão mais recente no site:", versao_site)
print("🗓️ Data da release:", data_release)

# ===============================
# 2️⃣ Ler package.json do repo destino
# ===============================
package_json_path = os.path.join(REPO_PATH, "package.json")
with open(package_json_path, "r", encoding="utf-8") as f:
    package_json = json.load(f)

versao_atual = package_json["dependencies"].get(DEPENDENCY)
print(f"📂 Versão atual no package.json: {versao_atual}")

# ===============================
# 3️⃣ Atualizar se necessário
# ===============================
if versao_atual != versao_site:
    # Atualiza a versão
    package_json["dependencies"][DEPENDENCY] = versao_site
    with open(package_json_path, "w", encoding="utf-8") as f:
        json.dump(package_json, f, indent=2, ensure_ascii=False)

    print(f"✅ Atualizado {DEPENDENCY} para versão {versao_site}")

    # Entrar na pasta do repo destino
    os.chdir(REPO_PATH)
    branch = f"update-{DEPENDENCY}-v{versao_site}"
    tag = f"{DEPENDENCY}-v{versao_site}"

    # Criar branch, commit e push
    subprocess.run(["git", "checkout", "-b", branch], check=True)
    subprocess.run(["git", "config", "user.name", "github-actions"], check=True)
    subprocess.run(["git", "config", "user.email", "github-actions@github.com"], check=True)
    subprocess.run(["git", "add", "package.json"], check=True)
    subprocess.run(["git", "commit", "-m", f"chore: bump {DEPENDENCY} to v{versao_site}"], check=True)
    subprocess.run(["git", "push", "origin", branch], check=True)

    # Criar tag
    subprocess.run(["git", "tag", "-a", tag, "-m", f"Release {DEPENDENCY} {versao_site} ({data_release})"], check=True)
    subprocess.run(["git", "push", "origin", tag], check=True)

    # Criar PR usando GitHub CLI
    body = f"""
    Atualização automática do `{DEPENDENCY}` para versão **{versao_site}**  
    📅 Data de release: **{data_release}**  
    🔗 [Release Notes oficiais]({URL})
    """

    subprocess.run([
        "gh", "pr", "create",
        "--title", f"Update {DEPENDENCY} to v{versao_site}",
        "--body", body,
        "--head", branch
    ], check=True)

else:
    print("🔄 Já está na versão mais recente, nada a fazer.")
