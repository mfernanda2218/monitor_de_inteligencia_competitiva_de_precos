# Guia de Execução Local

Este guia fornece instruções passo a passo para rodar o Monitor de Inteligência Competitiva de Preços localmente.

## Pré-requisitos

- **Python 3.8+** - Para executar o script ETL
- **Node.js 18+** - Para rodar o Next.js
- **Redis** - Para cache de dados
- **Git** - Para controle de versão (opcional)

## Passo 1: Instalar e Configurar Redis

### Windows

#### Opção 1: Usar Docker (Recomendado)

```bash
docker run -d -p 6379:6379 redis:latest
```

#### Opção 2: Instalar Redis via Chocolatey

```bash
choco install redis-64
redis-server
```

#### Opção 3: Baixar binário

1. Baixe em: https://github.com/microsoftarchive/redis/releases
2. Extraia e execute `redis-server.exe`

#### Opção 4: Usar Memurai (Alternativa gratuita)

1. Baixe em: https://www.memurai.com/get-memurai
2. Instale e inicie o serviço

### macOS

```bash
brew install redis
brew services start redis
```

### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis
```

### Verificar se Redis está rodando

```bash
redis-cli ping
# Deve retornar: PONG
```

## Passo 2: Configurar Ambiente Python

### 2.1 Criar Ambiente Virtual (se não existir)

```bash
python -m venv .venv
```

### 2.2 Ativar Ambiente Virtual

**Windows (PowerShell):**
```bash
.venv\Scripts\Activate.ps1
```

**Windows (CMD):**
```bash
.venv\Scripts\activate.bat
```

**macOS/Linux:**
```bash
source .venv/bin/activate
```

### 2.3 Instalar Dependências Python

```bash
cd etl
pip install -r requirements.txt
cd ..
```

## Passo 3: Configurar Variáveis de Ambiente

### 3.1 Criar arquivo .env

O projeto já tem um arquivo `.env.example`. Copie para criar o `.env`:

```bash
cp .env.example .env
```

### 3.2 Editar arquivo .env

Edite o arquivo `.env` e configure:

```env
REDIS_URL=redis://localhost:6379
NEXT_PUBLIC_APP_NAME=Monitor de Inteligência Competitiva de Preços
```

**Nota:** Se você estiver usando Redis com senha ou em porta diferente, ajuste a URL:
- `redis://localhost:6379` - Redis local sem senha
- `redis://:senha@localhost:6379` - Redis local com senha
- `redis://host:porta` - Redis remoto

## Passo 4: Instalar Dependências Node.js

### 4.1 Verificar se node_modules existe

O projeto já tem `node_modules`, mas se precisar reinstalar:

```bash
npm install
```

### 4.2 Verificar versões

```bash
node --version  # Deve ser 18+
npm --version
```

## Passo 5: Executar Processo ETL

O script ETL processa o arquivo CSV e armazena os dados no Redis.

### 5.1 Verificar arquivo CSV

Certifique-se que o arquivo `export_midea_31_13.csv` está na raiz do projeto.

### 5.2 Executar o script ETL

```bash
cd etl
python process_csv.py
cd ..
```

### 5.3 O que o script faz:

- Lê o CSV em blocos de 50.000 linhas (eficiente em memória)
- Calcula agregações por marca, marketplace, categoria e SKU
- Armazena os resultados no Redis com TTL de 24 horas
- Mostra progresso com barra de loading

### 5.4 Tempo estimado

- Arquivo de ~500MB: ~5-10 minutos (depende do hardware)

### 5.5 Verificar dados no Redis (opcional)

```bash
redis-cli
> KEYS dashboard:*
> GET dashboard:summary
> EXIT
```

## Passo 6: Iniciar Servidor de Desenvolvimento Next.js

### 6.1 Iniciar o servidor

```bash
npm run dev
```

### 6.2 Acessar a aplicação

Abra o navegador em: http://localhost:3000

### 6.3 Páginas disponíveis

- `/` - Dashboard principal com KPIs
- `/brands` - Análise por marca
- `/marketplaces` - Análise por marketplace
- `/skus` - Top SKUs
- `/timeline` - Linha do tempo de preços
- `/alerts` - Alertas de preços

## Passo 7: Desenvolvimento e Hot Reload

O Next.js suporta hot reload automático. Quando você fizer alterações:

1. Salve o arquivo
2. O navegador atualizará automaticamente
3. Não precisa reiniciar o servidor

## Passo 8: Reexecutar ETL (quando necessário)

Se você atualizar o arquivo CSV ou quiser recarregar os dados:

