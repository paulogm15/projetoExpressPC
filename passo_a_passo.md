🚀 Sistema de Gestão de Notebooks com Reconhecimento Facial
Este projeto é um sistema de controle de empréstimos de hardware que utiliza biometria facial para identificação automática de alunos. A solução é composta por uma aplicação Next.js (Frontend/API) e um Bridge de IA em Python (OpenCV/Face Recognition).

🏗️ Arquitetura e Fluxo de Dados
O sistema opera através de uma comunicação entre dois servidores:

Next.js (Porta 3000): Gerencia o banco de dados PostgreSQL via Prisma, autenticação de usuários e regras de negócio de empréstimos.

Python Bridge (Porta 5000): Atua como um microserviço de visão computacional, transformando imagens em vetores numéricos (embeddings) de 128 dimensões.

🔧 Requisitos Prévios
Node.js v18+

Python 3.10 ou 3.11 (recomendado para maior compatibilidade com Dlib)

Visual Studio Build Tools (com carga de trabalho "Desenvolvimento para Desktop com C++")

PostgreSQL (configurado no .env do Next.js)

🐍 1. Configuração do Motor Python (Bridge)
Navegue até a pasta do bridge (ex: python-bridge) e siga os comandos abaixo:

Inicialização do Ambiente
PowerShell

# Criação do ambiente virtual
python -m venv .venv

# Ativação (Windows)
.\.venv\Scripts\Activate.ps1
Instalação de Dependências
A ordem de instalação é crítica para garantir a compatibilidade dos modelos no Windows:

PowerShell

# 0. instale para conseguir a funcionalidade do Face-recognition
acesse esse link e instale
https://github.com/sachadee/Dlib/blob/main/dlib-20.0.0-cp313-cp313-win_amd64.whl

# 1. Compatibilidade com bibliotecas legadas
pip install "setuptools<70.0.0"

# 2. Bibliotecas de compilação e suporte
pip install cmake dlib

# 3. Bibliotecas de IA e Servidor Web
pip install face-recognition opencv-python Flask numpy

# 4. Modelos pré-treinados
pip install git+https://github.com/ageitgey/face_recognition_models
Inicialização
PowerShell

python camera_service.py
O servidor deve exibir: 🚀 Servidor de IA rodando em http://localhost:5000.



----------------------------------------------------------------------------------------
💻 2. Configuração do Projeto Next.js
Instalação de pacotes:

Bash

npm install
Sincronização do Banco de Dados:
Certifique-se de que o campo embedding na model Aluno está definido como Float[].

Bash

npx prisma generate
npx prisma db push
Execução:

Bash

npm run dev
🛠️ Detalhes da Implementação
Cadastro de Alunos
Ao cadastrar um novo aluno, o sistema envia a foto para o Python, recebe o vetor de 128 números e o armazena no campo embedding do Prisma.

Reconhecimento no Empréstimo
No formulário de empréstimo, ao capturar a foto:

O sistema obtém o embedding do rosto atual via Python.

O Next.js recupera todos os alunos ativos do banco.

É calculada a Distância Euclidiana entre o rosto atual e os salvos no banco.

Se a distância for menor que 0.6, a matrícula e o nome do aluno são preenchidos automaticamente na interface.

🔍 Troubleshooting (Resolução de Problemas)
Erro: No module named 'pkg_resources': Resolvido instalando setuptools<70.0.0.

Erro: Please install face_recognition_models: Resolvido forçando o caminho dos modelos via os.environ no script Python.

Matrícula não preenche automaticamente: Verifique se o servidor Python está rodando e se a rota /api/face/recognize está retornando o JSON correto do aluno.