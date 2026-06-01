import React from 'react';

export default function SidebarFilters({
  search,
  setSearch,
  styleFilter,
  setStyleFilter,
  minScore,
  setMinScore,
  yieldToggle,
  setYieldToggle,
  timingToggle,
  setTimingToggle,
  sortBy,
  setSortBy
}) {
  return (
    <aside className="sidebar-filters">
      {/* 搜尋個股 */}
      <div className="filter-section">
        <h3 className="filter-title">搜尋股票</h3>
        <div className="search-container">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="輸入代碼或名稱..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* 投資類型篩選 */}
      <div className="filter-section">
        <h3 className="filter-title">投資類型</h3>
        <div className="style-buttons">
          <button
            className={`btn-filter ${styleFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setStyleFilter('ALL')}
          >
            全部
          </button>
          <button
            className={`btn-filter ${styleFilter === '成長' ? 'active' : ''}`}
            onClick={() => setStyleFilter('成長')}
          >
            成長型
          </button>
          <button
            className={`btn-filter ${styleFilter === '收益' ? 'active' : ''}`}
            onClick={() => setStyleFilter('收益')}
          >
            收益型
          </button>
          <button
            className={`btn-filter ${styleFilter === '價值' ? 'active' : ''}`}
            onClick={() => setStyleFilter('價值')}
          >
            價值型
          </button>
        </div>
      </div>

      {/* 最低推薦分數篩選 */}
      <div className="filter-section slider-container">
        <div className="filter-title">
          <span>最低推薦分數</span>
          <span className="slider-val">{minScore} 分</span>
        </div>
        <input
          type="range"
          min="60"
          max="95"
          className="custom-slider"
          value={minScore}
          onChange={(e) => setMinScore(Number(e.target.value))}
        />
      </div>

      {/* 特殊條件篩選 */}
      <div className="filter-section" style={{ gap: '0.9rem' }}>
        <h3 className="filter-title">進階篩選</h3>
        
        {/* 殖利率 4% 以上 */}
        <label className="toggle-item">
          <span className="toggle-label">只看殖利率 4% 以上</span>
          <div className="switch">
            <input
              type="checkbox"
              checked={yieldToggle}
              onChange={(e) => setYieldToggle(e.target.checked)}
            />
            <span className="slider-switch"></span>
          </div>
        </label>

        {/* 只看適合進場 (可布局 / 等待拉回) */}
        <label className="toggle-item">
          <span className="toggle-label">只看適合進場標的</span>
          <div className="switch">
            <input
              type="checkbox"
              checked={timingToggle}
              onChange={(e) => setTimingToggle(e.target.checked)}
            />
            <span className="slider-switch"></span>
          </div>
        </label>
      </div>

      {/* 排序方式 */}
      <div className="filter-section">
        <h3 className="filter-title">排序方式</h3>
        <select
          className="select-input"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="total">綜合推薦優先</option>
          <option value="momentum">短線動能最強</option>
          <option value="valuation">評價安全邊際高 (低PE)</option>
          <option value="dividend">殖利率優先</option>
          <option value="risk">波動度低 (風險最低)</option>
          <option value="trend">產業趨勢最優</option>
        </select>
      </div>
    </aside>
  );
}
