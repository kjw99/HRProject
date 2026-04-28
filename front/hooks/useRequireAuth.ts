import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/getAuth"; // 경로에 맞게 수정해주세요

export const useRequireAuth = () => {
    const router = useRouter();
    const token = useAuthStore((state) => state.token);

    useEffect(() => {
        // 토큰이 없으면 로그인 페이지로 강제 이동
        if (!token) {
            router.push("/login");
        }
    }, [token, router]);

    // 컴포넌트에게 현재 인증 상태를 전달 (토큰이 있으면 true, 없으면 false)
    return {
        isAuthorized: !!token
    };
};