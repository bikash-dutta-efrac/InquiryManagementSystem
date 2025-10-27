import {
  HiUserPlus,
  HiBeaker,
  HiCurrencyDollar,
} from "react-icons/hi2";
import {
  ChevronsLeft,
  ChevronsRight,
  TestTube2,
} from "lucide-react";
import {
  MdAssignment,
  MdBusiness,
  MdTrendingUp,
} from "react-icons/md";

export default function SideMenus({ activeView, onViewChange, isMinimized = false, onToggleMinimize }) {
  const searchingMenus = [
    { key: "inqDate", label: "Inquiry", icon: MdAssignment }, 
    { key: "quotDate", label: "Quotation", icon: HiCurrencyDollar },
    { key: "regisDate", label: "Registration", icon: HiUserPlus },
  ];

  const analysisMenus = [
    { key: "bdProjection", label: "Bd Projection", icon: MdTrendingUp },
    { key: "labAnalysis", label: "Lab Analysis", icon: HiBeaker },
    { key: "sampleAnalysis", label: "Sample Analysis", icon: TestTube2 },
    { key: "businessAnalysis", label: "Business Analysis", icon: MdBusiness },
  ];

  const renderMenuItem = (menu) => (
    <li key={menu.key} className={isMinimized ? "group relative" : ""}>
      <button
        onClick={() => onViewChange(menu.key)}
        className={`relative flex items-center w-full p-3 rounded-xl transition-all duration-300 ease-in-out ${
          isMinimized ? "justify-center" : "transform hover:scale-[1.02]"
        } hover:bg-white/15 ${
          activeView === menu.key
            ? "bg-white/25 backdrop-blur-sm shadow-inner font-semibold"
            : "hover:bg-white/10"
        }`}
      >
        <menu.icon className="w-5 h-5" />
        <span className={`text-sm ${isMinimized ? "hidden" : "ml-3"}`}>{menu.label}</span>

        {isMinimized && (
          <span className="absolute left-full ml-4 p-2 min-w-max bg-gray-800 text-white text-xs rounded-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none z-50">
            {menu.label}
          </span>
        )}
      </button>
    </li>
  );

  const ToggleIcon = isMinimized ? ChevronsRight : ChevronsLeft;

  return (
    <div
      className={`fixed top-0 left-0 bg-gradient-to-b from-blue-600 to-cyan-600 opacity-95" text-white ${
              isMinimized ? "w-25" : "w-56"
            } min-h-screen p-6 flex flex-col space-y-8 shadow-2xl transition-all duration-300 z-50`}
        >
      <div className={`flex ${isMinimized ? "justify-center" : "justify-between"} items-center mb-4`}>
        {!isMinimized && (
          <h2 className="text-xl font-extrabold tracking-wide">
            LIMS DASHBOARD
          </h2>
        )}

        <button
          onClick={onToggleMinimize}
          className={`p-1 rounded-lg hover:bg-white/20 transition-colors ${isMinimized ? "" : "ml-auto"}`}
          aria-label={isMinimized ? "Expand Menu" : "Collapse Menu"}
        >
          <ToggleIcon className="w-6 h-6" />
        </button>
      </div>

      <nav className="flex-1 space-y-8">
        <div>
          {!isMinimized && (
            <h3 className="text-xs font-semibold uppercase text-cyan-200 mb-3 tracking-wider">
              Searching
            </h3>
          )}
          <ul className="space-y-3">
            {searchingMenus.map(renderMenuItem)}
          </ul>
        </div>

        <div>
          {!isMinimized && (
            <h3 className="text-xs font-semibold uppercase text-cyan-200 mb-3 tracking-wider">
              Analysis
            </h3>
          )}
          <ul className="space-y-3">
            {analysisMenus.map(renderMenuItem)}
          </ul>
        </div>
      </nav>
    </div>
  );
}