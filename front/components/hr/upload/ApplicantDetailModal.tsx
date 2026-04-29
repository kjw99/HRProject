import { ApplicantInfo } from "@/types/hr";

const ApplicantDetailModal = ({
    isOpen, onClose, data, onDelete, onEdit
}: {
    isOpen: boolean; onClose: () => void; data: ApplicantInfo | null; onDelete: (id: string) => void; onEdit: (id: string) => void;
}) => {
    if (!isOpen || !data) return null;
    const { id, name, originalJobRole, email, contact, fileType, ...restData } = data;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-4xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors z-20">
                    <i className="bx bx-x text-2xl"></i>
                </button>
                <div className="overflow-y-auto scrollbar-hide">
                    <div className="p-8 md:p-10 bg-slate-50/50 border-b border-slate-100 relative">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 rounded-3xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-inner border border-indigo-200/50">
                                    <i className="bx bxs-user text-4xl"></i>
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">{name}</h2>
                                        <span className="px-2.5 py-1 bg-white border border-indigo-100 text-indigo-600 text-[11px] font-black rounded-lg uppercase tracking-wider shadow-sm">{fileType}</span>
                                    </div>
                                    <p className="text-sm font-bold text-slate-500 flex items-center gap-2"><i className="bx bx-briefcase text-slate-400"></i> {originalJobRole}</p>
                                    <div className="flex flex-wrap items-center gap-3 mt-3">
                                        <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5"><i className="bx bx-envelope text-indigo-400 text-base"></i> {email}</span>
                                        <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5"><i className="bx bx-phone text-indigo-400 text-base"></i> {contact}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="p-8 md:p-10 bg-white">
                        <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 tracking-tight mb-6"><i className='bx bxs-magic-wand text-indigo-500'></i> 파싱된 상세 정보</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {Object.entries(restData).filter(([k]) => k !== 'id').map(([key, val], idx) => (
                                <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-indigo-100 hover:shadow-sm transition-all">
                                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{key}</span>
                                    <span className="block text-sm font-bold text-slate-800 wrap-break-word">{String(val)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <button onClick={(e) => { e.stopPropagation(); onDelete(id); }} className="px-5 py-2.5 rounded-xl text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-1.5">
                        <i className='bx bx-trash text-lg'></i> 삭제
                    </button>
                    <div className="flex gap-3">
                        <button onClick={(e) => { e.stopPropagation(); onEdit(id); }} className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-1.5">
                            <i className='bx bx-edit-alt text-lg'></i> 데이터 수정
                        </button>
                        <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-indigo-600 hover:shadow-lg transition-all">
                            확인
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApplicantDetailModal;