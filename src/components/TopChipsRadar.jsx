import React from 'react';

// 本日主力分點籌碼前五強數據 (價格 + 分點 + 技術面交叉分析)
export const topChipsStocks = [
  {
    rank: 1,
    stock_id: "2330",
    stock_name: "台積電",
    close_price: 2355.0,
    change_percent: 2.77,
    broker_days: 3,
    net_buy_lots: 6333,
    comment: "核心最穩，分點買盤延續 3 天，前三大主力券商淨買超 6,333 張，現價仍座落在主力防守成本區附近，長線安全邊際極佳。"
  },
  {
    rank: 2,
    stock_id: "2454",
    stock_name: "聯發科",
    close_price: 2150.0,
    change_percent: 2.14,
    broker_days: 3,
    net_buy_lots: 2908,
    comment: "強勢延續性完整，特定投信分點連買 3 天，前三大主力淨買超 2,908 張，Edge AI 長線動能正式啟動，拉回即是買點。"
  },
  {
    rank: 3,
    stock_id: "2327",
    stock_name: "國巨",
    close_price: 790.0,
    change_percent: 1.96,
    broker_days: 3,
    net_buy_lots: 7721,
    comment: "題材分散效果良好，分點買盤延續 3 天，前三大淨買超 7,721 張，惟目前短線技術面位階偏熱，建議切忌追高，等整理再佈局。"
  },
  {
    rank: 4,
    stock_id: "2317",
    stock_name: "鴻海",
    close_price: 293.5,
    change_percent: -0.85,
    broker_days: 1,
    net_buy_lots: 1205,
    comment: "中長線多頭走勢仍強，但今日分點延續性萎縮僅剩 1 天，主力買盤有轉趨縮手跡象，故將其從「最優先」降評至「觀察強股」。"
  },
  {
    rank: 5,
    stock_id: "3481",
    stock_name: "群創",
    close_price: 56.1,
    change_percent: 5.84,
    broker_days: 1,
    net_buy_lots: 12400,
    comment: "今日成交量暴增強勢突圍，但買盤偏向短線事件/減資題材與情緒炒作，波動性極高。僅適合短線輕倉操作，不宜長線重壓。"
  }
];

export default function TopChipsRadar() {
  const handleStockClick = (code) => {
    window.location.hash = `#/stock/${code}`;
  };

  return (
    <div className="bg-tw-bg-secondary border border-white/5 p-5 rounded-2xl flex flex-col gap-4 shadow-xl">
      <div className="flex justify-between items-center border-b border-white/5 pb-3">
        <h2 className="text-base sm:text-lg font-bold flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
          🔥 主力分點籌碼 + 技術面交叉觀測 - 本日最值得關注 5 大強股
        </h2>
        <span className="text-xs text-gray-500 font-semibold monospace">每日盤後 AI 自動更新</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {topChipsStocks.map((item) => {
          const isUp = item.change_percent >= 0;
          return (
            <div
              key={item.rank}
              onClick={() => handleStockClick(item.stock_id)}
              className="group bg-tw-bg-primary border border-white/5 p-4 rounded-xl hover:border-blue-500/30 hover:shadow-glow cursor-pointer transition-all flex flex-col gap-3 relative overflow-hidden"
              title={`點擊查看 ${item.stock_id} ${item.stock_name} 的詳細互動 K 線圖`}
            >
              {/* 名次浮水印 */}
              <div className="absolute right-2 bottom-0 text-7xl font-extrabold text-white/[0.015] select-none monospace group-hover:text-blue-500/[0.04] transition-all">
                #{item.rank}
              </div>

              {/* 卡片頂部 */}
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <div className="text-xs text-gray-500 font-bold monospace">RANK #{item.rank}</div>
                  <h3 className="text-sm font-extrabold text-gray-100 flex items-center gap-1.5 mt-0.5">
                    {item.stock_id} {item.stock_name}
                  </h3>
                </div>
                <span className={`text-xs font-extrabold px-1.5 py-0.5 rounded ${
                  item.broker_days >= 3 ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-white/5 text-gray-400'
                }`}>
                  連買 {item.broker_days} 天
                </span>
              </div>

              {/* 價格與買超 */}
              <div className="flex justify-between items-end border-b border-white/5 pb-2">
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 font-semibold uppercase">今日收盤</span>
                  <span className="text-sm font-bold monospace leading-none mt-1" style={{ color: isUp ? 'var(--color-up)' : 'var(--color-down)' }}>
                    {item.close_price.toLocaleString('zh-TW', { minimumFractionDigits: 1 })}
                  </span>
                </div>
                <div className="text-right flex flex-col">
                  <span className="text-[10px] text-gray-500 font-semibold uppercase">前三淨買超</span>
                  <span className="text-xs font-bold text-amber-500 monospace mt-0.5">
                    {item.net_buy_lots.toLocaleString()} 張
                  </span>
                </div>
              </div>

              {/* 分析師點評 */}
              <p className="text-xs text-gray-400 leading-relaxed line-clamp-3 group-hover:text-gray-300 transition-colors">
                {item.comment}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
