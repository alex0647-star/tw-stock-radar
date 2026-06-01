import React from 'react';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-brand">
        <span className="brand-logo">台灣股市推薦觀察台</span>
        <span className="brand-badge">AI v2.0</span>
      </div>
      
      <div className="nav-stats">
        <div className="index-widget">
          <span className="index-title">加權指數</span>
          <span className="index-value">45,182.50</span>
          <span className="index-change up">
            ▲ 312.80 (+0.70%)
          </span>
        </div>

        <div className="index-widget">
          <span className="index-title">預估成交量</span>
          <span className="index-value">5,420 億</span>
        </div>
        
        <div className="nav-time">
          <span>資料基準日：2026-06-01</span>
          <span style={{ fontSize: '0.75rem', marginTop: '0.15rem' }}>AI 即時運算版</span>
        </div>
      </div>
    </nav>
  );
}
