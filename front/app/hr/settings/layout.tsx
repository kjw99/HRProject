import SettingsSidebar from '@/components/hr/layout/SettingsSidebar';

export default function SettingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        // 💡 1. max-w-9xl과 mx-auto를 지우고 w-full을 적용했습니다.
        // 💡 2. 화면이 너무 넓어질 때를 대비해 큰 화면(lg, xl)에서 좌우 여백(px)을 조금 더 주면 좋습니다.
        <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-12 py-4">
            <div className="flex flex-col md:flex-row gap-8 lg:gap-8 items-start">

                {/* 좌측: 세로형 사이드바 컴포넌트 */}
                {/* 💡 사이드바 너비가 너무 늘어나지 않도록 SettingsSidebar 내부에 w-64, shrink-0 등이 있는지 확인하세요 */}
                <SettingsSidebar />

                {/* 우측: 메인 설정 콘텐츠 영역 */}
                <main className="flex-1 w-full bg-white rounded-4xl p-6 md:p-10 shadow-sm border border-slate-100 min-h-[600px]">
                    {children}
                </main>

            </div>
        </div>
    );
}