import pandas as pd
import redis
import json
import os
from datetime import datetime
from tqdm import tqdm
import numpy as np
from dotenv import load_dotenv

load_dotenv()

# Configuration
CSV_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'export_midea_31_13.csv')
CHUNK_SIZE = 50000
REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379')
REDIS_TTL = 86400  # 24 hours

# Brand Configuration
TARGET_BRAND = "SAMSUNG"
BENCHMARK_BRAND = "MIDEA"

# Connect to Redis
r = redis.from_url(REDIS_URL, decode_responses=True)

def format_date(date_value):
    """Format date to DD/MM/YYYY"""
    if pd.isna(date_value):
        return None
    try:
        # Força o parsing tentando formatos comuns
        if isinstance(date_value, str):
            date_obj = pd.to_datetime(date_value, dayfirst=True, errors='coerce')
            if pd.isna(date_obj):
                date_obj = pd.to_datetime(date_value, errors='coerce')
        else:
            date_obj = pd.to_datetime(date_value, errors='coerce')
            
        if pd.isna(date_obj):
            return str(date_value).strip()
            
        return date_obj.strftime('%d/%m/%Y')
    except:
        return str(date_value).strip()

def process_chunk(chunk):
    """Process a chunk of data and return aggregated metrics"""
    results = {
        'total_records': len(chunk),
        'brands': {},
        'marketplaces': {},
        'categories': {},
        'skus': {},
        'timeline': {},
        'sku_prices': {}  # Track all prices by SKU for competitive analysis
    }
    
    # Process by brand
    for brand, group in chunk.groupby('BRAND'):
        if pd.isna(brand):
            continue
        if brand not in results['brands']:
            results['brands'][brand] = {
                'count': 0,
                'spot_prices': [],
                'forward_prices': [],
                'marketplaces': set()
            }
        results['brands'][brand]['count'] += len(group)
        results['brands'][brand]['spot_prices'].extend(group['SPOT PRICE OF MARKETPLACE'].dropna().tolist())
        results['brands'][brand]['forward_prices'].extend(group['FORWARD PRICE OF MARKETPLACE'].dropna().tolist())
        results['brands'][brand]['marketplaces'].update(group['MARKETPLACE'].dropna().unique())
    
    # Process by marketplace
    for mp, group in chunk.groupby('MARKETPLACE'):
        if pd.isna(mp):
            continue
        if mp not in results['marketplaces']:
            results['marketplaces'][mp] = {
                'count': 0,
                'spot_prices': [],
                'brands': set()
            }
        results['marketplaces'][mp]['count'] += len(group)
        results['marketplaces'][mp]['spot_prices'].extend(group['SPOT PRICE OF MARKETPLACE'].dropna().tolist())
        results['marketplaces'][mp]['brands'].update(group['BRAND'].dropna().unique())
    
    # Process by category
    for cat, group in chunk.groupby('CATEGORY'):
        if pd.isna(cat):
            continue
        if cat not in results['categories']:
            results['categories'][cat] = {
                'count': 0,
                'avg_spot_price': [],
                'brands': set()
            }
        results['categories'][cat]['count'] += len(group)
        results['categories'][cat]['avg_spot_price'].extend(group['SPOT PRICE OF MARKETPLACE'].dropna().tolist())
        results['categories'][cat]['brands'].update(group['BRAND'].dropna().unique())
    
    # Process by SKU for timeline
    for sku, group in chunk.groupby(['SKU', 'COLLECTION DATE']):
        if pd.isna(sku[0]):
            continue
        sku_key = sku[0]
        date_key = format_date(sku[1])

        if date_key is None:
            continue
            
        if sku_key not in results['timeline']:
            results['timeline'][sku_key] = {}
        if date_key not in results['timeline'][sku_key]:
            results['timeline'][sku_key][date_key] = []
        results['timeline'][sku_key][date_key].extend(group['SPOT PRICE OF MARKETPLACE'].dropna().tolist())
    
    # Collect all prices by SKU and brand for competitive analysis
    for _, row in chunk.iterrows():
        sku = row['SKU']
        brand = row['BRAND']
        price = row['SPOT PRICE OF MARKETPLACE']
        if pd.notna(sku) and pd.notna(brand) and pd.notna(price):
            if sku not in results['sku_prices']:
                results['sku_prices'][sku] = {}
            if brand not in results['sku_prices'][sku]:
                results['sku_prices'][sku][brand] = []
            results['sku_prices'][sku][brand].append(price)
    
    return results

