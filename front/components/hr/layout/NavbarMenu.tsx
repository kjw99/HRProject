interface NavbarMenuProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

const NavbarMenu: React.FC<NavbarMenuProps> = ({ currentPath, onNavigate }) => {
  const menuItems = [
    {
      id: "generator",
      label: "AI 질문 생성기",
      icon: "bx-wand",
      path: "/hr/agent",
    },
    {
      id: "pipeline",
      label: "지원자 관리",
      icon: "bx-group",
      path: "/hr/pipeline",
    },
    {
      id: "settings",
      label: "에이전트 설정",
      icon: "bx-cog",
      path: "/hr/settings",
    },
  ];

  return (
    <div className="hidden lg:flex items-center gap-2">
      {menuItems.map((item) => {
        const isActive = currentPath === item.path;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.path)}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-[14px] font-bold transition-all ${
              isActive
                ? "bg-blue-50 text-[#0D99FF] shadow-sm ring-1 ring-blue-100"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <i className={`bx ${item.icon} text-xl`}></i>
            {item.label}
          </button>
        );
      })}
    </div>
  );
};

export default NavbarMenu;
