interface MetricData {
    value: string;
    change: string;
    isUp: boolean;
    label: string;
}

interface StatCardsProps {
    metrics: Record<string, MetricData>;
}

export default function StatCards({ metrics }: StatCardsProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(metrics).map(([key, data], idx) => (
                <div key={key} className="bg-white p-6 rounded-[24px] border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                    <div className="flex justify-between items-start mb-4">
                        <div className={`w-12 h-12 rounded-[16px] flex items-center justify-center text-2xl shadow-inner ${idx === 0 ? 'bg-blue-50 text-blue-500' :
                            idx === 1 ? 'bg-purple-50 text-purple-500' :
                                idx === 2 ? 'bg-emerald-50 text-emerald-500' :
                                    'bg-rose-50 text-rose-500'
                            }`}>
                            <i className={`bx ${idx === 0 ? 'bx-network-chart' :
                                idx === 1 ? 'bx-chip' :
                                    idx === 2 ? 'bx-dollar-circle' :
                                        'bx-error-circle'
                                }`}></i>
                        </div>
                        <div className={`flex items-center gap-1 text-[12px] font-black px-2 py-1 rounded-[8px] ${data.isUp
                            ? (idx === 3 || idx === 2 ? 'text-rose-600 bg-rose-50' : 'text-emerald-600 bg-emerald-50') // 비용/에러율 상승은 빨간색
                            : (idx === 3 || idx === 2 ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50')
                            }`}>
                            <i className={`bx ${data.isUp ? 'bx-trending-up' : 'bx-trending-down'}`}></i>
                            {data.change}
                        </div>
                    </div>
                    <h3 className="text-slate-500 font-bold text-[13px] mb-1">{data.label}</h3>
                    <p className="text-[32px] font-black text-slate-900 tracking-tighter leading-none group-hover:text-indigo-600 transition-colors">
                        {data.value}
                    </p>
                </div>
            ))}
        </div>
    );
}