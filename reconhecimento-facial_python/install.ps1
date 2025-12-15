# ==========================================
# Script de instalação do projeto
# ==========================================

Write-Host "🔧 Iniciando instalação do projeto..." -ForegroundColor Cyan

# Verifica se o Python está disponível
python --version
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Python não encontrado no PATH." -ForegroundColor Red
    exit 1
}

# Cria ambiente virtual se não existir
if (!(Test-Path ".venv")) {
    Write-Host "📦 Criando ambiente virtual (.venv)..." -ForegroundColor Yellow
    python -m venv .venv
}

# Ativa o ambiente virtual
Write-Host "⚡ Ativando ambiente virtual..." -ForegroundColor Yellow
. .venv\Scripts\Activate.ps1

# Atualiza pip
Write-Host "⬆ Atualizando pip..." -ForegroundColor Yellow
python -m pip install --upgrade pip

# Instala dependências
Write-Host "📚 Instalando dependências do requirements.txt..." -ForegroundColor Yellow
pip install -r requirements.txt

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao instalar dependências." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Instalação concluída com sucesso!" -ForegroundColor Green
Write-Host "👉 Use .\run.ps1 para iniciar o sistema."

