import React, { useState, useEffect, useRef } from 'react';

export default function AiChatPanel({ stocks = [] }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: '您好！我是您的 **專業台股 AI 分析員**。我能結合今日台股即時交易所行情、個股技術面指標（日K/週K/月K線）及國際行事走向，為您提供精準的操作策略與解答。\n\n您可以點擊下方的熱門提問，或直接輸入任何股票名稱/代號（例如 `2330`、`2317`、`2454`）開始進行個股深度診斷！',
      timestamp: new Date().toLocaleTimeString('zh-TW', { hour12: false, hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  // 自動捲動到底部
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // 預設熱門提問
  const quickQuestions = [
    { label: '📊 診斷 2330 台積電', text: '請分析 2330 台積電目前的進出場建議與 AI 診斷理由。' },
    { label: '📈 診斷 2317 鴻海', text: '我想知道 2317 鴻海的 GB200 出貨預期與操作範圍？' },
    { label: '🔍 診斷 2454 聯發科', text: '聯發科 2454 重挫後，現在是適合分批進場的時機嗎？' },
    { label: '🌐 大盤指數看法', text: '目前加權指數大盤的情勢與趨勢如何？' },
    { label: '🛡️ 資金避險配置', text: '在大盤高檔震盪整理下，有哪些避險防禦個股推薦？' }
  ];

  // 處理訊息發送
  const handleSend = async (textToSend) => {
    const text = textToSend.trim();
    if (!text) return;

    // 新增使用者訊息
    const userMsg = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('zh-TW', { hour12: false, hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // 模擬 AI 分析中的延遲 (700ms - 1200ms)
    await new Promise(resolve => setTimeout(resolve, 800));

    // 生成 AI 回覆
    const replyContent = generateAiReply(text);
    const assistantMsg = {
      id: 'ai-' + Date.now(),
      role: 'assistant',
      content: replyContent,
      timestamp: new Date().toLocaleTimeString('zh-TW', { hour12: false, hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, assistantMsg]);
    setIsTyping(false);
  };

  // 本地智慧分析引擎：根據實時庫存資料與關鍵字動態拼裝專業報告
  const generateAiReply = (query) => {
    const q = query.toLowerCase();

    // 1. 匹配股票代號或名稱
    const matchedStock = stocks.find(s => {
      const idMatch = q.includes(s.stock_id);
      const nameMatch = q.includes(s.stock_name.toLowerCase());
      const pinyinMatch = s.stock_id === '2330' && (q.includes('tsmc') || q.includes('台積'));
      const foxconnMatch = s.stock_id === '2317' && (q.includes('foxconn') || q.includes('海'));
      const mediatekMatch = s.stock_id === '2454' && (q.includes('mediatek') || q.includes('發科'));
      return idMatch || nameMatch || pinyinMatch || foxconnMatch || mediatekMatch;
    });

    if (matchedStock) {
      const isUp = matchedStock.change >= 0;
      const changeColor = isUp ? '🔴' : '🟢'; // 台灣股市紅漲綠跌
      const changeSign = isUp ? '+' : '';

      return `### 📊 【個股深度診斷報告】 - ${matchedStock.stock_id} ${matchedStock.stock_name}
---
* **當前市價**：\`${matchedStock.current_price.toLocaleString('zh-TW', { minimumFractionDigits: 1 })}\` 元 ${changeColor} \`${matchedStock.change >= 0 ? '▲' : '▼'} ${Math.abs(matchedStock.change).toFixed(1)} (${changeSign}${matchedStock.change_percent.toFixed(2)}%)\`
* **累積成交量**：\`${(matchedStock.volume / 10).toLocaleString('zh-TW')} 張\`
* **時機評估**：**【${matchedStock.timing_status?.status || '區間操作'}】**
* **分析師決策**：\`${matchedStock.analyst_action || '區間操作 (分批布局)'}\`
* **區間觀察**：\`${matchedStock.strategy?.observe_range || '區間整理'}\` 元

#### 💡 操盤對策建議：
* **🔹 建議進場位**：${matchedStock.strategy?.entry_method || '逢量縮拉回均線支撐時分批佈局。'}
* **🔸 停利出場點**：${matchedStock.strategy?.exit_method || '股價挑戰整理平台阻力或出現爆量滯漲時分批停利。'}
* **🚨 紀律止損線**：${matchedStock.strategy?.stop_loss || '跌破近期防守低點整理平台。'}

#### ✍️ 專業台股分析師解析：
${matchedStock.reason || '該股目前受到大盤震盪與國際半導體板塊修正影響。日K在均線區間整理，週K與月K線長線架構尚未走空。長線產業基本面依然穩固，建議投資人秉持紀律，切忌於高檔一次性重倉追高，拉回至觀察區間內再分批低接。'}

#### ⚠️ 關鍵風險：
${matchedStock.core_risk || '短線乖離率過高，融資餘額若維持高檔，需防範高檔浮額回檔震盪的沉澱壓力。'}

#### 🌐 國際連動性：
${matchedStock.global_linkage || '連動美股費半指數、NVIDIA 等 AI 技術大廠之出貨表現與資本支出預算。'}`;
    }

    // 2. 匹配大盤/指數
    if (q.includes('大盤') || q.includes('指數') || q.includes('加權') || q.includes('台股')) {
      return `### 🌐 【大盤加權指數與國際情勢對策報告】
---
* **今日走勢**：大盤目前呈現高檔震盪整理態勢，技術面上日K線正面臨季線與月線的清洗修正，週K與月K線多頭排列架構依然完好。
* **盤面焦點**：Computex 與 WWDC 展後，AI/Edge AI 的短線利多逐步實現，資金面開始流向金控高息股等防禦板塊以作避險。

#### 💡 操作策略建議：
* **多頭格局未變**：大盤中長線多頭軌道並未破壞。此波回檔修正可視為良性的高檔乖離收斂。
* **分批低接為主**：避開短線乖離過高的熱門題材股。建議在指數拉回至月線或半年線附近支撐守穩時，針對先進製程半導體及水冷散熱模組等核心強股進行分批中長線布局。
* **嚴守資金額度**：高檔震盪加劇，建議控制總持股水位在 5~6 成左右，保留現金部位以便在回測底部時進攻。`;
    }

    // 3. 匹配避險/配置/理財
    if (q.includes('避險') || q.includes('配置') || q.includes('防禦') || q.includes('高股息') || q.includes('金融')) {
      const financeStocks = stocks.filter(s => ['2891', '2881', '2882', '2327'].includes(s.stock_id));
      const listStr = financeStocks.map(s => `* **${s.stock_id} ${s.stock_name}**（現價: \`${s.current_price}\`元 | 殖利率: \`${s.dividend_yield}%\` | 分析師評估: \`${s.analyst_action}\`）`).join('\n');
      
      return `### 🛡️ 【高檔避險與資產配置防禦指南】
---
在大盤加權指數處於高檔劇烈震盪之際，外資與本土主力資金通常會將部位調配至**高殖利率金控股**及**低本益比價值股**進行避險配置。

#### 📋 推薦避險防禦個股清單：
${listStr}

#### 💡 配置核心心法：
1. **防禦力極佳**：金融雙雄（富邦金、國泰金）與中信金具備穩健的獲利水準，且提供 4%~5% 以上的高殖利率，是大盤回檔時資金的安全避風港。
2. **被動元件庫存健康**：國巨 (2327) 庫存去化已完全落底，且兼具高配息防禦優勢，本益比偏低，適合防守型配置。
3. **比例分配**：建議將防禦型持股比例拉高至 30%~40%，平衡高波動 AI 伺服器散熱股的震盪衝擊。`;
    }

    // 4. 預設回覆
    return `您好！我是您的專業台股 AI 分析員。

我目前已成功連接台灣交易所資料庫。您可以透過輸入**股票代號（例如 \`2330\`、\`2317\`、\`2454\`）**或**股票名稱**，向我詢問關於個股的深度策略診斷。

**熱門詢問主題推薦：**
* 「台積電 2330 的進出場策略？」
* 「幫我診斷 2317 鴻海的股價區間」
* 「大盤加權指數目前的趨勢看法？」
* 「推薦在大盤高位時的資金避險防禦個股」`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-tw-bg-secondary border border-white/5 rounded-2xl shadow-2xl flex flex-col h-[650px] overflow-hidden text-gray-100">
      
      {/* 1. 對話框頁首 */}
      <div className="flex items-center gap-3 border-b border-white/5 p-4 bg-white/2">
        <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-xl shadow-glow">
          🤖
        </div>
        <div>
          <h2 className="text-base font-bold flex items-center gap-2">
            專業台股 AI 分析員 <span className="text-xs px-1.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded">Live 同步中</span>
          </h2>
          <p className="text-[10px] text-gray-500 mt-0.5">結合即時 TWSE 行情、K線指標及國際事件為您診斷個股策略</p>
        </div>
      </div>

      {/* 2. 對話歷史紀錄區 */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-[#0a0f1d]/30">
        {messages.map(msg => {
          const isAI = msg.role === 'assistant';
          return (
            <div key={msg.id} className={`flex gap-3 max-w-[85%] ${isAI ? 'self-start' : 'self-end flex-row-reverse'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
                isAI 
                  ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400' 
                  : 'bg-purple-500/10 border border-purple-500/20 text-purple-400'
              }`}>
                {isAI ? '🤖' : '👤'}
              </div>
              <div className="flex flex-col gap-1">
                <div className={`rounded-2xl p-3 text-sm leading-relaxed border ${
                  isAI 
                    ? 'bg-tw-bg-primary/80 border-white/5 text-gray-300' 
                    : 'bg-blue-600 border-blue-500 text-white rounded-tr-none'
                }`}>
                  {/* 解析換行與標記格式 */}
                  {msg.content.split('\n').map((line, idx) => {
                    // 解析簡化標題 ###
                    if (line.startsWith('### ')) {
                      return <h3 key={idx} className="text-sm font-extrabold text-white mt-2 mb-1 flex items-center gap-1.5">{line.replace('### ', '')}</h3>;
                    }
                    // 解析簡化小標 ####
                    if (line.startsWith('#### ')) {
                      return <h4 key={idx} className="text-xs font-bold text-blue-400 mt-2 mb-1">{line.replace('#### ', '')}</h4>;
                    }
                    // 解析分割線 ---
                    if (line === '---') {
                      return <hr key={idx} className="border-white/5 my-2" />;
                    }
                    // 行內代碼 `code` 轉換
                    const parts = line.split('`');
                    return (
                      <p key={idx} className="min-h-[1.2rem] mt-0.5">
                        {parts.map((part, pIdx) => {
                          if (pIdx % 2 === 1) {
                            return <code key={pIdx} className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded font-semibold text-amber-500 monospace text-xs mx-0.5">{part}</code>;
                          }
                          // 處理粗體 **bold**
                          const boldParts = part.split('**');
                          return boldParts.map((bPart, bIdx) => {
                            if (bIdx % 2 === 1) {
                              return <strong key={bIdx} className="text-white font-bold">{bPart}</strong>;
                            }
                            return bPart;
                          });
                        })}
                      </p>
                    );
                  })}
                </div>
                <span className={`text-[10px] text-gray-500 monospace ${isAI ? 'text-left' : 'text-right'}`}>
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {/* 正在輸入狀態 */}
        {isTyping && (
          <div className="flex gap-3 self-start max-w-[85%]">
            <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center text-sm flex-shrink-0">
              🤖
            </div>
            <div className="flex flex-col gap-1">
              <div className="rounded-2xl p-3 bg-tw-bg-primary/80 border border-white/5 text-gray-400 text-sm flex items-center gap-1">
                <span className="dot-typing animate-bounce">●</span>
                <span className="dot-typing animate-bounce delay-150">●</span>
                <span className="dot-typing animate-bounce delay-300">●</span>
                <span className="text-xs ml-1 italic">分析師整理中...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* 3. 快速問題建議欄 */}
      <div className="p-3 bg-white/1 border-t border-white/5 flex flex-wrap gap-2 items-center">
        <span className="text-[10px] text-gray-500 font-bold uppercase mr-1">💡 快速診斷:</span>
        {quickQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q.text)}
            disabled={isTyping}
            className="text-xs px-2.5 py-1 bg-tw-bg-primary border border-white/5 hover:border-blue-500/20 hover:text-blue-400 rounded-full transition-all disabled:opacity-50"
          >
            {q.label}
          </button>
        ))}
      </div>

      {/* 4. 對話輸入框 */}
      <div className="p-4 bg-white/2 border-t border-white/5">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="請輸入欲分析之股票名稱/代號或大盤問題... (例如：分析 2330)"
            disabled={isTyping}
            className="flex-1 px-4 py-2.5 bg-tw-bg-primary border border-white/5 focus:border-blue-500/30 rounded-xl text-sm focus:outline-none focus:shadow-glow text-gray-200 placeholder-gray-600 disabled:opacity-50 transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-white/5 border border-blue-500 hover:border-blue-400 disabled:border-white/5 text-white disabled:text-gray-500 font-bold text-sm rounded-xl transition-all shadow-md hover:shadow-glow flex items-center justify-center gap-1.5"
          >
            發送 ➔
          </button>
        </form>
      </div>

    </div>
  );
}
