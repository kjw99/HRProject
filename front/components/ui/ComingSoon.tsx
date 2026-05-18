"use client";
import { toast } from 'sonner';
import { ToastUI } from './ToastUI';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface ComingSoonProps {
  title: string;
}

export default function ComingSoon({ title }: ComingSoonProps) {
  const router = useRouter();
  const [isClicked, setIsClicked] = useState<boolean>(false);
  useEffect(() => {
    toast.custom((t) => (
      <ToastUI t={t} message={title} duration={2000} />
    ), {
      duration: 2000,
      onAutoClose: () => {
        router.push('/');
      }
    });
  }, [title, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] w-full text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-blue-100/50 rounded-full blur-3xl animate-pulse"></div>
        <div className="relative w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center border border-gray-100">
          <i className='bx bx-code-alt text-5xl text-blue-600 animate-bounce'></i>
        </div>
        <i className='bx bxs-cog absolute -top-2 -right-2 text-2xl text-gray-300 animate-[spin_4s_linear_infinite]'></i>
        <i className='bx bxs-wrench absolute -bottom-2 -left-2 text-2xl text-gray-300'></i>
      </div>

      <div className="text-center px-6">
        <h2 className="text-3xl font-black text-gray-900 mb-5 tracking-[-0.03em] leading-tight">
          {title} 기능 준비 중
        </h2>

        <div className="space-y-1.5 py-2.5">
          <p className="text-[15px] font-medium text-gray-500 leading-relaxed tracking-tight">
            더 나은 서비스를 위해 현재 열심히 개발하고 있는 기능입니다.
          </p>
          <p className="text-[15px] font-medium text-gray-500 leading-relaxed tracking-tight">
            조금만 기다려 주시면 곧 멋진 모습으로 찾아올게요!
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => {
            setIsClicked(true);
            toast.custom((t) => (
              <ToastUI t={t} message={"홈으로 돌아갑니다."} duration={2000} />
            ), {
              duration: 2000,
              onAutoClose: () => {
                router.push('/login');
              }
            });
          }}
          disabled={isClicked}
          className="px-6 py-3 bg-gray-900 text-white rounded-2xl font-bold text-sm hover:bg-gray-800 transition-all active:scale-95 flex items-center gap-2"
        >
          <i className='bx bx-home-alt'></i>
          홈으로 돌아가기
        </button>
      </div>
    </div>
  );
}
