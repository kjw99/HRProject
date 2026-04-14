"use client"
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from '@/store/getAuth'; // Zustand 스토어
// import { getAuth, signup } from "@/lib/getInfo";
import "../css/login.css";
import 'boxicons/css/boxicons.min.css';
import Link from "next/link";

const checkIDPW = (id: string, pw: string) => id.length >= 5 && pw.length >= 6 ? true : false;

export default function Login() {
    const [id, setId] = useState<string>("");
    const [pw, setPw] = useState<string>("");
    const [pw2, setPw2] = useState<string>("");
    const [same, setSame] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [signUp, setSignUp] = useState<boolean>(false);
    const router = useRouter();
    // const { setAuth, confirmAuth } = useAuthStore();
    useEffect(() => {
        if (pw === pw2) setSame(true)
        else setSame(false);
    }, [pw, pw2]);
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault(); // 폼 기본 동작 막기
        setLoading(true);
        router.push("/admin");
        // router.push("/hr/agent");
        if (id.at(0) === "h" || pw.at(0) === "H") {
            alert("인사 담당자 계정으로 로그인합니다.");
            // setAuth(id, true);
        } else if (id.at(0) === "a" || pw.at(0) === "A") {
            alert("관리자 계정으로 로그인합니다.");
            // setAuth(id, true);
            router.push("/admin");
        }
        // try {
        //     const loginData = await getAuth(id, pw);
        //     if (loginData.status === "success") {
        //         setAuth(id, true); // Zustand 상태 업데이트
        //         router.push("/main"); // 로그인 성공 후 리다이렉트
        //     } else {
        //         alert("로그인 실패! ID/비밀번호를 확인해주세요.");
        //     }
        // } catch (error) {
        //     alert("로그인 중 오류가 발생했습니다.");
        // } finally {
        //     setLoading(false);
        // }
    };
    // const handleRegister = async (e: React.FormEvent) => {
    //     e.preventDefault(); // 폼 기본 동작 막기
    //     if (same === false) {
    //         alert("비밀번호 확인해주세요");
    //         return;
    //     }
    //     setLoading(true);

    //     try {
    //         const signUpdata = await signup(id, pw);
    //         if (signUpdata.status === "success") {
    //             changeSit(); // 로그인 성공 후 리다이렉트
    //         } else {
    //             alert("회원가입 중 오류 발생");
    //         }
    //     } catch (error) {
    //         alert("회원가입 중 오류가 발생했습니다.");
    //     } finally {
    //         setLoading(false);
    //     }
    // }
    const changeSit = () => {
        setSignUp(!signUp);
        setId("");
        setPw("");
        setPw2("");
    };
    return (
        <div className="publishing">
            <div className="wraaper">
                {signUp ?
                    <form className="form" onSubmit={() => { alert("SignUp functionality not implemented"); }} >
                        <h1>SignUp</h1>
                        <div className="input-box">
                            <input
                                type="text"
                                placeholder="Email"
                                value={id}
                                onChange={(e) => setId(e.target.value)}
                                disabled={loading}
                            />
                            <i className="bx bxs-user"></i>
                        </div>
                        <div className="input-box">
                            <input
                                type="password"
                                placeholder="Password"
                                value={pw}
                                onChange={(e) => setPw(e.target.value)}
                                disabled={loading}
                            />
                            <i className="bx bxs-lock-alt"></i>
                        </div>
                        <div className="input-box">
                            <input
                                type="password"
                                placeholder="Verify Password"
                                value={pw2}
                                onChange={(e) => setPw2(e.target.value)}
                                disabled={loading}
                            />
                            <i className="bx bxs-lock-alt"></i>
                        </div>
                        <div className="flex justify-center items-center text-s -mt-3 mb-2">
                            {same && pw && pw2 ?
                                pw && pw2 && <p>same</p>
                                :
                                pw && pw2 && <p>not same</p>}
                        </div>
                        <button className="btn" type="submit" disabled={loading} >
                            {loading ? "등록 중..." : "Register"}
                        </button>
                        <div className="register-link">
                            <p>Don you have an account? <button
                                className="no-underline text-zinc-950 font-semibold hover:underline"
                                type="button"
                                onClick={() => changeSit()}
                                disabled={loading}
                            >
                                Login
                            </button></p>
                        </div>
                    </form>
                    :
                    <form className="form" onSubmit={handleLogin} >
                        <h1>LogIn</h1>
                        <div className="input-box">
                            <input
                                type="text"
                                placeholder="Username"
                                value={id}
                                onChange={(e) => setId(e.target.value)}
                                disabled={loading}
                            />
                            <i className="bx bxs-user"></i>
                        </div>
                        <div className="input-box">
                            <input
                                type="password"
                                placeholder="Password"
                                value={pw}
                                onChange={(e) => setPw(e.target.value)}
                                disabled={loading}
                            />
                            <i className="bx bxs-lock-alt"></i>
                        </div>
                        <div className="remember-forget">
                            <label>
                                <input type="checkbox" />
                                Remember me
                            </label>
                            <Link href="#">Forget Password?</Link>
                        </div>
                        <button className="btn" type="submit" disabled={loading}>
                            {loading ? "로그인 중..." : "Login"}
                        </button>
                        <div className="register-link">
                            <p>Don't have an account? <button
                                className="no-underline text-zinc-950 font-semibold hover:underline"
                                type="button"
                                onClick={() => changeSit()}
                                disabled={loading}
                            >
                                Register
                            </button></p>
                        </div>
                    </form>}

            </div>
        </div>
    );
}