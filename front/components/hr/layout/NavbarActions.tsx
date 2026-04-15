interface NavbarActionsProps {
  onToggleMobile: () => void;
}

const NavbarActions: React.FC<NavbarActionsProps> = ({ onToggleMobile }) => (
  <div className="flex items-center gap-5">
    <div className="hidden md:flex items-center gap-3">
      <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-all border border-transparent hover:border-blue-100">
        <i className="bx bx-bell text-2xl"></i>
      </button>
    </div>
    <div className="flex items-center gap-3.5 pl-5 border-l border-slate-200 group cursor-pointer">
      <div className="text-right hidden sm:block">
        <p className="text-sm font-bold text-slate-900 leading-none group-hover:text-blue-600 transition-colors">
          김인사 매니저
        </p>
        <p className="text-[11px] text-slate-400 font-bold mt-1.5 uppercase tracking-wider">
          Senior Recruiter
        </p>
      </div>
      <div className="w-10 h-10 rounded-2xl bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center text-slate-400 overflow-hidden ring-1 ring-slate-100 group-hover:ring-blue-400 transition-all">
        <i className="bx bxs-user text-2xl"></i>
      </div>
    </div>
    <button className="lg:hidden text-slate-600 p-1" onClick={onToggleMobile}>
      <i className="bx bx-menu-alt-right text-3xl"></i>
    </button>
  </div>
);


export default NavbarActions;