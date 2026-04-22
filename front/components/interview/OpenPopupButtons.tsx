"use client";

export default function OpenPopupButtons() {
    // 👨‍💼 면접관 팝업 열기
    const openInterviewerForm = () => {
        // 가로 420px, 세로 650px 크기로 팝업 띄우기
        window.open(
            "/temp/interviewer",
            "InterviewerPopup",
            "width=420,height=650,left=100,top=100,resizable=no,scrollbars=yes"
        );
    };

    // 🙋‍♂️ 지원자 팝업 열기
    const openIntervieweeForm = () => {
        window.open(
            "/temp/interviewee",
            "IntervieweePopup",
            "width=420,height=650,left=550,top=100,resizable=no,scrollbars=yes"
        );
    };

    return (
        <div className="flex gap-4 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
            <button
                onClick={openInterviewerForm}
                className="px-5 py-2.5 rounded-xl bg-indigo-50 text-indigo-600 font-bold hover:bg-indigo-100 transition active:scale-95 flex items-center gap-2"
            >
                <i className='bx bx-calendar-plus text-lg'></i>
                면접관 시간 설정 (새 창)
            </button>

            <button
                onClick={openIntervieweeForm}
                className="px-5 py-2.5 rounded-xl bg-emerald-50 text-emerald-600 font-bold hover:bg-emerald-100 transition active:scale-95 flex items-center gap-2"
            >
                <i className='bx bx-calendar-check text-lg'></i>
                지원자 시간 선택 (새 창)
            </button>
        </div>
    );
}