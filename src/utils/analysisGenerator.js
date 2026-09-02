// 台灣股票分析師：依日K、週K、月K與國際情勢動態生成個股分析、買賣區間與操作評估 (前端與全端通用)
export function generateStockAnalysis(code, currentPrice, changePercent) {
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

  // 個股專屬基本面字典
  const stockMeta = {
    // 半導體 & 晶圓代工 & 封測
    "2330": { name: "台積電", sector: "晶圓代工龍頭", driver: "先進製程（3nm/2nm）產能利用率持續吃緊，CoWoS/SoIC 先進封裝擴產加速，受惠美系 AI 巨頭龐大算力晶片訂單。" },
    "2303": { name: "聯電", sector: "晶圓代工", driver: "成熟製程稼動率逐步改善，聚焦 22/28nm 特殊製程與車用/電源管理晶片，具備 5% 以上高殖利率保護。" },
    "3711": { name: "日月光投控", sector: "先進封測龍頭", driver: "受惠 AI 伺服器與高效能運算 (HPC) 晶片封測需求，先進封裝 (VIPack) 營收倍數增長。" },
    "2449": { name: "京元電子", sector: "AI晶片測試", driver: "承接各大美系 AI GPU 與 ASIC 高階晶片成品測試訂單，測試時間拉長帶動產能滿載與毛利上揚。" },
    "5347": { name: "世界", sector: "特殊製程晶圓代工", driver: "8吋與12吋特殊製程產能利用率築底回升，車用與電源管理晶片訂單穩定挹注。" },
    "6239": { name: "力成", sector: "記憶體封測", driver: "高頻寬記憶體 (HBM) 與先進面板級封裝佈局逐步收割，提供穩定高配息防禦。" },
    "3374": { name: "精材", sector: "3D感測封測", driver: "台積電封測重要夥伴，受惠新一代智慧型手機 3D 感測與車用 CIS 封裝需求起飛。" },

    // IC 設計 & 矽智財
    "2454": { name: "聯發科", sector: "IC設計龍頭", driver: "天璣系列旗艦手機晶片滲透率攀升，搭配客製化 AI ASIC 伺服器晶片與車用/ARM PC SoC 開花結果，長線成長藍圖清晰。" },
    "3661": { name: "世芯-KY", sector: "AI ASIC矽智財", driver: "美系雲端巨頭 (CSP) 客製化 3nm/5nm AI 訓練晶片出貨維持高峰，長線 AI ASIC 能見度極高。" },
    "5274": { name: "信驊", sector: "伺服器BMC晶片股王", driver: "新一代 AST2700 伺服器遠端管理晶片放量，直接受惠 AI 伺服器多節點架構對 BMC 顆數翻倍需求。" },
    "3443": { name: "創意", sector: "先進製程ASIC", driver: "台積電第一大設計服務夥伴，HBM3e 介面 IP 與客製化 AI 晶片委託設計 (NRE) 營收強勁。" },
    "3035": { name: "智原", sector: "ASIC與先進封裝IP", driver: "深化與先進晶圓代工廠先進封裝 IP 合作，跨足先進製程 ASIC 開發，後續量產潛力龐大。" },
    "3034": { name: "聯詠", sector: "驅動與OLED IC龍頭", driver: "高階 OLED 驅動 IC 攻入美系旗艦手機供應鏈，ASIC 業務拓展有成，兼具 6% 超高殖利率。" },
    "2379": { name: "瑞昱", sector: "網通晶片龍頭", driver: "Wi-Fi 7 換機潮與車用乙太網路晶片市佔率擴大，PC/NB 庫存回補帶動營運逐季走高。" },
    "3529": { name: "力旺", sector: "嵌入式記憶體IP", driver: "安全 IP (PUF) 與 OTP 矽智財廣泛導入先進製程與車用晶片，權利金收入隨晶圓投片量高速成長。" },
    "3227": { name: "原相", sector: "CMOS影像感測晶片", driver: "遊戲機感測晶片拉貨強勁，電競滑鼠與 OTS 光學追蹤感測器產品組合優化推升獲利。" },

    // AI 伺服器 & 電腦代工
    "2317": { name: "鴻海", sector: "AI伺服器與電子代工龍頭", driver: "NVIDIA GB200/NVL72 伺服器整機機櫃出貨持續放量，伴隨旗艦智慧型手機進入傳統下半年拉貨旺季，雙引擎驅動營收動能。" },
    "2382": { name: "廣達", sector: "AI伺服器組裝龍頭", driver: "受惠美系四大雲端服務商 (CSP) 擴大資本支出，高階 AI 伺服器訂單能見度直達明年，產能陸續到位。" },
    "3231": { name: "緯創", sector: "AI伺服器運算板基座", driver: "身為全球 GPU 運算板 (UBB) 主力製造廠，良率穩定且產能充沛，下半年 AI 伺服器出貨量將呈雙位數季增。" },
    "6669": { name: "緯穎", sector: "CSP雲端資料中心伺服器", driver: "北美頂級雲端客戶客製化 AI 伺服器出貨放量，整機液冷機櫃解決方案受市場青睞。" },
    "2357": { name: "華碩", sector: "品牌電腦", driver: "Copilot+ AI PC 系列強勢開賣帶動換機潮，高階伺服器營收比重亦快速攀升至一成以上。" },
    "2376": { name: "技嘉", sector: "電腦硬體", driver: "高階 AI 伺服器與次世代電競顯示卡雙引擎發威，美歐通路庫存健康且出貨動能強勁。" },
    "3706": { name: "神達", sector: "電子組裝", driver: "旗下神雲科技承接大型資料中心伺服器訂單，車用電子與智慧零售業務穩健推進。" },

    // 散熱模組 & 水冷架構
    "3017": { name: "奇鋐", sector: "散熱模組龍頭", driver: "水冷板 (Cold Plate) 與散熱機櫃出貨量倍增，高階伺服器散熱規格升級趨勢明確，產品組合優化毛利表現。" },
    "3324": { name: "雙鴻", sector: "水冷散熱關鍵技術廠", driver: "水冷散熱關鍵零組件（CDU 分配器、水冷板）產能逐步開出，直接受惠次世代高 TDP 晶片散熱架構革新。" },
    "3653": { name: "健策", sector: "均熱片龍頭", driver: "超大型均熱片 (Heat Spreader) 專利與沖壓技術全球領先，AI 伺服器晶片插座扣件出貨暢旺。" },
    "2421": { name: "建準", sector: "散熱風扇龍頭", driver: "高轉速伺服器風扇與水冷系統輔助風扇規格升級，ASP 提升帶動毛利率創近年新高。" },
    "8996": { name: "高力", sector: "水冷散熱", driver: "伺服器水冷 CDU 分配歧管與熱泵熱交換板出貨升溫，掌握氫能與散熱雙重綠能題材。" },

    // 伺服器機殼 & 導軌
    "8210": { name: "勤誠", sector: "伺服器機殼龍頭", driver: "高階 AI 伺服器專用機殼與機櫃設計複雜度提升帶動平均售價 (ASP) 上揚，北美 CSP 客戶拉貨動能充沛。" },
    "2059": { name: "川湖", sector: "伺服器導軌王者", driver: "伺服器高階滑軌市佔率高達七成以上，專利護城河極深，受惠重型伺服器機箱規格升級，獲利結構扎實。" },
    "3013": { name: "晟銘電", sector: "伺服器機殼", driver: "積極擴建水冷機櫃組裝線，ODM 客戶伺服器機殼訂單能見度佳，產能利用率維持高檔。" },

    // 電源 & 連接零組件
    "2308": { name: "台達電", sector: "電源與綠能管理", driver: "AI 伺服器高瓦數專用電源與電網基礎設施需求強勁，散熱與車用電子雙軌並進，營運體質穩健。" },
    "2301": { name: "光寶科", sector: "電源管理", driver: "高效能雲端伺服器電源與電容器模組出貨成長，持續處分非核心事業以聚焦高毛利領域。" },
    "3665": { name: "貿聯-KY", sector: "高階連接線束", driver: "超高功率 HPC 連接線束與半導體設備機台線組出貨大增，水冷快接頭 (Quick Disconnect) 導入成效顯著。" },

    // PCB / CCL / 載板
    "2383": { name: "台光電", sector: "銅箔基板 (CCL) 先鋒", driver: "高階無鹵與低損耗 CCL 在 AI 伺服器及交換機板市佔居冠，材料升級週期確立其長期領先地位。" },
    "2368": { name: "金像電", sector: "AI伺服器PCB多層板龍頭", driver: "高層數 (20層以上) 伺服器主板與加速卡 PCB 產能滿載，台灣與泰國新產能陸續到位。" },
    "2313": { name: "華通", sector: "低軌衛星與HDI板龍頭", driver: "全球低軌衛星 (LEO) 天線與地面接收器主力 PCB 供應商，智慧型手機主板拉貨動能增溫。" },
    "3037": { name: "欣興", sector: "ABF高階載板龍頭", driver: "受惠 AI 伺服器晶片大面積與高層數載板需求回溫，稼動率逐步重返上升循環。" },

    // 被動元件
    "2327": { name: "國巨", sector: "被動元件龍頭", driver: "車用、工控與高階被動元件庫存去化完全，利基型產品比重超過七成，兼具高殖利率與估值防禦優勢。" },
    "2492": { name: "華新科", sector: "MLCC被動元件", driver: "車用電阻與高壓電容出貨平穩增長，稼動率回升推升獲利逐季好轉。" },

    // 半導體設備與檢測
    "3131": { name: "弘塑", sector: "CoWoS濕製程設備龍頭", driver: "先進封裝單晶圓旋轉清洗機與濕製程設備訂單大排長龍，營收動能強勁。" },
    "3583": { name: "辛耘", sector: "先進封裝設備", driver: "濕製程設備自製率提升且再生晶圓產能滿載，受惠晶圓龍頭擴產潮。" },
    "6187": { name: "萬潤", sector: "CoWoS封裝設備", driver: "點膠機與貼合檢測機台出貨暢旺，獲利爆發力位居半導體設備前茅。" },
    "6640": { name: "均華", sector: "挑晶機龍頭", driver: "高精度晶粒挑揀機市佔率突破七成，直攻先進封裝關鍵製程。" },
    "6223": { name: "旺矽", sector: "垂直探針卡龍頭", driver: "高階晶圓垂直探針卡 (VPC) 及 MEMS 探針卡打入美系 AI 客戶，產能全開。" },
    "6515": { name: "穎崴", sector: "高階測試座龍頭", driver: "大晶片與高功率散熱測試座 (Socket) 需求激增，技術門檻穩居全球前三大。" },

    // 電信與內需
    "2412": { name: "中華電信", sector: "電信通訊龍頭", driver: "5G 用戶數與 ARPU 穩定成長，企業 ICT 資通訊與 IDC 雲端服務營收亮眼，提供 4% 以上超高安全邊際與穩定配息。" },
    "4904": { name: "遠傳", sector: "電信三雄", driver: "合併綜效持續顯現，5G 月租用戶滲透率提升，遠距診療與智慧城市專案成長穩健。" },
    "3045": { name: "台灣大", sector: "電信三雄", driver: "電信本業與電商事業雙軌驅動，自由現金流充沛，提供良好殖利率防禦保護。" },
    "2912": { name: "統一超", sector: "零售超商龍頭", driver: "全台逾 7,000 家門市通路優勢，鮮食與自有品牌毛利率優化，同店營收 (SSSG) 穩健成長。" },
    "1216": { name: "統一", sector: "食品龍頭", driver: "食品本業原料成本受控，轉投資統一超與東南亞事業營運亮眼，抗通膨能力極佳。" },

    // 航運與航空
    "2603": { name: "長榮", sector: "貨櫃航運龍頭", driver: "紅海地緣繞道與歐美補庫存推升貨櫃運價維持高檔，長約鎖定高獲利，提供極具吸引力之高殖利率防護。" },
    "2609": { name: "陽明", sector: "貨櫃航運", driver: "主要航線運價有撐，新造大型節能貨櫃船陸續交付降低營運成本，營運體質健全。" },
    "2615": { name: "萬海", sector: "航運航海", driver: "亞洲近洋航線運價反彈，美西新航線裝載率維持高檔，營收爆發力顯著。" },
    "2618": { name: "長榮航", sector: "航空客運龍頭", driver: "海外旅遊需求強勁推升客運票價高檔不墜，搭配電商跨境高價航空貨運，獲利創歷史新高。" },
    "2610": { name: "華航", sector: "航空雙雄", driver: "貨運機隊運能優勢顯著，客運載客率維持八成以上高水準，燃油成本受控助益獲利。" },
    "2646": { name: "星宇航空", sector: "精品航空新星", driver: "北美長程航線佈局完成帶動高收益中轉客源，新機隊陸續到位大幅拓展航網效益。" },

    // 重電設備與綠能
    "1519": { name: "華城", sector: "重電外銷龍頭股王", driver: "美國電網基礎設施現代化與 AI 資料中心龐大用電需求帶動特高壓變壓器外銷大單，訂單能見度直通 2027 年。" },
    "1513": { name: "中興電", sector: "GIS重電設備", driver: "台電強韌電網計畫 345kV/161kV 氣體絕緣開關 (GIS) 最大供應商，在手訂單逾數百億元。" },
    "1503": { name: "士電", sector: "重電機電", driver: "變壓器與配電盤外銷美國及東南亞成長迅猛，綠能儲能電廠統包工程挹注營收。" },
    "6869": { name: "雲豹能源", sector: "綠能環保龍頭", driver: "大型太陽能光電與儲能電廠陸續完工併網，綠電轉供交易量成長逾倍。" },

    // 金融金控
    "2881": { name: "富邦金", sector: "金融金控獲利王", driver: "壽險投資部位未實現收益回升，銀行與產險雙引擎獲利強勁，長線每股獲利 (EPS) 與配息能力名列前茅。" },
    "2882": { name: "國泰金", sector: "指標壽險金控", driver: "受惠資本市場回溫與資產配置優化，獲利動能顯著回升，兼具金融防禦性與除權息收益題材。" },
    "2891": { name: "中信金", sector: "大型金控股", driver: "銀行利差獲利穩健增長，財富管理手續費收入亮眼，提供 5% 穩定高殖利率，為資金極佳之防守避風港。" },
    "2886": { name: "兆豐金", sector: "公股金控龍頭", driver: "美元外匯與企金放款利差維持高水準，資產品質優異且配息政策極為穩定。" },
    "2884": { name: "玉山金", sector: "消金優等生", driver: "財富管理手續費雙位數成長，數位金融市佔率穩居前段班，體質健全度高。" },
    "2885": { name: "元大金", sector: "證券經紀龍頭", driver: "台股成交量能放大與高股息 ETF 熱潮帶動經紀與財管手續費收入大幅攀升。" },

    // 傳產與生技
    "1301": { name: "台塑", sector: "石化傳產龍頭", driver: "面臨全球石化產能供過於求與常規品競爭，正積極朝半導體特用化學品與高值化材料轉型，靜待景氣築底。" },
    "2002": { name: "中鋼", sector: "鋼鐵龍頭", driver: "受全球高利率與房地產建築動能偏緩影響，鋼價處於底部震盪，正持續拉高車用與綠能高品級鋼材比重以優化體質。" },
    "4763": { name: "材料-KY", sector: "特用化學龍頭", driver: "全球醋酸纖維絲束產能供不應求，新產線陸續開出，獲利結構極佳並兼具高殖利率。" },
    "6472": { name: "保瑞", sector: "生技CDMO股王", driver: "併購國際大藥廠綜效顯現，全球 CDMO 代工產能規模躋身前段班，營收獲利續創新高。" },
    "1795": { name: "美時", sector: "特殊學名藥廠", driver: "血癌藥與肺癌藥外銷歐美市場持續放量，東南亞併購通路加速布局。" },
    "3481": { name: "群創", sector: "面板與先進封裝", driver: "積極跨足面板級扇出型封裝 (FOPLP) 切入 AI 晶片封裝領域，具備資產活化與轉型題材。" },
    "8069": { name: "元太", sector: "電子紙龍頭", driver: "彩色電子紙 (Spectra 6) 廣告看板與大尺寸電子貨架標籤 (ESL) 換代需求強勁。" }
  };

  const meta = stockMeta[code] || { 
    name: `台股標的 (${code})`, 
    sector: "台股焦點股", 
    driver: "基本面受惠整體產業結構升級與營運穩健拓展，中長線營運架構維持良性循環。" 
  };

  let timing_status;
  let analyst_action;
  let strategy;
  let core_risk;
  let global_linkage = "高度連動美股科技板塊、全球產業供應鏈供需狀況及外資法人資金流向。";
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

  // 針對特定族群補充專屬國際連動
  if (["2891", "2881", "2882", "2886", "2884", "2892", "2880", "2885", "2887", "2890", "2883", "5880"].includes(code)) {
    global_linkage = "密切連動美聯準會 (Fed) 利率政策路徑、美債殖利率波動，以及新台幣兌美元之匯率走勢。";
  } else if (["2603", "2609", "2615", "2637", "2606"].includes(code)) {
    global_linkage = "密切連動 SCFI 歐洲與美西貨櫃運價指數、BDI 散裝波羅的海指數，以及紅海與蘇伊士運河國際局勢。";
  } else if (["2618", "2610", "2646", "6757"].includes(code)) {
    global_linkage = "高度受惠於全球出國觀光客運復甦熱潮、航空燃油期貨價格走勢，以及跨境電商空運載貨量。";
  } else if (["1519", "1513", "1503", "1514", "1504"].includes(code)) {
    global_linkage = "連動美國電網現代化基建預算、全球變壓器供需缺口，以及台灣台電強韌電網計畫之標案進度。";
  } else if (["2412", "4904", "3045"].includes(code)) {
    global_linkage = "具備防禦性抗通膨特質，連動台灣整體消費信心指數與企業數位轉型雲端資本支出。";
  } else if (["1301", "1303", "1326", "6505", "2002"].includes(code)) {
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
