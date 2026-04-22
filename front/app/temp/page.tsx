// app/temp/page.tsx
import { notFound } from 'next/navigation';

export default function TempPage() {
    // 개발 환경이 아니면 404 페이지를 보여줌
    if (process.env.NODE_ENV !== 'development') {
        notFound();
    }

    return (
        <div className='h-screen bg-gray-500'>
            <h1>테스트용 페이지</h1>
            <p>이 페이지는 개발 모드에서만 보입니다.</p>
        </div>
    );
}