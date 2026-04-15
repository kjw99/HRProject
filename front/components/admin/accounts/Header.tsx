import Badge from "./Badge";

const Header = ({ onAddClick }: { onAddClick: () => void }) => (
    <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200/60 pb-8">
        <div>
            <Badge text="Access Control" className="bg-indigo-50 text-indigo-600 mb-4" />
            <h2 className="text-[32px] md:text-[36px] font-black text-slate-900 flex items-center gap-3 tracking-tighter leading-tight">
                <i className='bx bx-shield-quarter text-indigo-500 text-[36px]'></i> 계정 및 권한 관리
            </h2>
            <p className="text-slate-500 font-semibold text-[14px] mt-2">
                사내 인사 담당자 및 면접관의 시스템 접근 권한을 안전하게 통제합니다.
            </p>
        </div>
        <button onClick={onAddClick} className="px-6 py-3.5 bg-slate-900 text-white rounded-[16px] font-black shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2">
            <i className='bx bx-user-plus text-xl'></i> 사용자 초대
        </button>
    </header>
);

export default Header
