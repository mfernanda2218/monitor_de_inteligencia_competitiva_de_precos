# Price Intelligence Monitor

A competitive price intelligence dashboard for monitoring product prices across multiple Brazilian marketplaces. Built with Python ETL, Next.js 14, and Redis.

## Features

- **Real-time Price Monitoring**: Track 1.2M+ price points across multiple marketplaces
- **Brand Analysis**: Compare pricing and positioning by brand
- **Marketplace Coverage**: Analyze channel performance and brand presence
- **Price Timeline**: Interactive charts showing price evolution over time
- **Alerts System**: Automated detection of pricing opportunities and risks
- **Premium Dark UI**: Modern glassmorphism design with electric blue accents

## Architecture

```
CSV (515MB)
    │
    ▼
[Python ETL Script]
    ├── Reads CSV in chunks (50k lines)
    ├── Computes KPIs and aggregations
    ├── Serializes as JSON
    └── Persists in Redis (24h TTL)
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
     /api/alerts
            │
            ▼
       [Railway]
    (Deploy via GitHub)
```

## Prerequisites

- Python 3.8+
- Node.js 18+
- Redis (local or Railway)
- CSV data file (`export_midea_31_13.csv`)

## Setup

### 1. Install Python Dependencies

```bash
cd etl
pip install -r requirements.txt
```

### 2. Install Node.js Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and set your Redis URL:
```
REDIS_URL=redis://localhost:6379
```

### 4. Run ETL Process

```bash
cd etl
python process_csv.py
```

This will:
- Read the CSV in chunks (memory efficient)
- Compute aggregations by brand, marketplace, category, and SKU
- Store results in Redis with 24h TTL

### 5. Start Next.js Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Pages

- **/** - Executive dashboard with KPIs and quick navigation
- **/brands** - Brand analysis with pricing metrics
- **/marketplaces** - Marketplace coverage and performance
- **/skus** - Top SKUs by data volume
- **/timeline** - Interactive price timeline charts
- **/alerts** - Pricing opportunities and risk alerts

## API Routes

- `GET /api/summary` - General dashboard statistics
- `GET /api/brands` - Brand-level aggregations
- `GET /api/marketplaces` - Marketplace-level aggregations
- `GET /api/categories` - Category-level data
- `GET /api/timeline?sku=XXX` - Price timeline for specific SKU
- `GET /api/alerts` - Generated alerts and opportunities
- `GET /api/top_skus` - Top 20 SKUs by data volume

## Deployment to Railway

### 1. Create Redis Instance

In Railway dashboard:
- Click "New Project" → "Add a Service"
- Select "Redis" from the plugins
- Railway will provide a Redis connection URL

### 2. Deploy Next.js App

```bash
# Initialize git repo
git init
git add .
git commit -m "Initial commit"

# Create Railway project and link
railway login
railway init
railway up

# Set environment variables in Railway dashboard
REDIS_URL=<your-railway-redis-url>
NEXT_PUBLIC_APP_NAME=Price Intelligence Monitor
```

### 3. Run ETL on Railway (Optional)

For automated ETL, create a separate Railway service:
- Add a new service with Python builder
- Set build command to install requirements
- Set start command to run `python etl/process_csv.py`
- Configure as a cron job or one-off service

## Data Structure

### CSV Fields

| Field | Type | Description |
|-------|------|-------------|
| TITLE OF MARKETPLACE | Text | Product name on marketplace |
| PRODUCT | Text | Standardized product name |
| SKU | String | Product SKU identifier |
| FAMILY | String | Product family |
| COLLECTION DATE | Date | Data collection date |
| COLLECTION HOUR | Time | Collection hour |
| EXECUTION HOUR | Time | Execution hour |
| SPOT PRICE | Float | Cash price |
| FORWARD PRICE | Float | Installment price |
| PRICE FROM | Float | Reference price |
| NUMBER OF INSTALLMENTS | Int | Number of installments |
| INSTALLMENT VALUE | Float | Installment value |
| BRAND | String | Brand name |
| MARKETPLACE | String | Marketplace name |
| CATEGORY | String | Product category |
| SUBCATEGORY | String | Product subcategory |
| SELLER | String | Seller name |
| COLOR | String | Product color |
| OFFER URL | URL | Direct offer link |
| PIX PRICE | Float | PIX price |
| ID | UUID | Unique record ID |

### Redis Keys

- `dashboard:summary` - General statistics
- `dashboard:brands` - Brand aggregations
- `dashboard:marketplaces` - Marketplace aggregations
- `dashboard:categories` - Category data
- `dashboard:timeline:{sku}` - SKU price timeline
- `dashboard:alerts` - Generated alerts
- `dashboard:top_skus` - Top 20 SKUs

## Design System

- **Colors**: Deep Navy (`#0A0E1A`), Electric Blue (`#00D4FF`), Neon Green (`#00FF88`), Amber (`#FFB800`)
- **Typography**: Inter (Google Fonts)
- **Components**: Glassmorphism cards with backdrop-blur
- **Charts**: Recharts for data visualization

## Troubleshooting

### Redis Connection Error

Ensure Redis is running:
```bash
redis-cli ping  # Should return PONG
```

### ETL Memory Issues

The script uses chunked reading (50k lines) to handle large files. If you still encounter memory issues, reduce `CHUNK_SIZE` in `etl/process_csv.py`.

### TypeScript Errors After npm install

If you see TypeScript errors after running `npm install`, restart your IDE or run:
```bash
rm -rf .next
npm run dev
```

## License

MIT

## Support

For issues or questions, please refer to the implementation plan document.
