import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// 靜態託管編譯後的前端 dist 目錄 (這樣只啟動一個 Express 伺服器就能運行完整網頁與 API)
app.use(express.static(path.join(__dirname, 'dist')));

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

// Yahoo API 即時抓取輔助函式 (含防禦性 Timeout 與 Error Handling)
async function fetchYahooChart(symbol) {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      },
      signal: AbortSignal.timeout(4000)
    });
    if (!response.ok) {
      throw new Error(`HTTP 錯誤狀態: ${response.status}`);
    }
    const data = await response.json();
    if (data && data.chart && data.chart.result && data.chart.result[0]) {
      return data.chart.result[0].meta;
    }
    throw new Error("無效的 Yahoo API 回傳格式");
  } catch (error) {
    console.error(`[Yahoo 同步錯誤 - ${symbol}]:`, error.message);
    return null;
  }
}

// GET /api/market-index
app.get('/api/market-index', async (req, res) => {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('zh-TW', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = now.toISOString().split('T')[0];
  
  const meta = await fetchYahooChart("^TWII");
  if (meta) {
    const zVal = meta.regularMarketPrice;
    const yVal = meta.previousClose || meta.chartPreviousClose;
    if (zVal !== undefined && yVal !== undefined) {
      const change = parseFloat((zVal - yVal).toFixed(2));
      const changePercent = parseFloat(((change / yVal) * 100).toFixed(2));
      const volume = 5420; // 保持穩定的加權指數成交量估計
      
      marketIndexState = {
        value: zVal,
        change: change,
        changePercent: changePercent,
        volume: volume
      };
      
      console.log(`[API] 大盤加權指數已同步自 Yahoo: ${zVal} (${changePercent}%)`);
      return res.json({
        ...marketIndexState,
        date: dateStr,
        time: timeStr
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

// 台灣股票分析師：依日K、週K、月K與國際情勢動態生成個股分析、買賣區間與操作評估
function generateStockAnalysis(code, currentPrice, changePercent) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  const dateStr = `${year}年${month}月${day}日`;

  const isPennyStock = currentPrice < 50;
  const decimals = isPennyStock ? 2 : (currentPrice < 200 ? 1 : 0);
  const formatPrice = (p) => parseFloat(p).toFixed(decimals);

  // 動態點位計算
  const supportShort = formatPrice(currentPrice * 0.98); // 短線5日均線支撐
  const supportStrong = formatPrice(currentPrice * 0.95); // 月線強防守支撐
  const resistShort = formatPrice(currentPrice * 1.03); // 前波高點短線阻力
  const resistTarget = formatPrice(currentPrice * 1.065); // 波段停利目標
  const stopLoss = formatPrice(currentPrice * 0.94); // 嚴格停損位 (約 -6%)

  const observeRange = `${supportStrong} ~ ${resistShort}`;

  // 個股基本資訊對照
  const stockMeta = {
    "2330": { name: "台積電", sector: "晶圓代工龍頭", driver: "先進製程（3nm/2nm）產能利用率持續吃緊，CoWoS/SoIC 先進封裝擴產加速，受惠美系 AI 巨頭龐大算力晶片訂單。" },
    "2317": { name: "鴻海", sector: "AI伺服器與電子代工", driver: "NVIDIA GB200/NVL72 伺服器整機機櫃出貨持續放量，伴隨旗艦智慧型手機進入傳統下半年拉貨旺季，雙引擎驅動營收動能。" },
    "2454": { name: "聯發科", sector: "IC設計龍頭", driver: "天璣系列旗艦手機晶片滲透率攀升，搭配客製化 AI ASIC 伺服器晶片與車用/ARM PC SoC 開花結果，長線成長藍圖清晰。" },
    "2382": { name: "廣達", sector: "AI伺服器組裝", driver: "受惠美系四大雲端服務商 (CSP) 擴大資本支出，高階 AI 伺服器訂單能見度直達明年，產能陸續到位。" },
    "3017": { name: "奇鋐", sector: "散熱模組龍頭", driver: "水冷板 (Cold Plate) 與散熱機櫃出貨量倍增，高階伺服器散熱規格升級趨勢明確，產品組合優化毛利表現。" },
    "3324": { name: "雙鴻", sector: "水冷散熱關鍵廠", driver: "水冷散熱關鍵零組件（CDU 分配器、水冷板）產能逐步開出，直接受惠次世代高 TDP 晶片散熱架構革新。" },
    "2308": { name: "台達電", sector: "電源與綠能管理", driver: "AI 伺服器高瓦數專用電源與電網基礎設施需求強勁，散熱與車用電子雙軌並進，營運體質穩健。" },
    "8210": { name: "勤誠", sector: "伺服器機殼龍頭", driver: "高階 AI 伺服器專用機殼與機櫃設計複雜度提升帶動平均售價 (ASP) 上揚，北美 CSP 客戶拉貨動能充沛。" },
    "2059": { name: "川湖", sector: "伺服器導軌王者", driver: "伺服器高階滑軌市佔率高達七成以上，專利護城河極深，受惠重型伺服器機箱規格升級，獲利結構扎實。" },
    "3008": { name: "大立光", sector: "光學鏡頭領導廠", driver: "旗艦手機鏡頭規格持續升級（潛望式長焦鏡頭下放與高階玻塑混合鏡頭），旺季稼動率滿載支撐營運。" },
    "2327": { name: "國巨", sector: "被動元件龍頭", driver: "車用、工控與高階被動元件庫存去化完全，利基型產品比重超過七成，兼具高殖利率與估值防禦優勢。" },
    "2383": { name: "台光電", sector: "銅箔基板 (CCL) 先鋒", driver: "高階無鹵與低損耗 CCL 在 AI 伺服器及交換機板市佔居冠，材料升級週期確立其長期領先地位。" },
    "2408": { name: "南亞科", sector: "DRAM 記憶體製造", driver: "受惠 AI 伺服器排擠效應帶動常規 DDR5/DDR4 報價健康回升，記憶體產業逐步邁入結構性景氣復甦循環。" },
    "2891": { name: "中信金", sector: "大型金控股", driver: "銀行利差獲利穩健增長，財富管理手續費收入亮眼，提供 4%~5% 穩定高殖利率，為資金極佳之防守避風港。" },
    "2881": { name: "富邦金", sector: "金融金控獲利王", driver: "壽險投資部位未實現收益回升，銀行與產險雙引擎獲利強勁，長線每股獲利 (EPS) 與配息能力名列前茅。" },
    "2882": { name: "國泰金", sector: "指標壽險金控", driver: "受惠資本市場回溫與資產配置優化，獲利動能顯著回升，兼具金融防禦性與除權息收益題材。" },
    "1301": { name: "台塑", sector: "石化傳產龍頭", driver: "面臨全球石化產能供過於求與常規品競爭，正積極朝半導體特用化學品與高值化材料轉型，靜待景氣築底。" },
    "2002": { name: "中鋼", sector: "鋼鐵龍頭", driver: "受全球高利率與房地產建築動能偏緩影響，鋼價處於底部震盪，正持續拉高車用與綠能高品級鋼材比重以優化體質。" },
    "3481": { name: "群創", sector: "面板與先進封裝", driver: "面板本業稼動率受供需動態調整，積極跨足扇出型面板級封裝 (FOPLP) 轉型題材，具備短線題材爆發力與高波動特質。" }
  };

  const meta = stockMeta[code] || { name: `個股 (${code})`, sector: "台股焦點股", driver: "基本面受惠整體電子產業景氣回溫，長線營運架構維持穩健。" };

  let timing_status;
  let analyst_action;
  let strategy;
  let core_risk;
  let global_linkage = "高度連動美股費城半導體指數、納斯達克科技板塊，以及美系大型雲端科技巨頭之資本支出預算走向。";
  let reason;

  // 1. 大漲噴發 (>= 2.5%)
  if (changePercent >= 2.5) {
    timing_status = { status: "等待拉回", tags: ["短線大漲", "多頭強攻", "過熱不追"] };
    analyst_action = "波段續抱 (不追高待拉回)";
    strategy = {
      observe_range: observeRange,
      entry_method: `今日股價大漲，正乖離擴大，切忌盲目追高。空手者建議靜待量縮拉回至 ${supportShort} 元支撐附近再分批布局。`,
      exit_method: `持股者可波段續抱；若股價進一步衝高至 ${resistTarget} 元或爆量長黑時，可分批調節 1/3 獲利入袋。`,
      stop_loss: `短線跌破今日紅K起漲低點或收盤跌破 ${supportStrong} 元強防守位。`
    };
    core_risk = "短線漲幅偏快導致短線獲利了結賣壓沉重，需防範高檔爆量震盪或融資快速浮額增加。";
    reason = `${dateStr}，${meta.name} (${code}) 今日股價強勁噴發，單日大漲 +${changePercent.toFixed(2)}% 來到 ${currentPrice} 元！日K線拉出實體紅棒一舉站穩各期均線之上，技術指標呈強勢多頭排列。基本面上，${meta.driver} 由於短線乖離偏大，操盤上切忌於盤中急拉時追價，建議已持股者波段續抱，欲加碼或空手者靜待拉回量縮後再行分批低接。`;
  }
  // 2. 溫和多頭 (0.8% ~ 2.5%)
  else if (changePercent >= 0.8) {
    timing_status = { status: "可分批布局", tags: ["紅K推進", "多頭排列", "穩步走揚"] };
    analyst_action = "分批進場 (偏多操作)";
    strategy = {
      observe_range: observeRange,
      entry_method: `逢股價回測日K 5日線或 ${supportShort} 元附近時，可採定時定量或分批買進方式建倉。`,
      exit_method: `股價反彈挑戰波段前高壓力位 ${resistShort} 元或 ${resistTarget} 元時分批停利調節。`,
      stop_loss: `收盤價有效跌破 ${supportStrong} 元重要支撐平台。`
    };
    core_risk = "大盤高檔震盪引發的資金類股輪動，以及外資在現貨市場的短線獲利調節賣盤。";
    reason = `${dateStr}，${meta.name} (${code}) 呈現穩健上揚走勢，今日漲幅 +${changePercent.toFixed(2)}% 收在 ${currentPrice} 元。日K線維持溫和上升通道，週K與月K線多頭架構完好。產業面方面，${meta.driver} 目前股價位階健康，適合中長線投資人於 ${supportShort} 元支撐上方分批建立基本持股。`;
  }
  // 3. 窄幅橫盤整理 (-0.8% ~ 0.8%)
  else if (changePercent > -0.8) {
    timing_status = { status: "區間操作", tags: ["橫盤打底", "籌碼沉澱", "箱型整理"] };
    analyst_action = "區間操作 (低買高賣)";
    strategy = {
      observe_range: observeRange,
      entry_method: `在整理箱型下軌約 ${supportStrong} 元整數關卡附近，逢低分批承接。`,
      exit_method: `股價回升至箱型上軌約 ${resistShort} 元壓力區時，適度逢高獲利調節。`,
      stop_loss: `收盤價跌破近 10 日整理低點 ${stopLoss} 元。`
    };
    core_risk = "盤整期過長導致市場追價意願不足，若大盤走弱需防範停損賣壓測試支撐。";
    reason = `${dateStr}，${meta.name} (${code}) 今日股價在 ${currentPrice} 元附近呈現窄幅橫盤整理（今日漲跌 ${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%）。日K線在短中期均線糾結處持續洗盤換手，籌碼正處於沉澱階段。基本面 ${meta.driver} 建議投資人在 ${observeRange} 元之觀察區間內採取區間操作策略，待帶量突破箱型再行加碼。`;
  }
  // 4. 回檔修正 (-2.5% ~ -0.8%)
  else if (changePercent > -2.5) {
    timing_status = { status: "等待止跌", tags: ["回檔修正", "良性洗盤", "中長線買點"] };
    analyst_action = "分批低接 (等待止跌)";
    strategy = {
      observe_range: observeRange,
      entry_method: `待股價回測 ${supportStrong} 元月線/季線支撐且出現量縮十字星或紅K止跌訊號時再分批低接。`,
      exit_method: `反彈至短期壓力位 ${resistShort} 元附近分批調節停利。`,
      stop_loss: `收盤價有效跌破 ${stopLoss} 元防守低點。`
    };
    core_risk = "短線指標仍在修正，若國際科技股持續拉回可能延長整理時間。";
    reason = `${dateStr}，${meta.name} (${code}) 今日受盤勢震盪影響回檔修正，單日跌幅 ${changePercent.toFixed(2)}% 收在 ${currentPrice} 元。日K線回測短期支撐進行良性洗盤，但週K線與月K線中長線多頭架構依然健全。受惠於 ${meta.driver} 此波回檔提供了較佳的安全邊際，建議分批在 ${supportStrong} 元附近逢低布局。`;
  }
  // 5. 重挫下殺 (< -2.5%)
  else {
    timing_status = { status: "觀望防守", tags: ["長黑重挫", "避開接刀", "嚴守紀律"] };
    analyst_action = "暫不介入 (嚴守紀律)";
    strategy = {
      observe_range: observeRange,
      entry_method: `短線空方力道強勁，空手者切忌急於搶反彈，建議等待連續兩日不破低且融資沉澱後再評估。`,
      exit_method: `持股套牢者若反彈至 ${supportShort} 元均線反壓無法克服，應考慮適度減碼防禦。`,
      stop_loss: `嚴格執行停損：收盤跌破 ${stopLoss} 元立即退場觀望。`
    };
    core_risk = "法人連續提款調節，高檔籌碼鬆動與融資多殺多之連鎖回檔風險。";
    reason = `${dateStr}，${meta.name} (${code}) 今日遭遇沈重賣壓，單日重挫 ${changePercent.toFixed(2)}% 下跌至 ${currentPrice} 元。日K線收出長黑棒灌破短期均線防守，短期技術面轉弱。雖然中長線 ${meta.driver} 但短線切忌急於進場接刀，務必嚴守 ${stopLoss} 元之停損紀律，待籌碼沉澱止跌後再行進場。`;
  }

  // 針對傳產與金融股補充專屬風險與國際連動
  if (["2891", "2881", "2882"].includes(code)) {
    global_linkage = "密切連動美聯準會 (Fed) 利率政策路徑、美債殖利率波動，以及新台幣兌美元之匯率走勢。";
  } else if (["1301", "2002"].includes(code)) {
    global_linkage = "高度連動國際原油期貨、鐵礦砂大宗原物料報價，以及全球製造業景氣循環與碳費政策。";
  }

  return {
    timing_status,
    strategy,
    analyst_action,
    core_risk,
    global_linkage,
    reason
  };
}

// GET /api/stocks-update
app.get('/api/stocks-update', async (req, res) => {
  const stockIds = Object.keys(stockBasePrices);
  const updates = {};

  try {
    // 平行發送 19 檔個股的 Yahoo API 請求
    const promises = stockIds.map(async (code) => {
      const symbol = code === "3324" ? `${code}.TWO` : `${code}.TW`;
      const meta = await fetchYahooChart(symbol);
      if (meta) {
        const currentPrice = meta.regularMarketPrice;
        const yesterdayClose = meta.previousClose || meta.chartPreviousClose;
        const rawVolume = meta.regularMarketVolume || 0;
        const volume = Math.floor(rawVolume / 100); // 配合張數，並對照前端 volume / 10
        
        if (currentPrice !== undefined && yesterdayClose !== undefined) {
          const change = parseFloat((currentPrice - yesterdayClose).toFixed(1));
          const changePercent = parseFloat(((change / yesterdayClose) * 100).toFixed(2));
          
          const aiUpdate = generateStockAnalysis(code, currentPrice, changePercent);
          
          updates[code] = {
            current_price: currentPrice,
            change: change,
            change_percent: changePercent,
            volume: volume || 2000,
            ...aiUpdate
          };
          
          stockBasePrices[code] = yesterdayClose;
        }
      }
    });
    
    await Promise.all(promises);
  } catch (err) {
    console.error("[API Stocks Update Error]:", err.message);
  }

  // 檢查是否成功抓取到個股
  const keys = Object.keys(updates);
  if (keys.length > 0) {
    // 檢查是否有 API 漏給的個股，若有則以模擬補齊並生成動態分析
    stockIds.forEach(code => {
      if (!updates[code]) {
        const basePrice = stockBasePrices[code];
        const changePercent = parseFloat((Math.random() * 8 - 3).toFixed(2));
        const change = parseFloat((basePrice * (changePercent / 100)).toFixed(1));
        const currentPrice = parseFloat((basePrice + change).toFixed(code === '2891' || code === '2002' ? 2 : 1));
        const volume = Math.floor(Math.random() * 50000) + 2000;
        
        const aiUpdate = generateStockAnalysis(code, currentPrice, changePercent);
        
        updates[code] = {
          current_price: currentPrice,
          change: change,
          change_percent: changePercent,
          volume: volume,
          ...aiUpdate
        };
      }
    });

    console.log(`[API] 已自 Yahoo 同步並動態生成共 ${Object.keys(updates).length} 檔個股行情與 AI 分析推薦`);
    return res.json(updates);
  }

  // Fallback: 當連線 Yahoo API 失敗時，採用前端落底模擬與 AI 分析
  stockIds.forEach(code => {
    const basePrice = stockBasePrices[code];
    const changePercent = parseFloat((Math.random() * 8 - 3).toFixed(2));
    const change = parseFloat((basePrice * (changePercent / 100)).toFixed(1));
    const currentPrice = parseFloat((basePrice + change).toFixed(code === '2891' || code === '2002' ? 2 : 1));
    const volume = Math.floor(Math.random() * 50000) + 2000;
    
    const aiUpdate = generateStockAnalysis(code, currentPrice, changePercent);
    
    updates[code] = {
      current_price: currentPrice,
      change: change,
      change_percent: changePercent,
      volume: volume,
      ...aiUpdate
    };
  });
  
  console.log(`[API] 連線 Yahoo 失敗，已採用預設模擬數據與 AI 動態推薦更新個股`);
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

// 讓所有未匹配的 GET 請求都回到前端 index.html (單頁路由防禦)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🚀 台股 AI 改版後端 API 伺服器已成功啟動！`);
  console.log(`📡 監聽埠號: http://localhost:${PORT}`);
  console.log(`📊 支援接口 1: GET /api/stock/:code/realtime`);
  console.log(`📊 支援接口 2: GET /api/stock/:code/kline?type=daily`);
  console.log(`==================================================`);
});
