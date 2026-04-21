"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ErrorToastUI } from './ErrorToastUI';


const SkeletonTimeline = ({ msg, duration }: { msg: string; duration: number }) => {
    const router = useRouter();

    useEffect(() => {
        toast.custom((t) => (
            <ErrorToastUI t={t} message={`${msg}`} duration={duration} />
        ), {
            duration: 2000, // 진행 바와 맞춤
            onAutoClose: () => {
                router.push('/');
            }
        });
    }, [])

    return (
        <div className="w-full bg-white p-6 rounded-2xl space-y-4 animate-pulse">
            {/* 날짜 헤더 모사 */}
            <div className="flex justify-between border-b border-gray-100 pb-4">
                {[...Array(15)].map((_, i) => (
                    <div key={i} className="h-2 w-6 bg-gray-100 rounded" />
                ))}
            </div>

            {/* 타임라인 바 모사 */}
            <div className="space-y-6 pt-4">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="relative h-9 w-full bg-gray-50 rounded-xl overflow-hidden">
                        <div
                            className="absolute h-full bg-gray-200 rounded-xl"
                            style={{
                                left: `${Math.random() * 20}%`,
                                width: `${30 + Math.random() * 40}%`,
                                opacity: 1 - (i * 0.1) // 아래로 갈수록 연해지는 디테일
                            }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SkeletonTimeline;