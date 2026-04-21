"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import "boxicons/css/boxicons.min.css";
import Link from "next/link";

const inputWrapClass = "relative group w-full transition-all duration-300";
const inputClass = "w-full h-12 bg-white/5 border border-white/20 rounded-xl px-5 pr-12 text-white placeholder:text-white/40 outline-none focus:border-indigo-400 focus:bg-white/10 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-300 backdrop-blur-sm";
const iconClass = "bx absolute right-4 top-1/2 -translate-y-1/2 text-xl text-white/50 group-focus-within:text-indigo-400 transition-colors duration-300";
export default function Login() {
  const [id, setId] = useState<string>("");
  const [pw, setPw] = useState<string>("");
  const [pw2, setPw2] = useState<string>("");
  const [name, setName] = useState("");
  const [same, setSame] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [signUp, setSignUp] = useState<boolean>(false);
  const router = useRouter();
  const confirm = pw.length > 0 && pw2.length > 0 && name.length > 0 && id.length > 0;
  useEffect(() => {
    if (pw === pw2) setSame(true);
    else setSame(false);
  }, [pw, pw2]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (id.at(0) === "h" || id.at(0) === "H") {
        alert("인사 담당자 계정으로 로그인합니다.");
        router.push("/hr/agent");
      } else if (id.at(0) === "a" || id.at(0) === "A") {
        alert("관리자 계정으로 로그인합니다.");
        router.push("/admin");
      } else if (id.at(0) === "u" || id.at(0) === "U") {
        alert("지원자 계정으로 로그인합니다.");
        router.push("/applicant/dashboard");
      } else {
        alert("로그인 실패! ID/비밀번호를 확인해주세요.");
      }
    } catch {
      alert("로그인 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const changeSit = () => {
    setSignUp(!signUp);
    setId("");
    setPw("");
    setPw2("");
  };

  return (
    <div className="relative isolate flex min-h-dvh w-full items-center justify-center overflow-x-hidden px-4 py-10 sm:px-6 sm:py-12">
      {/* 배경: `public/login-hero.jpg` + 그라데이션(이미지 로드 전·대체). 모바일은 조금 더 어두운 스크림 */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden
      >
        <div className="absolute inset-0 bg-linear-to-br from-slate-950 via-indigo-950 to-violet-950 sm:from-slate-900 sm:via-slate-800 sm:to-indigo-950" />
        <div className="absolute inset-0">
          <Image
            src="/login-hero.jpg"
            alt=""
            fill
            priority
            className="object-cover object-[center_18%] sm:object-[center_30%] lg:object-center"
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(129,140,248,0.35),transparent_55%)] opacity-90 sm:opacity-100" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_100%,rgba(15,23,42,0.55),transparent_45%)] sm:bg-[radial-gradient(circle_at_80%_100%,rgba(15,23,42,0.35),transparent_50%)]" />
        <div className="absolute inset-0 bg-slate-950/45 sm:bg-slate-950/30" />
      </div>

      <div className="relative z-10 w-full max-w-[min(100%,420px)] rounded-[10px] border-2 border-white/20 bg-white/10 px-6 py-7 shadow-[0_0_10px_rgba(255,255,255,0.15)] backdrop-blur-md sm:px-10 sm:py-8">
        {signUp ? (
          <form
            className="w-full"
            onSubmit={(e) => {
              e.preventDefault(); // 페이지 새로고침 방지
              if (!same) {
                alert("비밀번호가 일치하지 않습니다.");
                return;
              }
              // 여기에 회원가입 API 호출 로직 (axios 등)을 넣으시면 됩니다.
              console.log({ user_email: id, user_name: name, password: pw });
              alert("회원가입 요청이 전송되었습니다.");
            }}
          >
            <h1 className="mb-6 text-center text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
              SignUp
            </h1>

            {/* 1. 이메일 입력 (user_email) */}
            <div className={`${inputWrapClass} mb-6 sm:mb-7`}>
              <input
                type="email"
                placeholder="Email"
                required
                value={id}
                onChange={(e) => setId(e.target.value)}
                disabled={loading}
                className={inputClass}
              />
              <i className="bx bxs-envelope pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xl text-zinc-700 sm:right-5 sm:text-[1.25rem]" />
            </div>

            {/* 2. 이름 입력 (user_name) - DB 필수값 반영 */}
            <div className={`${inputWrapClass} mb-6 sm:mb-7`}>
              <input
                type="text"
                placeholder="Full Name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                className={inputClass}
              />
              <i className="bx bxs-user pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xl text-zinc-700 sm:right-5 sm:text-[1.25rem]" />
            </div>

            {/* 3. 비밀번호 입력 (pw_hash로 변환될 값) */}
            <div className={`${inputWrapClass} mb-6 sm:mb-7`}>
              <input
                type="password"
                placeholder="Password"
                required
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                disabled={loading}
                className={inputClass}
              />
              <i className="bx bxs-lock-alt pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xl text-zinc-700 sm:right-5 sm:text-[1.25rem]" />
            </div>

            {/* 4. 비밀번호 확인 */}
            <div className={`${inputWrapClass} mb-2 sm:mb-3`}>
              <input
                type="password"
                placeholder="Verify Password"
                required
                value={pw2}
                onChange={(e) => setPw2(e.target.value)}
                disabled={loading}
                className={inputClass}
              />
              <i className="bx bxs-check-shield pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xl text-zinc-700 sm:right-5 sm:text-[1.25rem]" />
            </div>

            {/* 비밀번호 일치 메시지 최적화 */}
            <div className="mb-4 h-5 text-center text-xs font-medium">
              {pw && pw2 ? (
                same ? (
                  <p className="text-emerald-600">비밀번호가 일치합니다.</p>
                ) : (
                  <p className="text-rose-500">비밀번호가 일치하지 않습니다.</p>
                )
              ) : null}
            </div>

            <button
              className="h-11 w-full cursor-pointer rounded-full border-none bg-zinc-950 text-[15px] font-semibold text-white shadow-md transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 sm:h-[45px]"
              type="submit"
              disabled={loading || !same || !confirm} // 비밀번호가 다르면 버튼 비활성화
            >
              {loading ? "등록 중..." : "Register Now"}
            </button>

            <div className="mt-5 text-center text-[14.5px] text-zinc-800">
              <p>
                Already have an account?{" "}
                <button
                  className="font-bold text-zinc-950 no-underline hover:underline"
                  type="button"
                  onClick={() => changeSit()}
                  disabled={loading}
                >
                  Login
                </button>
              </p>
            </div>
          </form>
        ) : (
          <form className="w-full" onSubmit={handleLogin}>
            <h1 className="mb-6 text-center text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
              LogIn
            </h1>
            <div className={`${inputWrapClass} mb-6 sm:mb-7`}>
              <input
                type="text"
                placeholder="Username"
                value={id}
                onChange={(e) => setId(e.target.value)}
                disabled={loading}
                className={inputClass}
              />
              <i className="bx bxs-user pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xl text-zinc-700 sm:right-5 sm:text-[1.25rem]" />
            </div>
            <div className={`${inputWrapClass} mb-4 sm:mb-5`}>
              <input
                type="password"
                placeholder="Password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                disabled={loading}
                className={inputClass}
              />
              <i className="bx bxs-lock-alt pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xl text-zinc-700 sm:right-5 sm:text-[1.25rem]" />
            </div>
            <div className="-mt-2 mb-4 flex flex-col gap-3 text-[14.5px] text-zinc-900 sm:mb-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
              <label className="flex cursor-pointer items-center gap-1.5">
                <input
                  type="checkbox"
                  className="size-4 accent-white sm:mr-0.5"
                />
                Remember me
              </label>
              <Link
                href="#"
                className="text-zinc-900 no-underline hover:underline sm:text-right"
              >
                Forget Password?
              </Link>
            </div>
            <button
              className="h-11 w-full cursor-pointer rounded-full border-none bg-white text-[15px] font-semibold text-zinc-800 shadow-[0_0_10px_rgba(0,0,0,0.1)] transition hover:bg-zinc-800/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-60 sm:h-[45px]"
              type="submit"
              disabled={loading}
            >
              {loading ? "로그인 중..." : "Login"}
            </button>
            <div className="mt-5 text-center text-[14.5px] text-zinc-900">
              <p>
                Don&apos;t have an account?{" "}
                <button
                  className="font-semibold text-zinc-950 no-underline hover:underline"
                  type="button"
                  onClick={() => changeSit()}
                  disabled={loading}
                >
                  Register
                </button>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
