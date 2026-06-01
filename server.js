import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// 模擬股票基本對照價
const stockBasePrices = {
  "2330": 2415.0, // 台積電
  "2317": 320.0,  // 鴻海
  "2454": 2150.0, // 聯發科
  "2382": 480.0,  // 廣達
  "3017": 1250.0, // 奇鋐
  "3324": 1180.0, // 雙鴻
  "2308": 540.0,  // 台達電
  "8210": 620.0,  // 勤誠
  "2059": 1850.0, // 川湖
  "3008": 3200.0, // 大立光
  "2327": 780.0,  // 國巨
  "2383": 520.0,  // 台光電
  "2408": 72.0,   // 南亞科
  "2891": 41.5,   // 中信金
  "2881": 92.0,   // 富邦金
  "2882": 64.0,   // 國泰金
  "1301": 58.0,   // 台塑
  "2002": 23.5    // 中鋼
};

// GET /api/stock/:code/realtime
// 獲取該股票當天每分鐘的即時走勢（模擬台股 9:00 - 13:30 共 270 分鐘數據）
app.get('/api/stock/:code/realtime', (req, res) => {
  const code = req.params.code;
  const basePrice = stockBasePrices[code] || 100.0;
  
  const result = [];
  let currentPrice = basePrice * 0.985; // 模擬從昨收價附近低開或跳空
  
  // 生成 120 點用於圖表展示（簡化版即時分時折線）
  for (let i = 0; i < 120; i++) {
    const min = i % 60;
    const hour = 9 + Math.floor(i / 60);
    const timeStr = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
    
    // 動態隨機波動
    const volatility = (Math.random() - 0.49) * (basePrice * 0.002);
    currentPrice += volatility;
    // 限制漲跌幅在 10% 內
    currentPrice = Math.max(basePrice * 0.9, Math.min(basePrice * 1.1, currentPrice));
    
    result.push({
      time: timeStr,
      price: parseFloat(currentPrice.toFixed(1)),
      volume: Math.floor(Math.random() * 300) + 30
    });
  }
  
  console.log(`[API] 獲取股票 ${code} 當日即時走勢數據，共 ${result.length} 筆`);
  res.json(result);
});

// GET /api/stock/:code/kline?type=daily
// 獲取歷史 K 線數據。支援 type=day/week/month (可傳入 daily/weekly/monthly 作為映射)
app.get('/api/stock/:code/kline', (req, res) => {
  const code = req.params.code;
  const type = req.query.type || 'daily';
  
  const basePrice = stockBasePrices[code] || 100.0;
  const dataCount = 90; // 回傳 90 根 K 線
  const result = [];
  
  let currentPrice = basePrice * 0.8; // 歷史從低點逐步走揚
  let date = new Date();
  date.setDate(date.getDate() - (type === 'month' ? dataCount * 30 : type === 'week' ? dataCount * 7 : dataCount));

  for (let i = 0; i < dataCount; i++) {
    if (type === 'day' || type === 'daily') {
      date.setDate(date.getDate() + 1);
      // 跳過週末
      if (date.getDay() === 0 || date.getDay() === 6) {
        i--; // 不算次數
        continue;
      }
    } else if (type === 'week' || type === 'weekly') {
      date.setDate(date.getDate() + 7);
    } else if (type === 'month' || type === 'monthly') {
      date.setMonth(date.getMonth() + 1);
    }
    
    const open = currentPrice;
    // 隨機漲跌波動
    const volatility = (Math.random() - 0.47) * (basePrice * 0.035);
    const close = Math.max(basePrice * 0.4, open + volatility);
    const high = Math.max(open, close) + Math.random() * (basePrice * 0.015);
    const low = Math.max(basePrice * 0.35, Math.min(open, close) - Math.random() * (basePrice * 0.015));
    const volume = Math.floor(Math.random() * 15000) + 2000;
    
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
  
  console.log(`[API] 獲取股票 ${code} 歷史 K 線數據 (${type})，共 ${result.length} 筆`);
  res.json(result);
});

app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🚀 台股 AI 改版後端 API 伺服器已成功啟動！`);
  console.log(`📡 監聽埠號: http://localhost:${PORT}`);
  console.log(`📊 支援接口 1: GET /api/stock/:code/realtime`);
  console.log(`📊 支援接口 2: GET /api/stock/:code/kline?type=daily`);
  console.log(`==================================================`);
});
