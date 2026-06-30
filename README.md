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

O sistema emprega um modelo desacoplado via banco em cache (Redis Singleton Pattern):

```
CSV (515MB) Local
    │
    ▼
[Script Python ETL - process_csv.py]
    ├── Lê CSV em blocos (50k linhas) usando itertuples (Otimizado)
    ├── Calcula KPIs e agregações
    ├── Serializa como JSON
    └── Persiste no Redis remoto ou local (TTL 24h)
             │
             ▼
        [Cache Redis] ◄──────────────┐ (Singleton via lib/redis.ts)
             │                       │
             ▼                       │
    [Rotas API Next.js] ─────────────┘
             │ (Com sistema unificado de Filtros)
             ▼
    [Frontend Next.js] (Dashboard Premium)
             │
             ▼
        [Railway / Vercel]
     (Deploy Web via GitHub)
```

## Pré-requisitos

- Python 3.8+
- Node.js 18+
- Redis (local ou em nuvem como Railway/Upstash)
- Arquivo de dados CSV (`export_midea_31_13.csv`)

## Configuração e Fluxo Híbrido Recomendado

A forma mais ágil de atualizar os dados do projeto sem precisar hospedar um ambiente Python pesado na nuvem é utilizar o **Fluxo Híbrido**: rodar o ETL local apontando para o seu banco da nuvem.

### 1. Configurar Ambiente

Crie o seu `.env`:
```bash
cp .env.example .env
```

Edite `.env` e defina sua URL do Redis público/remoto da sua nuvem (Railway/Upstash):
```
REDIS_URL=redis://default:sua-senha-aqui@host.com:porta
```

### 2. Executar Processo ETL (Local)

Instale as dependências Python localmente na pasta `/etl` e rode o script apontando para sua nuvem:
```bash
cd etl
pip install -r requirements.txt
python process_csv.py
```

Isso irá de imediato (via vetorização com `itertuples` de alta performance):
- Processar o CSV local sem afetar os custos de memória do seu servidor web;
- Armazenar as métricas na sua base em nuvem remotamente.

### 3. Executar/Deploy Next.js 

Instale as dependências Node na raiz e faça seu deploy.

```bash
npm install
npm run dev # Teste local
```

Ou simplesmente dê o `git push`. A hospedagem na nuvem executará o build Typescript automaticamente e consultará os dados no mesmo Redis. O CSV não precisa (e nem deve) subir no repositório.

## Rotas da API e Navegação

**Páginas Front-end:**
- **/** - Dashboard executivo com KPIs
- **/brands** - Análise de marcas com métricas de preços dinâmicas
- **/marketplaces** - Desempenho de canais de venda
- **/alerts** - Alertas automatizados

**Endpoints API (Sistema Unificado em `lib/filters.ts`):**
- `GET /api/summary` - Estatísticas gerais
- `GET /api/brands` - Agregações de mercado
- `GET /api/marketplaces` - Estatísticas de lojas online
- `GET /api/categories` - Dados segmentados
- `GET /api/timeline` - Evolução histórica de SKUs
- `GET /api/alerts` - Sistema de alertas
- `GET /api/top_skus` - Listagem em volume
- `GET /api/skus` - Métricas detalhadas

> **Nota Arquitetural:** O projeto utiliza um Design Pattern de Singleton em `lib/redis.ts` que reaproveita pools de conexão, suportando um alto tráfego sem derrubar o host com chamadas redundantes.

## Estrutura de Dados

### Campos Processados
| Campo | Descrição |
|-------|-------------|
| TITLE OF MARKETPLACE | Nome do produto no marketplace |
| SPOT PRICE | Preço à vista (usado para cálculo de métricas competitivas) |
| FORWARD PRICE | Preço parcelado |
| BRAND | Nome da marca (Ex: Samsung, Midea) |
| MARKETPLACE | Nome do marketplace |
| CATEGORY | Categoria do produto |
| SKU | Identificador único referencial |

## Solução de Problemas

### Erro de Conexão Redis (NextJS: Failed to type check / 500)
Se houver falhas de Timeout na API ou erros `Cannot find module`, assegure-se de que:
1. O Redis alvo possui as chaves populadas (verifique log do ETL).
2. O cache local `.next` não está com builds antigos. (Limpe a pasta `.next` se necessário rodando `rm -rf .next`).

### Problemas de Memória no ETL Local
O script processa o arquivo pesado usando `chunksize`. Se o seu computador congelar, acesse o script Python e redefina `CHUNK_SIZE` para `10000`.

## Licença

MIT
