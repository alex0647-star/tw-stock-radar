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

// 台灣股票分析師：依日K、週K、月K與國際情勢動態生成個股分析、買賣區間與操作評估
function generateStockAnalysis(code, currentPrice, changePercent) {
  const isDown = changePercent < -1.5;
  const isUp = changePercent > 1.5;
  
  // 預設策略與理由模板
  let timing_status = { status: "區間操作", tags: ["區間操作", "中性看待"] };
  let strategy = {
    observe_range: `${(currentPrice * 0.96).toFixed(1)} ~ ${(currentPrice * 1.04).toFixed(1)}`,
    entry_method: "股價拉回支撐位且量縮時分批建倉",
    exit_method: "股價挑戰壓力位或出現爆量滯漲時分批停利",
    stop_loss: `跌破近 10 日最低價或有效跌破防守支撐`
  };
  let analyst_action = "區間操作 (分批布局)";
  let core_risk = "短線市場追價意願不足，且面臨國際股市震盪與法人調節賣壓。";
  let global_linkage = "高度連動美股納斯達克與台股加權指數的盤面資金流向。";
  let reason = `截至 2026 年 6 月下旬，${code} 股價表現溫和。日K線目前處於區間整理，週K線與月K線則維持中線上升通道。長線受惠於產業基本面復甦，建議在觀察區間內低買高賣。`;

  // 針對核心個股提供細緻與專業的台股分析師解析
  if (code === "2330") {
    if (isDown) {
      timing_status = { status: "等待止跌", tags: ["回檔修正", "中長線機會", "半導體龍頭"] };
      analyst_action = "分批低接 (等待止跌)";
      reason = `2026年6月24日，台積電股價隨美股費半指數拉回而重挫。日K線跌破 10日均線，短期指標轉弱，目前正尋求 20日均線（月線）支撐。但週K與月K線仍呈穩健多頭排列。受惠於 CoWoS 先進封裝產能持續滿載，中長線基本面無虞，建議在 2350~2380 元區間分批進場建倉。`;
      strategy = {
        observe_range: "2350 ~ 2400",
        entry_method: "回測月線或 2360 元整數支撐且量縮止跌時分批承接",
        exit_method: "反彈至 2450 元以上或前波高點 2490 元附近分批停利",
        stop_loss: "有效收盤跌破 2300 元整數平台"
      };
      core_risk = "短線乖離率修正，融資餘額若持續維持高檔，需防範高檔浮額停損賣壓。";
    } else if (isUp) {
      timing_status = { status: "等待拉回", tags: ["高檔超買", "強勢續抱", "過熱不追"] };
      analyst_action = "暫不追高 (強勢續抱)";
      reason = `台積電近日股價多頭氣勢強勁。日K、週K及月K均呈強烈多頭排列。全球 AI 晶片（如 NVIDIA Blackwell）需求爆炸，CoWoS 產能供不應求，外資持續大舉回補。由於短線正乖離率偏高，不宜在此高位追價，持股者可強勢續抱。`;
      strategy = {
        observe_range: "2420 ~ 2490",
        entry_method: "待股價量縮拉回至 10日均線附近再行布局",
        exit_method: "突破 2500 元關卡或出現高檔長黑棒時分批獲利了結",
        stop_loss: "跌破月線 2350 元且法人轉為連續大賣"
      };
      core_risk = "主要在於地緣政治風險對供應鏈的潛在衝擊，以及先進封裝擴產時程是否受設備交期延後影響。";
    } else {
      timing_status = { status: "可分批布局", tags: ["穩健打底", "多頭排列", "EdgeAI"] };
      analyst_action = "分批低接 (穩健佈局)";
      reason = `目前台積電股價呈現高檔強勢整理。日K在月線上方維持橫盤，週K、月K線多頭架構完好。在 COMPUTEX 與 WWDC 展後，AI 與 Edge AI 長線趨勢明朗。長線基本面極度健康，適合中長線資金在 2390 元附近分批建倉佈局。`;
      strategy = {
        observe_range: "2380 ~ 2430",
        entry_method: "於 2390 元整數關卡至月線區間分批佈局",
        exit_method: "攻克 2480~2500 元以上阻力區分批調節",
        stop_loss: "收盤跌破 2330 元月線關卡"
      };
      core_risk = "近期外資提款美股科技股的連鎖效應，以及高檔個股融資資券洗盤風險。";
    }
    global_linkage = "高度連動費城半導體指數與 NVIDIA GPU 出貨表現，並受到美股科技巨頭（微軟、Google、Meta）擴大算力資本支出的直接牽引。";
  } 
  else if (code === "2317") {
    if (isDown) {
      timing_status = { status: "可分批布局", tags: ["拉回買點", "GB200主線", "蘋果鏈"] };
      analyst_action = "強力買進 (分批佈局)";
      reason = `鴻海今日隨大盤拉回。日K跌破 5日線，但週K及月K多頭架構極為穩固。公司為 NVIDIA GB200 伺服器的核心組裝龍頭，預計 Q3 末起正式出貨，下半年營收動能強勁。且 WWDC 發表會後 Apple Intelligence 換機潮利多持續，拉回提供極佳的中長線進場點。`;
      strategy = {
        observe_range: "250 ~ 258",
        entry_method: "回測 250 元整數支撐或月線防守點分批承接",
        exit_method: "挑戰 270~275 元歷史新高阻力區分批停利",
        stop_loss: "收盤跌破 243 元且連續三日未能收復"
      };
      core_risk = "全球供應鏈缺料（如 ASIC 或水冷接頭短缺）對伺服器出貨時程的影響，以及代工廠產能移轉成本。";
    } else if (isUp) {
      timing_status = { status: "等待拉回", tags: ["創高強勢", "多頭軌道", "過熱不追"] };
      analyst_action = "波段續抱 (等待拉回)";
      reason = `鴻海股價強勢噴發創下新高。日K沿 5日線上攻，週K、月K呈強烈仰角多頭排列。受惠於 GB200 訂單市佔率超乎預期，以及蘋果概念股資金強力追捧。由於短線漲幅偏快，不建議此時追價，建議持股者波段續抱，空手者靜待拉回。`;
      strategy = {
        observe_range: "255 ~ 265",
        entry_method: "等待量縮回測 10日線約 252 元附近再建倉",
        exit_method: "突破 280 元大關前或高檔量能失控時停利 1/3",
        stop_loss: "跌破月線 245 元"
      };
      core_risk = "高檔追價力道減弱，以及市場對 AI 伺服器獲利貢獻的預期過高，需防範利多實現後的震盪。";
    } else {
      timing_status = { status: "可分批布局", tags: ["穩健布局", "GB200龍頭", "WWDC概念"] };
      analyst_action = "強力買進 (分批佈局)";
      reason = `鴻海股價目前在高檔維持強勢盤整。日K線呈現箱型打底，週K與月K線多頭趨勢向上。基本面上，AI 伺服器與蘋果 iPhone 雙重主線推升，目前本益比相比其他 AI 個股仍屬合理，建議於 255 元附近分批佈局。`;
      strategy = {
        observe_range: "252 ~ 260",
        entry_method: "在 255 元以下及月線支撐區間分批買進",
        exit_method: "波段上看 275 元歷史新高位置進行調節",
        stop_loss: "有效收盤跌破 246 元支撐"
      };
      core_risk = "美元匯率波動、美中貿易關稅變數下對代工廠毛利率的潛在擠壓風險。";
    }
    global_linkage = "高度受惠於美股蘋果 (Apple) 公司秋季硬體換機潮與 NVIDIA 全球 AI 資料中心 Blackwell 架構首波出貨兩大國際科技主流。";
  } 
  else if (code === "2454") {
    if (isDown) {
      timing_status = { status: "等待止跌", tags: ["長黑灌破", "EdgeAI", "技術性修正"] };
      analyst_action = "分批低接 (等待止跌)";
      reason = `聯發科今日因手機市場短期雜音及大盤回檔影響，日K線收長黑棒摜破月線，短線多頭指標轉弱，需時間整理。然而，週K與月K線的中長線多頭架構並未遭到破壞。公司在 Edge AI 手機晶片（天璣9400）與 PC/車用 SoC 領域長線前景依舊明朗，建議空手者在 4200~4250 元附近分批逢低進場。`;
      strategy = {
        observe_range: "4200 ~ 4300",
        entry_method: "回測 4200 元關卡及尋求日K季線支撐時分批承接",
        exit_method: "反彈至 4450~4500 元以上整理區間上軌分批調節",
        stop_loss: "有效收盤跌破 4100 元重要防守位"
      };
      core_risk = "高階消費性手機市場復甦力道弱於預期，以及同業高通在 PC/AI 手機晶片上的價格戰與份額爭奪。";
    } else if (isUp) {
      timing_status = { status: "等待拉回", tags: ["高估值", "EdgeAI", "過熱不追"] };
      analyst_action = "分批低接 (等待拉回)";
      reason = `聯發科股價強勢反彈。日K重返所有均線之上，週K與月K呈現陡峭上揚軌道。天璣系列晶片出貨量預期大增，且與 NVIDIA 合作之車用 SoC 與 ARM 筆電晶片開始發揮綜效。由於短線正乖離偏高，建議拉回再做中長線布局。`;
      strategy = {
        observe_range: "4320 ~ 4450",
        entry_method: "待股價量縮拉回至 10日線附近時小幅建倉",
        exit_method: "股價攻克 4600 元關卡前適度獲利調節",
        stop_loss: "跌破月線 4250 元"
      };
      core_risk = "與微軟 Windows on ARM 生態系普及率是否符合預期，以及晶圓代工成本上漲對毛利的衝擊。";
    } else {
      timing_status = { status: "等待拉回", tags: ["高價整理", "晶片設計", "高配息"] };
      analyst_action = "分批低接";
      reason = `聯發科股價於 4280 元附近維持橫盤打底。日K線在月線邊界震盪，週K及月K多頭動能穩健。公司具備 3.9% 以上高配息保護，Edge AI 手機與 AI PC 滲透率加速上升，操作上建議回檔進行防禦性配置。`;
      strategy = {
        observe_range: "4250 ~ 4350",
        entry_method: "於整理箱型下軌（約 4250 元附近）進行分批低接",
        exit_method: "股價回升至 4480~4500 元阻力區時進行調節",
        stop_loss: "收盤跌破 4180 元"
      };
      core_risk = "全球半導體景氣循環復甦斜率偏緩，以及智慧型手機關鍵零組件調漲對客戶採購晶片預算的排擠效應。";
    }
    global_linkage = "緊密連動微軟 Copilot+ PC 的 ARM 架構生態圈發展，及台積電先進製程（3奈米）晶片產能獲配額度。";
  }
  else if (code === "3481") {
    if (isUp) {
      timing_status = { status: "僅觀察", tags: ["爆量突破", "事件炒作", "高波動"] };
      analyst_action = "短線輕倉 (小倉操作)";
      reason = `群創股價因面板廠轉型半導體封裝（扇出型面板級封裝 FOPLP）等題材爆量強勢突圍。日K呈現陡峭紅棒突破。但週K、月K長線格局仍受面板供需循環限制。目前屬情緒與題材炒作，波動極大，嚴禁高檔追價，僅適合極短線輕倉參與。`;
      strategy = {
        observe_range: "68 ~ 72",
        entry_method: "股價量縮拉回至 5 日線且守穩時小倉位快進快出",
        exit_method: "股價挑戰 75 元以上阻力區全數獲利了結",
        stop_loss: "有效跌破 65 元重要短波段防守位"
      };
    } else {
      timing_status = { status: "僅觀察", tags: ["面板循環", "題材整理", "高波動"] };
      analyst_action = "短線輕倉 (小倉操作)";
      reason = `群創股價目前進入高檔爆量後的整理階段。日K線高檔震盪。雖然有半導體級封裝 FOPLP 的轉型題材，但長線面板本業稼動率與價格回升力道偏弱。不宜中長線重壓，建議列入觀察。`;
      strategy = {
        observe_range: "65 ~ 70",
        entry_method: "回測前一波整理箱型中軸附近且量能萎縮時逢低買進",
        exit_method: "反彈至 72 元以上逢高了結",
        stop_loss: "收盤價跌破 62.5 元"
      };
    }
    core_risk = "短線市場情緒散去後資金流出速度快，且面板產業常規品報價面臨中國大廠產能開出的長期殺價競爭。";
    global_linkage = "連動全球大尺寸面板報價、減資進度，以及中國同業（京東方等）的產能擴張動能。";
  }
  else if (code === "3324") {
    if (isUp) {
      timing_status = { status: "等待拉回", tags: ["水冷概念", "均線多頭", "高波動"] };
      analyst_action = "分批低接";
      reason = `雙鴻股價多頭走勢完好。日K線重返所有均線之上，週K與月K線維持長線上揚軌道。水冷散熱技術（CDU、水冷板）產能逐步開出，GB200 需求明確。由於短線波動劇烈，建議拉回再做布局。`;
      strategy = {
        observe_range: "1030 ~ 1100",
        entry_method: "股價量縮回測千元關卡或月線附近分批接",
        exit_method: "股價突破 1150 元以上前高附近逢高獲利了結",
        stop_loss: "有效跌破 980 元"
      };
    } else {
      timing_status = { status: "等待拉回", tags: ["水冷概念", "整理格局", "高波動"] };
      analyst_action = "分批低接";
      reason = `雙鴻股價在高檔橫盤整理。日K在月線邊界洗盤。中長線水冷散熱升級趨勢不變，但短線散熱板塊正進行估值修正。建議等整理完畢、量能收斂後再分批介入。`;
      strategy = {
        observe_range: "1000 ~ 1080",
        entry_method: "於 1000 元整數關卡防守點附近分批接",
        exit_method: "股價反彈挑戰 1120~1150 元前波整理平台逢高調節",
        stop_loss: "收盤跌破 960 元"
      };
    }
    core_risk = "原料銅、鋁等大宗商品暴漲推升成本，以及同業產能開出後引發的價格競爭。";
    global_linkage = "高度綁定 NVIDIA GPU 晶片 TDP 能耗演進（從 air cooling 轉為 liquid cooling 的進程）。";
  }
  else if (code === "3017") {
    if (isUp) {
      timing_status = { status: "等待拉回", tags: ["水冷先鋒", "估值偏高", "高波動"] };
      analyst_action = "暫不介入 (逢高了結)";
      reason = `奇鋐作為水冷散熱核心供應商，近期股價再度爆量創高。日K線呈強勢排列。但因本益比已高於 40 倍，市場期待值過高。中長線看好但短線不建議在此位階追高，持股者可逢高調節，空手者觀望。`;
      strategy = {
        observe_range: "1220 ~ 1290",
        entry_method: "待日K回測 10日線約 1200 元且洗盤結束後建倉",
        exit_method: "股價衝克 1300 元以上大關時分批獲利出場",
        stop_loss: "跌破月線 1150 元"
      };
    } else {
      timing_status = { status: "等待拉回", tags: ["估值修正", "高價整理", "高波動"] };
      analyst_action = "暫不介入 (逢高了結)";
      reason = `奇鋐股價目前呈現高檔震盪盤整。日K線橫盤整理，週K與月K線多頭架構依舊。由於本益比偏高，市場正進行籌碼沉澱，建議暫時不介入，等拉回季線或量縮止跌後再評估。`;
      strategy = {
        observe_range: "1180 ~ 1260",
        entry_method: "回測前一波整理區間下軌（約 1180 元）附近進行防禦性低接",
        exit_method: "股價反彈至 1270~1290 元附近逢高調節",
        stop_loss: "跌破 1120 元"
      };
    }
    core_risk = "高本益比 (>40x) 容易面臨市場資金獲利了結的劇烈提款回檔風險。";
    global_linkage = "直接連動美超微 (Supermicro) 伺服器整機機櫃水冷模組出貨量與組裝滲透率。";
  }
  else if (code === "2382") {
    if (isDown) {
      timing_status = { status: "等待拉回", tags: ["多頭防守", "伺服器龍頭", "季底結帳"] };
      analyst_action = "波段續抱 (等待拉回)";
      reason = `廣達股價今日隨大盤拉回。日K跌破短期均線尋求月線支撐。中長期受惠美系CSP大廠持續擴大資本支出，訂單能見度佳。目前股價處於合理估值區，拉回是良好建倉時機。`;
      strategy = {
        observe_range: "360 ~ 385",
        entry_method: "回測月線或 365 元支撐防守點分批進場",
        exit_method: "股價重返 400 元整數大關前分批调节",
        stop_loss: "收盤跌破 350 元"
      };
    } else {
      timing_status = { status: "等待拉回", tags: ["多頭排列", "伺服器龍頭", "GB200受益"] };
      analyst_action = "波段續抱 (等待拉回)";
      reason = `廣達股價沿均線呈溫和多頭格局。日K、週K、月K多頭結構良好。公司伺服器組裝產能逐步擴充，且本益比相較散熱更具安全邊際，建議持股波段續抱，逢低分批承接。`;
      strategy = {
        observe_range: "370 ~ 390",
        entry_method: "待量縮回測 10日線約 370 元附近時布局",
        exit_method: "突破 400 元整數關卡時逢高獲利停利 1/3",
        stop_loss: "跌破月線 355 元"
      };
    }
    core_risk = "水冷電源等零組件短缺可能壓抑出貨速度，但中長線大廠建資料中心趨勢不變。";
    global_linkage = "高度連動 Google、Amazon AWS、Meta 等超大型雲端服務商 (CSP) 的年度資料中心建設資本支出。";
  }
  else if (["2891", "2881", "2882"].includes(code)) {
    timing_status = { status: "可分批布局", tags: ["高殖利率", "穩健防禦", "避險配置"] };
    analyst_action = "分批低接 (價值避險)";
    reason = `目前加權指數處於高檔震盪整理期，金融股如${code === "2891" ? "中信金" : code === "2881" ? "富邦金" : "國泰金"}受惠於首季亮眼獲利及高額配息政策，日K、週K、月K線皆呈穩定的上升通道，為資金極佳的避險防禦去處。`;
    strategy = {
      observe_range: `${(currentPrice * 0.97).toFixed(1)} ~ ${(currentPrice * 1.03).toFixed(1)}`,
      entry_method: "逢股價回測日K 10日線或月線時分批存股買進",
      exit_method: "波段獲利達 10~15% 以上或挑戰前高阻力時適度減碼",
      stop_loss: `收盤價有效跌破近一季整理區間下軌`
    };
    core_risk = "台美降息預期延遲導致債券未實現損益波動，以及新台幣匯率劇烈升值時壽險子公司的匯率避險成本增加。";
    global_linkage = "密切連動美國十年期國債殖利率波動、聯準會 (Fed) 利率決策以及新台幣兌美元匯率走勢。";
  }
  else if (["1301", "2002"].includes(code)) {
    timing_status = { status: "僅觀察", tags: ["傳產景氣", "庫存調整", "低動能"] };
    analyst_action = "避開觀望 (僅觀察)";
    reason = `傳產鋼鐵石化股如${code === "1301" ? "台塑" : "中鋼"}因全球製造業復甦動能偏緩，且面臨中國低價鋼材與石化常規品傾銷競爭，日K、週K、月K線處於底部橫盤整理，短期缺乏上攻動能。建議暫不介入，僅作景氣觀察。`;
    strategy = {
      observe_range: `${(currentPrice * 0.95).toFixed(1)} ~ ${(currentPrice * 1.05).toFixed(1)}`,
      entry_method: "目前不建議建立新部位，待報價明顯落底反彈後再評估",
      exit_method: "若持有套牢者，建議逢反彈至季線/半年線附近時適度減碼換股",
      stop_loss: `跌破前波歷史低點平台`
    };
    core_risk = "中國大陸鋼材及通用塑膠產能持續過剩且低價外溢傾銷，導致毛利率反彈受壓。";
    global_linkage = "高度受制於中國房地產景氣、全球碳關稅進程，以及國際原油、鐵礦砂大宗商品價格波動。";
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
          
          // 根據實時行情動態生成 AI 分析
          const aiUpdate = generateStockAnalysis(code, currentPrice, changePercent);
          
          updates[code] = {
            current_price: currentPrice,
            change: change,
            change_percent: changePercent,
            volume: volume || 2000,
            ...aiUpdate
          };
          
          // 同步更新記憶體中的基準價格，使詳情頁與 K 線走勢的開高低收等模擬計算也能同步基於真實收盤價
          stockBasePrices[code] = yesterdayClose;
        }
      }
    });
    
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

    console.log(`[API] 已自 TWSE 同步並動態生成共 ${Object.keys(updates).length} 檔個股行情與 AI 分析推薦`);
    return res.json(updates);
  }

  // Fallback: 當連線 TWSE API 失敗時，採用前端落底模擬並生成動態分析
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
  
  console.log(`[API] 連線 TWSE 失敗，已採用預設模擬數據與 AI 動態推薦更新個股`);
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
