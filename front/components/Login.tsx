"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import "boxicons/css/boxicons.min.css";
import Link from "next/link";

const inputClass =
  "h-full w-full rounded-full border-2 border-white/25 bg-white/40 py-5 pl-5 pr-12 text-base text-zinc-900 outline-none transition placeholder:text-zinc-600/80 focus:border-blue-500 focus:bg-white focus:shadow-[0_0_0_4px_rgba(59,130,246,0.12)] sm:pr-[3.25rem]";

const inputWrapClass = "relative h-[50px] w-full sm:h-[52px]";

export default function Login() {
  const [id, setId] = useState<string>("");
  const [pw, setPw] = useState<string>("");
  const [pw2, setPw2] = useState<string>("");
  const [same, setSame] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [signUp, setSignUp] = useState<boolean>(false);
  const router = useRouter();

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
            onSubmit={() => {
              alert("SignUp functionality not implemented");
            }}
          >
            <h1 className="mb-6 text-center text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
              SignUp
            </h1>
            <div className={`${inputWrapClass} mb-6 sm:mb-7`}>
              <input
                type="text"
                placeholder="Email"
                value={id}
                onChange={(e) => setId(e.target.value)}
                disabled={loading}
                className={inputClass}
              />
              <i className="bx bxs-user pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xl text-zinc-700 sm:right-5 sm:text-[1.25rem]" />
            </div>
            <div className={`${inputWrapClass} mb-6 sm:mb-7`}>
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
            <div className={`${inputWrapClass} mb-2 sm:mb-3`}>
              <input
                type="password"
                placeholder="Verify Password"
                value={pw2}
                onChange={(e) => setPw2(e.target.value)}
                disabled={loading}
                className={inputClass}
              />
              <i className="bx bxs-lock-alt pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xl text-zinc-700 sm:right-5 sm:text-[1.25rem]" />
            </div>
            <div className="-mt-1 mb-2 flex items-center justify-center text-sm">
              {same && pw && pw2 ? (
                <p>same</p>
              ) : pw && pw2 ? (
                <p>not same</p>
              ) : null}
            </div>
            <button
              className="h-11 w-full cursor-pointer rounded-full border-none bg-white text-[15px] font-semibold text-zinc-800 shadow-[0_0_10px_rgba(0,0,0,0.1)] transition hover:bg-zinc-800/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-60 sm:h-[45px]"
              type="submit"
              disabled={loading}
            >
              {loading ? "등록 중..." : "Register"}
            </button>
            <div className="mt-5 text-center text-[14.5px] text-zinc-900">
              <p>
                Don you have an account?{" "}
                <button
                  className="font-semibold text-zinc-950 no-underline hover:underline"
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