def merge_results(accumulated, new):
    """Merge results from multiple chunks"""
    accumulated['total_records'] += new['total_records']
    
    # Merge brands
    for brand, data in new['brands'].items():
        if brand not in accumulated['brands']:
            accumulated['brands'][brand] = {
                'count': 0,
                'spot_prices': [],
                'forward_prices': [],
                'marketplaces': set()
            }
        accumulated['brands'][brand]['count'] += data['count']
        accumulated['brands'][brand]['spot_prices'].extend(data['spot_prices'])
        accumulated['brands'][brand]['forward_prices'].extend(data['forward_prices'])
        accumulated['brands'][brand]['marketplaces'].update(data['marketplaces'])
    
    # Merge marketplaces
    for mp, data in new['marketplaces'].items():
        if mp not in accumulated['marketplaces']:
            accumulated['marketplaces'][mp] = {
                'count': 0,
                'spot_prices': [],
                'brands': set()
            }
        accumulated['marketplaces'][mp]['count'] += data['count']
        accumulated['marketplaces'][mp]['spot_prices'].extend(data['spot_prices'])
        accumulated['marketplaces'][mp]['brands'].update(data['brands'])
    
    # Merge categories
    for cat, data in new['categories'].items():
        if cat not in accumulated['categories']:
            accumulated['categories'][cat] = {
                'count': 0,
                'avg_spot_price': [],
                'brands': set()
            }
        accumulated['categories'][cat]['count'] += data['count']
        accumulated['categories'][cat]['avg_spot_price'].extend(data['avg_spot_price'])
        accumulated['categories'][cat]['brands'].update(data['brands'])
    
    # Merge timeline
    for sku, dates in new['timeline'].items():
        if sku not in accumulated['timeline']:
            accumulated['timeline'][sku] = {}
        for date, prices in dates.items():
            if date not in accumulated['timeline'][sku]:
                accumulated['timeline'][sku][date] = []
            accumulated['timeline'][sku][date].extend(prices)
    
    # Merge sku_prices
    for sku, brands in new['sku_prices'].items():
        if sku not in accumulated['sku_prices']:
            accumulated['sku_prices'][sku] = {}
        for brand, prices in brands.items():
            if brand not in accumulated['sku_prices'][sku]:
                accumulated['sku_prices'][sku][brand] = []
            accumulated['sku_prices'][sku][brand].extend(prices)
    
    return accumulated

def finalize_results(results):
    """Finalize results by computing averages and converting sets to lists"""
    # Finalize brands
    for brand in results['brands']:
        data = results['brands'][brand]
        data['avg_spot_price'] = np.mean(data['spot_prices']) if data['spot_prices'] else 0
        data['min_spot_price'] = np.min(data['spot_prices']) if data['spot_prices'] else 0
        data['max_spot_price'] = np.max(data['spot_prices']) if data['spot_prices'] else 0
        data['price_variation'] = data['max_spot_price'] - data['min_spot_price']
        data['marketplace_coverage'] = len(data['marketplaces'])
        data['marketplaces'] = list(data['marketplaces'])
        del data['spot_prices']
        del data['forward_prices']
    
    # Finalize marketplaces
    for mp in results['marketplaces']:
        data = results['marketplaces'][mp]
        data['avg_spot_price'] = np.mean(data['spot_prices']) if data['spot_prices'] else 0
        data['min_spot_price'] = np.min(data['spot_prices']) if data['spot_prices'] else 0
        data['max_spot_price'] = np.max(data['spot_prices']) if data['spot_prices'] else 0
        data['brand_count'] = len(data['brands'])
        data['brands'] = list(data['brands'])
        del data['spot_prices']
    
    # Finalize categories
    for cat in results['categories']:
        data = results['categories'][cat]
        data['avg_spot_price'] = np.mean(data['avg_spot_price']) if data['avg_spot_price'] else 0
        data['brand_count'] = len(data['brands'])
        data['brands'] = list(data['brands'])
    
    # Finalize timeline - compute daily averages
    timeline_final = {}
    for sku, dates in results['timeline'].items():
        timeline_final[sku] = []
        for date in sorted(dates.keys()):
            prices = results['timeline'][sku][date]
            if prices:
                timeline_final[sku].append({
                    'date': date,
                    'avg_price': np.mean(prices),
                    'min_price': np.min(prices),
                    'max_price': np.max(prices)
                })
    
    results['timeline'] = timeline_final
    
    return results

