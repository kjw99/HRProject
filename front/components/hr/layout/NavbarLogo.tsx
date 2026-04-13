const NavbarLogo: React.FC = () => (
  <div className="flex items-center gap-3 group cursor-pointer transition-transform active:scale-95">
    <div className="w-11 h-11 bg-linear-to-br from-[#0D99FF] to-[#0070E0] rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 group-hover:rotate-6 transition-all">
      <i className='bx bx-brain text-white text-2xl'></i>
    </div>
    <div className="hidden sm:block">
      <h1 className="text-xl font-black text-slate-900 tracking-tighter">A-RECRUIT</h1>
      <p className="text-[10px] text-blue-500 font-black uppercase tracking-[0.25em]">HR Intelligence</p>
    </div>
  </div>
);

export default NavbarLogo;