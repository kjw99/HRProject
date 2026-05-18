import { UserDetailModalProps } from '@/types/admin';

export default function UserDetailModal({
    isOpen, onClose, user, isLoading, isResettingPassword, onDelete, onResetPassword
}: UserDetailModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="h-20 bg-linear-to-r from-slate-100 to-slate-50 relative border-b border-slate-100">
                    <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-white rounded-full p-1 shadow-sm">
                        <i className="bx bx-x text-xl"></i>
                    </button>
                </div>

                <div className="p-8 pt-0">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center border-4 border-white shadow-sm -mt-10 mb-4 mx-auto relative z-10 text-4xl text-indigo-500">
                        <i className="bx bxs-user-circle"></i>
                    </div>

                    {isLoading ? (
                        <div className="py-10 flex justify-center"><i className="bx bx-loader-alt bx-spin text-3xl text-indigo-500"></i></div>
                    ) : user ? (
                        <>
                            <div className="text-center mb-6">
                                <h3 className="text-xl font-black text-slate-800">{user.userName}</h3>
                                <p className="text-sm font-medium text-slate-500">{user.userEmail}</p>
                            </div>

                            <div className="space-y-3 mb-8 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-bold text-slate-400">사원 ID</span>
                                    <span className="font-semibold text-slate-800">#{user.userId}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-bold text-slate-400">시스템 권한</span>
                                    <span className="font-bold uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">{user.role}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-bold text-slate-400">가입일</span>
                                    <span className="font-semibold text-slate-800">{new Intl.DateTimeFormat("ko-KR").format(new Date(user.createdAt))}</span>
                                </div>
                            </div>

                            <div className="flex gap-2 mt-2">
                                <button onClick={onClose} className="px-4 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">닫기</button>
                                <div className="flex-1 flex gap-2">
                                    <button onClick={() => onResetPassword(user.userEmail)} disabled={isResettingPassword} className="flex-1 px-3 py-2.5 rounded-xl font-bold text-white bg-amber-500 hover:bg-amber-600 shadow-sm flex justify-center items-center gap-1.5 disabled:opacity-50">
                                        <i className={`bx ${isResettingPassword ? "bx-loader-alt bx-spin" : "bx-key"} text-lg`}></i>
                                        <span className="text-sm">비밀번호 초기화</span>
                                    </button>
                                    <button onClick={() => onDelete(user.userId)} className="flex-1 px-3 py-2.5 rounded-xl font-bold text-white bg-rose-500 hover:bg-rose-600 shadow-sm flex justify-center items-center gap-1.5">
                                        <i className="bx bx-trash text-lg"></i>
                                        <span className="text-sm">계정 삭제</span>
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center text-rose-500 font-bold py-10">데이터를 불러오지 못했습니다.</div>
                    )}
                </div>
            </div>
        </div>
    );
}