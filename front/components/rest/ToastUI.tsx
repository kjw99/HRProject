'use client';

import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface CustomToastProps {
    t: string | number; // Sonner의 고유 ID
    message: string;
    duration: number; // 선택적 지속 시간 (밀리초)
}

export const ToastUI = ({ t, message, duration }: CustomToastProps) => {
    return (
        /* 외부 fixed div는 Sonner가 관리하므로 제거하고 내부 레이아웃만 유지합니다 */
        <div className="relative flex items-center gap-4 bg-white border-2 border-slate-100 rounded-lg p-4 pr-6 shadow-2xl shadow-slate-200/50 min-w-[320px] max-w-md pointer-events-auto">

            {/* 아이콘 영역 */}
            <div className="shrink-0 w-12 h-12 rounded-full bg-green-50 flex items-center justify-center border-4 border-white shadow-inner">
                <i className='bx bx-check-circle text-3xl text-green-500'></i>
            </div>

            {/* 텍스트 영역 */}
            <div className="flex-1 flex flex-col gap-0.5">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">System Status</span>
                <p className="text-[14px] font-bold text-slate-900 tracking-tight leading-snug">
                    {message}
                </p>
            </div>

            {/* 닫기 버튼 */}
            <button
                onClick={() => toast.dismiss(t)}
                className="text-slate-300 hover:text-slate-500 transition-colors ml-2"
            >
                <i className='bx bx-x text-xl'></i>
            </button>

            {/* 하단 진행 바 */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-50/50 overflow-hidden rounded-b-lg">
                <motion.div
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: duration / 1000, ease: "linear" }} // Sonner 기본 유지시간에 맞춤
                    className="h-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"
                    style={{ originX: 0 }}
                />
            </div>
        </div>
    );
};