import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SidebarFilters from './components/SidebarFilters';
import StockCard from './components/StockCard';
import PortfolioMonitor from './components/PortfolioMonitor';
import { stockData } from './data/stocks';

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
  
  // 初始最愛設定 (台積電、鴻海、中信金)
  const [favorites, setFavorites] = useState(['2330', '2317', '2891']);
  
  // 初始持股部位 (模擬一個 GB200 精兵與防禦金融股組合)
  const [holdings, setHoldings] = useState([
    { stock_id: '2330', buy_price: 2150.0, lots: 2.0 }, // 買入 2 張台積電
    { stock_id: '2317', buy_price: 295.0, lots: 5.0 },  // 買入 5 張鴻海
    { stock_id: '2891', buy_price: 38.5, lots: 10.0 }   // 買入 10 張中信金
  ]);

  // 切換最愛
  const handleToggleFavorite = (stockId) => {
    if (favorites.includes(stockId)) {
      setFavorites(favorites.filter(id => id !== stockId));
    } else {
      setFavorites([...favorites, stockId]);
    }
  };

  // 新增持股
  const handleAddHolding = (newHolding) => {
    const existingIdx = holdings.findIndex(h => h.stock_id === newHolding.stock_id);
    if (existingIdx > -1) {
      // 若持股已存在，重新計算加權均價與張數
      const oldH = holdings[existingIdx];
      const newLots = oldH.lots + newHolding.lots;
      const newBuyPrice = (oldH.lots * oldH.buy_price + newHolding.lots * newHolding.buy_price) / newLots;
      
      const updatedHoldings = [...holdings];
      updatedHoldings[existingIdx] = {
        stock_id: newHolding.stock_id,
        buy_price: parseFloat(newBuyPrice.toFixed(1)),
        lots: parseFloat(newLots.toFixed(2))
      };
      setHoldings(updatedHoldings);
    } else {
      setHoldings([...holdings, newHolding]);
    }
  };

  // 移出持股
  const handleRemoveHolding = (stockId) => {
    setHoldings(holdings.filter(h => h.stock_id !== stockId));
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
    // 搜尋比對 (代碼或名稱)
    const matchesSearch = stock.stock_id.includes(search) || 
                          stock.stock_name.includes(search);
    
    // 最低推薦分數
    const matchesScore = stock.scores.total >= minScore;
    
    // 殖利率 4% 以上
    const matchesYield = !yieldToggle || stock.dividend_yield >= 4.0;
    
    // 適合進場時機
    const matchesTiming = !timingToggle || 
                          stock.timing_status.status === '可分批布局' || 
                          stock.timing_status.status === '等待拉回' ||
                          stock.timing_status.status === '等待回檔';

    return matchesSearch && matchesScore && matchesStyle(stock) && matchesYield && matchesTiming;
  });

  // 排序邏輯
  const sortedStocks = [...filteredStocks].sort((a, b) => {
    if (sortBy === 'total') return b.scores.total - a.scores.total;
    if (sortBy === 'momentum') return b.scores.momentum - a.scores.momentum;
    if (sortBy === 'valuation') return b.scores.valuation - a.scores.valuation; // 高安全邊際優先
    if (sortBy === 'dividend') return b.dividend_yield - a.dividend_yield; // 殖利率優先
    if (sortBy === 'risk') return b.scores.risk - a.scores.risk; // 防禦力最強（風險最小）優先
    if (sortBy === 'trend') return b.scores.trend - a.scores.trend;
    return 0;
  });

  return (
    <div className="app-container">
      {/* 頁首 */}
      <Navbar />

      {/* 主內容區 */}
      <main className="main-content">
        {/* 推薦清單模式下顯示左側篩選面板 */}
        {activeTab === 'grid' && (
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
        )}

        {/* 股票顯示網格 */}
        <div className="stock-grid-container">
          
          {/* 控制頁籤頭部 */}
          <div className="grid-header">
            {activeTab === 'grid' ? (
              <div className="results-count">
                篩選結果：共 <span>{sortedStocks.length}</span> 檔推薦觀察股
              </div>
            ) : (
              <div className="results-count">
                我的最愛與持股監控控制台
              </div>
            )}

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
            </div>
          </div>

          {/* 渲染主頁面內容 */}
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
          ) : (
            <PortfolioMonitor
              stocks={stocks}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              holdings={holdings}
              onAddHolding={handleAddHolding}
              onRemoveHolding={handleRemoveHolding}
            />
          )}
        </div>
      </main>
    </div>
  );
}