def generate_alerts(results):
    """Generate competitive intelligence alerts with actionable insights"""
    alerts = []
    
    # 1. Competitive Price Positioning: TARGET_BRAND vs Market per SKU
    target_overpriced_skus = []
    target_competitive_skus = []
    
    for sku, brands in results['sku_prices'].items():
        if TARGET_BRAND in brands and len(brands) > 1:
            target_avg = np.mean(brands[TARGET_BRAND])
            
            # Get minimum price across all competitors
            all_prices = []
            for brand, prices in brands.items():
                if brand.upper() != TARGET_BRAND.upper():
                    all_prices.extend(prices)
            
            if all_prices:
                market_min = np.min(all_prices)
                market_avg = np.mean(all_prices)
                
                # Calculate premium percentage
                premium_vs_min = ((target_avg - market_min) / market_min) * 100
                premium_vs_avg = ((target_avg - market_avg) / market_avg) * 100
                
                if premium_vs_min > 10:
                    target_overpriced_skus.append({
                        'sku': sku,
                        'target_price': target_avg,
                        'market_min': market_min,
                        'market_avg': market_avg,
                        'premium_vs_min': premium_vs_min,
                        'premium_vs_avg': premium_vs_avg,
                        'recommendation': f"Reduzir preço em {premium_vs_min:.1f}% para competir com mínimo de mercado"
                    })
                elif premium_vs_min < -5:
                    target_competitive_skus.append({
                        'sku': sku,
                        'target_price': target_avg,
                        'market_min': market_min,
                        'premium_vs_min': premium_vs_min,
                        'insight': "Preço agressivo, considerando aumentar margem"
                    })
    
    # Add top overpriced SKUs to alerts
    for sku_alert in sorted(target_overpriced_skus, key=lambda x: x['premium_vs_min'], reverse=True)[:5]:
        alerts.append({
            'type': 'price_gap',
            'brand': TARGET_BRAND,
            'severity': 'danger',
            'sku': sku_alert['sku'],
            'message': f"SKU {sku_alert['sku'][:20]}... está {sku_alert['premium_vs_min']:.1f}% acima do mínimo de mercado",
            'target_price': sku_alert['target_price'],
            'market_min': sku_alert['market_min'],
            'market_avg': sku_alert['market_avg'],
            'premium_vs_min': sku_alert['premium_vs_min'],
            'recommendation': sku_alert['recommendation']
        })
    
    # 2. Market Share Analysis by Brand
    total_records = results['total_records']
    brand_market_share = []
    
    for brand, data in results['brands'].items():
        share = (data['count'] / total_records) * 100
        brand_market_share.append({
            'brand': brand,
            'share': share,
            'count': data['count'],
            'avg_price': data['avg_spot_price']
        })
    
    brand_market_share.sort(key=lambda x: x['share'], reverse=True)
    
    # Alert for TARGET_BRAND market share
    target_share = next((x for x in brand_market_share if x['brand'].upper() == TARGET_BRAND.upper()), None)
    if target_share:
        target_rank = next((i + 1 for i, x in enumerate(brand_market_share) if x['brand'].upper() == TARGET_BRAND.upper()), None)
        if target_share['share'] < 5:
            alerts.append({
                'type': 'market_share',
                'brand': TARGET_BRAND,
                'severity': 'warning',
                'message': f"Market share de {TARGET_BRAND} é baixo: {target_share['share']:.1f}% ({target_share['count']:,} registros) - {target_rank}º lugar",
                'market_share': target_share['share'],
                'rank': target_rank,
                'recommendation': 'Investigar penetração por categoria e marketplace'
            })
        else:
            alerts.append({
                'type': 'market_share',
                'brand': TARGET_BRAND,
                'severity': 'success',
                'message': f"Market share de {TARGET_BRAND}: {target_share['share']:.1f}% ({target_share['count']:,} registros) - {target_rank}º lugar",
                'market_share': target_share['share'],
                'rank': target_rank,
                'recommendation': 'Manter estratégia atual'
            })
    
    # Add benchmark brand (MIDEA) market share as reference
    benchmark_share = next((x for x in brand_market_share if x['brand'].upper() == BENCHMARK_BRAND.upper()), None)
    if benchmark_share:
        benchmark_rank = next((i + 1 for i, x in enumerate(brand_market_share) if x['brand'].upper() == BENCHMARK_BRAND.upper()), None)
        alerts.append({
            'type': 'competitor_share',
            'brand': BENCHMARK_BRAND,
            'severity': 'info',
            'message': f"{BENCHMARK_BRAND} tem {benchmark_share['share']:.1f}% de market share (concorrente principal) - {benchmark_rank}º lugar",
            'market_share': benchmark_share['share'],
            'rank': benchmark_rank,
            'is_competitor': True
        })
    
    # 3. Price Trend Analysis (from timeline data)
    # Calculate overall price trend for TARGET_BRAND
    target_trend_alerts = []
    for sku in results['timeline']:
        if sku in results['sku_prices'] and TARGET_BRAND in results['sku_prices'][sku]:
            timeline_data = results['timeline'][sku]
            if len(timeline_data) >= 2:
                # Calculate trend between first and last data points
                first_price = timeline_data[0]['avg_price']
                last_price = timeline_data[-1]['avg_price']
                
                if first_price > 0:
                    price_change = ((last_price - first_price) / first_price) * 100
                    
                    if price_change > 10:
                        target_trend_alerts.append({
                            'sku': sku,
                            'trend': 'increasing',
                            'change': price_change,
                            'first_price': first_price,
                            'last_price': last_price
                        })
                    elif price_change < -10:
                        target_trend_alerts.append({
                            'sku': sku,
                            'trend': 'decreasing',
                            'change': price_change,
                            'first_price': first_price,
                            'last_price': last_price
                        })
    
    # Add trend alerts
    if target_trend_alerts:
        increasing_count = len([x for x in target_trend_alerts if x['trend'] == 'increasing'])
        decreasing_count = len([x for x in target_trend_alerts if x['trend'] == 'decreasing'])
        
        if increasing_count > decreasing_count:
            alerts.append({
                'type': 'price_trend',
                'brand': TARGET_BRAND,
                'severity': 'warning',
                'message': f"Tendência de alta em preços: {increasing_count} SKUs com aumento >10%",
                'trend_direction': 'increasing',
                'recommendation': 'Monitorar impacto em volume de vendas'
            })
        elif decreasing_count > increasing_count:
            alerts.append({
                'type': 'price_trend',
                'brand': TARGET_BRAND,
                'severity': 'info',
                'message': f"Tendência de baixa em preços: {decreasing_count} SKUs com redução >10%",
                'trend_direction': 'decreasing',
                'recommendation': 'Avaliar estratégia de precificação competitiva'
            })
    
    # 4. Marketplace Coverage Analysis for TARGET_BRAND
    for brand, data in results['brands'].items():
        if brand.upper() == TARGET_BRAND.upper():
            if data['marketplace_coverage'] < len(results['marketplaces']):
                missing_marketplaces = len(results['marketplaces']) - data['marketplace_coverage']
                alerts.append({
                    'type': 'coverage',
                    'brand': TARGET_BRAND,
                    'severity': 'warning',
                    'message': f"{TARGET_BRAND} não está presente em {missing_marketplaces} marketplace(s)",
                    'current_coverage': data['marketplace_coverage'],
                    'total_marketplaces': len(results['marketplaces']),
                    'recommendation': 'Expandir presença para marketplaces faltantes'
                })
    
    # 5. Category Performance for TARGET_BRAND
    category_insights = []
    for cat, data in results['categories'].items():
        if TARGET_BRAND in data['brands']:
            category_insights.append({
                'category': cat,
                'brand_count': data['brand_count'],
                'avg_price': data['avg_spot_price']
            })
    
    if category_insights:
        best_category = max(category_insights, key=lambda x: x['brand_count'])
        alerts.append({
            'type': 'category_performance',
            'brand': TARGET_BRAND,
            'severity': 'success',
            'message': f"Melhor categoria: {best_category['category']} com {best_category['brand_count']} marcas",
            'category': best_category['category'],
            'recommendation': 'Focar recursos em categorias de alto desempenho'
        })
    
    # 6. TARGET_BRAND vs BENCHMARK_BRAND Comparison
    target_brand_data = results['brands'].get(TARGET_BRAND)
    benchmark_brand_data = results['brands'].get(BENCHMARK_BRAND)
    
    if target_brand_data and benchmark_brand_data:
        price_diff_pct = ((target_brand_data['avg_spot_price'] - benchmark_brand_data['avg_spot_price']) / benchmark_brand_data['avg_spot_price']) * 100
        
        if price_diff_pct > 5:
            alerts.append({
                'type': 'brand_comparison',
                'brand': TARGET_BRAND,
                'competitor': BENCHMARK_BRAND,
                'severity': 'warning',
                'message': f"{TARGET_BRAND} está {price_diff_pct:.1f}% acima do {BENCHMARK_BRAND} em preço médio",
                'target_avg_price': target_brand_data['avg_spot_price'],
                'benchmark_avg_price': benchmark_brand_data['avg_spot_price'],
                'price_difference_pct': price_diff_pct,
                'recommendation': f"{TARGET_BRAND} pode reduzir preço em {price_diff_pct:.1f}% para competir com {BENCHMARK_BRAND}"
            })
        elif price_diff_pct < -5:
            alerts.append({
                'type': 'brand_comparison',
                'brand': TARGET_BRAND,
                'competitor': BENCHMARK_BRAND,
                'severity': 'success',
                'message': f"{TARGET_BRAND} está {abs(price_diff_pct):.1f}% abaixo do {BENCHMARK_BRAND} em preço médio",
                'target_avg_price': target_brand_data['avg_spot_price'],
                'benchmark_avg_price': benchmark_brand_data['avg_spot_price'],
                'price_difference_pct': price_diff_pct,
                'recommendation': f"{TARGET_BRAND} tem vantagem de preço sobre {BENCHMARK_BRAND}"
            })
        else:
            alerts.append({
                'type': 'brand_comparison',
                'brand': TARGET_BRAND,
                'competitor': BENCHMARK_BRAND,
                'severity': 'info',
                'message': f"{TARGET_BRAND} e {BENCHMARK_BRAND} têm preços similares (diferença de {abs(price_diff_pct):.1f}%)",
                'target_avg_price': target_brand_data['avg_spot_price'],
                'benchmark_avg_price': benchmark_brand_data['avg_spot_price'],
                'price_difference_pct': price_diff_pct,
                'recommendation': 'Monitorar dinâmica competitiva'
            })
    
    return alerts

