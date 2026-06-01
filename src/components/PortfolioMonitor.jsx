import React, { useState } from 'react';

export default function PortfolioMonitor({ 
  stocks, 
  favorites, 
  onToggleFavorite,
  holdings,
  onAddHolding,
  onRemoveHolding
}) {
  const [selectedStockId, setSelectedStockId] = useState(stocks[0]?.stock_id || '');
  const [buyPrice, setBuyPrice] = useState('');
  const [lots, setLots] = useState('');

  // 取得自選股詳細資料
  const favoriteStocks = stocks.filter(s => favorites.includes(s.stock_id));

  // 提交新增持股
  const handleSubmitHolding = (e) => {
    e.preventDefault();
    if (!selectedStockId || !buyPrice || !lots) return;
    
    onAddHolding({
      stock_id: selectedStockId,
      buy_price: parseFloat(buyPrice),
      lots: parseFloat(lots)
    });
    setBuyPrice('');
    setLots('');
  };

  // 計算持股部位數據
  const holdingsDetails = holdings.map(h => {
    const stockInfo = stocks.find(s => s.stock_id === h.stock_id);
    if (!stockInfo) return null;
    
    const marketValue = stockInfo.current_price * h.lots * 1000; // 1張 = 1000股
    const cost = h.buy_price * h.lots * 1000;
    const profit = marketValue - cost;
    const profitPercent = cost > 0 ? (profit / cost) * 100 : 0;
    
    return {
      ...h,
      stockInfo,
      marketValue,
      cost,
      profit,
      profitPercent
    };
  }).filter(Boolean);

  const totalMarketValue = holdingsDetails.reduce((acc, curr) => acc + curr.marketValue, 0);
  const totalCost = holdingsDetails.reduce((acc, curr) => acc + curr.cost, 0);
  const totalProfit = totalMarketValue - totalCost;
  const totalProfitPercent = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

  // 計算電子權值曝險 % (半導體, 電子組裝, 電子零組件, 光學鏡頭)
  const techCategories = ["半導體", "電子組裝", "電子零組件", "光學鏡頭"];
  const techValue = holdingsDetails.reduce((acc, curr) => {
    if (techCategories.includes(curr.stockInfo.category)) {
      return acc + curr.marketValue;
    }
    return acc;
  }, 0);
  const techExposurePercent = totalMarketValue > 0 ? (techValue / totalMarketValue) * 100 : 0;

  // 按產業統計市值，供圓餅圖使用
  const categoryStats = holdingsDetails.reduce((acc, curr) => {
    const cat = curr.stockInfo.category;
    acc[cat] = (acc[cat] || 0) + curr.marketValue;
    return acc;
  }, {});

  const categoryArray = Object.keys(categoryStats).map(cat => ({
    name: cat,
    value: categoryStats[cat],
    percent: totalMarketValue > 0 ? (categoryStats[cat] / totalMarketValue) * 100 : 0
  })).sort((a, b) => b.value - a.value);

  // 產業配色
  const catColors = {
    "半導體": "#3b82f6",     // 藍
    "電子組裝": "#8b5cf6",   // 紫
    "電子零組件": "#06b6d4", // 靛藍
    "光學鏡頭": "#ec4899",   // 粉
    "金融保險": "#10b981",   // 綠
    "傳統產業": "#f59e0b",   // 黃
    "通用機械": "#6b7280"    // 灰
  };

  // 生成 SVG 圓餅圖路徑參數
  let accumulatedPercent = 0;
  const pieSegments = categoryArray.map((cat, idx) => {
    const color = catColors[cat.name] || "#6b7280";
    const strokeDasharray = `${cat.percent} ${100 - cat.percent}`;
    const strokeDashoffset = 100 - accumulatedPercent;
    accumulatedPercent += cat.percent;
    return {
      ...cat,
      color,
      strokeDasharray,
      strokeDashoffset
    };
  });

  return (
    <div className="portfolio-container">
      {/* 左半邊：表格與清單 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* 我的自選監控 */}
        <div className="monitor-card">
          <h2 className="monitor-title">自選股動態即時監控 ({favoriteStocks.length} 檔)</h2>
          {favoriteStocks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">♥</div>
              <div className="empty-text">目前自選清單為空。請在卡片中點擊心型圖示加入自選！</div>
            </div>
          ) : (
            <div className="holdings-table-wrapper">
              <table className="holdings-table">
                <thead>
                  <tr>
                    <th>代碼</th>
                    <th>名稱</th>
                    <th>現價</th>
                    <th>漲跌幅</th>
                    <th>時機狀態</th>
                    <th>主要優勢 / 警示</th>
                    <th>自選管理</th>
                  </tr>
                </thead>
                <tbody>
                  {favoriteStocks.map(stock => {
                    const isUp = stock.change >= 0;
                    let badgeClass = 'watch';
                    if (stock.timing_status.status === '等待拉回' || stock.timing_status.status === '等待回檔') badgeClass = 'wait';
                    if (stock.timing_status.status === '可分批布局' || stock.timing_status.status === '可布局') badgeClass = 'buy';

                    return (
                      <tr key={stock.stock_id}>
                        <td style={{ fontFamily: 'monospace', fontWeight: 700 }}>{stock.stock_id}</td>
                        <td style={{ fontWeight: 600 }}>{stock.stock_name}</td>
                        <td style={{ fontFamily: 'monospace', fontWeight: 700, color: isUp ? 'var(--color-up)' : 'var(--color-down)' }}>
                          {stock.current_price}
                        </td>
                        <td style={{ fontFamily: 'monospace', fontWeight: 700, color: isUp ? 'var(--color-up)' : 'var(--color-down)' }}>
                          {isUp ? '+' : ''}{stock.change_percent.toFixed(2)}%
                        </td>
                        <td>
                          <span className={`timing-badge ${badgeClass}`} style={{ transform: 'scale(0.85)', transformOrigin: 'left' }}>
                            {stock.timing_status.status}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {stock.scores.momentum >= 90 && "🔥 動能強勁 | "}
                          {stock.scores.valuation >= 75 && "💎 評價具安全邊際 | "}
                          {stock.timing_status.tags.includes("過熱不追") && "⚠️ 短線過熱建議等拉回"}
                          {!stock.timing_status.tags.includes("過熱不追") && "基本面穩健，適合追蹤"}
                        </td>
                        <td>
                          <button 
                            className="btn-delete-hold"
                            onClick={() => onToggleFavorite(stock.stock_id)}
                            title="取消自選"
                          >
                            ❌
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 實體持股部位管理 */}
        <div className="monitor-card">
          <h2 className="monitor-title">真實持股部位監控（部位分析模式）</h2>
          
          {/* 新增部位表單 */}
          <form className="holdings-form" onSubmit={handleSubmitHolding}>
            <div className="form-group-hold">
              <label className="form-label">選擇股票</label>
              <select 
                className="form-input"
                value={selectedStockId}
                onChange={(e) => setSelectedStockId(e.target.value)}
              >
                {stocks.map(s => (
                  <option key={s.stock_id} value={s.stock_id}>
                    {s.stock_id} - {s.stock_name} ({s.category})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group-hold">
              <label className="form-label">買進價格 (NTD)</label>
              <input 
                type="number" 
                step="0.1"
                className="form-input" 
                placeholder="例如 2350"
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group-hold">
              <label className="form-label">持股張數 (張 = 1,000股)</label>
              <input 
                type="number" 
                step="0.01"
                className="form-input" 
                placeholder="例如 5"
                value={lots}
                onChange={(e) => setLots(e.target.value)}
                required
              />
            </div>
            
            <button type="submit" className="btn-add-hold">新增持股</button>
          </form>

          {holdingsDetails.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📈</div>
              <div className="empty-text">目前未建立部位。請在上方輸入您真實或模擬的持股明細以開啟風險與產業集中度分析！</div>
            </div>
          ) : (
            <div className="holdings-table-wrapper">
              <table className="holdings-table">
                <thead>
                  <tr>
                    <th>代碼 / 名稱</th>
                    <th>產業</th>
                    <th>買入成本</th>
                    <th>今日現價</th>
                    <th>持有張數</th>
                    <th>部位現值</th>
                    <th>今日損益</th>
                    <th>移出</th>
                  </tr>
                </thead>
                <tbody>
                  {holdingsDetails.map(h => {
                    const isProfit = h.profit >= 0;
                    return (
                      <tr key={h.stock_id}>
                        <td>
                          <div style={{ fontWeight: 700 }}>{h.stock_id}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{h.stockInfo.stock_name}</div>
                        </td>
                        <td style={{ fontSize: '0.8rem' }}>{h.stockInfo.category}</td>
                        <td style={{ fontFamily: 'monospace' }}>{h.buy_price.toLocaleString('zh-TW', { minimumFractionDigits: 1 })}</td>
                        <td style={{ fontFamily: 'monospace', fontWeight: 700 }}>{h.stockInfo.current_price.toLocaleString('zh-TW', { minimumFractionDigits: 1 })}</td>
                        <td style={{ fontFamily: 'monospace' }}>{h.lots} 張</td>
                        <td style={{ fontFamily: 'monospace', fontWeight: 700 }}>
                          {h.marketValue.toLocaleString('zh-TW', { maximumFractionDigits: 0 })} 元
                        </td>
                        <td style={{ fontFamily: 'monospace', fontWeight: 700, color: isProfit ? 'var(--color-up)' : 'var(--color-down)' }}>
                          {isProfit ? '+' : ''}{h.profit.toLocaleString('zh-TW', { maximumFractionDigits: 0 })} 元
                          <div style={{ fontSize: '0.75rem' }}>({isProfit ? '+' : ''}{h.profitPercent.toFixed(2)}%)</div>
                        </td>
                        <td>
                          <button 
                            className="btn-delete-hold"
                            onClick={() => onRemoveHolding(h.stock_id)}
                            title="刪除此筆持股"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  
                  {/* 合計欄位 */}
                  <tr style={{ background: 'rgba(255, 255, 255, 0.02)', fontWeight: 700 }}>
                    <td colSpan="4">合計部位</td>
                    <td>{holdingsDetails.reduce((acc, curr) => acc + curr.lots, 0).toFixed(2)} 張</td>
                    <td style={{ fontFamily: 'monospace', color: 'var(--accent-blue)', fontSize: '0.95rem' }}>
                      {totalMarketValue.toLocaleString('zh-TW', { maximumFractionDigits: 0 })} 元
                    </td>
                    <td style={{ fontFamily: 'monospace', color: totalProfit >= 0 ? 'var(--color-up)' : 'var(--color-down)', fontSize: '0.95rem' }} colSpan="2">
                      {totalProfit >= 0 ? '+' : ''}{totalProfit.toLocaleString('zh-TW', { maximumFractionDigits: 0 })} 元
                      <span style={{ fontSize: '0.8rem', marginLeft: '0.4rem' }}>({totalProfit >= 0 ? '+' : ''}{totalProfitPercent.toFixed(2)}%)</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 右半邊：部位分析與集中度圖表 */}
      <div className="stats-sidebar">
        
        {/* 電子權值曝險度 */}
        <div className="portfolio-card">
          <h3 className="portfolio-card-title">電子權值股曝險指標</h3>
          {holdingsDetails.length === 0 ? (
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>暫無部位數據</span>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="big-stat">
                <span className="big-stat-val" style={{ color: techExposurePercent >= 80 ? 'var(--color-up)' : 'var(--accent-blue)' }}>
                  {techExposurePercent.toFixed(1)}%
                </span>
                <span className="big-stat-lbl">佔投資組合總市值比</span>
              </div>
              
              <div className="exposure-bar-track">
                <div 
                  className={`exposure-bar-fill ${techExposurePercent >= 80 ? 'high' : ''}`}
                  style={{ width: `${techExposurePercent}%` }}
                ></div>
              </div>

              {techExposurePercent >= 80 ? (
                <div className="alert-message warning">
                  ⚠️ <strong>電子產業曝險過高！</strong><br />
                  目前投資組合高度集中於電子/半導體類股，大盤高檔修正時波動將顯著加大。建議適度調配 15%~20% 資金至**金融保險**或**傳統產業**以分散風險。
                </div>
              ) : techExposurePercent > 0 ? (
                <div className="alert-message info">
                  ✓ <strong>曝險配置安全</strong><br />
                  目前電子股佔比為合理健康區間，攻守兼備。已預留了傳統或金融股等低波動族群，防禦性佳。
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* 產業集中度圖表 (SVG) */}
        <div className="portfolio-card">
          <h3 className="portfolio-card-title">產業市值集中度</h3>
          {holdingsDetails.length === 0 ? (
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>暫無部位數據</span>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* SVG 圓餅圖 */}
              <div className="pie-svg-container">
                <svg width="120" height="120" viewBox="0 0 42 42" className="pie-chart">
                  <circle cx="21" cy="21" r="15.91549430918954" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="6" />
                  {pieSegments.map((segment, idx) => (
                    <circle
                      key={idx}
                      cx="21"
                      cy="21"
                      r="15.91549430918954"
                      fill="none"
                      stroke={segment.color}
                      strokeWidth="6"
                      strokeDasharray={segment.strokeDasharray}
                      strokeDashoffset={segment.strokeDashoffset}
                      className="pie-segment"
                    />
                  ))}
                </svg>
              </div>

              {/* 產業圖例 */}
              <div className="pie-legend">
                {pieSegments.map((segment, idx) => (
                  <div className="legend-item" key={idx}>
                    <div className="legend-dot-name">
                      <span className="legend-dot" style={{ backgroundColor: segment.color }}></span>
                      <span>{segment.name}</span>
                    </div>
                    <span className="legend-val">{segment.percent.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 推薦重疊度與決策提示 */}
        <div className="portfolio-card">
          <h3 className="portfolio-card-title">自持股契合決策提示</h3>
          {holdingsDetails.length === 0 ? (
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>暫無部位數據</span>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'block' }}>
                您的持股在推薦觀察名單中的時機：
              </span>
              
              {holdingsDetails.map(h => {
                const isRecommend = stocks.find(s => s.stock_id === h.stock_id);
                if (!isRecommend) return null;
                
                let timingClass = 'watch';
                if (isRecommend.timing_status.status === '等待拉回' || isRecommend.timing_status.status === '等待回檔') timingClass = 'wait';
                if (isRecommend.timing_status.status === '可分批布局' || isRecommend.timing_status.status === '可布局') timingClass = 'buy';

                return (
                  <div className="overlap-item" key={h.stock_id}>
                    <span className="overlap-ticker">{h.stock_id} {isRecommend.stock_name}</span>
                    <span className={`overlap-status ${timingClass}`}>{isRecommend.timing_status.status}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
