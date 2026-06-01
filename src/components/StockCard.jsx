import React, { useState } from 'react';

export default function StockCard({ stock, isFavorite, onToggleFavorite }) {
  const [strategyOpen, setStrategyOpen] = useState(false);

  const {
    stock_id,
    stock_name,
    category,
    sub_category,
    current_price,
    change,
    change_percent,
    volume,
    dividend_yield,
    pe_ratio,
    scores,
    timestamps,
    timing_status,
    strategy,
    reason,
    analyst_action,
    core_risk,
    global_linkage
  } = stock;

  const isUp = change >= 0;
  
  // 計算 SVG 圓形進度條參數
  const radius = 24;
  const stroke = 3;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (scores.total / 100) * circumference;

  // 定義時機標籤樣式類別
  let timingClass = 'watch';
  if (timing_status.status === '等待拉回' || timing_status.status === '等待回檔') {
    timingClass = 'wait';
  } else if (timing_status.status === '可分批布局' || timing_status.status === '可布局') {
    timingClass = 'buy';
  }

  // 點擊卡片跳轉詳情頁面，排除按鈕與摺疊面板
  const handleCardClick = (e) => {
    if (e.target.closest('button') || e.target.closest('.strategy-accord')) {
      return;
    }
    window.location.hash = `#/stock/${stock_id}`;
  };

  return (
    <article 
      className="stock-card" 
      onClick={handleCardClick}
      style={{ cursor: 'pointer' }}
    >
      {/* 卡片頭部 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="card-header-info">
          <div className="card-title-sec">
            <h2 className="card-ticker" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {stock_id} <span>{stock_name}</span>
              <button 
                className={`btn-favorite-card-inline ${isFavorite ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(stock_id);
                }}
                title={isFavorite ? "從觀察清單移除" : "加入觀察清單"}
                style={{
                  background: 'none',
                  border: 'none',
                  color: isFavorite ? 'var(--color-up)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '1.25rem',
                  padding: '0 0.25rem',
                  lineHeight: 1,
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'var(--transition)'
                }}
              >
                ♥
              </button>
            </h2>
            <div className="card-category">
              {category} • {sub_category}
            </div>
          </div>
        </div>

        {/* 進場時機大 Badge */}
        <span className={`timing-badge ${timingClass}`}>
          {timing_status.status}
        </span>
      </div>

      {/* 價格與總分顯示區 */}
      <div className="price-section">
        <div className="price-main">
          <div className="price-val" style={{ color: isUp ? 'var(--color-up)' : 'var(--color-down)' }}>
            {current_price.toLocaleString('zh-TW', { minimumFractionDigits: 1 })}
          </div>
          <div className={`price-change-sec ${isUp ? 'up' : 'down'}`}>
            <span>{isUp ? '▲' : '▼'}</span>
            <span>{Math.abs(change).toFixed(1)}</span>
            <span>({isUp ? '+' : ''}{change_percent.toFixed(2)}%)</span>
          </div>
        </div>

        {/* 總分顯示 (動態 SVG 進度環) */}
        <div className="score-circle-container">
          <div className="score-circle-ui">
            <svg height="54" width="54" className="score-svg">
              <defs>
                <linearGradient id="score-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--accent-blue)" />
                  <stop offset="100%" stopColor="var(--accent-purple)" />
                </linearGradient>
              </defs>
              <circle
                className="score-circle-bg"
                cx="27"
                cy="27"
                r={normalizedRadius}
              />
              <circle
                className="score-circle-bar"
                cx="27"
                cy="27"
                r={normalizedRadius}
                strokeDasharray={circumference + ' ' + circumference}
                style={{ strokeDashoffset }}
              />
            </svg>
            <div className="score-circle-text">{scores.total}</div>
          </div>
          <span className="score-circle-lbl">綜合評分</span>
        </div>
      </div>

      {/* 核心財務指標列 */}
      <div className="metrics-row">
        <div className="metric-item">
          <span className="metric-label">本益比</span>
          <span className="metric-val">{pe_ratio}x</span>
        </div>
        <div className="metric-item">
          <span className="metric-label">預估殖利率</span>
          <span className="metric-val yield">{dividend_yield}%</span>
        </div>
        <div className="metric-item">
          <span className="metric-label">今日成交量</span>
          <span className="metric-val">{(volume / 10).toLocaleString('zh-TW', { maximumFractionDigits: 0 })} 張</span>
        </div>
      </div>

      {/* 子分數五大維度拆解 */}
      <div className="subscores-section">
        {/* 動能 */}
        <div className="subscore-item">
          <div className="subscore-header">
            <span className="subscore-name">📊 動能強度</span>
            <span className="subscore-val">{scores.momentum}</span>
          </div>
          <div className="subscore-track">
            <div className="subscore-fill fill-momentum" style={{ width: `${scores.momentum}%` }}></div>
          </div>
        </div>

        {/* 評價 */}
        <div className="subscore-item">
          <div className="subscore-header">
            <span className="subscore-name">💎 評價安全邊際</span>
            <span className="subscore-val">{scores.valuation}</span>
          </div>
          <div className="subscore-track">
            <div className="subscore-fill fill-valuation" style={{ width: `${scores.valuation}%` }}></div>
          </div>
        </div>

        {/* 收益 */}
        <div className="subscore-item">
          <div className="subscore-header">
            <span className="subscore-name">💰 股息回報率</span>
            <span className="subscore-val">{scores.dividend}</span>
          </div>
          <div className="subscore-track">
            <div className="subscore-fill fill-dividend" style={{ width: `${scores.dividend}%` }}></div>
          </div>
        </div>

        {/* 防禦風險 */}
        <div className="subscore-item">
          <div className="subscore-header">
            <span className="subscore-name">🛡️ 防禦力 (波動低)</span>
            <span className="subscore-val">{scores.risk}</span>
          </div>
          <div className="subscore-track">
            <div className="subscore-fill fill-risk" style={{ width: `${scores.risk}%` }}></div>
          </div>
        </div>

        {/* 趨勢 */}
        <div className="subscore-item">
          <div className="subscore-header">
            <span className="subscore-name">🚀 產業趨勢</span>
            <span className="subscore-val">{scores.trend}</span>
          </div>
          <div className="subscore-track">
            <div className="subscore-fill fill-trend" style={{ width: `${scores.trend}%` }}></div>
          </div>
        </div>
      </div>

      {/* 操作判定標籤列 */}
      <div className="tags-row">
        {timing_status.tags.map((tag, idx) => {
          let extraClass = '';
          if (tag === '過熱不追' || tag === '高波動') extraClass = 'hot';
          if (tag === '雙重題材') extraClass = 'vol';
          return (
            <span key={idx} className={`tag-badge ${extraClass}`}>
              {tag}
            </span>
          );
        })}
      </div>

      {/* 推薦理由簡述 */}
      <div className="reason-box" title={reason}>
        {reason}
      </div>

      {/* 📁 專業分析師診斷與國際局勢 */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.015)',
        border: '1px solid rgba(255, 255, 255, 0.04)',
        padding: '0.65rem',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.4rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 700 }}>🔍 分析師動作建議</span>
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 800,
            color: analyst_action.includes('強力買進') ? 'var(--color-up)' : 
                   analyst_action.includes('分批') ? 'var(--accent-blue)' : 'var(--text-secondary)',
            background: analyst_action.includes('強力買進') ? 'rgba(255, 77, 79, 0.08)' : 
                       analyst_action.includes('分批') ? 'rgba(59, 130, 246, 0.08)' : 'rgba(255,255,255,0.03)',
            padding: '0.12rem 0.4rem',
            borderRadius: '4px',
            border: `1px solid ${analyst_action.includes('強力買進') ? 'rgba(255, 77, 79, 0.2)' : 
                                   analyst_action.includes('分批') ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.06)'}`
          }}>
            {analyst_action}
          </span>
        </div>
        <div style={{ fontSize: '0.7rem', color: 'rgba(245, 158, 11, 0.85)', lineHeight: 1.35 }}>
          ⚠️ <strong>核心風險：</strong>{core_risk}
        </div>
        <div style={{ fontSize: '0.7rem', color: 'rgba(6, 182, 212, 0.85)', lineHeight: 1.35 }}>
          🌐 <strong>國際連動：</strong>{global_linkage}
        </div>
      </div>

      {/* 具體策略摺疊區 */}
      <div className="strategy-accord">
        <button 
          className="strategy-toggle"
          onClick={() => setStrategyOpen(!strategyOpen)}
        >
          <span>🎯 進出場決策策略</span>
          <span>{strategyOpen ? '▲ 折疊' : '▼ 展開具體建議價位'}</span>
        </button>
        {strategyOpen && (
          <div className="strategy-body">
            <div className="strat-item">
              <span className="strat-lbl">觀察區間</span>
              <span className="strat-desc" style={{ color: 'var(--accent-amber)' }}>{strategy.observe_range}</span>
            </div>
            <div className="strat-item">
              <span className="strat-lbl">進場方式</span>
              <span className="strat-desc">{strategy.entry_method}</span>
            </div>
            <div className="strat-item">
              <span className="strat-lbl">停利目標</span>
              <span className="strat-desc" style={{ color: 'var(--color-up)' }}>{strategy.exit_method}</span>
            </div>
            <div className="strat-item">
              <span className="strat-lbl">警戒防守</span>
              <span className="strat-desc" style={{ color: 'var(--text-secondary)' }}>{strategy.stop_loss}</span>
            </div>
          </div>
        )}
      </div>

      {/* 多維度資料日期更新標記 */}
      <div className="timestamps-row">
        <div className="time-item">
          <span>股價：</span>
          <span className="time-val">{timestamps.price_date}</span>
        </div>
        <div className="time-item">
          <span>法人：</span>
          <span className="time-val">{timestamps.inst_date}</span>
        </div>
        <div className="time-item">
          <span>分點：</span>
          <span className="time-val">{timestamps.broker_date}</span>
        </div>
        <div className="time-item">
          <span>財報：</span>
          <span className="time-val">{timestamps.report_date}</span>
        </div>
      </div>
    </article>
  );
}
