const AddUserModal = ({ isOpen, onClose, onAdd }: { isOpen: boolean, onClose: () => void, onAdd: (data: FormData) => void }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <form onSubmit={(e) => { e.preventDefault(); onAdd(new FormData(e.currentTarget)); }} className="bg-white rounded-[32px] w-full max-w-md shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-lg font-black flex items-center gap-2 text-slate-800"><i className='bx bx-user-plus text-indigo-500 text-xl'></i> 사용자 초대</h3>
                    <button type="button" onClick={onClose} className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-400 hover:bg-slate-100 flex items-center justify-center"><i className='bx bx-x text-xl'></i></button>
                </div>
                <div className="p-6 space-y-5">
                    <div><label className="block text-[12px] font-bold text-slate-500 mb-2">이름</label><input name="name" required placeholder="예: 홍길동" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] font-semibold outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400" /></div>
                    <div><label className="block text-[12px] font-bold text-slate-500 mb-2">이메일</label><input name="email" required type="email" placeholder="예: user@company.com" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] font-semibold outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400" /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-[12px] font-bold text-slate-500 mb-2">부서</label><input name="dept" required placeholder="예: 개발팀" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] font-semibold outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400" /></div>
                        <div>
                            <label className="block text-[12px] font-bold text-slate-500 mb-2">부여 권한</label>
                            <select name="role" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] font-semibold outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 cursor-pointer">
                                <option value="Interviewer">Interviewer</option><option value="HR Manager">HR Manager</option><option value="Viewer">Viewer</option><option value="Super Admin">Super Admin</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="p-6 pt-0 flex gap-3">
                    <button type="button" onClick={onClose} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-colors">취소</button>
                    <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-md hover:bg-indigo-700 transition-colors">초대 발송</button>
                </div>
            </form>
        </div>
    );
};

export default AddUserModal
