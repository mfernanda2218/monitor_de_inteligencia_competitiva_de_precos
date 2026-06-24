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

# Connect to Redis
r = redis.from_url(REDIS_URL, decode_responses=True)

def process_chunk(chunk):
    """Process a chunk of data and return aggregated metrics"""
    results = {
        'total_records': len(chunk),
        'brands': {},
        'marketplaces': {},
        'categories': {},
        'skus': {},
        'timeline': {}
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
        date_key = str(sku[1])
        if sku_key not in results['timeline']:
            results['timeline'][sku_key] = {}
        if date_key not in results['timeline'][sku_key]:
            results['timeline'][sku_key][date_key] = []
        results['timeline'][sku_key][date_key].extend(group['SPOT PRICE OF MARKETPLACE'].dropna().tolist())
    
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
        del data['avg_spot_price']
    
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
    """Generate alerts for SKUs where MIDEA is >10% above market minimum"""
    alerts = []
    
    # Get MIDEA average prices by SKU
    midea_prices = {}
    
    # This is a simplified alert generation
    # In production, you'd compare MIDEA prices vs minimum market price per SKU
    for brand in results['brands']:
        if brand.upper() == 'MIDEA':
            data = results['brands'][brand]
            if data['avg_spot_price'] > 0:
                alerts.append({
                    'type': 'price_positioning',
                    'brand': 'MIDEA',
                    'severity': 'info',
                    'message': f"MIDEA average price: R$ {data['avg_spot_price']:.2f}",
                    'avg_price': data['avg_spot_price'],
                    'price_variation': data['price_variation']
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
        'timeline': {}
    }
    
    # Process CSV in chunks
    total_chunks = 0
    for chunk in tqdm(pd.read_csv(CSV_PATH, chunksize=CHUNK_SIZE, encoding='utf-8'), desc="Processing chunks"):
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
