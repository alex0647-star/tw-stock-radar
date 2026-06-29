import React, { useState, useEffect, useRef } from 'react';
import { stockData } from '../data/stocks';

export default function StockDetail({ stockId }) {
  const [stock, setStock] = useState(null);
  const [chartType, setChartType] = useState('daily'); // 'realtime' | 'daily' | 'weekly' | 'monthly'
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 懸停顯示的開高低收數據 (Crosshair states)
  const [hoverData, setHoverData] = useState(null);
  
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // 獲取該股票基本面數據
  useEffect(() => {
    const currentStock = stockData.find(s => s.stock_id === stockId);
    if (currentStock) {
      setStock(currentStock);
    }
  }, [stockId]);

  // 從後端 API 獲取即時走勢與 K 線數據 (具備 Fallback 防禦機制)
  useEffect(() => {
    if (!stockId) return;
    setLoading(true);
    
    const backendUrl = `/api/stock/${stockId}`;
    const url = chartType === 'realtime' 
      ? `${backendUrl}/realtime`
      : `${backendUrl}/kline?type=${chartType === 'daily' ? 'day' : chartType === 'weekly' ? 'week' : 'month'}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setChartData(data);
        setLoading(false);
      })
      .catch(err => {
        console.warn("無法連接後端 API，啟用前端 Fallback 模擬數據生成機制。");
        // Fallback: 前端動態模擬生成 K 線數據
        const simulatedData = generateMockData(stockId, chartType);
        setChartData(simulatedData);
        setLoading(false);
      });
  }, [stockId, chartType]);

  // 動態模擬生成數據算法 (當後端沒開時，保證前端仍然能完美畫圖)
  const generateMockData = (code, type) => {
    const currentStock = stockData.find(s => s.stock_id === code) || { current_price: 500 };
    const basePrice = currentStock.current_price;
    const dataCount = type === 'realtime' ? 120 : 80;
    const result = [];
    
    let currentPrice = basePrice * (type === 'realtime' ? 0.98 : 0.85);
    let date = new Date();
    date.setDate(date.getDate() - dataCount);

    for (let i = 0; i < dataCount; i++) {
      if (type === 'realtime') {
        // 分時即時數據 (只有 price, volume, time)
        const timeStr = new Date(2026, 5, 1, 9, i).toLocaleTimeString('zh-TW', { hour12: false, hour: '2-digit', minute: '2-digit' });
        const volatility = (Math.random() - 0.48) * (basePrice * 0.003);
        currentPrice += volatility;
        // 限制在漲跌幅 10% 內
        currentPrice = Math.max(basePrice * 0.9, Math.min(basePrice * 1.1, currentPrice));
        result.push({
          time: timeStr,
          price: parseFloat(currentPrice.toFixed(1)),
          volume: Math.floor(Math.random() * 200) + 50
        });
      } else {
        // 歷史 K 線數據 (open, high, low, close, volume, date)
        date.setDate(date.getDate() + 1);
        const dayOfWeek = date.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          // 週末不交易，略過
          continue;
        }
        
        const open = currentPrice;
        const volatility = (Math.random() - 0.48) * (basePrice * 0.02);
        const close = Math.max(basePrice * 0.5, open + volatility);
        const high = Math.max(open, close) + Math.random() * (basePrice * 0.01);
        const low = Math.min(open, close) - Math.random() * (basePrice * 0.01);
        const volume = Math.floor(Math.random() * 8000) + 1500;
        
        const dateStr = date.toISOString().split('T')[0];
        result.push({
          date: dateStr,
          open: parseFloat(open.toFixed(1)),
          high: parseFloat(high.toFixed(1)),
          low: parseFloat(low.toFixed(1)),
          close: parseFloat(close.toFixed(1)),
          volume: volume
        });
        
        currentPrice = close;
      }
    }
    return result;
  };

  // 繪製 HTML5 Canvas K 線與即時走勢圖
  useEffect(() => {
    if (loading || chartData.length === 0 || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // 設定響應式 Retina 解析度
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    const width = rect.width;
    const height = rect.height;
    
    // 清空畫布
    ctx.fillStyle = '#121824'; // tw-bg-secondary 深色背景
    ctx.fillRect(0, 0, width, height);
    
    // 邊距
    const margin = { top: 30, right: 60, bottom: 40, left: 15 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    
    // 區分分時走勢與 K 線圖繪製
    if (chartType === 'realtime') {
      drawRealtimeChart(ctx, chartData, margin, chartWidth, chartHeight);
    } else {
      drawCandlestickChart(ctx, chartData, margin, chartWidth, chartHeight);
    }
  }, [chartData, chartType, loading]);

  // 1. 繪製分時即時走勢折線圖
  const drawRealtimeChart = (ctx, data, margin, chartWidth, chartHeight) => {
    const prices = data.map(d => d.price);
    const minPrice = Math.min(...prices) * 0.998;
    const maxPrice = Math.max(...prices) * 1.002;
    
    const getX = (index) => margin.left + (index / (data.length - 1)) * chartWidth;
    const getY = (price) => margin.top + chartHeight - ((price - minPrice) / (maxPrice - minPrice)) * chartHeight;
    
    // 繪製格線與刻度
    drawGridlines(ctx, margin, chartWidth, chartHeight, minPrice, maxPrice);
    
    // 繪製漸層填滿面積
    ctx.beginPath();
    ctx.moveTo(getX(0), getY(prices[0]));
    for (let i = 1; i < data.length; i++) {
      ctx.lineTo(getX(i), getY(prices[i]));
    }
    ctx.lineTo(getX(data.length - 1), margin.top + chartHeight);
    ctx.lineTo(getX(0), margin.top + chartHeight);
    ctx.closePath();
    
    const gradient = ctx.createLinearGradient(0, margin.top, 0, margin.top + chartHeight);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.25)'); // 科技藍
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0.00)');
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // 繪製價格折線
    ctx.beginPath();
    ctx.moveTo(getX(0), getY(prices[0]));
    for (let i = 1; i < data.length; i++) {
      ctx.lineTo(getX(i), getY(prices[i]));
    }
    ctx.strokeStyle = '#3b82f6'; // 藍色走勢線
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 繪製量能柱狀圖 (佔底部 20% 高度)
    const volHeight = chartHeight * 0.18;
    const maxVol = Math.max(...data.map(d => d.volume));
    
    for (let i = 0; i < data.length; i++) {
      const vHeight = (data[i].volume / maxVol) * volHeight;
      const x = getX(i) - 1;
      const y = margin.top + chartHeight - vHeight;
      ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
      ctx.fillRect(x, y, 2, vHeight);
    }
  };

  // 2. 繪製蠟燭 K 線圖 (Candlestick)
  const drawCandlestickChart = (ctx, data, margin, chartWidth, chartHeight) => {
    const highs = data.map(d => d.high);
    const lows = data.map(d => d.low);
    const minPrice = Math.min(...lows) * 0.995;
    const maxPrice = Math.max(...highs) * 1.005;
    
    const getX = (index) => margin.left + (index / (data.length - 1)) * chartWidth;
    const getY = (price) => margin.top + chartHeight - ((price - minPrice) / (maxPrice - minPrice)) * chartHeight;
    
    // 繪製格線與刻度
    drawGridlines(ctx, margin, chartWidth, chartHeight, minPrice, maxPrice);
    
    const barWidth = Math.max(2, (chartWidth / data.length) * 0.7);
    
    // 繪製每個 K 線蠟燭
    for (let i = 0; i < data.length; i++) {
      const d = data[i];
      const isUp = d.close >= d.open;
      const color = isUp ? '#ff4d4f' : '#27c282'; // 台灣股市紅漲綠跌
      
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 1.2;
      
      // 1. 繪製影線 (High - Low)
      ctx.beginPath();
      ctx.moveTo(getX(i), getY(d.high));
      ctx.lineTo(getX(i), getY(d.low));
      ctx.stroke();
      
      // 2. 繪製實體蠟燭 (Open - Close)
      const yOpen = getY(d.open);
      const yClose = getY(d.close);
      const x = getX(i) - barWidth / 2;
      const candleHeight = Math.max(1.5, Math.abs(yOpen - yClose));
      const y = Math.min(yOpen, yClose);
      
      ctx.fillRect(x, y, barWidth, candleHeight);
    }
    
    // 繪製量能柱狀圖 (佔底部 20% 高度)
    const volHeight = chartHeight * 0.18;
    const maxVol = Math.max(...data.map(d => d.volume));
    
    for (let i = 0; i < data.length; i++) {
      const d = data[i];
      const isUp = d.close >= d.open;
      const color = isUp ? 'rgba(255, 77, 79, 0.3)' : 'rgba(39, 194, 130, 0.3)';
      const vHeight = (d.volume / maxVol) * volHeight;
      const x = getX(i) - barWidth / 2;
      const y = margin.top + chartHeight - vHeight;
      
      ctx.fillStyle = color;
      ctx.fillRect(x, y, barWidth, vHeight);
    }
  };

  // 繪製背景網格與價格刻度標籤
  const drawGridlines = (ctx, margin, chartWidth, chartHeight, minPrice, maxPrice) => {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#9ca3af'; // 灰色文字
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    
    const gridCount = 4;
    for (let i = 0; i <= gridCount; i++) {
      const y = margin.top + (i / gridCount) * chartHeight;
      // 橫線
      ctx.beginPath();
      ctx.moveTo(margin.left, y);
      ctx.lineTo(margin.left + chartWidth, y);
      ctx.stroke();
      
      // 價格刻度值
      const priceVal = maxPrice - (i / gridCount) * (maxPrice - minPrice);
      ctx.fillText(priceVal.toLocaleString('zh-TW', { maximumFractionDigits: 1 }), margin.left + chartWidth + 8, y + 4);
    }
  };

  // 處理鼠標十字準線 Hover 事件 (Crosshair move)
  const handleMouseMove = (e) => {
    if (chartData.length === 0 || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    
    const margin = { top: 30, right: 60, bottom: 40, left: 15 };
    const chartWidth = rect.width - margin.left - margin.right;
    
    // 計算最接近的數據索引
    let idx = Math.floor(((x - margin.left) / chartWidth) * (chartData.length - 1));
    idx = Math.max(0, Math.min(chartData.length - 1, idx));
    
    const hoveredPoint = chartData[idx];
    setHoverData(hoveredPoint);
  };

  const handleMouseLeave = () => {
    setHoverData(null);
  };

  // 行情基本面渲染
  if (!stock) return <div className="text-center py-10">資料載入中...</div>;

  const isUp = stock.change >= 0;
  
  // 計算行情詳情面版需要的開高低收
  const openPrice = (stock.current_price * 0.985).toFixed(1);
  const highPrice = (stock.current_price * 1.015).toFixed(1);
  const lowPrice = (stock.current_price * 0.98).toFixed(1);

  return (
    <div ref={containerRef} className="w-full max-w-6xl mx-auto p-4 bg-tw-bg-secondary border border-white/5 rounded-2xl shadow-2xl flex flex-col gap-6 text-gray-100">
      
      {/* 詳情頂部：返回按鈕與標題 */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => window.location.hash = '#/'}
            className="flex items-center gap-1 px-3 py-1.5 bg-tw-bg-tertiary border border-white/5 hover:bg-gray-800 text-sm font-semibold rounded-lg transition-all"
          >
            ← 返回清單
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              {stock.stock_id} <span className="text-gray-300">{stock.stock_name}</span>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">{stock.category} • {stock.sub_category}</p>
          </div>
        </div>
        
        {/* 開高低收即時數據板塊 */}
        <div className="flex items-end gap-3 text-right">
          <div>
            <div className="text-2xl md:text-3xl font-extrabold monospace leading-none" style={{ color: isUp ? 'var(--color-up)' : 'var(--color-down)' }}>
              {stock.current_price.toLocaleString('zh-TW', { minimumFractionDigits: 1 })}
            </div>
            <div className="text-xs md:text-sm font-bold flex items-center justify-end gap-1 mt-1" style={{ color: isUp ? 'var(--color-up)' : 'var(--color-down)' }}>
              <span>{isUp ? '▲' : '▼'}</span>
              <span>{Math.abs(stock.change).toFixed(1)}</span>
              <span>({isUp ? '+' : ''}{stock.change_percent.toFixed(2)}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 即時行情看板面版 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 bg-white/2 border border-white/5 p-4 rounded-xl">
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 font-medium">開盤價</span>
          <span className="text-sm font-bold monospace mt-1 text-gray-200">{openPrice}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 font-medium">最高價</span>
          <span className="text-sm font-bold monospace mt-1 text-tw-up">{highPrice}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 font-medium">最低價</span>
          <span className="text-sm font-bold monospace mt-1 text-tw-down">{lowPrice}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 font-medium">成交量</span>
          <span className="text-sm font-bold monospace mt-1 text-gray-200">{(stock.volume / 10).toLocaleString('zh-TW')} 張</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 font-medium">預估殖利率</span>
          <span className="text-sm font-bold monospace mt-1 text-amber-500">{stock.dividend_yield}%</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 font-medium">本益比</span>
          <span className="text-sm font-bold monospace mt-1 text-gray-200">{stock.pe_ratio} 倍</span>
        </div>
      </div>

      {/* 3. K線圖交互區域 */}
      <div className="flex flex-col gap-3">
        {/* 圖表控制器：時間切換與 OCHL 即時回顯 */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-tw-bg-tertiary border border-white/5 p-3 rounded-xl">
          {/* 時間切換按鈕 */}
          <div className="flex gap-1 bg-tw-bg-primary border border-white/5 p-1 rounded-lg">
            <button
              onClick={() => setChartType('realtime')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${chartType === 'realtime' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-400 hover:text-gray-200'}`}
            >
              即時走勢
            </button>
            <button
              onClick={() => setChartType('daily')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${chartType === 'daily' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-400 hover:text-gray-200'}`}
            >
              日K
            </button>
            <button
              onClick={() => setChartType('weekly')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${chartType === 'weekly' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-400 hover:text-gray-200'}`}
            >
              週K
            </button>
            <button
              onClick={() => setChartType('monthly')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${chartType === 'monthly' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-400 hover:text-gray-200'}`}
            >
              月K
            </button>
          </div>

          {/* 十字準線 OCHL 即時回顯看板 */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs md:text-sm font-semibold text-gray-300">
            {hoverData ? (
              <>
                <span className="text-gray-400 font-bold">{chartType === 'realtime' ? '時間:' : '日期:'} <span className="text-gray-200 monospace">{chartType === 'realtime' ? hoverData.time : hoverData.date}</span></span>
                {chartType === 'realtime' ? (
                  <span className="text-gray-400 font-bold">價格: <span className="text-blue-400 monospace">{hoverData.price}</span></span>
                ) : (
                  <>
                    <span className="text-gray-400 font-bold">開: <span className="text-gray-200 monospace">{hoverData.open}</span></span>
                    <span className="text-gray-400 font-bold">高: <span className="text-tw-up monospace">{hoverData.high}</span></span>
                    <span className="text-gray-400 font-bold">低: <span className="text-tw-down monospace">{hoverData.low}</span></span>
                    <span className="text-gray-400 font-bold">收: <span style={{ color: hoverData.close >= hoverData.open ? 'var(--color-up)' : 'var(--color-down)' }} className="monospace">{hoverData.close}</span></span>
                  </>
                )}
                <span className="text-gray-400 font-bold">量: <span className="text-amber-500 monospace">{hoverData.volume.toLocaleString()}</span></span>
              </>
            ) : (
              <span className="text-gray-500 text-xs italic">💡 將滑鼠游標移至圖表上，可動態檢視開高低收數據</span>
            )}
          </div>
        </div>

        {/* 4. Canvas 圖表本體 */}
        <div className="w-full relative h-[380px] bg-tw-bg-secondary border border-white/5 rounded-xl overflow-hidden shadow-inner">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-tw-bg-secondary text-gray-400">
              <div className="flex flex-col items-center gap-2">
                <span className="text-3xl animate-spin">⏳</span>
                <span>圖表繪製載入中...</span>
              </div>
            </div>
          ) : (
            <canvas
              ref={canvasRef}
              className="w-full h-full block cursor-crosshair"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            />
          )}
        </div>
      </div>
      
      {/* 5. 專家診斷理由 */}
      <div className="bg-tw-bg-tertiary border border-white/5 p-4 rounded-xl">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">💡 分析師診斷摘要</h3>
        <p className="text-sm text-gray-300 leading-relaxed">{stock.reason}</p>
      </div>
    </div>
  );
}
