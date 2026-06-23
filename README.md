# Monitor de Inteligência Competitiva de Preços

Um dashboard de inteligência competitiva de preços para monitorar preços de produtos em múltiplos marketplaces brasileiros. Construído com Python ETL, Next.js 14 e Redis.

## Funcionalidades

- **Monitoramento de Preços em Tempo Real**: Acompanhe 1,2M+ pontos de preços em múltiplos marketplaces
- **Análise de Marcas**: Compare preços e posicionamento por marca
- **Cobertura de Marketplaces**: Analise o desempenho dos canais e presença da marca
- **Linha do Tempo de Preços**: Gráficos interativos mostrando a evolução dos preços ao longo do tempo
- **Sistema de Alertas**: Detecção automatizada de oportunidades e riscos de preços
- **Interface Premium Dark**: Design moderno glassmorphism com acentos em azul elétrico

## Arquitetura

```
CSV (515MB)
    │
    ▼
[Script Python ETL]
    ├── Lê CSV em blocos (50k linhas)
    ├── Calcula KPIs e agregações
    ├── Serializa como JSON
    └── Persiste no Redis (TTL 24h)
            │
            ▼
       [Cache Redis]
            │
            ▼
    [Rotas API Next.js] ──► [Frontend Next.js]
            │                      │
     /api/summary           Dashboard Premium
     /api/brands            (Gráficos, Tabelas,
     /api/marketplaces       KPIs, Timeline)
     /api/skus
     /api/timeline
     /api/alerts
            │
            ▼
       [Railway]
    (Deploy via GitHub)
```

## Pré-requisitos

- Python 3.8+
- Node.js 18+
- Redis (local ou Railway)
- Arquivo de dados CSV (`export_midea_31_13.csv`)

## Configuração

### 1. Instalar Dependências Python

```bash
cd etl
pip install -r requirements.txt
```

### 2. Instalar Dependências Node.js

```bash
npm install
```

### 3. Configurar Ambiente

```bash
cp .env.example .env
```

Edite `.env` e defina sua URL do Redis:
```
REDIS_URL=redis://localhost:6379
```

### 4. Executar Processo ETL

```bash
cd etl
python process_csv.py
```

Isso irá:
- Ler o CSV em blocos (eficiente em memória)
- Calcular agregações por marca, marketplace, categoria e SKU
- Armazenar resultados no Redis com TTL de 24h

### 5. Iniciar Servidor de Desenvolvimento Next.js

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## Páginas

- **/** - Dashboard executivo com KPIs e navegação rápida
- **/brands** - Análise de marcas com métricas de preços
- **/marketplaces** - Cobertura e desempenho de marketplaces
- **/skus** - Principais SKUs por volume de dados
- **/timeline** - Gráficos interativos de linha do tempo de preços
- **/alerts** - Alertas de oportunidades e riscos de preços

## Rotas da API

- `GET /api/summary` - Estatísticas gerais do dashboard
- `GET /api/brands` - Agregações por marca
- `GET /api/marketplaces` - Agregações por marketplace
- `GET /api/categories` - Dados por categoria
- `GET /api/timeline?sku=XXX` - Linha do tempo de preços para SKU específico
- `GET /api/alerts` - Alertas e oportunidades gerados
- `GET /api/top_skus` - Top 20 SKUs por volume de dados

## Deploy no Railway

### 1. Criar Instância Redis

No dashboard do Railway:
- Clique em "New Project" → "Add a Service"
- Selecione "Redis" nos plugins
- O Railway fornecerá uma URL de conexão Redis

### 2. Deploy do App Next.js

```bash
# Inicializar repositório git
git init
git add .
git commit -m "Commit inicial"

# Criar projeto Railway e vincular
railway login
railway init
railway up

# Definir variáveis de ambiente no dashboard Railway
REDIS_URL=<sua-url-redis-railway>
NEXT_PUBLIC_APP_NAME=Monitor de Inteligência Competitiva de Preços
```

### 3. Executar ETL no Railway (Opcional)

Para ETL automatizado, crie um serviço Railway separado:
- Adicione um novo serviço com builder Python
- Defina o comando de build para instalar requirements
- Defina o comando de start para executar `python etl/process_csv.py`
- Configure como job cron ou serviço one-off

## Estrutura de Dados

### Campos do CSV

| Campo | Tipo | Descrição |
|-------|------|-------------|
| TITLE OF MARKETPLACE | Texto | Nome do produto no marketplace |
| PRODUCT | Texto | Nome do produto padronizado |
| SKU | String | Identificador SKU do produto |
| FAMILY | String | Família do produto |
| COLLECTION DATE | Data | Data de coleta dos dados |
| COLLECTION HOUR | Hora | Hora da coleta |
| EXECUTION HOUR | Hora | Hora de execução |
| SPOT PRICE | Float | Preço à vista |
| FORWARD PRICE | Float | Preço parcelado |
| PRICE FROM | Float | Preço de referência |
| NUMBER OF INSTALLMENTS | Int | Número de parcelas |
| INSTALLMENT VALUE | Float | Valor da parcela |
| BRAND | String | Nome da marca |
| MARKETPLACE | String | Nome do marketplace |
| CATEGORY | String | Categoria do produto |
| SUBCATEGORY | String | Subcategoria do produto |
| SELLER | String | Nome do vendedor |
| COLOR | String | Cor do produto |
| OFFER URL | URL | Link direto da oferta |
| PIX PRICE | Float | Preço PIX |
| ID | UUID | ID único do registro |

### Chaves Redis

- `dashboard:summary` - Estatísticas gerais
- `dashboard:brands` - Agregações por marca
- `dashboard:marketplaces` - Agregações por marketplace
- `dashboard:categories` - Dados por categoria
- `dashboard:timeline:{sku}` - Linha do tempo de preços do SKU
- `dashboard:alerts` - Alertas gerados
- `dashboard:top_skus` - Top 20 SKUs

## Sistema de Design

- **Cores**: Azul Marinho Profundo (`#0A0E1A`), Azul Elétrico (`#00D4FF`), Verde Neon (`#00FF88`), Âmbar (`#FFB800`)
- **Tipografia**: Inter (Google Fonts)
- **Componentes**: Cards glassmorphism com backdrop-blur
- **Gráficos**: Recharts para visualização de dados

## Solução de Problemas

### Erro de Conexão Redis

Certifique-se de que o Redis está rodando:
```bash
redis-cli ping  # Deve retornar PONG
```

### Problemas de Memória no ETL

O script usa leitura em blocos (50k linhas) para lidar com arquivos grandes. Se ainda encontrar problemas de memória, reduza `CHUNK_SIZE` em `etl/process_csv.py`.

### Erros TypeScript Após npm install

Se você ver erros TypeScript após executar `npm install`, reinicie sua IDE ou execute:
```bash
rm -rf .next
npm run dev
```

## Licença

MIT

## Suporte

Para problemas ou dúvidas, consulte o documento de plano de implementação.
