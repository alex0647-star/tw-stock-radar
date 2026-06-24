import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// 模擬股票基本對照價
const stockBasePrices = {
  "2330": 2415.0, // 台積電 (前收盤，今日 2390.0)
  "2317": 259.5,  // 鴻海 (前收盤，今日 256.0)
  "2454": 4535.0, // 聯發科 (前收盤，今日 4285.0)
  "2382": 480.0,  // 廣達
  "3017": 1250.0, // 奇鋐
  "3324": 1180.0, // 雙鴻
  "2308": 540.0,  // 台達電
  "8210": 620.0,  // 勤誠
  "2059": 1850.0, // 川湖
  "3008": 3200.0, // 大立光
  "2327": 1025.0, // 國巨 (前收盤，今日 1050.0)
  "2383": 520.0,  // 台光電
  "2408": 72.0,   // 南亞科
  "2891": 41.5,   // 中信金
  "2881": 92.0,   // 富邦金
  "2882": 64.0,   // 國泰金
  "1301": 58.0,   // 台塑
  "2002": 23.5,   // 中鋼
  "3481": 66.0    // 群創 (前收盤，今日 69.4)
};

// 模擬大盤狀態
let marketIndexState = {
  value: 45182.50,
  change: 312.80,
  changePercent: 0.70,
  volume: 5420
};

// TWSE API 即時抓取輔助函式 (含防禦性 Timeout 與 Error Handling)
async function fetchTwseData(exChs) {
  try {
    const url = `https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=${exChs}&_=${Date.now()}`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://mis.twse.com.tw/stock/index.jsp?lang=zhHant"
      },
      signal: AbortSignal.timeout(4000)
    });
    if (!response.ok) {
      throw new Error(`HTTP 錯誤狀態: ${response.status}`);
    }
    const data = await response.json();
    if (data && data.rtcode === "0000" && data.msgArray) {
      return data.msgArray;
    }
    throw new Error(data.rtmessage || "API 內部錯誤");
  } catch (error) {
    console.error("[TWSE 同步錯誤]:", error.message);
    return null;
  }
}

// GET /api/market-index
app.get('/api/market-index', async (req, res) => {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('zh-TW', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = now.toISOString().split('T')[0];
  
  const twseData = await fetchTwseData("tse_t00.tw");
  if (twseData && twseData.length > 0) {
    const item = twseData[0];
    const zVal = parseFloat(item.z);
    const yVal = parseFloat(item.y);
    if (!isNaN(zVal) && !isNaN(yVal)) {
      const change = parseFloat((zVal - yVal).toFixed(2));
      const changePercent = parseFloat(((change / yVal) * 100).toFixed(2));
      const volume = Math.floor(parseFloat(item.m || "0") / 100) || 5420;
      
      marketIndexState = {
        value: zVal,
        change: change,
        changePercent: changePercent,
        volume: volume
      };
      
      const formattedDate = item.d ? `${item.d.substring(0, 4)}-${item.d.substring(4, 6)}-${item.d.substring(6, 8)}` : dateStr;
      console.log(`[API] 大盤加權指數已同步自 TWSE: ${zVal} (${changePercent}%)`);
      return res.json({
        ...marketIndexState,
        date: formattedDate,
        time: item.t || timeStr
      });
    }
  }

  // Fallback: 模擬大盤即時跳動
  const diff = parseFloat(((Math.random() - 0.45) * 80).toFixed(2));
  marketIndexState.value = parseFloat((marketIndexState.value + diff).toFixed(2));
  marketIndexState.change = parseFloat((marketIndexState.change + diff).toFixed(2));
  marketIndexState.changePercent = parseFloat(((marketIndexState.change / 44800) * 100).toFixed(2));
  marketIndexState.volume = Math.floor(5200 + (Math.random() - 0.5) * 500);
  
  console.log(`[API] 大盤連線失敗，啟用模擬大盤數據: ${marketIndexState.value}`);
  res.json({
    ...marketIndexState,
    date: dateStr,
    time: timeStr
  });
});

// GET /api/stocks-update
app.get('/api/stocks-update', async (req, res) => {
  const stockIds = Object.keys(stockBasePrices);
  const exChs = stockIds.map(code => code === "3324" ? `otc_${code}.tw` : `tse_${code}.tw`).join('|');
  
  const twseData = await fetchTwseData(exChs);
  const updates = {};

  if (twseData && twseData.length > 0) {
    twseData.forEach(item => {
      const code = item.c;
      if (code) {
        let currentPrice = parseFloat(item.z);
        if (isNaN(currentPrice) || currentPrice === 0) {
          currentPrice = parseFloat(item.pz);
        }
        if (isNaN(currentPrice) || currentPrice === 0) {
          currentPrice = parseFloat(item.o);
        }
        if (isNaN(currentPrice) || currentPrice === 0) {
          currentPrice = parseFloat(item.y);
        }
        
        const yesterdayClose = parseFloat(item.y);
        const volume = parseInt(item.v || "0") * 10;
        
        if (!isNaN(currentPrice) && !isNaN(yesterdayClose)) {
          const change = parseFloat((currentPrice - yesterdayClose).toFixed(1));
          const changePercent = parseFloat(((change / yesterdayClose) * 100).toFixed(2));
          
          updates[code] = {
            current_price: currentPrice,
            change: change,
            change_percent: changePercent,
            volume: volume || 2000
          };
          
          // 同步更新記憶體中的基準價格，使詳情頁與 K 線走勢的開高低收等模擬計算也能同步基於真實收盤價
          stockBasePrices[code] = yesterdayClose;
        }
      }
    });
    
    // 檢查是否有 API 漏給的個股，若有則以模擬補齊
    stockIds.forEach(code => {
      if (!updates[code]) {
        const basePrice = stockBasePrices[code];
        const changePercent = parseFloat((Math.random() * 8 - 3).toFixed(2));
        const change = parseFloat((basePrice * (changePercent / 100)).toFixed(1));
        const currentPrice = parseFloat((basePrice + change).toFixed(code === '2891' || code === '2002' ? 2 : 1));
        const volume = Math.floor(Math.random() * 50000) + 2000;
        
        updates[code] = {
          current_price: currentPrice,
          change: change,
          change_percent: changePercent,
          volume: volume
        };
      }
    });

    console.log(`[API] 已自 TWSE 同步並更新共 ${Object.keys(updates).length} 檔個股行情與交易量`);
    return res.json(updates);
  }

  // Fallback: 當連線 TWSE API 失敗時，採用前端落底模擬
  stockIds.forEach(code => {
    const basePrice = stockBasePrices[code];
    const changePercent = parseFloat((Math.random() * 8 - 3).toFixed(2));
    const change = parseFloat((basePrice * (changePercent / 100)).toFixed(1));
    const currentPrice = parseFloat((basePrice + change).toFixed(code === '2891' || code === '2002' ? 2 : 1));
    const volume = Math.floor(Math.random() * 50000) + 2000;
    
    updates[code] = {
      current_price: currentPrice,
      change: change,
      change_percent: changePercent,
      volume: volume
    };
  });
  
  console.log(`[API] 連線 TWSE 失敗，已採用預設模擬數據更新個股`);
  res.json(updates);
});

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
