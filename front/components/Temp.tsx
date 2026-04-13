"use client";
import React, { useEffect } from 'react';
import { useRouter } from "next/navigation";

export default function Temp() {
    const router = useRouter();

    useEffect(() => {
        // 1. 타이머 생성
        const timer = setTimeout(() => {
            router.push("/login");
        }, 900);

        // 2. 클린업 함수: 컴포넌트가 언마운트될 때 타이머를 제거합니다.
        return () => clearTimeout(timer);
    }, [router]); // 의존성 배열에 router 추가

    return (
        <div>
            {/* 사용자에게 리다이렉트 중임을 알리는 UI를 넣는 것이 좋습니다. */}
            <p>로그인 페이지로 이동 중입니다...</p>
        </div>
    );
}