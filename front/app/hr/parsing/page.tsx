import ResumeParsingClient from '@/components/hr/parsing/ResumeParsingClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: '이력서 AI 파싱 | HR Portal',
    description: '여러 개의 이력서를 한 번에 분석하고 인재 풀에 등록합니다.',
};

export default function ParsingPage() {
    return (
        <div className="w-full py-8 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                        <i className="bx bx-file-find text-indigo-500 text-3xl"></i>
                        이력서 AI 파싱
                    </h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">
                        파일을 업로드하면 AI가 인적사항과 경력을 자동으로 추출합니다.
                    </p>
                </header>

                <ResumeParsingClient />
            </div>
        </div>
    );
}