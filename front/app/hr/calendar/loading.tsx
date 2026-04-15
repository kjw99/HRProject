export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 h-screen">
      {/* 1. 스피너 아이콘 */}
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <i className="bx bx-calendar text-3xl text-blue-600"></i>
        </div>
      </div>

      {/* 2. 텍스트 영역: 간격과 크기 정돈 */}
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">
          불러오는 중
        </h2>

        {/* SYSTEM INITIALIZING 텍스트가 겹치지 않게 별도 공간 확보 */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] font-black text-blue-600/40 uppercase tracking-[0.3em]">
            System Initializing
          </span>
          <p className="text-[14px] font-medium text-gray-400 leading-relaxed">
            실시간 데이터를 동기화하고 있습니다.
            <br />
            잠시만 기다려 주세요.
          </p>
        </div>
      </div>
    </div>
  );
}
