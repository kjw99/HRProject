import Badge from "@/components/admin/accounts/Badge";
import { Role, Status, UserAccount } from "@/types/admin";

export const ROLE_COLORS: Record<Role, string> = {
    'Super Admin': 'bg-purple-100 text-purple-700 border-purple-200',
    'HR Manager': 'bg-blue-100 text-blue-700 border-blue-200',
    'Interviewer': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Viewer': 'bg-slate-100 text-slate-600 border-slate-200',
};

export const STATUS_COLORS: Record<Status, { dot: string; text: string; bg: string }> = {
    'Active': { dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' },
    'Inactive': { dot: 'bg-rose-500', text: 'text-rose-700', bg: 'bg-rose-50' },
    'Pending': { dot: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50' },
};

const UserTable = ({ users, onRowClick, onEdit, onDelete }: { users: UserAccount[], onRowClick: (u: UserAccount) => void, onEdit: (u: UserAccount) => void, onDelete: (id: string) => void }) => (
    <div className="bg-white rounded-[32px] border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200">
                        {['사용자 정보', '부서', '보안 권한', '상태', '최근 접속', '관리'].map(h => (
                            <th key={h} className="px-6 py-5 text-[12px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {users.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="py-20 text-center text-slate-500 font-bold">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
                                    <i className='bx bx-search text-3xl text-slate-300'></i>
                                </div>
                                <p>검색 결과가 없습니다.</p>
                            </td>
                        </tr>
                    ) : users.map((user) => (
                        <tr key={user.id} onClick={() => onRowClick(user)} className="hover:bg-slate-50/80 transition-colors cursor-pointer group">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-black shrink-0 border border-indigo-100">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-[14px] font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{user.name}</p>
                                        <p className="text-[12px] text-slate-500 font-medium">{user.email}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-[13px] font-bold text-slate-600">{user.department}</td>
                            <td className="px-6 py-4"><Badge text={user.role} className={ROLE_COLORS[user.role]} /></td>
                            <td className="px-6 py-4">
                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-bold ${STATUS_COLORS[user.status].bg} ${STATUS_COLORS[user.status].text}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${STATUS_COLORS[user.status].dot}`}></span>{user.status}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-[13px] font-medium text-slate-500">{user.lastLogin}</td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={(e) => { e.stopPropagation(); onEdit(user); }} className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 flex items-center justify-center transition-all shadow-sm" title="권한 변경">
                                        <i className='bx bx-key text-lg'></i>
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); onDelete(user.id); }} className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-all shadow-sm" title="계정 삭제">
                                        <i className='bx bx-trash text-lg'></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

export default UserTable;