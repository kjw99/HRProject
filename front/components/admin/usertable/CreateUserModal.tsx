import React, { useState } from "react";
import { CreateUserModalProps, CreateUserRequest } from "@/types/admin";
import {
  createUser,
  checkEmailAvailability,
} from "@/lib/admin/adminUsers.client";

export default function CreateUserModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateUserModalProps) {
  // 💡 모달 내부의 독립적인 상태 (부모 컴포넌트가 몰라도 됨)
  const [formData, setFormData] = useState<CreateUserRequest>({
    userEmail: "",
    password: "",
    userName: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 이메일 중복 체크 관련 상태
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isEmailChecked, setIsEmailChecked] = useState(false);
  const [emailMessage, setEmailMessage] = useState("");

  // 💡 모달이 닫혀있으면 렌더링하지 않음
  if (!isOpen) return null;

  // 이메일 입력값 변경 시 인증 초기화
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, userEmail: e.target.value });
    setIsEmailChecked(false);
    setEmailMessage("");
  };

  // 이메일 중복 확인 로직
  const handleEmailCheck = async () => {
    if (!formData.userEmail) {
      setEmailMessage("이메일을 먼저 입력해주세요.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.userEmail)) {
      setEmailMessage("올바른 이메일 형식이 아닙니다.");
      return;
    }

    setIsCheckingEmail(true);
    try {
      const res = await checkEmailAvailability(formData.userEmail);
      setIsEmailChecked(res.available);
      setEmailMessage(res.message);
    } catch (error) {
      setEmailMessage("중복 확인 중 오류가 발생했습니다.");
      setIsEmailChecked(false);
    } finally {
      setIsCheckingEmail(false);
    }
  };

  // 사용자 추가 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEmailChecked) {
      alert("이메일 중복 확인을 먼저 완료해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createUser(formData);
      alert(`${formData.userName}님이 성공적으로 추가되었습니다!`);

      // 성공 시 상태 초기화 및 부모에게 알림(onSuccess)
      handleClose();
      onSuccess(); // -> 이 함수가 호출되면 부모에서 router.refresh() 등을 실행함
    } catch (error) {
      alert("사용자 추가에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 모달을 닫을 때 내부 폼 상태도 싹 지워주는 깔끔한 마무리 함수
  const handleClose = () => {
    setFormData({ userEmail: "", password: "", userName: "" });
    setIsEmailChecked(false);
    setEmailMessage("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[24px] shadow-xl w-full max-w-md p-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black text-slate-800">새 사용자 추가</h3>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <i className="bx bx-x text-2xl"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">
              이름
            </label>
            <input
              required
              type="text"
              value={formData.userName}
              onChange={(e) =>
                setFormData({ ...formData, userName: e.target.value })
              }
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 outline-none"
              placeholder="홍길동"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">
              이메일 (ID)
            </label>
            <div className="flex gap-2">
              <input
                required
                type="email"
                value={formData.userEmail}
                onChange={handleEmailChange}
                className={`flex-1 border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all
                                    ${emailMessage
                    ? isEmailChecked
                      ? "border-emerald-500 focus:ring-emerald-200"
                      : "border-rose-500 focus:ring-rose-200"
                    : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-100"
                  }`}
                placeholder="hr1@company.com"
              />
              <button
                type="button"
                onClick={handleEmailCheck}
                disabled={
                  isCheckingEmail || !formData.userEmail || isEmailChecked
                }
                className="px-4 py-2.5 rounded-xl text-sm font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-50 transition-colors whitespace-nowrap"
              >
                {isCheckingEmail
                  ? "확인 중..."
                  : isEmailChecked
                    ? "확인 완료"
                    : "중복 확인"}
              </button>
            </div>
            {emailMessage && (
              <p
                className={`mt-2 text-xs font-bold flex items-center gap-1 ${isEmailChecked ? "text-emerald-600" : "text-rose-600"}`}
              >
                <i
                  className={`bx ${isEmailChecked ? "bx-check-circle" : "bx-error-circle"} text-base`}
                ></i>
                {emailMessage}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">
              임시 비밀번호
            </label>
            <input
              required
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 outline-none"
              placeholder="password123!"
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isEmailChecked}
              className="flex-1 px-4 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:bg-slate-400 transition-colors"
            >
              {isSubmitting ? "추가 중..." : "추가 완료"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
