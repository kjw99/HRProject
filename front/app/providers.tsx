// app/providers.tsx (별도 파일로 만드는 것이 관리하기 좋습니다)
"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
import { Toaster } from 'sonner';
import BackNavAuthGuard from '@/components/auth/BackNavAuthGuard';

export default function Providers({ children }: { children: React.ReactNode }) {
    // useState를 사용하여 페이지 이동 시 클라이언트가 초기화되는 것을 방지합니다.
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 5 * 60 * 1000, // 10분 동안 데이터를 '신선한(fresh)' 상태로 간주 (캐시 유지)
                gcTime: 10 * 60 * 1000,    // 캐시 보관 시간 15분
                retry: 1,                  // 실패 시 1회 재시도
            },
        },
    }));

    return (
        <QueryClientProvider client={queryClient}>
            <BackNavAuthGuard />
            {children}
            <ReactQueryDevtools initialIsOpen={false} />
            <Toaster position="top-right" expand={true} richColors />
        </QueryClientProvider>
    );
}
