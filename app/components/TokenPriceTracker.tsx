'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, DollarSign, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { sdk } from '@farcaster/miniapp-sdk';

interface Token {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  marketCap: number;
  marketCapRank: number;
  loading: boolean;
  image: string;
}

interface CoinData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
}

const TokenPriceTracker = () => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const fetchPrices = async () => {
    // Only fetch on client side
    if (typeof window === 'undefined') return;
    
    setIsRefreshing(true);
    setError(null);
    
    try {
      // Fetch top 10 coins by market cap
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h',
        {
          headers: {
            'Accept': 'application/json',
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch prices');
      }

      const data: CoinData[] = await response.json();
      
      // Map the data to our token format
      const mappedTokens: Token[] = data.map((coin: CoinData) => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        price: coin.current_price || 0,
        change24h: coin.price_change_percentage_24h || 0,
        marketCap: coin.market_cap || 0,
        marketCapRank: coin.market_cap_rank || 0,
        loading: false,
        image: coin.image || '',
      }));
      
      setTokens(mappedTokens);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error fetching prices:', err);
      setError('Failed to fetch prices. Please try again.');
      setTokens(prev => prev.map(token => ({ ...token, loading: false })));
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // Mark component as mounted (client-side only)
    setMounted(true);

    // Initialize the app
    const initializeApp = async () => {
      try {
        // Fetch initial prices
        await fetchPrices();
        
        // Tell Farcaster the app is ready to display
        if (typeof window !== 'undefined') {
          try {
            await sdk.actions.ready();
          } catch (e) {
            console.error('Error calling sdk.actions.ready:', e);
          }
        }
      } catch (error) {
        console.error('Error initializing app:', error);
      }
    };

    initializeApp();
    
    // Update every 60 seconds
    const interval = setInterval(fetchPrices, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number) => {
    if (price < 0.01) {
      return `$${price.toFixed(6)}`;
    } else if (price < 1) {
      return `$${price.toFixed(4)}`;
    }
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(2)}T`;
    } else if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(2)}B`;
    } else if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(2)}M`;
    }
    return `$${marketCap.toLocaleString()}`;
  };

  const formatTime = (date: Date | null) => {
    if (!date) return '--:--:--';
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const styles = {
    container: {
      minHeight: '100vh',
      height: '100vh',
      background: 'linear-gradient(to bottom right, #1e3a8a, #1e40af, #3730a3)',
      padding: '0.75rem',
      display: 'flex',
      flexDirection: 'column' as const,
      overflow: 'hidden',
    },
    innerContainer: {
      maxWidth: '1400px',
      margin: '0 auto',
      width: '100%',
      display: 'flex',
      flexDirection: 'column' as const,
      height: '100%',
      overflow: 'hidden',
    },
    header: {
      textAlign: 'center' as const,
      marginBottom: '0.75rem',
      paddingTop: '0.5rem',
      flexShrink: 0,
    },
    iconContainer: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '3rem',
      height: '3rem',
      backgroundColor: '#3b82f6',
      borderRadius: '9999px',
      marginBottom: '0.5rem',
    },
    title: {
      fontSize: '1.75rem',
      fontWeight: 'bold',
      color: 'white',
      marginBottom: '0.25rem',
      margin: 0,
    },
    subtitle: {
      color: '#bfdbfe',
      fontSize: '0.875rem',
      margin: 0,
    },
    errorBox: {
      marginBottom: '0.75rem',
      backgroundColor: 'rgba(239, 68, 68, 0.2)',
      border: '1px solid rgba(239, 68, 68, 0.5)',
      borderRadius: '0.5rem',
      padding: '0.75rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      flexShrink: 0,
    },
    errorText: {
      color: '#fecaca',
      fontSize: '0.75rem',
      margin: 0,
    },
    controlBar: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '0.75rem',
      padding: '0 0.25rem',
      flexShrink: 0,
    },
    updateTime: {
      fontSize: '0.75rem',
      color: '#bfdbfe',
    },
    refreshButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.375rem',
      padding: '0.375rem 0.75rem',
      backgroundColor: '#2563eb',
      color: 'white',
      borderRadius: '0.375rem',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s',
      fontSize: '0.875rem',
    },
    refreshButtonDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
    tokensGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(5, 1fr)',
      gap: '0.75rem',
      flex: 1,
      overflow: 'auto',
      paddingBottom: '0.5rem',
    },
    tokenCard: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(16px)',
      borderRadius: '0.75rem',
      padding: '0.875rem',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.2s',
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column' as const,
      justifyContent: 'space-between',
      height: 'fit-content',
    },
    tokenHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '0.625rem',
    },
    tokenLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      flex: 1,
      minWidth: 0,
    },
    tokenImageWrapper: {
      width: '2rem',
      height: '2rem',
      borderRadius: '9999px',
      flexShrink: 0,
      position: 'relative' as const,
      overflow: 'hidden',
    },
    tokenInfo: {
      display: 'flex',
      flexDirection: 'column' as const,
      minWidth: 0,
      overflow: 'hidden',
    },
    tokenSymbol: {
      fontSize: '0.875rem',
      fontWeight: 'bold',
      color: 'white',
      whiteSpace: 'nowrap' as const,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    tokenName: {
      fontSize: '0.625rem',
      color: '#bfdbfe',
      whiteSpace: 'nowrap' as const,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    rankBadge: {
      backgroundColor: 'rgba(59, 130, 246, 0.3)',
      color: '#93c5fd',
      fontSize: '0.625rem',
      fontWeight: '600',
      padding: '0.125rem 0.375rem',
      borderRadius: '0.25rem',
      flexShrink: 0,
    },
    tokenPrice: {
      fontSize: '1.125rem',
      fontWeight: 'bold',
      color: 'white',
      marginBottom: '0.375rem',
      margin: 0,
    },
    statsRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '0.25rem',
    },
    changeContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem',
    },
    changeText: {
      fontSize: '0.75rem',
      fontWeight: '600',
    },
    marketCapText: {
      fontSize: '0.625rem',
      color: '#bfdbfe',
      whiteSpace: 'nowrap' as const,
    },
    footer: {
      marginTop: '0.5rem',
      textAlign: 'center' as const,
      fontSize: '0.625rem',
      color: '#bfdbfe',
      paddingBottom: '0.5rem',
      flexShrink: 0,
    },
    skeleton: {
      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    },
    skeletonBar: {
      height: '1rem',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: '0.25rem',
      marginBottom: '0.375rem',
    },
  };

  // Show loading state until mounted
  if (!mounted) {
    return (
      <div style={styles.container}>
        <div style={styles.innerContainer}>
          <div style={styles.header}>
            <div style={styles.iconContainer}>
              <DollarSign style={{ width: '1.5rem', height: '1.5rem', color: 'white' }} />
            </div>
            <h1 style={styles.title}>Top 10 Crypto Prices</h1>
            <p style={styles.subtitle}>Live prices by market cap • Powered by CoinGecko</p>
          </div>
          <div className="tokensGrid" style={styles.tokensGrid}>
            {[...Array(10)].map((_, i) => (
              <div key={i} style={styles.tokenCard}>
                <div style={styles.skeleton}>
                  <div style={{ ...styles.skeletonBar, width: '60%' }}></div>
                  <div style={{ ...styles.skeletonBar, width: '40%' }}></div>
                  <div style={{ ...styles.skeletonBar, width: '80%' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        /* Responsive Design */
        @media (max-width: 1400px) {
          .tokensGrid {
            grid-template-columns: repeat(4, 1fr) !important;
          }
        }
        
        @media (max-width: 1024px) {
          .tokensGrid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
        
        @media (max-width: 768px) {
          .tokensGrid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        
        @media (max-width: 480px) {
          .tokensGrid {
            grid-template-columns: repeat(1, 1fr) !important;
          }
        }
        
        /* Hide scrollbar but keep functionality */
        .tokensGrid::-webkit-scrollbar {
          display: none;
        }
        .tokensGrid {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      
      <div style={styles.innerContainer}>
        <div style={styles.header}>
          <div style={styles.iconContainer}>
            <DollarSign style={{ width: '1.5rem', height: '1.5rem', color: 'white' }} />
          </div>
          <h1 style={styles.title}>Top 10 Crypto Prices</h1>
          <p style={styles.subtitle}>Live prices by market cap • Powered by CoinGecko</p>
        </div>

        {error && (
          <div style={styles.errorBox}>
            <AlertCircle style={{ width: '1rem', height: '1rem', color: '#fca5a5', flexShrink: 0 }} />
            <p style={styles.errorText}>{error}</p>
          </div>
        )}

        <div style={styles.controlBar}>
          <span style={styles.updateTime}>
            Updated: {formatTime(lastUpdate)}
          </span>
          <button
            onClick={fetchPrices}
            disabled={isRefreshing}
            style={{
              ...styles.refreshButton,
              ...(isRefreshing ? styles.refreshButtonDisabled : {}),
            }}
            onMouseEnter={(e) => {
              if (!isRefreshing) {
                e.currentTarget.style.backgroundColor = '#1d4ed8';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#2563eb';
            }}
          >
            <RefreshCw 
              style={{ 
                width: '0.875rem', 
                height: '0.875rem',
                animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
              }} 
            />
            Refresh
          </button>
        </div>

        {tokens.length === 0 ? (
          <div className="tokensGrid" style={styles.tokensGrid}>
            {[...Array(10)].map((_, i) => (
              <div key={i} style={styles.tokenCard}>
                <div style={styles.skeleton}>
                  <div style={{ ...styles.skeletonBar, width: '60%' }}></div>
                  <div style={{ ...styles.skeletonBar, width: '40%' }}></div>
                  <div style={{ ...styles.skeletonBar, width: '80%' }}></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="tokensGrid" style={styles.tokensGrid}>
            {tokens.map((token) => (
              <div 
                key={token.id} 
                style={styles.tokenCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.2)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={styles.tokenHeader}>
                  <div style={styles.tokenLeft}>
                    <div style={styles.tokenImageWrapper}>
                      <Image 
                        src={token.image} 
                        alt={token.name}
                        fill
                        sizes="32px"
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    <div style={styles.tokenInfo}>
                      <span style={styles.tokenSymbol}>{token.symbol}</span>
                      <span style={styles.tokenName}>{token.name}</span>
                    </div>
                  </div>
                  <span style={styles.rankBadge}>#{token.marketCapRank}</span>
                </div>

                <p style={styles.tokenPrice}>
                  {formatPrice(token.price)}
                </p>

                <div style={styles.statsRow}>
                  <div style={styles.changeContainer}>
                    {token.change24h >= 0 ? (
                      <TrendingUp style={{ width: '0.875rem', height: '0.875rem', color: '#4ade80' }} />
                    ) : (
                      <TrendingDown style={{ width: '0.875rem', height: '0.875rem', color: '#f87171' }} />
                    )}
                    <span
                      style={{
                        ...styles.changeText,
                        color: token.change24h >= 0 ? '#4ade80' : '#f87171',
                      }}
                    >
                      {token.change24h >= 0 ? '+' : ''}
                      {token.change24h.toFixed(2)}%
                    </span>
                  </div>
                  <span style={styles.marketCapText}>
                    {formatMarketCap(token.marketCap)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={styles.footer}>
          <p style={{ margin: 0 }}>Auto-updates every 60 seconds • Data from CoinGecko API</p>
        </div>
      </div>
    </div>
  );
};

export default TokenPriceTracker;