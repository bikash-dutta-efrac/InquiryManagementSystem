import { ZapIcon, Users, User, TrendingUp } from "lucide-react";

export default function SideMenus({ activeView, onViewChange }) {
  const menus = [
    { key: "inqDate", label: "Inquiry", icon: ZapIcon },
    { key: "quotDate", label: "Quotation", icon: Users },
    { key: "regisDate", label: "Registration", icon: User },
  ];

  const bdProjection = { key: "bdProjection", label: "Bd Projection", icon: TrendingUp };

  return (
    <div className="bg-linear-to-b from-cyan-700 via-blue-500 to-indigo-600 text-white w-56 min-h-screen p-6 flex flex-col space-y-8 shadow-2xl transition-all duration-300">
      <h2 className="text-2xl font-extrabold mb-4 text-center tracking-wide">
        Lims Dashboard
      </h2>
      <nav className="flex-1 space-y-8">
        <div>
          <h3 className="text-xs font-semibold uppercase text-cyan-200 mb-3 tracking-wider">
            Searching
          </h3>
          <ul className="space-y-3">
            {menus.map((menu) => (
              <li key={menu.key}>
                <button
                  onClick={() => onViewChange(menu.key)}
                  className={`relative flex items-center w-full p-3 rounded-xl transition-all duration-300 ease-in-out transform hover:scale-[1.02] hover:bg-white/15 ${
                    activeView === menu.key
                      ? "bg-white/25 backdrop-blur-sm shadow-inner font-semibold"
                      : "hover:bg-white/10"
                  }`}
                >
                  <menu.icon className="w-5 h-5 mr-3" />
                  <span className="text-sm">{menu.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h3 className="text-xs font-semibold uppercase text-cyan-200 mb-3 tracking-wider">
            Analysis
          </h3>
          <ul className="space-y-3">
            <li>
              <button
                onClick={() => onViewChange(bdProjection.key)}
                className={`relative flex items-center w-full p-3 rounded-xl transition-all duration-300 ease-in-out transform hover:scale-[1.02] hover:bg-white/15 ${
                  activeView === bdProjection.key
                    ? "bg-white/25 backdrop-blur-sm shadow-inner font-semibold"
                    : "hover:bg-white/15"
                }`}
              >
                <bdProjection.icon className="w-5 h-5 mr-3" />
                <span className="text-sm">{bdProjection.label}</span>
              </button>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );
}
