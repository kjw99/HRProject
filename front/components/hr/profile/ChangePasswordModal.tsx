'use client';

import { changeMyPassword } from '@/lib/common/auth';
import React, { useState } from 'react';

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    if (!isOpen) return null;



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');

        if (newPassword !== confirmPassword) {
            setErrorMsg('새 비밀번호가 일치하지 않습니다.');
            return;
        }

        setIsLoading(true);
        try {
            const res = await changeMyPassword({ currentPassword, newPassword });
            setSuccessMsg(res.message || '비밀번호가 성공적으로 변경되었습니다.');

            // 성공 시 폼 초기화 및 1.5초 후 모달 닫기
            setTimeout(() => {
                onClose();
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setSuccessMsg('');
            }, 1500);

        } catch (error: any) {
            setErrorMsg(error.message || '비밀번호 변경에 실패했습니다. 기존 비밀번호를 확인해주세요.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                {/* 모달 헤더 */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h3 className="font-black text-lg text-slate-800 flex items-center gap-2">
                        <i className="bx bx-lock-alt text-indigo-500"></i> 비밀번호 변경
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100">
                        <i className="bx bx-x text-2xl"></i>
                    </button>
                </div>

                {/* 모달 폼 */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1.5">현재 비밀번호</label>
                            <input
                                type="password"
                                required
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                placeholder="기존 비밀번호 입력"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1.5">새 비밀번호</label>
                            <input
                                type="password"
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                placeholder="새 비밀번호 입력"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1.5">새 비밀번호 확인</label>
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                placeholder="새 비밀번호 다시 입력"
                            />
                        </div>
                    </div>

                    {/* 피드백 메시지 영역 */}
                    {errorMsg && <p className="mt-4 text-sm font-bold text-rose-500 flex items-center gap-1"><i className="bx bx-error-circle"></i> {errorMsg}</p>}
                    {successMsg && <p className="mt-4 text-sm font-bold text-emerald-500 flex items-center gap-1"><i className="bx bx-check-circle"></i> {successMsg}</p>}

                    {/* 액션 버튼 */}
                    <div className="mt-8 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-bold transition-colors"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
                            className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? <i className="bx bx-loader-alt bx-spin"></i> : '변경 완료'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}