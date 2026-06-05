import React from 'react';

export default function Navbar({ 
  marketIndex = {
    value: 45182.50,
    change: 312.80,
    changePercent: 0.70,
    volume: 5420,
    date: '2026-06-05',
    time: '10:44:43'
  },
  onRefresh,
  isRefreshing = false
}) {
  const isUp = marketIndex.change >= 0;

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <span className="brand-logo">台灣股市推薦觀察台</span>
        <span className="brand-badge">AI v2.0</span>
      </div>
      
      <div className="nav-stats">
        {/* 大盤加權指數 */}
        <div className="index-widget">
          <span className="index-title">加權指數</span>
          <span className="index-value">{marketIndex.value.toLocaleString('zh-TW', { minimumFractionDigits: 2 })}</span>
          <span className={`index-change ${isUp ? 'up' : 'down'}`}>
            {isUp ? '▲' : '▼'} {Math.abs(marketIndex.change).toFixed(2)} ({isUp ? '+' : ''}{marketIndex.changePercent.toFixed(2)}%)
          </span>
        </div>

        {/* 預估成交量 */}
        <div className="index-widget">
          <span className="index-title">預估成交量</span>
          <span className="index-value">{marketIndex.volume.toLocaleString('zh-TW')} 億</span>
        </div>
        
        {/* 資料基準時間 */}
        <div className="nav-time">
          <span>更新時間：{marketIndex.time}</span>
          <span style={{ fontSize: '0.75rem', marginTop: '0.15rem' }}>資料基準日：{marketIndex.date}</span>
        </div>

        {/* 隨時更新按鈕 */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className={`btn-refresh ${isRefreshing ? 'refreshing' : ''}`}
          title="點擊隨時更新股市現狀與 AI 分析"
        >
          <span className="refresh-icon">🔄</span>
          <span className="refresh-text">{isRefreshing ? '更新中...' : '隨時更新'}</span>
        </button>
      </div>
    </nav>
  );
}
