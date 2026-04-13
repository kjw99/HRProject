const DeleteConfirmModal = ({ isOpen, onClose, onConfirm }: any) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-110 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[28px] w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col p-6 text-center">
                <div className="w-14 h-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4 border border-red-100 shadow-sm">
                    <i className='bx bx-trash text-3xl'></i>
                </div>
                <h3 className="text-[20px] font-black text-slate-800 mb-2">지원자 삭제</h3>
                <p className="text-slate-500 text-[14px] font-medium mb-8 leading-relaxed">
                    정말로 이 지원자를 파이프라인에서 삭제하시겠습니까?<br />이 작업은 되돌릴 수 없습니다.
                </p>
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3.5 rounded-[14px] font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors">취소</button>
                    <button onClick={onConfirm} className="flex-1 py-3.5 rounded-[14px] font-bold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-sm">삭제하기</button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmModal;