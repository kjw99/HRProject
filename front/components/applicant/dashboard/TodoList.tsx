"use client";

import React from "react";
import { useRouter } from "next/navigation";

export interface Todo {
  id: string;
  title: string;
  desc: string;
  type: "urgent" | "normal";
  link: string;
}

export default function TodoList({ todos }: { todos: Todo[] }) {
  const router = useRouter();

  if (todos.length === 0) {
    return (
      <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[24px] p-10 text-center flex flex-col items-center justify-center h-[200px]">
        <i className="bx bx-party text-4xl text-slate-300 mb-3"></i>
        <p className="text-[15px] font-bold text-slate-500">
          현재 완료해야 할 할 일이 없습니다.
        </p>
        <p className="text-[13px] text-slate-400 mt-1">
          다음 안내를 기다려 주세요!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {todos.map((todo) => (
        <div
          key={todo.id}
          className={`relative overflow-hidden rounded-[24px] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-all duration-300 hover:-translate-y-1 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border ${
            todo.type === "urgent"
              ? "bg-gradient-to-br from-indigo-600 to-blue-700 border-transparent text-white"
              : "bg-white border-slate-200/80 hover:border-indigo-300 hover:shadow-lg"
          }`}
        >
          {/* Urgent 타입일 때 빛나는 배경 장식 */}
          {todo.type === "urgent" && (
            <div className="absolute top-0 right-0 w-48 h-48 bg-white opacity-5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
          )}

          <div className="flex gap-4 sm:gap-5 relative z-10">
            <div
              className={`mt-1 w-12 h-12 rounded-[16px] flex items-center justify-center text-2xl shrink-0 ${
                todo.type === "urgent"
                  ? "bg-white/20 text-white backdrop-blur-sm"
                  : "bg-indigo-50 text-indigo-500"
              }`}
            >
              <i
                className={`bx ${todo.type === "urgent" ? "bx-play-circle" : "bx-file-blank"}`}
              ></i>
            </div>

            <div>
              {todo.type === "urgent" && (
                <span className="inline-block px-2.5 py-1 bg-rose-500 text-white text-[10px] font-black uppercase tracking-wider rounded-[6px] mb-2 shadow-sm animate-pulse">
                  진행 필요
                </span>
              )}
              <h3
                className={`text-[16px] sm:text-[18px] font-black mb-1 ${todo.type === "urgent" ? "text-white" : "text-slate-900"}`}
              >
                {todo.title}
              </h3>
              <p
                className={`text-[13px] font-medium flex items-center gap-1.5 ${todo.type === "urgent" ? "text-indigo-100" : "text-slate-500"}`}
              >
                <i className="bx bx-time-five"></i> {todo.desc}
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push(todo.link)}
            className={`w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-[14px] whitespace-nowrap transition-transform active:scale-95 relative z-10 ${
              todo.type === "urgent"
                ? "bg-white text-indigo-600 shadow-lg hover:shadow-xl hover:bg-slate-50"
                : "bg-slate-900 text-white shadow-md hover:bg-slate-800"
            }`}
          >
            {todo.type === "urgent" ? "바로 시작하기" : "상세 보기"}
          </button>
        </div>
      ))}
    </div>
  );
}
