# Monitor de Inteligência Competitiva de Preços — Plano de Implementação

## Contexto & Análise dos Dados

O arquivo `export_midea_31_13.csv` contém **1.217.408 linhas** (~515 MB) de capturas horárias de preços coletadas de múltiplos marketplaces brasileiros. Os dados abrangem o período de **31/05/2026 a 13/06/2026** (13 dias de rastreio).

### Estrutura do Dataset

| Campo | Tipo | Exemplo |
|---|---|---|
| `TITLE OF MARKETPLACE` | Texto | Nome do produto no marketplace |
| `PRODUCT` | Texto | Nome padronizado do produto |
| `SKU` | String | `42EZVCA12M5` |
| `FAMILY` | String | Família de produto |
| `COLLECTION DATE` | Date | `31/05/2026` |
| `COLLECTION HOUR` | Time | `00:00h` |
| `EXECUTION HOUR` | Time | `00:09` |
| `SPOT PRICE` | Float | `2450.10` (preço à vista) |
| `FORWARD PRICE` | Float | `2579.04` (preço a prazo) |
| `PRICE FROM` | Float | Preço de origem/referência |
| `NUMBER OF INSTALLMENTS` | Int | Número de parcelas |
| `INSTALLMENT VALUE` | Float | Valor da parcela |
| `BRAND` | String | `MIDEA`, `LG`, `ELECTROLUX`, `SAMSUNG`... |
| `MARKETPLACE` | String | `AMAZON`, `ADIAS`, `AMERICANAS`... |
| `CATEGORY` | String | `AR CONDICIONADO`, `REFRIGERADOR`, `MICROONDAS`... |
| `SUBCATEGORY` | String | `HI-WALL`, `TMF`, `FRIGOBAR`... |
| `SELLER` | String | Seller dentro do marketplace |
| `COLOR` | String | Cor do produto |
| `OFFER URL` | URL | Link direto da oferta |
| `PIX PRICE` | Float | Preço no PIX |
| `ID` | UUID | Identificador único do registro |

### Inteligência Extraída (Visão de Diretor)

**Marcas identificadas**: MIDEA, LG, ELECTROLUX, SAMSUNG, PHILCO, BRASTEMP, CONSUL e outras.

**Marketplaces monitorados**: AMAZON, ADIAS, AMERICANAS, CASAS BAHIA, EXTRA, SHOPTIME, PONTOFRIO, MAGALU e outros.

**Categorias**: AR CONDICIONADO (HI-WALL, SPLIT), REFRIGERADOR (TMF, FRIGOBAR, FREEZER), MICROONDAS.

**Frequência de coleta**: A cada 1 hora, 24h por dia, durante 13+ dias.

**KPIs competitivos disponíveis**:
- Diferença de preço MIDEA vs concorrentes por SKU
- Elasticidade de preço ao longo do tempo (variação horária/diária)
- Presença e cobertura por marketplace
- Análise de parcelamento (competitividade no crédito)
- Detecção de promoções/quedas de preço anômalas
- Market share de exposição por categoria
- Índice de competitividade (preço MIDEA vs menor preço do mercado)

---

## Arquitetura da Solução

```
CSV (515MB)
    │
    ▼
[Python ETL Script]
    ├── Lê CSV em chunks (pandas/dask)
    ├── Agrega e computa KPIs
    ├── Serializa como JSON
    └── Persiste no Redis
            │
            ▼
       [Redis Cache]
            │
            ▼
    [Next.js API Routes] ──► [Next.js Frontend]
            │                      │
     /api/summary           Dashboard Premium
     /api/brands            (Charts, Tables,
     /api/marketplaces       KPIs, Timeline)
     /api/skus
     /api/timeline
            │
            ▼
       [Railway]
    (Deploy automático via GitHub)
```

---

## Componentes

### 1. Python ETL (`/etl/`)

#### `etl/process_csv.py`
- Lê o CSV em **chunks de 50k linhas** (memória eficiente)
- Computa os seguintes agregados:
  - **KPIs gerais**: total de registros, período, marcas únicas, SKUs únicos, marketplaces
  - **Por marca**: preço médio spot, mín, máx, variação de preço, cobertura de marketplace
  - **Por marketplace**: ranking de preço por SKU, share de exposição
  - **Por categoria**: mapa de competitividade
  - **Timeline**: evolução diária de preços por SKU (top 20 SKUs)
  - **Alertas**: SKUs onde MIDEA está acima do menor preço de mercado por >10%
  - **Parcelamento**: comparativo de condições de crédito
- Armazena no Redis com TTL de 24h
- Keys Redis:
  - `dashboard:summary` — resumo geral
  - `dashboard:brands` — dados por marca
  - `dashboard:marketplaces` — dados por marketplace
  - `dashboard:categories` — dados por categoria/subcategoria
  - `dashboard:timeline:{sku}` — série temporal de preço
  - `dashboard:alerts` — alertas de oportunidade/risco
  - `dashboard:top_skus` — top SKUs monitorados
  - `dashboard:price_matrix` — matriz SKU × Marketplace × Preço

