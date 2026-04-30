export default function MaintenancePage({
    searchParams,
}: {
    searchParams: { reason?: string };
}) {
    // 파라미터가 없으면 기본 메시지 출력
    const message = searchParams.reason || "시스템 점검 및 업데이트 중입니다. 잠시 후 다시 시도해 주세요.";

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
            <i className='bx bx-error text-6xl text-amber-500 mb-6'></i>
            <h1 className="text-3xl font-black text-slate-800 mb-4">🚧 현재 작업 중입니다 🚧</h1>
            <p className="text-lg text-slate-600 text-center max-w-md bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                {message}
            </p>
        </div>
    );
}