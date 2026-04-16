export default function TypingIndicator() {
  return (
    <div className="flex gap-3 max-w-[85%] animate-in fade-in slide-in-from-bottom-2">
      <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30 mt-1">
        <i className="bx bx-bot text-lg"></i>
      </div>
      <div className="bg-slate-800 p-4 rounded-[24px] rounded-tl-[8px] flex items-center gap-1.5 h-[52px]">
        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
        <div
          className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
          style={{ animationDelay: "0.15s" }}
        ></div>
        <div
          className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
          style={{ animationDelay: "0.3s" }}
        ></div>
      </div>
    </div>
  );
}
