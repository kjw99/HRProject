import { getMyProfileServer } from '@/app/server/common/user.server';
import { UserProfile } from '@/types/myInformation';
import { Metadata } from 'next';
import UserProfileClient from '@/components/hr/UserProfileClient';

export const metadata: Metadata = {
    title: '내 정보 | HR Portal',
    description: '내 계정 정보를 확인하고 관리합니다.',
};

export default async function ProfilePage() {
    let profile: UserProfile | null = null;
    let errorMessage: string | null = null;

    try {
        profile = await getMyProfileServer();
    } catch (error: Error | any) {
        errorMessage = error.message || "데이터를 불러올 수 없습니다.";
    }

    if (errorMessage || !profile) {
        return (
            <div className="w-full max-w-3xl mx-auto py-8">
                <div className="bg-rose-50 border border-rose-200 rounded-3xl p-8 text-center text-rose-600 font-bold flex flex-col items-center">
                    <i className="bx bx-error-circle text-4xl mb-2"></i>
                    <p>{errorMessage}</p>
                </div>
            </div>
        );
    }

    const formattedDate = new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(new Date(profile.createdAt));

    return (
        <div className="w-full max-w-3xl mx-auto py-8 animate-in fade-in duration-500">
            <div className="mb-8">
                <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                    <i className="bx bx-user-circle text-indigo-500 text-3xl"></i>
                    내 프로필
                </h1>
                <p className="text-sm font-medium text-slate-500 mt-1 ml-10">
                    시스템에 등록된 계정 정보를 확인하고 보안을 관리합니다.
                </p>
            </div>

            {/* 💡 서버에서 완성된 데이터를 클라이언트 래퍼로 전달 (Props) */}
            <UserProfileClient profile={profile} formattedDate={formattedDate} />
        </div>
    );
}