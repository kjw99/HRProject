'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface InterviewTimerProps {
    initialMinutes: number; // 초기 설정 시간 (분 단위)
}

export default function InterviewTimer({ initialMinutes }: InterviewTimerProps) {
    const router = useRouter();
    // 전체 시간을 초(second) 단위로 변환하여 관리
    const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);

    useEffect(() => {
        // 1초마다 실행되는 타이머
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    // 💡 시간이 종료되면 대시보드로 강제 이동
                    router.push('/applicant/dashboard');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [router]);

    // 초 단위를 MM:SS 포맷으로 변환
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // 1분(60초) 미만일 때 긴급 상태 표시
    const isUrgent = timeLeft < 60;

    return (
        <div className={`flex items-center gap-2 font-mono font-black transition-colors duration-300 ${isUrgent ? 'text-rose-600 animate-pulse' : 'text-rose-500'
            }`}>
            <span className="text-[12px] text-slate-400 font-sans font-bold">남은 시간</span>
            <span className="text-[18px]">{formatTime(timeLeft)}</span>

            {/* 1분 미만일 때 작은 경고 아이콘 노출 */}
            {isUrgent && <i className='bx bx-error-circle text-lg'></i>}
        </div>
    );
}