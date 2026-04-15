import { Role, UserAccount } from "@/types/admin";

const ChangeRoleModal = ({ user, onClose, onChangeRole }: { user: UserAccount | null, onClose: () => void, onChangeRole: (role: Role) => void }) => {
    if (!user) return null;
    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[32px] w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="p-6 text-center border-b border-slate-100 bg-slate-50/50">
                    <div className="w-16 h-16 mx-auto bg-indigo-50 rounded-full flex items-center justify-center mb-4 border border-indigo-100"><i className='bx bx-key text-3xl text-indigo-500'></i></div>
                    <h3 className="text-xl font-black text-slate-800">권한 레벨 변경</h3>
                    <p className="text-sm font-semibold text-slate-500 mt-1">[{user.name}] 님의 권한을 수정합니다.</p>
                </div>
                <div className="p-6 space-y-3 bg-slate-50/30">
                    {(['Super Admin', 'HR Manager', 'Interviewer', 'Viewer'] as Role[]).map(r => (
                        <button key={r} onClick={() => onChangeRole(r)} className={`w-full p-4 rounded-2xl border-2 flex justify-between items-center transition-all ${user.role === r ? 'border-indigo-500 bg-indigo-50/50 text-indigo-700' : 'border-slate-100 bg-white hover:border-indigo-300 text-slate-600'}`}>
                            <span className="font-black text-[14px]">{r}</span>
                            {user.role === r && <i className='bx bxs-check-circle text-xl text-indigo-500'></i>}
                        </button>
                    ))}
                </div>
                <div className="p-4 border-t border-slate-100 bg-white">
                    <button onClick={onClose} className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-colors">닫기</button>
                </div>
            </div>
        </div>
    );
};

export default ChangeRoleModal
