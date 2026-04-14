import { UserAccount } from "@/types/admin";
import Badge from "./Badge";
import { ROLE_COLORS, STATUS_COLORS } from "./UserTable";

const UserDrawer = ({ user, onClose, onEdit, onDelete }: { user: UserAccount | null, onClose: () => void, onEdit: (u: UserAccount) => void, onDelete: (id: string) => void }) => {
    if (!user) return null;
    return (
        <div className="fixed inset-0 z-50 transition-all duration-300">
            <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={onClose} />
            <div className="absolute right-0 top-0 h-full w-full max-w-[420px] bg-white shadow-[auto_0_50px_rgba(0,0,0,0.1)] flex flex-col animate-in slide-in-from-right duration-300">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h3 className="font-black text-slate-800 text-[16px]">계정 상세 정보</h3>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-slate-400 hover:bg-slate-100 border border-slate-200 shadow-sm">
                        <i className='bx bx-x text-xl'></i>
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    <div className="text-center">
                        <div className="w-20 h-20 mx-auto rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center mb-4 shadow-inner relative">
                            <span className="text-3xl font-black text-indigo-600">{user.name.charAt(0)}</span>
                            <span className={`absolute bottom-0 right-0 w-5 h-5 border-2 border-white rounded-full ${STATUS_COLORS[user.status].dot}`}></span>
                        </div>
                        <h2 className="text-[22px] font-black text-slate-900">{user.name}</h2>
                        <p className="text-[14px] text-slate-500 font-medium">{user.email}</p>
                        <div className="mt-4 flex justify-center"><Badge text={user.role} className={ROLE_COLORS[user.role]} /></div>
                    </div>
                    <div className="bg-slate-50 rounded-[20px] p-5 space-y-3 border border-slate-100">
                        <div className="flex justify-between pb-3 border-b border-slate-200/60"><span className="text-[13px] font-bold text-slate-400">소속 부서</span><span className="text-[14px] font-black text-slate-800">{user.department}</span></div>
                        <div className="flex justify-between pb-3 border-b border-slate-200/60"><span className="text-[13px] font-bold text-slate-400">생성일</span><span className="text-[14px] font-black text-slate-800">{user.createdAt}</span></div>
                        <div className="flex justify-between"><span className="text-[13px] font-bold text-slate-400">접속</span><span className="text-[14px] font-black text-slate-800">{user.lastLogin}</span></div>
                    </div>
                    <div>
                        <h4 className="text-[13px] font-black text-slate-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <i className='bx bx-briefcase text-lg text-slate-400'></i> 담당 채용 공고
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {user.managedJobs.map((job, i) => (
                                <span key={i} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[12px] font-bold text-slate-600 shadow-sm">{job}</span>
                            ))}
                            {user.managedJobs.length === 0 && <span className="text-[13px] text-slate-400 italic">할당된 공고 없음</span>}
                        </div>
                    </div>
                </div>
                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3">
                    <button onClick={() => onEdit(user)} className="flex-1 py-3.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-[14px] hover:bg-slate-50 shadow-sm">권한 변경</button>
                    <button onClick={() => onDelete(user.id)} className="flex-1 py-3.5 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl font-bold text-[14px] hover:bg-rose-100 shadow-sm">계정 삭제</button>
                </div>
            </div>
        </div>
    );
};

export default UserDrawer
