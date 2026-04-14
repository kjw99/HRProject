// 기존 DeleteConfirmModal을 이걸로 교체하세요.
const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onDelete,
  isDeleting,
}: {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] w-full max-w-sm p-8 shadow-2xl text-center animate-in zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-rose-100">
          {/* 로딩 중일 때는 스피너 아이콘으로 변경 */}
          {isDeleting ? (
            <i className="bx bx-loader-alt text-4xl text-rose-500 animate-spin"></i>
          ) : (
            <i className="bx bx-user-x text-4xl text-rose-500"></i>
          )}
        </div>
        <h3 className="text-[22px] font-black text-slate-900 mb-3">
          계정 삭제 경고
        </h3>
        <p className="text-[14px] font-medium text-slate-500 mb-8 leading-relaxed">
          정말로 이 사용자를 시스템에서 삭제하시겠습니까?
          <br />
          할당된 데이터는 접근할 수 없게 됩니다.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-colors disabled:opacity-50"
          >
            취소
          </button>
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-black shadow-md hover:bg-rose-600 transition-colors disabled:bg-rose-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isDeleting ? "삭제 중..." : "삭제 확인"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;