```bash
cd etl
python process_csv.py
cd ..
```

Os dados no Redis serão substituídos.

## Solução de Problemas

### Erro: "Redis connection refused"

**Causa:** Redis não está rodando

**Solução:**
```bash
# Verificar se Redis está rodando
redis-cli ping

# Se não estiver, inicie o Redis
# Windows: redis-server
# macOS: brew services start redis
# Linux: sudo systemctl start redis
```

### Erro: "Module not found" (Node.js)

**Causa:** Dependências não instaladas

**Solução:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Erro: "No module named 'pandas'" (Python)

**Causa:** Ambiente virtual não ativado ou dependências não instaladas

**Solução:**
```bash
# Ativar ambiente virtual
.venv\Scripts\Activate.ps1  # Windows
source .venv/bin/activate   # macOS/Linux

# Instalar dependências
cd etl
pip install -r requirements.txt
cd ..
```

### Erro: "File not found: export_midea_31_13.csv"

**Causa:** Arquivo CSV não está na raiz do projeto

**Solução:**
- Coloque o arquivo `export_midea_31_13.csv` na raiz do projeto
- Ou atualize o caminho no arquivo `etl/process_csv.py`

### Erro: "Port 3000 already in use"

**Causa:** Outra aplicação usando a porta 3000

**Solução:**
```bash
# Opção 1: Matar processo na porta 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Opção 2: Usar porta diferente
npm run dev -- -p 3001
```

### Erro: "Memory Error" no ETL

**Causa:** Arquivo CSV muito grande para memória disponível

**Solução:**
- O script já usa leitura em blocos, mas se ainda tiver problemas:
- Edite `etl/process_csv.py`
- Reduza `CHUNK_SIZE` de 50000 para um valor menor (ex: 10000)

### Erro: "TypeScript errors"

**Causa:** Erros de tipo após alterações

**Solução:**
```bash
# Limpar cache do Next.js
rm -rf .next

# Reiniciar servidor
npm run dev
```

## Comandos Úteis

### Redis

```bash
# Verificar status
redis-cli ping

# Ver todas as chaves
redis-cli KEYS "*"

# Ver valor de uma chave específica
redis-cli GET dashboard:summary

# Limpar todas as chaves (cuidado!)
redis-cli FLUSHALL

# Ver informações do servidor
redis-cli INFO
```

### Next.js

```bash
# Iniciar desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar produção
npm start

# Verificar erros de lint
npm run lint
```

### Python

```bash
# Ativar ambiente virtual
.venv\Scripts\Activate.ps1  # Windows
source .venv/bin/activate   # macOS/Linux

# Desativar ambiente virtual
deactivate

# Ver pacotes instalados
pip list

# Atualizar pip
pip install --upgrade pip
```

## Estrutura de Arquivos

```
monitor_de_inteligencia_competitiva_de_precos/
├── app/                    # Páginas Next.js
├── etl/                    # Scripts ETL
│   ├── process_csv.py      # Script principal de processamento
│   └── requirements.txt    # Dependências Python
├── .env                    # Variáveis de ambiente (não commitar)
├── .env.example            # Exemplo de variáveis
├── .gitignore              # Arquivos ignorados pelo Git
├── export_midea_31_13.csv  # Arquivo de dados (não commitar)
├── next.config.js          # Configuração Next.js
├── package.json            # Dependências Node.js
└── tsconfig.json           # Configuração TypeScript
```

## Performance e Otimização

### Para desenvolvimento local

- Use Redis local (mais rápido)
- Reduza o CHUNK_SIZE se tiver pouca memória RAM
- Use subset do CSV para testes rápidos

### Para testar com dados menores

Edite `etl/process_csv.py` e limite o número de linhas:

```python
# Adicione após ler o CSV
df = pd.read_csv('../export_midea_31_13.csv', nrows=10000)  # Testar com 10k linhas
```

## Monitoramento

### Ver uso de memória Redis

```bash
redis-cli INFO memory
```

### Ver logs do Next.js

Os logs aparecem diretamente no terminal onde você rodou `npm run dev`.

## Próximos Passos

Após configurar o ambiente local:

1. Execute o ETL para carregar dados iniciais
2. Explore o dashboard em http://localhost:3000
3. Faça alterações no código e veja o hot reload
4. Teste as diferentes páginas e funcionalidades
5. Quando pronto, siga o guia de deploy no Railway

## Suporte

Para problemas ou dúvidas:
- Consulte o README.md para informações do projeto
- Consulte DEPLOYMENT_RAILWAY.md para deploy em produção
- Verifique os logs do terminal para mensagens de erro detalhadas
