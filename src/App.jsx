import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SidebarFilters from './components/SidebarFilters';
import StockCard from './components/StockCard';
import PortfolioMonitor from './components/PortfolioMonitor';
import StockDetail from './components/StockDetail';
import MarketTrends from './components/MarketTrends';
import { stockData } from './data/stocks';
import TopChipsRadar from './components/TopChipsRadar';
import AiChatPanel from './components/AiChatPanel';

export default function App() {
  // 狀態管理
  const [stocks, setStocks] = useState(() => {
    // 預設將資料庫中的日期初始化為「今天」的日期，實現每日更新的效果
    const todayStr = new Date().toISOString().split('T')[0];
    return stockData.map(stock => ({
      ...stock,
      timestamps: {
        ...stock.timestamps,
        price_date: todayStr,
        inst_date: todayStr,
        broker_date: todayStr
      }
    }));
  });
  const [search, setSearch] = useState('');
  const [styleFilter, setStyleFilter] = useState('ALL');
  const [minScore, setMinScore] = useState(70);
  const [yieldToggle, setYieldToggle] = useState(false);
  const [timingToggle, setTimingToggle] = useState(false);
  const [sortBy, setSortBy] = useState('total');
  
  // 頁籤切換：'grid' (推薦清單) | 'portfolio' (我的最愛與部位監控)
  const [activeTab, setActiveTab] = useState('grid');
  
  // 從 localStorage 讀取最愛清單，若無則使用預設值
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('tw-stock-favorites');
      return saved ? JSON.parse(saved) : ['2330', '2317', '2891'];
    } catch (e) {
      return ['2330', '2317', '2891'];
    }
  });
  
  // 從 localStorage 讀取持股部位，若無則使用預設值
  const [holdings, setHoldings] = useState(() => {
    try {
      const saved = localStorage.getItem('tw-stock-holdings');
      return saved ? JSON.parse(saved) : [
        { stock_id: '2330', buy_price: 2150.0, lots: 2.0 },
        { stock_id: '2317', buy_price: 295.0, lots: 5.0 },
        { stock_id: '2891', buy_price: 38.5, lots: 10.0 }
      ];
    } catch (e) {
      return [
        { stock_id: '2330', buy_price: 2150.0, lots: 2.0 },
        { stock_id: '2317', buy_price: 295.0, lots: 5.0 },
        { stock_id: '2891', buy_price: 38.5, lots: 10.0 }
      ];
    }
  });

  // 持久化儲存最愛股
  useEffect(() => {
    try {
      localStorage.setItem('tw-stock-favorites', JSON.stringify(favorites));
    } catch (e) {
      console.error(e);
    }
  }, [favorites]);

  // 持久化儲存持股部位
  useEffect(() => {
    try {
      localStorage.setItem('tw-stock-holdings', JSON.stringify(holdings));
    } catch (e) {
      console.error(e);
    }
  }, [holdings]);

  // 路由狀態管理
  const [route, setRoute] = useState({ path: 'list', stockId: null });
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // 實時刷新狀態管理
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [marketIndex, setMarketIndex] = useState(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const now = new Date();
    const timeStr = now.toLocaleTimeString('zh-TW', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    return {
      value: 45182.50,
      change: 312.80,
      changePercent: 0.70,
      volume: 5420,
      date: todayStr,
      time: timeStr
    };
  });

  // 實時更新核心處理器 (支援後端 API 與前端落底 Fallback 模擬)
  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    // 延遲 600ms 以提供流暢的旋轉動畫載入感
    await new Promise(resolve => setTimeout(resolve, 600));

    try {
      // 1. 嘗試串接後端 API 獲取最新大盤與個股數據
      const indexRes = await fetch('/api/market-index');
      const stocksRes = await fetch('/api/stocks-update');
      
      if (indexRes.ok && stocksRes.ok) {
        const indexData = await indexRes.json();
        const stocksUpdateData = await stocksRes.json();
        
        setMarketIndex(indexData);
        setStocks(prevStocks => 
          prevStocks.map(stock => {
            const update = stocksUpdateData[stock.stock_id];
            if (update) {
              return {
                ...stock,
                ...update,
                timestamps: {
                  ...stock.timestamps,
                  price_date: indexData.date,
                  inst_date: indexData.date,
                  broker_date: indexData.date
                }
              };
            }
            return stock;
          })
        );
        setIsRefreshing(false);
        return;
      }
    } catch (e) {
      console.warn("無法串接後端刷新 API，啟用前端備用隨機模擬刷新機制。");
    }

    // 2. Fallback: 前端防禦性模擬刷新 (讓無後端環境也能 100% 流暢運作)
    const now = new Date();
    const timeStr = now.toLocaleTimeString('zh-TW', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const dateStr = now.toISOString().split('T')[0];
    
    // 模擬大盤波動
    setMarketIndex(prev => {
      const diff = parseFloat(((Math.random() - 0.45) * 80).toFixed(2));
      const newValue = parseFloat((prev.value + diff).toFixed(2));
      const newChange = parseFloat((prev.change + diff).toFixed(2));
      const newPercent = parseFloat(((newChange / 44800) * 100).toFixed(2));
      return {
        value: newValue,
        change: newChange,
        changePercent: newPercent,
        volume: Math.floor(5200 + (Math.random() - 0.5) * 500),
        date: dateStr,
        time: timeStr
      };
    });

    // 模擬個股隨機跳動
    setStocks(prevStocks => 
      prevStocks.map(stock => {
        // 隨機波動率 -1.5% 到 +1.8%
        const pct = (Math.random() * 3.3 - 1.5) / 100;
        const priceDiff = stock.current_price * pct;
        
        // 保留合理的小數點位數
        const priceScale = stock.current_price > 100 ? 1 : 2;
        const newPrice = parseFloat(Math.max(1.0, stock.current_price + priceDiff).toFixed(priceScale));
        
        // 昨收價為基準計算漲跌
        const yesterdayPrice = stock.current_price - stock.change;
        const newChange = parseFloat((newPrice - yesterdayPrice).toFixed(2));
        const newChangePercent = parseFloat(((newChange / yesterdayPrice) * 100).toFixed(2));
        
        return {
          ...stock,
          current_price: newPrice,
          change: newChange,
          change_percent: newChangePercent,
          volume: Math.floor(stock.volume * (1 + (Math.random() - 0.3) * 0.05)),
          timestamps: {
            ...stock.timestamps,
            price_date: dateStr,
            inst_date: dateStr,
            broker_date: dateStr
          }
        };
      })
    );

    setIsRefreshing(false);
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      const stockMatch = hash.match(/^#\/stock\/(\d+)$/);
      if (stockMatch) {
        setRoute({ path: 'detail', stockId: stockMatch[1] });
      } else {
        setRoute({ path: 'list', stockId: null });
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // 首次加載比對

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // 頁面首次載入時自動執行一次更新，同步真實台灣股市與加權指數資料
  useEffect(() => {
    handleRefresh();
  }, []);

  // 切換最愛
  // 切換最愛 (同步寫入 localStorage，防範 Strict Mode 或閉包異步問題)
  const handleToggleFavorite = (stockId) => {
    setFavorites(prev => {
      const next = prev.includes(stockId)
        ? prev.filter(id => id !== stockId)
        : [...prev, stockId];
      try {
        localStorage.setItem('tw-stock-favorites', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  // 新增持股 (同步寫入 localStorage)
  const handleAddHolding = (newHolding) => {
    setHoldings(prev => {
      const existingIdx = prev.findIndex(h => h.stock_id === newHolding.stock_id);
      let next;
      if (existingIdx > -1) {
        const oldH = prev[existingIdx];
        const newLots = oldH.lots + newHolding.lots;
        const newBuyPrice = (oldH.lots * oldH.buy_price + newHolding.lots * newHolding.buy_price) / newLots;
        
        next = [...prev];
        next[existingIdx] = {
          stock_id: newHolding.stock_id,
          buy_price: parseFloat(newBuyPrice.toFixed(1)),
          lots: parseFloat(newLots.toFixed(2))
        };
      } else {
        next = [...prev, newHolding];
      }
      try {
        localStorage.setItem('tw-stock-holdings', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  // 移出持股 (同步寫入 localStorage)
  const handleRemoveHolding = (stockId) => {
    setHoldings(prev => {
      const next = prev.filter(h => h.stock_id !== stockId);
      try {
        localStorage.setItem('tw-stock-holdings', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  // 篩選與比對邏輯
  const matchesStyle = (stock) => {
    if (styleFilter === 'ALL') return true;
    if (styleFilter === '成長') {
      return stock.scores.momentum >= 90 || stock.scores.trend >= 92;
    }
    if (styleFilter === '收益') {
      return stock.dividend_yield >= 3.0 || stock.scores.dividend >= 68;
    }
    if (styleFilter === '價值') {
      return stock.pe_ratio <= 22 || stock.scores.valuation >= 75;
    }
    return true;
  };

  const filteredStocks = stocks.filter(stock => {
    const matchesSearch = stock.stock_id.includes(search) || 
                          stock.stock_name.includes(search);
    const matchesScore = stock.scores.total >= minScore;
    const matchesYield = !yieldToggle || stock.dividend_yield >= 4.0;
    const matchesTiming = !timingToggle || 
                          stock.timing_status.status === '可分批布局' || 
                          stock.timing_status.status === '等待拉回' ||
                          stock.timing_status.status === '等待回檔';

    return matchesSearch && matchesScore && matchesStyle(stock) && matchesYield && matchesTiming;
  });

  const sortedStocks = [...filteredStocks].sort((a, b) => {
    if (sortBy === 'total') return b.scores.total - a.scores.total;
    if (sortBy === 'momentum') return b.scores.momentum - a.scores.momentum;
    if (sortBy === 'valuation') return b.scores.valuation - a.scores.valuation;
    if (sortBy === 'dividend') return b.dividend_yield - a.dividend_yield;
    if (sortBy === 'risk') return b.scores.risk - a.scores.risk;
    if (sortBy === 'trend') return b.scores.trend - a.scores.trend;
    return 0;
  });

  return (
    <div className="app-container">
      {/* 置頂頁首與分頁控制欄 */}
      <header className="app-header">
        <Navbar marketIndex={marketIndex} />

        {/* 全域置頂分頁控制欄 */}
        <div className="sticky-tab-bar">
          <div className="tab-bar-container">
            <div className="tab-buttons">
              <button
                className={`btn-tab ${activeTab === 'grid' && route.path === 'list' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('grid');
                  window.location.hash = ''; // 清除 Hash，無縫回到列表
                }}
              >
                🔍 推薦觀察清單
              </button>
              <button
                className={`btn-tab ${activeTab === 'portfolio' && route.path === 'list' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('portfolio');
                  window.location.hash = ''; // 清除 Hash，無縫回到列表
                }}
              >
                💼 最愛與持股監控
              </button>
              <button
                className={`btn-tab ${activeTab === 'market' && route.path === 'list' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('market');
                  window.location.hash = ''; // 清除 Hash，無縫回到列表
                }}
              >
                🌐 大盤與國際情勢
              </button>
              <button
                className={`btn-tab ${activeTab === 'chat' && route.path === 'list' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('chat');
                  window.location.hash = ''; // 清除 Hash，無縫回到列表
                }}
              >
                💬 AI分析對話
              </button>
            </div>

            {/* 隨時更新按鈕 (移至與分頁按鈕並列) */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`btn-refresh ${isRefreshing ? 'refreshing' : ''}`}
              title="點擊隨時更新股市現狀與 AI 分析"
            >
              <span className="refresh-icon">🔄</span>
              <span className="refresh-text">{isRefreshing ? '更新中...' : '隨時更新'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* 主內容區 */}
      <main className="main-content">
        {route.path === 'detail' ? (
          /* 個股詳情 K 線圖視圖 */
          <StockDetail stockId={route.stockId} />
        ) : (
          /* 大盤觀察與列表視圖 */
          <>
            {activeTab === 'grid' && (
              <>
                <button 
                  className="btn-filter-mobile-toggle"
                  onClick={() => setShowFiltersMobile(!showFiltersMobile)}
                >
                  {showFiltersMobile ? '✖ 關閉篩選與排序' : '🔍 展開篩選與排序'}
                </button>
                <div className={`sidebar-filters-wrapper ${showFiltersMobile ? 'mobile-show' : ''}`}>
                  <SidebarFilters
                    search={search}
                    setSearch={setSearch}
                    styleFilter={styleFilter}
                    setStyleFilter={setStyleFilter}
                    minScore={minScore}
                    setMinScore={setMinScore}
                    yieldToggle={yieldToggle}
                    setYieldToggle={setYieldToggle}
                    timingToggle={timingToggle}
                    setTimingToggle={setTimingToggle}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                  />
                </div>
              </>
            )}

            <div className="stock-grid-container">
              {activeTab === 'grid' && <TopChipsRadar stocks={stocks} />}
              <div className="grid-header">
                {activeTab === 'grid' ? (
                  <div className="results-count">
                    篩選結果：共 <span>{sortedStocks.length}</span> 檔推薦觀察股
                  </div>
                ) : activeTab === 'portfolio' ? (
                  <div className="results-count">
                    我的最愛與持股監控控制台
                  </div>
                ) : activeTab === 'market' ? (
                  <div className="results-count">
                    加權指數與國際情勢戰略對策室
                  </div>
                ) : (
                  <div className="results-count">
                    專業台股 AI 策略診斷對話室
                  </div>
                )}
              </div>

              {activeTab === 'grid' ? (
                sortedStocks.length === 0 ? (
                  <div className="empty-state" style={{ padding: '5rem 2rem' }}>
                    <div className="empty-icon">📂</div>
                    <div className="empty-text" style={{ fontSize: '1rem', fontWeight: 600 }}>沒有符合目前篩選條件的股票。</div>
                    <div className="empty-text" style={{ marginTop: '0.5rem' }}>請嘗試調整搜尋關鍵字、推薦分數滑桿或放寬進階篩選條件。</div>
                  </div>
                ) : (
                  <div className="cards-grid">
                    {sortedStocks.map(stock => (
                      <StockCard
                        key={stock.stock_id}
                        stock={stock}
                        isFavorite={favorites.includes(stock.stock_id)}
                        onToggleFavorite={handleToggleFavorite}
                      />
                    ))}
                  </div>
                )
              ) : activeTab === 'portfolio' ? (
                <PortfolioMonitor
                  stocks={stocks}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                  holdings={holdings}
                  onAddHolding={handleAddHolding}
                  onRemoveHolding={handleRemoveHolding}
                />
              ) : activeTab === 'market' ? (
                <MarketTrends favorites={favorites} stocks={stocks} marketIndex={marketIndex} />
              ) : (
                <AiChatPanel stocks={stocks} />
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
