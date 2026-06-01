import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SidebarFilters from './components/SidebarFilters';
import StockCard from './components/StockCard';
import PortfolioMonitor from './components/PortfolioMonitor';
import StockDetail from './components/StockDetail';
import MarketTrends from './components/MarketTrends';
import { stockData } from './data/stocks';
import TopChipsRadar from './components/TopChipsRadar';

export default function App() {
  // 狀態管理
  const [stocks, setStocks] = useState(stockData);
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
      {/* 頁首 */}
      <Navbar />

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
              {activeTab === 'grid' && <TopChipsRadar />}
              <div className="sticky-tab-bar">
                <div className="tab-buttons">
                  <button
                    className={`btn-tab ${activeTab === 'grid' ? 'active' : ''}`}
                    onClick={() => setActiveTab('grid')}
                  >
                    🔍 推薦觀察清單
                  </button>
                  <button
                    className={`btn-tab ${activeTab === 'portfolio' ? 'active' : ''}`}
                    onClick={() => setActiveTab('portfolio')}
                  >
                    💼 最愛與持股監控
                  </button>
                  <button
                    className={`btn-tab ${activeTab === 'market' ? 'active' : ''}`}
                    onClick={() => setActiveTab('market')}
                  >
                    🌐 大盤與國際情勢
                  </button>
                </div>
              </div>

              <div className="grid-header">
                {activeTab === 'grid' ? (
                  <div className="results-count">
                    篩選結果：共 <span>{sortedStocks.length}</span> 檔推薦觀察股
                  </div>
                ) : activeTab === 'portfolio' ? (
                  <div className="results-count">
                    我的最愛與持股監控控制台
                  </div>
                ) : (
                  <div className="results-count">
                    加權指數與國際情勢戰略對策室
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
              ) : (
                <MarketTrends favorites={favorites} stocks={stocks} />
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