def get_top_skus(results, limit=20):
    """Get top SKUs by data volume"""
    sku_counts = {}
    for sku, dates in results['timeline'].items():
        total_points = sum(len(dates[date]) for date in dates)
        sku_counts[sku] = total_points
    
    top_skus = sorted(sku_counts.items(), key=lambda x: x[1], reverse=True)[:limit]
    return [sku for sku, count in top_skus]

def main():
    print(f"Starting ETL process for {CSV_PATH}")
    print(f"Chunk size: {CHUNK_SIZE}")
    
    accumulated = {
        'total_records': 0,
        'brands': {},
        'marketplaces': {},
        'categories': {},
        'timeline': {},
        'sku_prices': {}
    }
    
    # Process CSV in chunks
    total_chunks = 0
    for chunk in tqdm(pd.read_csv(
        CSV_PATH, 
        chunksize=CHUNK_SIZE, 
        encoding='utf-8',
        parse_dates=['COLLECTION DATE'],   # ← Adicionado
        dayfirst=True                      # ← Adicionado (importante para dd/mm)
    ), desc="Processing chunks"):
        chunk_results = process_chunk(chunk)
        accumulated = merge_results(accumulated, chunk_results)
        total_chunks += 1
    
    print(f"\nProcessed {total_chunks} chunks")
    print(f"Total records: {accumulated['total_records']}")
    
    # Get top SKUs before finalizing (needs original timeline structure)
    top_skus = get_top_skus(accumulated, limit=20)
    
    # Finalize results
    results = finalize_results(accumulated)
    
    # Generate summary
    summary = {
        'total_records': results['total_records'],
        'total_brands': len(results['brands']),
        'total_marketplaces': len(results['marketplaces']),
        'total_categories': len(results['categories']),
        'total_skus': len(results['timeline']),
        'processed_at': datetime.now().isoformat()
    }
    
    # Generate alerts
    alerts = generate_alerts(results)
    
    # Store in Redis
    print("\nStoring data in Redis...")
    
    r.set('dashboard:summary', json.dumps(summary), ex=REDIS_TTL)
    r.set('dashboard:brands', json.dumps(results['brands']), ex=REDIS_TTL)
    r.set('dashboard:marketplaces', json.dumps(results['marketplaces']), ex=REDIS_TTL)
    r.set('dashboard:categories', json.dumps(results['categories']), ex=REDIS_TTL)
    r.set('dashboard:alerts', json.dumps(alerts), ex=REDIS_TTL)
    r.set('dashboard:top_skus', json.dumps(top_skus), ex=REDIS_TTL)
    
    # Store timeline for top SKUs only (to save memory)
    for sku in top_skus:
        if sku in results['timeline']:
            r.set(f'dashboard:timeline:{sku}', json.dumps(results['timeline'][sku]), ex=REDIS_TTL)
    
    print("ETL process completed successfully!")
    print(f"Summary: {summary}")
    print(f"Alerts generated: {len(alerts)}")
    print(f"Top SKUs stored: {len(top_skus)}")

if __name__ == '__main__':
    main()