#### `etl/requirements.txt`
```
pandas>=2.0
redis>=5.0
python-dotenv
tqdm
numpy
```

---

### 2. Next.js App (`/app/`)

Stack: **Next.js 14 App Router** + **Recharts** + **Vanilla CSS** (design system próprio)

#### Páginas

| Rota | Descrição |
|---|---|
| `/` | Dashboard executivo: KPIs macro, gráficos de posicionamento |
| `/brands` | Análise por marca: preço médio, cobertura, variação |
| `/marketplaces` | Análise por canal: preços, sellers, cobertura |
| `/skus` | Tabela de SKUs com histórico e alertas |
| `/timeline` | Série temporal interativa por SKU |
| `/alerts` | Alertas de oportunidades e riscos competitivos |

#### API Routes (`/app/api/`)
- `GET /api/summary` → Redis `dashboard:summary`
- `GET /api/brands` → Redis `dashboard:brands`
- `GET /api/marketplaces` → Redis `dashboard:marketplaces`
- `GET /api/categories` → Redis `dashboard:categories`
- `GET /api/timeline?sku=XXX` → Redis `dashboard:timeline:{sku}`
- `GET /api/alerts` → Redis `dashboard:alerts`
- `GET /api/top_skus` → Redis `dashboard:top_skus`

#### Design System (premium, dark mode)
- Paleta: Deep Navy `#0A0E1A` + Electric Blue `#00D4FF` + Neon Green `#00FF88` + Amber `#FFB800`
- Tipografia: Inter (Google Fonts)
- Glassmorphism cards com backdrop-blur
- Animações suaves com CSS transitions
- Gráficos: LineChart, BarChart, RadarChart, HeatMap via Recharts
- Tabelas com sorting, filtering e highlight de anomalias

---

### 3. Configuração Railway

#### Serviços no Railway
1. **Redis** — Redis oficial do Railway (plugin)
2. **Python ETL** — Serviço que roda o script de ingestão (one-shot ou cron)
3. **Next.js** — App frontend + API routes

#### Variáveis de Ambiente
```
REDIS_URL=redis://...railway...
NEXT_PUBLIC_APP_NAME=Price Intelligence Monitor
```

#### `railway.json`
```json
{
  "build": { "builder": "NIXPACKS" },
  "deploy": {
    "startCommand": "npm run start",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

---

## Plano de Ação — Visão Executiva (Apresentação para Diretor Samsung)

### O Problema
Com 1.2M+ pontos de dados, a **MIDEA está sendo monitorada hora a hora** por um sistema de rastreio competitivo que compara preços em todos os principais marketplaces do Brasil. A Samsung (e qualquer marca concorrente) precisa de uma ferramenta equivalente para **reagir em tempo real** às movimentações de preço dos rivais.

### As Oportunidades Identificadas
1. **Detecção de dumping temporário** — quando concorrentes caem preço pontualmente (promoção-relâmpago) e você pode contra-atacar
2. **Janelas de precificação ótima** — horários/dias onde o mercado está menos agressivo
3. **Cobertura de marketplace** — canais onde sua marca está sub-representada vs concorrência
4. **Análise de crédito/parcelamento** — competitividade além do preço à vista
5. **Alertas de risco** — quando sua marca está >X% acima do mercado em um SKU estratégico

### Entregáveis
- ✅ Script Python de ETL (ingestão CSV → Redis)
- ✅ Dashboard Next.js premium com 6 módulos analíticos
- ✅ Deploy automatizado no Railway
- ✅ Plano de ação executivo com recomendações estratégicas

---

## Verificação

### Automated
```bash
# ETL
cd etl && python process_csv.py

# Next.js
npm run build && npm run start
```

### Manual
- Verificar todas as rotas da API retornando dados do Redis
- Confirmar que gráficos carregam com dados reais
- Validar deploy no Railway com URL pública

---

## Open Questions

> [!IMPORTANT]
> **Você tem acesso ao Redis já provisionado ou devo incluir instruções para criar um Redis no Railway?**
> 
> Por padrão, vou incluir instruções para criar via Railway plugin (gratuito no tier Hobby).

> [!IMPORTANT]
> **O CSV deve ser commitado no repositório ou apenas processado localmente e os dados persistidos no Redis?**
> 
> Por padrão: o ETL roda localmente (ou em um serviço separado no Railway) e os dados vão para o Redis. O CSV **não** é commitado (muito grande).

> [!NOTE]
> **O nome do arquivo `export_midea_31_13.csv` sugere que o período é 31/05 a 13/06/2026.** Vou usar isso como contexto na apresentação executiva.
