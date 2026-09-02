import React from 'react';

export default function MarketTrends({ 
  favorites = [], 
  stocks = [], 
  marketIndex = {
    value: 45182.50,
    change: 312.80,
    changePercent: 0.70,
    volume: 5420,
    date: '2026-06-05',
    time: '10:44:43'
  }
}) {
  
  // 篩選最愛股票
  const favoriteStocks = stocks.filter(s => favorites.includes(s.stock_id));

  // 如果最愛為空，則預設展示台積電 2330, 聯發科 2454, 國巨 2327, 鴻海 2317, 群創 3481
  const displayStocks = (favoriteStocks.length > 0 
    ? favoriteStocks 
    : stocks.filter(s => ["2330", "2454", "2327", "2317", "3481"].includes(s.stock_id))
  ).map(stock => {
    // 籌碼預設或動態對應
    const chipsPreset = {
      "2330": "分點延續 3 天，前三淨買超 6,333 張",
      "2454": "分點延續 3 天，前三淨買超 2,908 張",
      "2327": "分點延續 3 天，前三淨買超 7,721 張",
      "2317": "分點延續 1 天，前三淨買超 1,205 張",
      "3481": "分點延續 1 天，前三淨買超 12,400 張"
    };

    let chipsInfo = chipsPreset[stock.stock_id];
    if (!chipsInfo) {
      if (stock.scores.momentum >= 90) {
        chipsInfo = `投信連買 ${Math.floor((stock.scores.momentum - 80) / 3) || 3} 天，籌碼大增`;
      } else if (stock.scores.trend >= 90) {
        chipsInfo = "特定主力分點連買 2 天，籌碼持續收斂";
      } else {
        chipsInfo = "三大法人進出溫和，主力資券互鎖中";
      }
    }

    // 操盤動作類型
    let actionType = "watch";
    const act = stock.analyst_action || "";
    if (act.includes("強力買進")) actionType = "buy-strong";
    else if (act.includes("分批")) actionType = "buy-gradual";
    else if (act.includes("輕倉") || act.includes("短線")) actionType = "light-position";
    else if (act.includes("避開")) actionType = "watch";

    return {
      id: stock.stock_id,
      name: stock.stock_name,
      closePrice: stock.current_price,
      action: stock.analyst_action || stock.timing_status.status,
      actionType,
      chips: chipsInfo,
      range: stock.strategy?.observe_range || "等待回測支撐",
      entry: stock.strategy?.entry_method || "逢回踩均線分批承接",
      exit: stock.strategy?.exit_method || "波段阻力位減碼停利",
      stop: stock.strategy?.stop_loss || "有效跌破近期整理平台支撐",
      desc: stock.reason || "AI 正在融合價格走勢、分點買超強度與技術乖離率分析該股..."
    };
  });

  // 國際事件對照矩陣數據
  const matrixData = [
    {
      event: "NVIDIA 與全球雲端巨頭 (CSP) 算力資本支出瘋狂擴張",
      impact: "強烈利多 (產能滿載)",
      sectors: "晶圓代工、AI 伺服器組裝、水冷散熱、高階機殼",
      stocks: [
        { id: "2330", name: "台積電", action: "等待均線拉回分批佈局" },
        { id: "2317", name: "鴻海", action: "本益比低於同業，強力買進" },
        { id: "2382", name: "廣達", action: "多頭架構完好，波段續抱" },
        { id: "3017", name: "奇鋐", action: "高估值波動大，過熱暫不追" },
        { id: "3324", name: "雙鴻", action: "回測支撐逢低低接" }
      ]
    },
    {
      event: "旗艦手機與 AI PC 換機潮全面啟動 (端側 Edge AI 普及循環)",
      impact: "中長線利多 (換機循環)",
      sectors: "AI PC、AI 手機、光學鏡頭、晶片設計",
      stocks: [
        { id: "2317", name: "鴻海", action: "旗艦機組裝主力，強力買進" },
        { id: "2454", name: "聯發科", action: "Edge AI 旗艦晶片出貨，分批低接" },
        { id: "3008", name: "大立光", action: "潛望鏡鏡頭規格升級，強力買進" }
      ]
    },
    {
      event: "Fed 貨幣利率政策延遲降息 & 美伊地緣政治原油波動",
      impact: "防守型支撐 (避險買盤)",
      sectors: "高息銀行金控、價值股被動元件",
      stocks: [
        { id: "2891", name: "中信金", action: "5%高殖利率與利差受惠，強力買進" },
        { id: "2881", name: "富邦金", action: "壽險雙雄首季獲利爆發，分批低接" },
        { id: "2327", name: "國巨", action: "庫存去化完成兼具殖利率，分批低接" }
      ]
    },
    {
      event: "中國大陸房地產低迷與重工業/石化產能嚴重過剩外溢",
      impact: "長線利空 (利差擠壓)",
      sectors: "傳統石化、粗鋼冶煉、低階通用記憶體",
      stocks: [
        { id: "2002", name: "中鋼", action: "受大陸粗鋼低價傾銷，避開觀望" },
        { id: "1301", name: "台塑", action: "五大通用塑膠供過於求，避開觀望" },
        { id: "2408", name: "南亞科", action: "傳統品報價回溫慢，避開觀望" }
      ]
    }
  ];

  // 點擊矩陣個股直接跳轉詳情
  const handleStockNavigate = (code) => {
    window.location.hash = `#/stock/${code}`;
  };

  return (
    <div className="w-full flex flex-col gap-6 text-gray-100">
      
      {/* 頂部大盤走勢概況 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 左大欄：大盤現況診斷 */}
        <div className="lg:col-span-2 bg-tw-bg-secondary border border-white/5 p-6 rounded-2xl flex flex-col gap-4">
          <h2 className="text-lg font-bold flex items-center gap-2 border-b border-white/5 pb-3">
            📈 加權指數技術與籌碼診斷 ({marketIndex.date})
          </h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-tw-bg-primary border border-white/5 p-4 rounded-xl">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 font-semibold">當前位階</span>
              <span className="text-lg font-extrabold monospace mt-1 text-tw-up">{marketIndex.value.toLocaleString('zh-TW', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 font-semibold">乖離率 (BIAS 20MA)</span>
              <span className="text-lg font-extrabold monospace mt-1 text-amber-500">+12.4% (超買)</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 font-semibold">市場融資餘額</span>
              <span className="text-lg font-extrabold monospace mt-1 text-tw-up">4,250 億 (歷史高)</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 font-semibold">外資期指空單</span>
              <span className="text-lg font-extrabold monospace mt-1 text-cyan-400">6.24 萬口 (避險)</span>
            </div>
          </div>
          
          <div className="text-sm text-gray-300 leading-relaxed flex flex-col gap-3">
            <p>
              <strong>【趨勢診斷】</strong><br />
              當前台股大盤多頭氣勢如虹，加權指數成功跨越 45,000 點大關。主要由台積電創高及 COMPUTEX 台北國際電腦展之 AI 熱浪推動。
              然而，短線技術指標（如 RSI、KD）已處於 80 以上之極端超買區，日 K 線與月線（20MA）正乖離過大，技術面有急迫的拉回修正、均線收斂壓力。
            </p>
            <p>
              <strong>【籌碼警告】</strong><br />
              散戶及市場槓桿資金（融資餘額）創下歷史高檔，顯示高檔投機情緒高昂。與此同時，外資在台指期布署了超過 6 萬口的巨量淨空單進行防守對鎖。
              此種「散戶融資大增、外資空單高掛」的結構極易引發高檔大幅震盪。一旦科技股出現利多實現的技術性長黑，需防範槓桿多單多殺多的急跌回檔。
            </p>
          </div>
        </div>

        {/* 右小欄：分析師宏觀配置策略 */}
        <div className="bg-tw-bg-secondary border border-white/5 p-6 rounded-2xl flex flex-col gap-4">
          <h2 className="text-lg font-bold flex items-center gap-2 border-b border-white/5 pb-3">
            🛡️ 宏觀避險策略與資金分配
          </h2>
          
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-semibold text-gray-400">
                <span>科技成長股 (AI鏈/Edge AI)</span>
                <span className="text-blue-400 font-bold">50% (分批防守)</span>
              </div>
              <div className="h-2 w-full bg-tw-bg-primary rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: '50%' }}></div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-semibold text-gray-400">
                <span>避險防禦股 (高息金融/價值)</span>
                <span className="text-emerald-400 font-bold">30% (逢低加碼)</span>
              </div>
              <div className="h-2 w-full bg-tw-bg-primary rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: '30%' }}></div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-semibold text-gray-400">
                <span>現金保留 (等待拉回子彈)</span>
                <span className="text-amber-500 font-bold">20% (伺機低接)</span>
              </div>
              <div className="h-2 w-full bg-tw-bg-primary rounded-full overflow-hidden">
                <div className="h-full bg-amber-500" style={{ width: '20%' }}></div>
              </div>
            </div>
          </div>

          <div className="bg-white/2 border border-white/5 p-3.5 rounded-xl text-xs text-gray-400 leading-relaxed mt-2">
            💡 <strong>分析師配置思維：</strong><br />
            指數 45,000 點以上絕非單筆重倉追價的時機。應維持 20% 以上的現金防禦水位。科技成長股僅保留核心持股（如強勢的鴻海、台積電），並將部分獲利調配至具備 4%~5% 殖利率防禦的金融金控（中信金、富邦金），以平滑投組波動度。
          </div>
        </div>
      </div>

      {/* 🎯 AI 專業個股進出場與操盤戰術決策對策面板 */}
      <div className="bg-tw-bg-secondary border border-white/5 p-6 rounded-2xl flex flex-col gap-5 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-white/5 pb-3 gap-2">
          <div className="flex flex-col">
            <h2 className="text-base sm:text-lg font-bold flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
              🔮 AI 專業個股進出場點與操作策略精準對策面板 ({marketIndex.date})
            </h2>
            <p className="text-xs text-gray-500 mt-1">結合價格 + 分點 + 技術面交叉共振篩選，給予焦點強股最明晰的買賣與停損對策</p>
          </div>
          <span className="text-xs text-amber-500 font-bold bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full self-start sm:self-auto">
            ⚡ 盤後 AI 決策室 ({marketIndex.date})
          </span>
        </div>

        {favoriteStocks.length === 0 && (
          <div className="bg-amber-500/10 border border-white/5 text-amber-400 p-4 rounded-xl text-xs sm:text-sm flex flex-col gap-1.5 leading-relaxed">
            <div className="flex items-center gap-2 font-extrabold">
              <span>💡 提示：您目前尚未將股票加入最愛</span>
            </div>
            <p className="text-gray-400 text-xs">
              以下展示系統預設的 5 大籌碼焦點觀察股操作策略。您可以在 <strong>「🔍 推薦觀察清單」</strong> 分頁，點擊任意股票卡片上的 <strong>❤️ 按鈕</strong>，此對策面板將會<strong>自動替換</strong>為您專屬的最愛持股 AI 策略分析！
            </p>
          </div>
        )}

        {/* 焦點強股操作對策卡片區 */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
          {displayStocks.map((stock) => {
            // 決定動作標籤顏色
            let badgeBg = "bg-white/5 text-gray-400 border border-white/10";
            if (stock.actionType === "buy-strong") badgeBg = "bg-red-500/10 text-red-400 border border-red-500/20";
            if (stock.actionType === "buy-gradual") badgeBg = "bg-orange-500/10 text-orange-400 border border-orange-500/20";
            if (stock.actionType === "watch") badgeBg = "bg-blue-500/10 text-blue-400 border border-blue-500/20";
            if (stock.actionType === "light-position") badgeBg = "bg-purple-500/10 text-purple-400 border border-purple-500/20";

            return (
              <div 
                key={stock.id}
                onClick={() => handleStockNavigate(stock.id)}
                className="group bg-tw-bg-primary border border-white/5 hover:border-amber-500/30 p-4 rounded-xl flex flex-col gap-3.5 hover:shadow-glow cursor-pointer transition-all relative overflow-hidden"
                title={`點擊跳轉至 ${stock.id} ${stock.name} 互動 K 線行情圖`}
              >
                {/* 背景名次 */}
                <div className="absolute right-3 top-2 text-5xl font-extrabold text-white/[0.015] select-none monospace group-hover:text-amber-500/[0.04] transition-all">
                  {stock.id}
                </div>

                {/* 卡片頂部 */}
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <h3 className="text-sm font-extrabold text-gray-100 mt-0.5">
                      {stock.id} {stock.name}
                    </h3>
                    <span className="text-[10px] text-gray-500 font-semibold mt-0.5 monospace">現價: {stock.closePrice.toLocaleString()} 元</span>
                  </div>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${badgeBg}`}>
                    {stock.action}
                  </span>
                </div>

                {/* 籌碼現況 */}
                <div className="bg-white/[0.02] border border-white/5 px-2.5 py-1.5 rounded-lg">
                  <div className="text-[9px] text-gray-500 font-bold uppercase">本日主力籌碼</div>
                  <div className="text-xs text-amber-400 font-semibold monospace mt-0.5">{stock.chips}</div>
                </div>

                {/* 進出場戰術點 */}
                <div className="flex flex-col gap-2 border-t border-b border-white/5 py-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-[9px] text-gray-500 font-semibold">🎯 買進觀察區</div>
                      <div className="font-extrabold text-gray-300 monospace mt-0.5">{stock.range}</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-gray-500 font-semibold">🚨 防守停損線</div>
                      <div className="font-extrabold text-red-400/90 monospace mt-0.5">{stock.stop}</div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col mt-1">
                    <div className="text-[9px] text-emerald-400 font-bold">🟢 進場策略:</div>
                    <div className="text-xs text-gray-400 leading-relaxed mt-0.5">{stock.entry}</div>
                  </div>

                  <div className="flex flex-col">
                    <div className="text-[9px] text-cyan-400 font-bold">🔵 出場/停利目標:</div>
                    <div className="text-xs text-gray-400 leading-relaxed mt-0.5">{stock.exit}</div>
                  </div>
                </div>

                {/* 分析師點評 */}
                <div className="text-xs text-gray-400 leading-relaxed italic border-l-2 border-amber-500/40 pl-2 group-hover:text-gray-300 transition-colors">
                  {stock.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 中部：四大國際情勢事件剖析 */}
      <div className="bg-tw-bg-secondary border border-white/5 p-6 rounded-2xl flex flex-col gap-5">
        <h2 className="text-lg font-bold flex items-center gap-2 border-b border-white/5 pb-3">
          🌐 國際情勢核心事件與台股關聯分析
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="bg-tw-bg-primary border border-white/5 p-4 rounded-xl flex flex-col gap-2.5">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">科技主線 I</span>
              <span className="text-xs text-tw-up font-bold">● 強烈利多</span>
            </div>
            <h3 className="text-sm font-bold text-gray-200">美股 AI 巨頭資本支出與 COMPUTEX 電腦展</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              NVIDIA 營收前景暴增，美系四大 CSP（微軟、Google、AWS、Meta）持續追加 2026 資本支出建置資料中心。高瓦數電源、水冷散熱與 GB200 機櫃組裝訂單滿載，推升台股電子代工與零組件長線高成長。
            </p>
          </div>

          <div className="bg-tw-bg-primary border border-white/5 p-4 rounded-xl flex flex-col gap-2.5">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20">科技主線 II</span>
              <span className="text-xs text-tw-up font-bold">● 波段利多</span>
            </div>
            <h3 className="text-sm font-bold text-gray-200">蘋果 WWDC 釋出 Apple Intelligence 換機潮</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              蘋果 6 月召開開發者大會，全面導入端側 AI 技術 (Apple Intelligence)，將刺激全球長達數年的 AI 手機與 AI PC 升級與光學鏡頭規格更新。台廠晶片設計與高階潛望式鏡頭封裝供貨商中長線受惠明確。
            </p>
          </div>

          <div className="bg-tw-bg-primary border border-white/5 p-4 rounded-xl flex flex-col gap-2.5">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">宏觀金融</span>
              <span className="text-xs text-amber-500 font-bold">▲ 中性偏多</span>
            </div>
            <h3 className="text-sm font-bold text-gray-200">Fed 利率決策與中東地緣政治原油波動</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              受制地緣政治原油微幅走揚，美國 Fed 對降息態度謹慎，高利率環境預估延續至下半年。此情勢使台美高利差維持，核心子公司為銀行及擁有高息台美債券配置之金控，能維持優異的利差回報。
            </p>
          </div>

          <div className="bg-tw-bg-primary border border-white/5 p-4 rounded-xl flex flex-col gap-2.5">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">傳統循環</span>
              <span className="text-tw-down font-bold">▼ 長線利空</span>
            </div>
            <h3 className="text-sm font-bold text-gray-200">中國內需低迷與製造業產能過剩低價傾銷</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              中國大陸房地產景氣冰封，內需不振導致其鋼鐵冶煉、通用五大石化塑膠產能嚴重過剩，並以極低價格向東南亞及台灣市場傾銷，嚴重衝擊台灣粗鋼與傳統石化大廠毛利與報價，基本面仍待長線打底。
            </p>
          </div>

        </div>
      </div>

      {/* 底部：國際情勢與個股對策矩陣 (Interactive Table) */}
      <div className="bg-tw-bg-secondary border border-white/5 p-6 rounded-2xl flex flex-col gap-4">
        <h2 className="text-lg font-bold flex items-center gap-2 border-b border-white/5 pb-3">
          📊 國際情勢與個股關聯對策矩陣
        </h2>
        
        <div className="holdings-table-wrapper">
          <table className="holdings-table">
            <thead>
              <tr>
                <th className="w-[30%]">核心國際情勢 / 宏觀事件</th>
                <th className="w-[12%]">大盤多空影響</th>
                <th className="w-[20%]">主要受惠/受害產業板塊</th>
                <th>對應台股標的與分析師具體操作策略 (點擊代號跳轉詳情)</th>
              </tr>
            </thead>
            <tbody>
              {matrixData.map((row, idx) => {
                const isUp = row.impact.includes('利多');
                const isDown = row.impact.includes('利空');
                return (
                  <tr key={idx}>
                    <td className="font-bold text-gray-200 text-xs sm:text-sm leading-relaxed">{row.event}</td>
                    <td>
                      <span className={`timing-badge ${isUp ? 'buy' : isDown ? 'wait' : 'watch'}`} style={{ transform: 'scale(0.85)', transformOrigin: 'left' }}>
                        {row.impact}
                      </span>
                    </td>
                    <td className="text-xs text-gray-400 leading-relaxed">{row.sectors}</td>
                    <td>
                      <div className="flex flex-col gap-2">
                        {row.stocks.map(s => (
                          <div 
                            key={s.id} 
                            onClick={() => handleStockNavigate(s.id)}
                            className="flex items-center gap-2 p-1.5 rounded bg-tw-bg-primary/50 hover:bg-tw-bg-tertiary border border-white/5 hover:border-blue-500/30 cursor-pointer transition-all"
                            title={`查看 ${s.id} ${s.name} 詳細行情與 K 線圖`}
                          >
                            <span className="font-bold monospace text-xs bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20">{s.id}</span>
                            <span className="font-bold text-xs text-gray-200 w-16">{s.name}</span>
                            <span className="text-xs text-gray-400 leading-normal flex-1">{s.action}</span>
                            <span className="text-xs text-blue-500 font-bold">➔</span>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
