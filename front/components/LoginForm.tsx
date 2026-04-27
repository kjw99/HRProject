"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from "next/navigation";
import useAuthStore from '@/store/getAuth';
import { loginApi, signUpApi } from '@/lib/auth';
import { LoginResponse, SignUpRequest } from '@/types/auth';

// 배경 곡선 애니메이션 설정
const bgVariants = {
    signIn: {
        x: "0%",
        right: "50%",
        borderBottomRightRadius: "50vw",
        borderTopLeftRadius: "50vw",
    },
    signUp: {
        x: "100%",
        right: "50%",
        borderBottomRightRadius: "0vw",
        borderTopLeftRadius: "100vw", // 반대 방향 곡선 효과
    }
};

const LoginForm = () => {
    const [isSignIn, setIsSignIn] = useState<boolean>(true);
    const [isLoaded, setIsLoaded] = useState<boolean>(false);
    const [name, setName] = useState<string>(""); // 회원가입 시 이름 입력 받는 필드 추가
    const [email, setEmail] = useState<string>(""); // 로그인과 회원가입 모두에서 이메일 입력 받는 필드
    const [password, setPassword] = useState<string>(""); // 로그인과 회원가입 모두에서 비밀번호 입력 받는 필드
    const [confirmPw, setConfirmPw] = useState<string>(""); // 회원가입 시 비밀번호 확인 입력 받는 필드 추가
    const [loading, setLoading] = useState<boolean>(false); // 로그인/회원가입 요청이 진행 중인지 여부를 나타내는 상태
    const [disabled, setDisabled] = useState<boolean>(false); // 입력 필드와 버튼을 비활성화할지 여부를 나타내는 상태 (예: 요청이 진행 중일 때)
    const router = useRouter();
    const setAuth = useAuthStore((state) => state.setAuth);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    const toggle = () => {
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPw("");
        setIsSignIn(!isSignIn);
    }

    // const handleLogin = async (e: React.FormEvent): Promise<LoginResponse | undefined> => {
    const handleLogin = async (e: React.FormEvent) => {

        e.preventDefault();
        setLoading(true);
        try {
            const data: LoginResponse = await loginApi({ user_email: email, password: password });

            // Zustand 스토어 업데이트
            setAuth(data.user_name, data.access_token);
            handleLoginError(data.token_type);
        } catch (error: Error | any) {
            // 에러 시 기존에 작성하신 테스트용 조건 로직 실행
            handleLoginError(email);
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. 비밀번호 일치 여부 선제 검사
            if (password !== confirmPw) {
                // 에러를 던져서 catch 블록으로 보냄
                throw new Error("PASSWORD_MISMATCH");
            }
            const signUpData: SignUpRequest = await signUpApi({
                user_email: email,
                password: password,
                user_name: name,
                role: "hr" // 기본값 설정
            });
            alert("회원가입 성공! 로그인해주세요.");
        } catch (error) {
            alert("회원가입 실패: 형식을 확인해주세요.");
        } finally {
            setLoading(false);
        }
    };

    const handleLoginError = (email: string) => {
        const firstChar = email.toLowerCase().charAt(0);
        if (firstChar === 'h') router.push("/hr/agent");
        else if (firstChar === 'a') router.push("/admin");
        else alert("로그인 정보가 올바르지 않습니다.");
    };

    if (!isLoaded) return null;

    return (
        <div className="relative min-h-screen w-full bg-white overflow-hidden font-['Pretendard']">

            {/* --- BACKGROUND LAYER --- */}
            <motion.div
                className="absolute top-0 h-screen w-[300vw] z-6 shadow-2xl bg-linear-to-br from-[#70a7f0] to-[#1b3285] hidden md:block"
                initial={false}
                animate={isSignIn ? "signIn" : "signUp"}
                variants={bgVariants}
                transition={{ duration: 1, ease: [0.645, 0.045, 0.355, 1.0] }}
                style={{ opacity: 0.7 }}
            />
            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute top-0 left-0 w-full h-full object-cover"
            >
                <source src={`./iljin_main_02.mp4`} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
            {/* --- CONTENT SECTION (TEXT & IMG) --- */}
            <div className="absolute inset-0 z-10 pointer-events-none flex w-full h-full">
                {/* Sign In Content */}
                <motion.div
                    className="flex-1 flex flex-col items-center justify-center text-white"
                    animate={{ x: isSignIn ? 0 : "-150%", opacity: isSignIn ? 1 : 0 }}
                    transition={{ duration: 1 }}
                >
                    <div className="p-16 text-center">
                        <h2 className="text-6xl font-extrabold mb-4">Welcome</h2>
                        <div className="w-64 h-64 bg-[#1b3285]/20 rounded-full blur-2xl absolute -z-10" />
                    </div>
                </motion.div>

                {/* Sign Up Content */}
                <motion.div
                    className="flex-1 flex flex-col items-center justify-center text-white"
                    animate={{ x: isSignIn ? "150%" : 0, opacity: isSignIn ? 0 : 1 }}
                    transition={{ duration: 1 }}
                >
                    <div className="p-16 text-center">
                        <h2 className="text-6xl font-extrabold mb-4">Join with us</h2>
                        <div className="w-64 h-64 bg-[#1b3285]/20 rounded-full blur-2xl absolute -z-10" />
                    </div>
                </motion.div>
            </div>

            {/* --- FORM SECTION --- */}
            <div className="flex h-screen w-full relative z-5">
                {/* SIGN UP FORM (Left Side) */}
                <div className="flex-1 flex items-center justify-center p-4">
                    <AnimatePresence>
                        {!isSignIn && (
                            <motion.form
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ delay: 0.5, duration: 0.5 }}
                                className="w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl space-y-4"
                                onSubmit={handleSignUp}
                            >
                                <h3 className="text-2xl font-bold text-[#000000] mb-6">Sign Up</h3>
                                <InputGroup icon="👤" placeholder="Username" type="text" value={name} onChange={setName} disabled={disabled} />
                                <InputGroup icon="✉️" placeholder="Email" type="email" value={email} onChange={setEmail} disabled={disabled} />
                                <InputGroup icon="🔒" placeholder="Password" type="password" value={password} onChange={setPassword} disabled={disabled} />
                                <InputGroup icon="🔒" placeholder="Confirm password" type="password" value={confirmPw} onChange={setConfirmPw} disabled={disabled} />
                                <button className="w-full py-3 bg-[#70a7f0] text-white 
                                    rounded-lg font-semibold text-lg hover:bg-[#7584ad] transition-colors"
                                    type="submit"
                                    disabled={loading}>
                                    {loading ? "등록 중..." : "회원가입"}
                                </button>
                                <p className="text-xs text-center">
                                    Already have an account?{" "}
                                    <span onClick={toggle} className="font-bold cursor-pointer hover:underline text-[#000000]">Sign in here</span>
                                </p>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>

                {/* SIGN IN FORM (Right Side) */}
                <div className="flex-1 flex items-center justify-center p-4">
                    <AnimatePresence>
                        {isSignIn && (
                            <motion.form
                                onSubmit={handleLogin}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ delay: 0.5, duration: 0.5 }}
                                className="w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl space-y-4"
                            >
                                <h3 className="text-2xl font-bold text-[#000000] mb-6">로그인</h3>
                                <InputGroup icon="👤" placeholder="E-mail" type="text" value={email} onChange={setEmail} disabled={disabled} />
                                <InputGroup icon="🔒" placeholder="Password" type="password" value={password} onChange={setPassword} disabled={disabled} />
                                <button className="w-full py-3 bg-[#1e69ca] text-white rounded-lg font-semibold text-lg hover:bg-[#7584ad] transition-colors"
                                    type="submit"
                                    disabled={loading}>
                                    로그인
                                </button>
                                <p className="text-xs text-center font-bold cursor-pointer">비밀번호 찾기</p>
                                <p className="text-xs text-center">
                                    아이디 생성 {" "}
                                    <span onClick={toggle} className="font-bold cursor-pointer hover:underline text-[#000000]">회원가입 하러가기</span>
                                </p>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

interface InputGroupProps {
    icon: React.ReactNode;
    placeholder: string;
    type: string;
    value?: string;
    onChange: (value: string) => void;
    disabled: boolean;
}


// 재사용 가능한 인풋 컴포넌트
const InputGroup = ({ icon, placeholder, type, value, onChange, disabled }: InputGroupProps) => (
    <div className="relative group">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#4EA685]">
            {icon}
        </span>
        <input
            type={type}
            placeholder={placeholder}
            required
            value={value}
            onChange={e => onChange(e.target.value)}
            disabled={disabled}
            className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-lg outline-none border-2 border-transparent focus:border-[#446ea6] focus:bg-white transition-all text-sm"
        />
    </div>
);

export default LoginForm;