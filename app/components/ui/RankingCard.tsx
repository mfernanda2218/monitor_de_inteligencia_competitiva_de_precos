import React from 'react';

interface RankingItem {
  name: string;
  value: number | string;
  percentage?: number;
  isTarget?: boolean;
  isBenchmark?: boolean;
}

interface RankingCardProps {
  title: string;
  items: RankingItem[];
  maxItems?: number;
  showPercentage?: boolean;
  className?: string;
}

export default function RankingCard({ 
  title, 
  items, 
  maxItems = 10, 
  showPercentage = true,
  className = '' 
}: RankingCardProps) {
  const displayItems = items.slice(0, maxItems);
  const maxValue = Math.max(...displayItems.map(item => 
    typeof item.value === 'number' ? item.value : 0
  ));

  const getRankBadge = (index: number) => {
    if (index === 0) return { bg: '#FEF3C7', color: '#D97706', text: '1º' };
    if (index === 1) return { bg: '#E5E7EB', color: '#6B7280', text: '2º' };
    if (index === 2) return { bg: '#FEE2E2', color: '#DC2626', text: '3º' };
    return null;
  };

  return (
    <div className={`card ${className}`}>
      <h3 style={{
        fontSize: '0.875rem',
        fontWeight: 600,
        color: '#111827',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginBottom: '16px'
      }}>
        {title}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {displayItems.map((item, index) => {
          const rankBadge = getRankBadge(index);
          const barWidth = typeof item.value === 'number' 
            ? (item.value / maxValue) * 100 
            : 100;

          return (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px 0'
              }}
            >
              {rankBadge && (
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  background: rankBadge.bg,
                  color: rankBadge.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  flexShrink: 0
                }}>
                  {rankBadge.text}
                </div>
              )}
              {!rankBadge && (
                <div style={{
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  color: '#6B7280',
                  flexShrink: 0
                }}>
                  {index + 1}
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '4px'
                }}>
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: '#111827',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    {item.name}
                    {item.isTarget && (
                      <span style={{
                        fontSize: '0.625rem',
                        background: '#DCFCE7',
                        color: '#059669',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontWeight: 600
                      }}>
                        ★
                      </span>
                    )}
                    {item.isBenchmark && (
                      <span style={{
                        fontSize: '0.625rem',
                        background: '#FEF3C7',
                        color: '#D97706',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontWeight: 600
                      }}>
                        BM
                      </span>
                    )}
                  </div>
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#2563EB'
                  }}>
                    {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
                  </div>
                </div>
                <div style={{
                  height: '6px',
                  background: '#E5E7EB',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div
                    style={{
                      width: `${barWidth}%`,
                      height: '100%',
                      background: index === 0 ? '#059669' : 
                               index === 1 ? '#2563EB' : 
                               index === 2 ? '#D97706' : '#6B7280',
                      borderRadius: '3px',
                      transition: 'width 0.3s ease'
                    }}
                  />
                </div>
                {showPercentage && item.percentage !== undefined && (
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#6B7280',
                    marginTop: '2px'
                  }}>
                    {item.percentage.toFixed(1)}%
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
