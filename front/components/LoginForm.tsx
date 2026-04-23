"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from "next/navigation";
import axios from 'axios';

interface LoginRequest {
    email: string;
    password: string; // 변수명이 pw라도 타입 내부 키 이름은 서버와 맞춰야 합니다.
}

export interface SignUpRequest {
    email: string;
    password: string;
    name: string;
    phoneNumber?: string; // 선택 사항일 경우 ? 붙임
}

export interface SignUpResponse {
    success: boolean;
    message: string;
    userId: number;
}

interface LoginResponse {
    token: string;
    user: {
        id: number;
        name: string;
    };
}

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
    const [name, setName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPw, setConfirmPw] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [disabled, setDisabled] = useState<boolean>(false);
    const router = useRouter();

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
            const url = 'https://api.example.com/login';
            // 2. 전송할 데이터 객체
            const data = {
                email,
                password
            };
            // 3. POST 요청 보내기
            const response = await axios.post(url, data);

            // 로그인 성공 시 처리 (예: 토큰 저장, 페이지 이동 등)
            console.log('로그인 성공:', response.data);

            // 보통 서버에서 JWT 토큰을 보내주므로 이를 저장합니다.
            const token = response.data.token;
            localStorage.setItem('userToken', token);

            // return response.data;

        } catch {
            if (email.at(0) === "h" || email.at(0) === "H") {
                alert("인사 담당자 계정으로 로그인합니다.");
                router.push("/hr/agent");
            } else if (email.at(0) === "a" || email.at(0) === "A") {
                alert("관리자 계정으로 로그인합니다.");
                router.push("/admin");
            } else if (email.at(0) === "u" || email.at(0) === "U") {
                alert("지원자 계정으로 로그인합니다.");
                router.push("/applicant/dashboard");
            } else {
                alert("로그인 실패! ID/비밀번호를 확인해주세요.");
            }

        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1500));

            const sendData: SignUpRequest = {
                email,
                password,
                name
            };

            const response = await axios.post<SignUpResponse>(
                'https://api.example.com/signup',
                sendData
            );
        } catch {
            alert("이메일 또는 비밀번호 형식이 올바르지 않습니다.");
        } finally {
            setLoading(false);
        }
    };

    if (!isLoaded) return null;

    return (
        <div className="relative min-h-screen w-full bg-white overflow-hidden font-['Poppins']">

            {/* --- BACKGROUND LAYER --- */}
            <motion.div
                className="absolute top-0 h-screen w-[300vw] z-6 shadow-2xl bg-linear-to-br from-[#1b3285] to-[#1b3285] hidden md:block"
                initial={false}
                animate={isSignIn ? "signIn" : "signUp"}
                variants={bgVariants}
                transition={{ duration: 1, ease: [0.645, 0.045, 0.355, 1.0] }}
            />

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
                                <button className="w-full py-3 bg-[#160bb0] text-white 
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
                                <h3 className="text-2xl font-bold text-[#000000] mb-6">Sign In</h3>
                                <InputGroup icon="👤" placeholder="Email" type="text" value={email} onChange={setEmail} disabled={disabled} />
                                <InputGroup icon="🔒" placeholder="Password" type="password" value={password} onChange={setPassword} disabled={disabled} />
                                <button className="w-full py-3 bg-[#160bb0] text-white rounded-lg font-semibold text-lg hover:bg-[#7584ad] transition-colors"
                                    type="submit"
                                    disabled={loading}>
                                    Sign in
                                </button>
                                <p className="text-xs text-center font-bold cursor-pointer">Forgot password?</p>
                                <p className="text-xs text-center">
                                    Don't have an account?{" "}
                                    <span onClick={toggle} className="font-bold cursor-pointer hover:underline text-[#000000]">Sign up here</span>
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