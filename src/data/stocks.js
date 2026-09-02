// 台灣股市 2026 年 6 月最新模擬資料庫（含分析師進出場與國際情勢對照欄位）
export const stockData = [
  {
    stock_id: "2330",
    stock_name: "台積電",
    category: "半導體",
    sub_category: "晶圓代工",
    current_price: 2390.0,
    change: -25.0,
    change_percent: -1.04,
    volume: 38450,
    dividend_yield: 1.82,
    pe_ratio: 28.5,
    scores: {
      total: 90,
      momentum: 98,
      valuation: 45,
      dividend: 40,
      risk: 70,
      trend: 99
    },
    timestamps: {
      price_date: "2026-06-01",
      inst_date: "2026-06-01",
      broker_date: "2026-05-29",
      report_date: "2026-Q1"
    },
    timing_status: {
      status: "等待拉回",
      tags: ["過熱不追", "強勢續抱", "高波動"]
    },
    strategy: {
      observe_range: "2280 ~ 2320",
      entry_method: "股價拉回至 10 日線附近分批佈局",
      exit_method: "波段高點 2415 附近先獲利入袋 1/3",
      stop_loss: "有效跌破 20 日均線（月線）且法人籌碼轉賣"
    },
    reason: "全球 AI 晶片需求呈爆發式成長，先進製程與 CoWoS 先進封裝產能持續滿載。技術面長線呈多頭排列，唯短線正乖離率偏高時切忌追價，建議逢量縮回測均線時分批承接。",
    // 分析師擴充欄位
    analyst_action: "分批低接 (等待拉回)",
    core_risk: "短線與月線正乖離率偏大，高檔融資餘額若同步大增，需防範獲利回檔與籌碼沉澱賣壓。",
    global_linkage: "高度連動費城半導體指數與 NVIDIA GPU 出貨量。受惠於美股科技巨頭（微軟、Meta、Google）持續擴大算力資本支出。"
  },
  {
    stock_id: "2317",
    stock_name: "鴻海",
    category: "電子組裝",
    sub_category: "AI伺服器",
    current_price: 256.0,
    change: -3.5,
    change_percent: -1.35,
    volume: 85200,
    dividend_yield: 3.44,
    pe_ratio: 18.2,
    scores: {
      total: 89,
      momentum: 94,
      valuation: 75,
      dividend: 68,
      risk: 80,
      trend: 96
    },
    timestamps: {
      price_date: "2026-06-01",
      inst_date: "2026-06-01",
      broker_date: "2026-06-01",
      report_date: "2026-Q1"
    },
    timing_status: {
      status: "可分批布局",
      tags: ["可分批布局", "強勢續抱", "雙重題材"]
    },
    strategy: {
      observe_range: "298 ~ 308",
      entry_method: "回測月線或 300 元整數關卡支撐分批接",
      exit_method: "波段目標 350~360 元分批調節",
      stop_loss: "收盤跌破 290 元且連續三日未收復"
    },
    reason: "同時具備 AI 伺服器龍頭（GB200 關鍵組裝商）與旗艦智慧型手機換機潮雙重利多。相較於其他 AI 概念股，目前本益比仍屬合理，營收維持穩健增長，內外資籌碼持續流入，具備成長與防禦雙重優勢。",
    analyst_action: "強力買進 (分批佈局)",
    core_risk: "主要在於美中貿易關稅變數下全球代工廠的去中心化轉移成本，以及高階 AI 晶片缺貨對組裝時程的影響。",
    global_linkage: "高度受惠於美股蘋果 (Apple) 旗艦手機換機潮與 NVIDIA 全球 AI 資料中心 Blackwell 架構機櫃出貨兩大國際科技主流。"
  },
  {
    stock_id: "2454",
    stock_name: "聯發科",
    category: "半導體",
    sub_category: "IC設計",
    current_price: 4285.0,
    change: -250.0,
    change_percent: -5.51,
    volume: 143530,
    dividend_yield: 3.95,
    pe_ratio: 24.8,
    scores: {
      total: 86,
      momentum: 90,
      valuation: 55,
      dividend: 70,
      risk: 75,
      trend: 92
    },
    timestamps: {
      price_date: "2026-06-01",
      inst_date: "2026-06-01",
      broker_date: "2026-05-29",
      report_date: "2026-Q1"
    },
    timing_status: {
      status: "等待拉回",
      tags: ["等待回檔", "EdgeAI", "高配息"]
    },
    strategy: {
      observe_range: "1980 ~ 2030",
      entry_method: "回測前次整理區間上軌或 2000 元支撐分批低接",
      exit_method: "站上 2200 元以上可適度分批停利",
      stop_loss: "收盤價跌破季線且法說會展望下修"
    },
    reason: "受惠 AI 手機與 AI PC 滲透率加速上升，天璣 9400 系列及天璣 8300 系列出貨暢旺，且與 NVIDIA 合作之車用 SoC 與 ARM 架構筆電晶片開始貢獻營收。股價突破前高，短線技術面超買，建議拉回再布局。",
    analyst_action: "分批低接",
    core_risk: "高階手機消費市場復甦動能偏緩，以及與同業高通（Qualcomm）在 Edge AI 晶片市場上的價格競爭壓力。",
    global_linkage: "高度連動 ARM 架構生態系發展及全球 Edge AI 終端硬體升級週期，與微軟 Copilot+ PC 生態圈緊密連結。"
  },
  {
    stock_id: "2382",
    stock_name: "廣達",
    category: "電子組裝",
    sub_category: "AI伺服器",
    current_price: 480.0,
    change: 14.5,
    change_percent: 3.11,
    volume: 34100,
    dividend_yield: 2.92,
    pe_ratio: 22.1,
    scores: {
      total: 85,
      momentum: 91,
      valuation: 58,
      dividend: 55,
      risk: 78,
      trend: 95
    },
    timestamps: {
      price_date: "2026-06-01",
      inst_date: "2026-06-01",
      broker_date: "2026-06-01",
      report_date: "2026-Q1"
    },
    timing_status: {
      status: "等待拉回",
      tags: ["過熱不追", "強勢續抱"]
    },
    strategy: {
      observe_range: "435 ~ 450",
      entry_method: "回測 20 日月線附近防守點分批買進",
      exit_method: "挑戰 500 元大關前分批了結",
      stop_loss: "跌破 420 元整理平台支撐"
    },
    reason: "AI 伺服器整機出貨動能維持高檔，受惠美系大型雲端服務商 (CSP) 持續擴大資本支出。公司訂單能見度已達 2026 年底。整體營運動能強勁，操作上宜等量縮回測均線後再行切入。",
    analyst_action: "波段續抱 (等待拉回)",
    core_risk: "伺服器關鍵零組件（如 ASIC、水冷接頭）的全球供應鏈短缺風險，可能壓抑出貨速度並使毛利承壓。",
    global_linkage: "直接連動 Google、Amazon AWS、Meta 等美系超大型雲端服務商 (CSP) 之資本支出預算及資料中心建置時程。"
  },
  {
    stock_id: "3017",
    stock_name: "奇鋐",
    category: "電子零組件",
    sub_category: "散熱模組",
    current_price: 1250.0,
    change: 55.0,
    change_percent: 4.60,
    volume: 12400,
    dividend_yield: 1.60,
    pe_ratio: 42.5,
    scores: {
      total: 84,
      momentum: 96,
      valuation: 30,
      dividend: 35,
      risk: 60,
      trend: 98
    },
    timestamps: {
      price_date: "2026-06-01",
      inst_date: "2026-06-01",
      broker_date: "2026-05-29",
      report_date: "2026-Q1"
    },
    timing_status: {
      status: "等待拉回",
      tags: ["過熱不追", "高波動", "水冷先鋒"]
    },
    strategy: {
      observe_range: "1120 ~ 1160",
      entry_method: "回測月線或季線支撐，且融資餘額退潮時進場",
      exit_method: "挑戰 1300 元以上逢高分批停利",
      stop_loss: "收盤跌破季線 (60MA) 且投信連續大賣"
    },
    reason: "NVIDIA GB200 架構中，水冷散熱模組 (Liquid Cooling) 滲透率暴增，奇鋐作為全球唯二合格供應商，出貨量暴增。雖然營收成長明確，但目前本益比已突破 40 倍，評價偏高，波動極大，嚴禁高檔追價。",
    analyst_action: "暫不介入 (逢高了結)",
    core_risk: "高本益比 (>40x) 與市場對水冷期待值已高。一旦後續產能稀釋或對手（如雙鴻、日電產）搶佔份額，評價面有收縮修正之虞。",
    global_linkage: "高度綁定 NVIDIA GPU 晶片能耗規格（高達 1000W-1200W），與美超微 (Supermicro) 全球算力中心組裝需求息息相關。"
  },
  {
    stock_id: "3324",
    stock_name: "雙鴻",
    category: "電子零組件",
    sub_category: "散熱模組",
    current_price: 1180.0,
    change: 48.0,
    change_percent: 4.24,
    volume: 9800,
    dividend_yield: 1.86,
    pe_ratio: 39.8,
    scores: {
      total: 83,
      momentum: 93,
      valuation: 35,
      dividend: 38,
      risk: 62,
      trend: 97
    },
    timestamps: {
      price_date: "2026-06-01",
      inst_date: "2026-06-01",
      broker_date: "2026-05-29",
      report_date: "2026-Q1"
    },
    timing_status: {
      status: "等待拉回",
      tags: ["等候回檔", "高波動", "水冷概念"]
    },
    strategy: {
      observe_range: "1060 ~ 1100",
      entry_method: "待股價回測千元整數大關或 10 日線附近分批接",
      exit_method: "前高 1220 元附近逢高獲利減碼",
      stop_loss: "跌破月線三天不站回或日 K 出現爆量黑 K"
    },
    reason: "水冷散熱技術（水冷板、CDU、歧管）產能已於第二季全面開出，營收佔比翻倍。受惠於伺服器高瓦數熱功耗處理需求，長線動能無虞。技術面近期正乖離大，宜等回檔量縮再進場。",
    analyst_action: "分批低接",
    core_risk: "原物料銅、鋁等國際大宗商品價格走揚推升成本壓力，以及新進對手在冷卻液監控系統上的低價競爭風險。",
    global_linkage: "直接連動英特爾、超微 (AMD) 與 NVIDIA 全球資料中心冷卻規格規範，及各國對雲端機房 PUE (電力使用效率) 的環保政策法規限制。"
  },
  {
    stock_id: "2308",
    stock_name: "台達電",
    category: "電子零組件",
    sub_category: "電源供應器",
    current_price: 540.0,
    change: 12.0,
    change_percent: 2.27,
    volume: 18500,
    dividend_yield: 2.59,
    pe_ratio: 26.5,
    scores: {
      total: 87,
      momentum: 88,
      valuation: 62,
      dividend: 58,
      risk: 85,
      trend: 94
    },
    timestamps: {
      price_date: "2026-06-01",
      inst_date: "2026-06-01",
      broker_date: "2026-06-01",
      report_date: "2026-Q1"
    },
    timing_status: {
      status: "可分批布局",
      tags: ["可分批布局", "低波動", "綠能儲能"]
    },
    strategy: {
      observe_range: "510 ~ 525",
      entry_method: "拉回整理區間中軸或月線附近分批承接",
      exit_method: "波段挑戰 600 元整數大關逐步停利",
      stop_loss: "跌破 495 元季線強支撐"
    },
    reason: "AI 伺服器除了算力，電力供應更是關鍵。台達電在 5kW 以上高階伺服器電源市佔率超高，且冷卻系統與電網級儲能方案成長前景樂觀。股價走勢較為溫和、穩健，適合風險承受度中等的投資人分批布局。",
    analyst_action: "分批低接 (穩健佈局)",
    core_risk: "電動車市場全球增長偏緩使車用事業群營收增速放緩，以及中國同業在傳統中階電源供應器的殺價策略。",
    global_linkage: "連動全球 ESG 減碳浪潮、各國智慧電網建置與美系資料中心巨頭對高瓦數高轉換率電源供應的嚴苛要求。"
  },
  {
    stock_id: "8210",
    stock_name: "勤誠",
    category: "電子零組件",
    sub_category: "伺服器機殼",
    current_price: 620.0,
    change: 15.0,
    change_percent: 2.48,
    volume: 6800,
    dividend_yield: 2.74,
    pe_ratio: 24.2,
    scores: {
      total: 86,
      momentum: 89,
      valuation: 65,
      dividend: 52,
      risk: 72,
      trend: 93
    },
    timestamps: {
      price_date: "2026-06-01",
      inst_date: "2026-06-01",
      broker_date: "2026-06-01",
      report_date: "2026-Q1"
    },
    timing_status: {
      status: "可分批布局",
      tags: ["可分批布局", "機殼龍頭"]
    },
    strategy: {
      observe_range: "585 ~ 600",
      entry_method: "股價拉回至 10 日線附近且量縮時低接",
      exit_method: "挑戰 680~700 元前波高點附近分批出場",
      stop_loss: "收盤跌破 560 元前低整理平台"
    },
    reason: "高階 AI 伺服器機殼與客製化機櫃需求激增。作為 NVIDIA 核心合作夥伴，在 GB200 機櫃市佔率領先。目前估值相較於散熱模組而言較有安全邊際，營收逐月增長明確，呈多頭排列且未有過熱失控訊號。",
    analyst_action: "分批低接",
    core_risk: "關鍵大廠（如美超微）設計架構修正影響訂單流向，以及鋼板、鋁合金等國際金屬原材料上漲衝擊毛利。",
    global_linkage: "緊密相連 NVIDIA Blackwell 架構的系統整合出貨標準，及全球大型 CSP 業者資料中心機房機架空間配置規格變革。"
  },
  {
    stock_id: "2059",
    stock_name: "川湖",
    category: "通用機械",
    sub_category: "導軌滑軌",
    current_price: 1850.0,
    change: 35.0,
    change_percent: 1.93,
    volume: 1820,
    dividend_yield: 2.16,
    pe_ratio: 32.4,
    scores: {
      total: 84,
      momentum: 86,
      valuation: 48,
      dividend: 50,
      risk: 70,
      trend: 92
    },
    timestamps: {
      price_date: "2026-06-01",
      inst_date: "2026-06-01",
      broker_date: "2026-05-29",
      report_date: "2026-Q1"
    },
    timing_status: {
      status: "等待拉回",
      tags: ["等待回檔", "高價股"]
    },
    strategy: {
      observe_range: "1720 ~ 1760",
      entry_method: "股價回測月線且量縮、融資降溫時佈局",
      exit_method: "上看 2000 元關卡附近進行獲利調節",
      stop_loss: "收盤價跌破 1650 元支撐點"
    },
    reason: "高階伺服器導軌全球市佔第一。AI 伺服器重量劇增（GB200 重達數百公斤），對於導軌的承重、阻尼及專利設計要求極高，毛利率高達 60% 以上。高價股流動性較低但籌碼安定，建議逢回分批進場。",
    analyst_action: "波段續抱 (等待拉回)",
    core_risk: "高單價精密零件易受市場高價股流動性緊縮影響，若國際股市回檔，外資易將其視為提款提現之防守標的。",
    global_linkage: "與美系雲端巨頭客製化伺服器主機重量規格、及伺服器滑軌全球結構防震專利法律訴訟進度高度掛鉤。"
  },
  {
    stock_id: "3008",
    stock_name: "大立光",
    category: "光學鏡頭",
    sub_category: "蘋果鏈",
    current_price: 3200.0,
    change: 95.0,
    change_percent: 3.06,
    volume: 1250,
    dividend_yield: 2.81,
    pe_ratio: 21.5,
    scores: {
      total: 85,
      momentum: 87,
      valuation: 78,
      dividend: 62,
      risk: 82,
      trend: 86
    },
    timestamps: {
      price_date: "2026-06-01",
      inst_date: "2026-06-01",
      broker_date: "2026-06-01",
      report_date: "2026-Q1"
    },
    timing_status: {
      status: "可分批布局",
      tags: ["可分批布局", "低估值", "光學鏡頭"]
    },
    strategy: {
      observe_range: "3020 ~ 3100",
      entry_method: "於 3000 元整數關卡至月線區間分批佈局",
      exit_method: "攻克 3500 元前高附近分批獲利了結",
      stop_loss: "跌破專案底線 2850 元"
    },
    reason: "市場對導入端側 AI 的旗艦智慧型手機換機潮預期升溫。大立光作為潛望鏡式鏡頭及高階 G+P 鏡頭主供商，最能受惠規格升級。目前估值相對偏低，底部打底完成，具備高安全邊際。",
    analyst_action: "強力買進",
    core_risk: "全球智慧手機飽和、總出貨量增長有限，以及主要對手玉晶光、舜宇光學在潛望式鏡頭上的專利繞道與低價搶單。",
    global_linkage: "深度連動蘋果 (Apple) 公司秋季 iPhone 新機出貨展望，以及歐美日三大消費性電子市場的實質零售買氣強度。"
  },
  {
    stock_id: "2327",
    stock_name: "國巨",
    category: "電子零組件",
    sub_category: "被動元件",
    current_price: 1050.0,
    change: 25.0,
    change_percent: 2.44,
    volume: 4800,
    dividend_yield: 4.10,
    pe_ratio: 14.5,
    scores: {
      total: 88,
      momentum: 82,
      valuation: 88,
      dividend: 82,
      risk: 86,
      trend: 80
    },
    timestamps: {
      price_date: "2026-06-01",
      inst_date: "2026-05-29",
      broker_date: "2026-05-29",
      report_date: "2026-Q1"
    },
    timing_status: {
      status: "可分批布局",
      tags: ["可分批布局", "高殖利率", "價值復甦"]
    },
    strategy: {
      observe_range: "740 ~ 760",
      entry_method: "回測月線或 750 元附近支撐分批承接",
      exit_method: "目標上看 850~880 元附近獲利出場",
      stop_loss: "收盤價跌破半年線 710 元"
    },
    reason: "被動元件產業經歷長達數季的庫存去化後，第二季庫存回到健康水準。AI 伺服器與高效能運算對高壓、高頻 MLCC 需求暴增數倍，帶動高階產品稼動率回溫。具備 >4% 高殖利率，評價極具吸引力。",
    analyst_action: "分批低接 (價值存股)",
    core_risk: "若全球傳統 PC、手機出貨持續低迷，可能拖累常規品 MLCC 的利潤回升幅度；債務槓桿收購後的利息支出也需留心。",
    global_linkage: "直接連動全球消費電子半導體庫存循環週期，及日本大廠（如村田製作所 Murata、太陽誘電）對車用被動元件的擴產動態。"
  },
  {
    stock_id: "2383",
    stock_name: "台光電",
    category: "電子零組件",
    sub_category: "銅箔基板",
    current_price: 520.0,
    change: 18.0,
    change_percent: 3.59,
    volume: 11200,
    dividend_yield: 2.31,
    pe_ratio: 23.6,
    scores: {
      total: 86,
      momentum: 92,
      valuation: 60,
      dividend: 50,
      risk: 74,
      trend: 95
    },
    timestamps: {
      price_date: "2026-06-01",
      inst_date: "2026-06-01",
      broker_date: "2026-06-01",
      report_date: "2026-Q1"
    },
    timing_status: {
      status: "等待拉回",
      tags: ["等待回檔", "CCL龍頭"]
    },
    strategy: {
      observe_range: "480 ~ 495",
      entry_method: "回測月線或 500 元整數關卡支撐分批接",
      exit_method: "股價創高挑戰 560~580 元時分批減碼",
      stop_loss: "跌破 460 元季線支撐"
    },
    reason: "全球高階 AI 伺服器 CCL（銅箔基板）主要供應商。雖然一度面臨同業競爭，但因 GB200 生態系中對超低損耗材料規格要求極高，其龍頭地位依然穩固。股價強勢反彈，短線追價風險偏高，建議回檔布局。",
    analyst_action: "分批低接",
    core_risk: "同業（如聯茂、台燿）通過 NVIDIA 新版認證引發市佔率瓜分與價格競爭；玻璃纖維布、銅箔等原物料價格大幅上漲。",
    global_linkage: "綁定 NVIDIA GPU 載板與高多層 (HDI) PCB 主板規格規範。高度受惠美中晶片對抗下，台廠供應鏈的溢注與轉單效應。"
  },
  {
    stock_id: "2408",
    stock_name: "南亞科",
    category: "半導體",
    sub_category: "記憶體",
    current_price: 72.0,
    change: -0.5,
    change_percent: -0.69,
    volume: 15400,
    dividend_yield: 1.39,
    pe_ratio: 35.0,
    scores: {
      total: 71,
      momentum: 62,
      valuation: 55,
      dividend: 30,
      risk: 76,
      trend: 78
    },
    timestamps: {
      price_date: "2026-06-01",
      inst_date: "2026-05-29",
      broker_date: "2026-05-28",
      report_date: "2026-Q1"
    },
    timing_status: {
      status: "僅觀察",
      tags: ["僅觀察", "高波動", "循環底部"]
    },
    strategy: {
      observe_range: "68 ~ 70",
      entry_method: "股價落入 70 元以下打底平台時，僅建立觀察基本倉",
      exit_method: "反彈至季線 76~78 元附近適度解套減碼",
      stop_loss: "跌破前低 65 元"
    },
    reason: "DRAM 報價呈現緩步復甦，HBM 產能排擠效應雖帶動 DDR5 漲價，但南亞科主力之 DDR4 及利基型記憶體需求回升速度慢於預期。第一季營運仍處損平邊緣，短線動能偏弱，適合長線景氣循環谷底觀察者。",
    analyst_action: "避開觀望 (僅觀察)",
    core_risk: "相較於美光或三星等能直接生產高毛利 HBM 的大廠，南亞科的技術製程轉換進度偏慢，且受傳統消費型電子低迷壓抑。",
    global_linkage: "高度依存全球 DRAM 產業三巨頭（三星、SK海力士、美光）的產能調度與資本支出政策，及主流 DDR4 與 DDR5 記憶體全球報價水位。"
  },
  {
    stock_id: "2891",
    stock_name: "中信金",
    category: "金融保險",
    sub_category: "銀行",
    current_price: 41.5,
    change: 0.5,
    change_percent: 1.22,
    volume: 42100,
    dividend_yield: 5.06,
    pe_ratio: 11.2,
    scores: {
      total: 87,
      momentum: 80,
      valuation: 85,
      dividend: 95,
      risk: 90,
      trend: 82
    },
    timestamps: {
      price_date: "2026-06-01",
      inst_date: "2026-06-01",
      broker_date: "2026-06-01",
      report_date: "2026-Q1"
    },
    timing_status: {
      status: "可分批布局",
      tags: ["可分批布局", "高殖利率", "穩健防禦"]
    },
    strategy: {
      observe_range: "39.5 ~ 40.8",
      entry_method: "股價回測 5 日線或 40 元大關分批進場",
      exit_method: "中長線穩健存股，若漲幅超過 15% 可適度調節",
      stop_loss: "跌破 37.5 元且配息政策出現意外調降"
    },
    reason: "核心子公司中信銀獲利維持歷史高檔，受惠台美高利差及財富管理手續費暴增。今年配發高額現金股利，目前實質殖利率高達 5% 以上，極具防禦價值。在大盤位階創高時，為極佳之避險與資產配置選擇。",
    analyst_action: "強力買進 (價值避險)",
    core_risk: "若全球通膨加速降溫引發美國 Fed 進行劇烈降息，將使台美高利差縮減，並壓抑淨利差 (NIM) 長期獲利表現。",
    global_linkage: "連動美國聯準會 (Fed) 利率決策、美債殖利率波動走勢，以及外資在大盤創高時進行防守板塊的調配動能。"
  },
  {
    stock_id: "2881",
    stock_name: "富邦金",
    category: "金融保險",
    sub_category: "壽險金控",
    current_price: 92.0,
    change: 1.2,
    change_percent: 1.32,
    volume: 24500,
    dividend_yield: 4.13,
    pe_ratio: 10.8,
    scores: {
      total: 86,
      momentum: 82,
      valuation: 82,
      dividend: 85,
      risk: 84,
      trend: 84
    },
    timestamps: {
      price_date: "2026-06-01",
      inst_date: "2026-06-01",
      broker_date: "2026-06-01",
      report_date: "2026-Q1"
    },
    timing_status: {
      status: "可分批布局",
      tags: ["可分批布局", "獲利王", "穩健存股"]
    },
    strategy: {
      observe_range: "88 ~ 90.5",
      entry_method: "逢回測月線或 90 元關卡分批布局存股",
      exit_method: "挑戰百元大關前適度進行減碼",
      stop_loss: "跌破 84 元或新台幣匯率出現極端劇烈波動"
    },
    reason: "台灣金融業 EPS 獲利王。受惠於台美股市創高，旗下富邦人壽投資收益及台股部位實現可觀未實現損益，壽險雙雄獲利動能爆發。且宣告現金股利優於預期，殖利率逾 4%，性價比高。",
    analyst_action: "分批低接",
    core_risk: "新台幣匯率若強烈升值，將面臨龐大的避險成本與匯損，影響壽險子公司的實質獲利申報與淨值。",
    global_linkage: "緊密關聯標普 500 (S&P 500) 與台灣加權指數走勢（影響龐大投資部位評價），以及國際信用利差走勢。"
  },
  {
    stock_id: "2882",
    stock_name: "國泰金",
    category: "金融保險",
    sub_category: "壽險金控",
    current_price: 64.0,
    change: 0.8,
    change_percent: 1.27,
    volume: 21500,
    dividend_yield: 4.38,
    pe_ratio: 11.5,
    scores: {
      total: 85,
      momentum: 81,
      valuation: 80,
      dividend: 86,
      risk: 82,
      trend: 83
    },
    timestamps: {
      price_date: "2026-06-01",
      inst_date: "2026-06-01",
      broker_date: "2026-06-01",
      report_date: "2026-Q1"
    },
    timing_status: {
      status: "可分批布局",
      tags: ["可分批布局", "穩健存股"]
    },
    strategy: {
      observe_range: "61 ~ 62.8",
      entry_method: "回測月線或整數支撐分批買進佈局",
      exit_method: "中長線存股，波段上看 70 元大關",
      stop_loss: "跌破半年線 57.5 元"
    },
    reason: "金控雙雄之一，首季獲利爆發。受惠海外高利環境及資本市場大漲，國壽淨值與獲利能力大幅提升。配發股利大方，目前殖利率表現優異，防禦力十足，適合於高檔盤勢中作為資金避風港。",
    analyst_action: "分批低接",
    core_risk: "避險衍生工具合約成本偏高，以及當美國國債殖利率劇烈下行時對新增資金再投資收益率的壓抑風險。",
    global_linkage: "密切連動美股、台股兩大股票市場多空位階，以及新台幣兌美元之避險匯率成本走勢。"
  },
  {
    stock_id: "1301",
    stock_name: "台塑",
    category: "傳統產業",
    sub_category: "塑膠石化",
    current_price: 58.0,
    change: -0.2,
    change_percent: -0.34,
    volume: 8200,
    dividend_yield: 1.72,
    pe_ratio: 45.0,
    scores: {
      total: 65,
      momentum: 50,
      valuation: 40,
      dividend: 32,
      risk: 88,
      trend: 55
    },
    timestamps: {
      price_date: "2026-06-01",
      inst_date: "2026-05-29",
      broker_date: "2026-05-28",
      report_date: "2026-Q1"
    },
    timing_status: {
      status: "僅觀察",
      tags: ["僅觀察", "低動能", "傳統石化"]
    },
    strategy: {
      observe_range: "54 ~ 56",
      entry_method: "目前趨勢尚未扭轉，不建議在此位階建立部位，僅作景氣復甦觀察",
      exit_method: "若持有者，可逢反彈回月線/季線時適度減碼換股",
      stop_loss: "股價跌破 52 元續創波段新低"
    },
    reason: "受制於中國大陸石化產能持續過剩與殺價競爭，外溢效應衝擊台灣石化製品利潤，且全球碳稅實施增加營運成本。第一季本業依然面臨虧損壓力，基本面仍待落底，建議暫不買進，保持觀察。",
    analyst_action: "避開觀望",
    core_risk: "中國大陸在五大通用塑膠產能的大幅擴張且短期沒有退場跡象，造成石化產品裂解利差長期維持在歷史底部區間。",
    global_linkage: "直接遭受中國大陸製造業供應鏈外銷傾銷變局的劇烈衝擊，且容易受到國際原油（布蘭特、西德州）價格波動擠壓毛利。"
  },
  {
    stock_id: "2002",
    stock_name: "中鋼",
    category: "傳統產業",
    sub_category: "鋼鐵冶煉",
    current_price: 23.5,
    change: -0.1,
    change_percent: -0.42,
    volume: 12500,
    dividend_yield: 2.13,
    pe_ratio: 38.0,
    scores: {
      total: 68,
      momentum: 55,
      valuation: 50,
      dividend: 40,
      risk: 86,
      trend: 60
    },
    timestamps: {
      price_date: "2026-06-01",
      inst_date: "2026-05-29",
      broker_date: "2026-05-29",
      report_date: "2026-Q1"
    },
    timing_status: {
      status: "僅觀察",
      tags: ["僅觀察", "景氣循環"]
    },
    strategy: {
      observe_range: "21.8 ~ 22.5",
      entry_method: "股價未站穩季線前，僅進行長線技術面追蹤，不建議重倉",
      exit_method: "若反彈至半年線 25 元整數關卡可減碼",
      stop_loss: "跌破 21 元波段支撐"
    },
    reason: "受全球房地產建設需求偏弱以及低價鋼材傾銷衝擊，鋼價反彈動能不足。中鋼雖積極佈局高值化精緻鋼材及綠能風電鋼板，但整體獲利回溫緩慢，目前評價偏高且殖利率缺乏吸引力，僅列入觀察。",
    analyst_action: "避開觀望 (僅觀察)",
    core_risk: "中國房地產爛尾樓與建材需求持續冰封，導致中國內銷熱軋、冷軋鋼材大量低價傾銷外溢至東南亞與台灣市場。",
    global_linkage: "高度掛鉤中國大陸房地產景氣（螺紋鋼、鐵礦砂報價指標），以及全球基礎綠能建設對精緻鋼材的需求增速。"
  },
  {
    stock_id: "3481",
    stock_name: "群創",
    category: "面板",
    sub_category: "液晶面板",
    current_price: 69.4,
    change: 3.4,
    change_percent: 5.15,
    volume: 154000,
    dividend_yield: 2.15,
    pe_ratio: 28.2,
    scores: {
      total: 75,
      momentum: 88,
      valuation: 65,
      dividend: 40,
      risk: 55,
      trend: 84
    },
    timestamps: {
      price_date: "2026-06-01",
      inst_date: "2026-06-01",
      broker_date: "2026-06-01",
      report_date: "2026-Q1"
    },
    timing_status: {
      status: "僅觀察",
      tags: ["爆量強勢", "事件題材", "高波動"]
    },
    strategy: {
      observe_range: "52.5 ~ 54.0",
      entry_method: "量縮回測 5 日均線支撐時小倉位快進快出",
      exit_method: "波段高點 59 ~ 61 元阻力區全數獲利了結",
      stop_loss: "有效跌破今日長紅棒中值 (51.5 元)"
    },
    reason: "今日成交量暴增強勢突圍，但買盤偏向短線事件/減資題材與情緒炒作，波動性極高。僅適合短線輕倉操作，不宜長線重壓。",
    analyst_action: "短線輕倉 (小倉操作)",
    core_risk: "面板產業長期供過於求格局未完全改變，且短線情緒與資金流出速度快，防範高檔爆量長黑多殺多。",
    global_linkage: "連動全球大尺寸面板報價、減資進度，以及中國同業（京東方等）的產能擴張動能。"
  }
];
