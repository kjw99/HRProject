import { Message } from "@/types/hr";

export default function ChatMessage({ msg }: { msg: Message }) {
  if (msg.role === "system") {
    return (
      <div className="w-full text-center mt-2 mb-6">
        <span className="bg-slate-800 text-slate-400 text-[11px] font-medium px-4 py-1.5 rounded-full border border-slate-700/50">
          {msg.content}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
    >
      {msg.role === "agent" ? (
        <div className="flex gap-3 max-w-[85%]">
          <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30 mt-1">
            <i className="bx bx-bot text-lg"></i>
          </div>
          <div className="bg-slate-800 text-slate-200 p-4 rounded-[24px] rounded-tl-[8px] text-[14px] leading-relaxed shadow-sm">
            {msg.content}
          </div>
        </div>
      ) : (
        <div className="bg-indigo-500 text-white p-4 rounded-[24px] rounded-tr-[8px] text-[14px] leading-relaxed shadow-sm max-w-[85%]">
          {msg.content}
        </div>
      )}
    </div>
  );
}
