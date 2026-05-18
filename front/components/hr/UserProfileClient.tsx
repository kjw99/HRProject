'use client';

import React, { useState } from 'react';
import { UserProfile } from '@/types/myInformation';
import ChangePasswordModal from './profile/ChangePasswordModal';

interface UserProfileClientProps {
    profile: UserProfile;
    formattedDate: string;
}

export default function UserProfileClient({ profile, formattedDate }: UserProfileClientProps) {
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    return (
        <>
            <div className="bg-white rounded-3xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">

                    {/* 좌측: 프로필 아바타 영역 */}
                    <div className="flex flex-col items-center gap-3 shrink-0">
                        <div className="w-28 h-28 rounded-full bg-indigo-50 flex items-center justify-center border-4 border-white shadow-md relative">
                            <i className="bx bx-user text-5xl text-indigo-400"></i>
                            <div className="absolute bottom-0 right-0 bg-indigo-600 text-white text-[10px] font-black uppercase px-2 py-1 rounded-full shadow-sm border-2 border-white">
                                {profile.role}
                            </div>
                        </div>
                    </div>

                    {/* 우측: 상세 정보 영역 */}
                    <div className="flex-1 w-full pt-2">
                        {/* 💡 헤더 영역에 비밀번호 변경 버튼 추가 */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                            <h2 className="text-2xl font-black text-slate-800 text-center sm:text-left">
                                {profile.userName}
                            </h2>
                            <button
                                onClick={() => setIsPasswordModalOpen(true)}
                                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl text-sm font-bold transition-all shadow-sm active:scale-95"
                            >
                                <i className="bx bx-lock-alt text-lg"></i> 비밀번호 변경
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                    <i className="bx bx-envelope text-base"></i> 이메일 주소
                                </p>
                                <p className="text-base font-bold text-slate-700 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
                                    {profile.userEmail}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                    <i className="bx bx-id-card text-base"></i> 사용자 ID (사번)
                                </p>
                                <p className="text-base font-bold text-slate-700 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100 font-mono">
                                    #{profile.userId}
                                </p>
                            </div>

                            <div className="md:col-span-2">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                    <i className="bx bx-calendar-check text-base"></i> 계정 생성일
                                </p>
                                <p className="text-base font-bold text-slate-700 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
                                    {formattedDate}
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* 💡 분리한 모달 컴포넌트 렌더링 */}
            <ChangePasswordModal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
            />
        </>
    );
}