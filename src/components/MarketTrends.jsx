import React from 'react';

export default function MarketTrends() {
  
  // 國際事件對照矩陣數據
  const matrixData = [
    {
      event: "NVIDIA 與美股 AI 巨頭資本支出瘋狂擴張 (COMPUTEX 效應)",
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
      event: "蘋果 WWDC 開發者大會 & Edge AI 開啟 (Apple Intelligence 換機潮)",
      impact: "中長線利多 (換機循環)",
      sectors: "AI PC、AI 手機、光學鏡頭、晶片設計",
      stocks: [
        { id: "2317", name: "鴻海", action: "蘋果頂規主力組裝，強力買進" },
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
            📈 加權指數技術與籌碼診斷 (2026年6月)
          </h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-tw-bg-primary border border-white/5 p-4 rounded-xl">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 font-semibold">當前位階</span>
              <span className="text-lg font-extrabold monospace mt-1 text-tw-up">45,182.50</span>
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
