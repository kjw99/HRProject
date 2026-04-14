import React from 'react';

interface Log {
    id: string;
    type: string;
    message: string;
    time: string;
    user: string;
}

export default function SystemLogs({ logs }: { logs: Log[] }) {
    return (
        <div className="bg-white p-8 rounded-[32px] border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col h-[450px]">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-[18px] font-black text-slate-900 flex items-center gap-2">
                    <i className='bx bx-list-ul text-slate-400'></i> 시스템 이벤트 로그
                </h2>
                <button className="text-[12px] font-bold text-indigo-500 hover:text-indigo-700">모두 보기</button>
            </div>

            {/* 스크롤바 디자인을 위한 inline 스타일 주입 (Tailwind 플러그인 대체용) */}
            <style>{`
        .logs-scrollbar::-webkit-scrollbar { width: 4px; }
        .logs-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .logs-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
      `}</style>

            <div className="flex-1 overflow-y-auto space-y-4 logs-scrollbar pr-2">
                {logs.map((log) => (
                    <div key={log.id} className="p-4 rounded-[16px] bg-slate-50/50 border border-slate-100 hover:bg-slate-50 transition-colors group">
                        <div className="flex items-start gap-3">
                            <div className={`mt-0.5 w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0 shadow-sm border ${log.type === 'error' ? 'bg-rose-50 text-rose-500 border-rose-100' :
                                log.type === 'warning' ? 'bg-amber-50 text-amber-500 border-amber-100' :
                                    log.type === 'hallucination' ? 'bg-purple-50 text-purple-500 border-purple-100' :
                                        'bg-blue-50 text-blue-500 border-blue-100'
                                }`}>
                                <i className={`bx ${log.type === 'error' ? 'bx-x-circle' :
                                    log.type === 'warning' ? 'bx-error' :
                                        log.type === 'hallucination' ? 'bx-ghost' :
                                            'bx-info-circle'
                                    } text-lg`}></i>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-[6px] ${log.type === 'error' ? 'bg-rose-100 text-rose-700' :
                                        log.type === 'warning' ? 'bg-amber-100 text-amber-700' :
                                            log.type === 'hallucination' ? 'bg-purple-100 text-purple-700' :
                                                'bg-blue-100 text-blue-700'
                                        }`}>
                                        {log.type}
                                    </span>
                                    <span className="text-[11px] font-bold text-slate-400">{log.time}</span>
                                </div>
                                <p className="text-[13px] font-bold text-slate-700 leading-snug truncate group-hover:whitespace-normal transition-all">
                                    {log.message}
                                </p>
                                <p className="text-[11px] font-semibold text-slate-400 mt-2 flex items-center gap-1.5">
                                    <i className='bx bxs-user-circle'></i> {log.user}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}