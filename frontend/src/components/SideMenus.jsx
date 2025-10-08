import {
  FileText,
  Receipt,
  UserPlus,
  FlaskConical,
  TrendingUp,
  ChevronsLeft, // New Icon for Minimize/Collapse (when expanded)
  ChevronsRight,
  Microscope, // New Icon for Maximize/Expand (when minimized)
} from "lucide-react";

export default function SideMenus({ activeView, onViewChange, isMinimized = false, onToggleMinimize }) {
  const searchingMenus = [
    { key: "inqDate", label: "Inquiry", icon: FileText },
    { key: "quotDate", label: "Quotation", icon: Receipt },
    { key: "regisDate", label: "Registration", icon: UserPlus },
  ];

  const analysisMenus = [
    { key: "bdProjection", label: "Bd Projection", icon: TrendingUp },
    { key: "labAnalysis", label: "Lab Analysis", icon: Microscope },
  ];

  // Helper to render a menu button
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
        {/* Hide label when minimized */}
        <span className={`text-sm ${isMinimized ? "hidden" : "ml-3"}`}>{menu.label}</span>

        {/* Tooltip for minimized state */}
        {isMinimized && (
          <span className="absolute left-full ml-4 p-2 min-w-max bg-gray-800 text-white text-xs rounded-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none z-50">
            {menu.label}
          </span>
        )}
      </button>
    </li>
  );

  // Determine which icon to display based on the state
  // If expanded, show ChevronsLeft (to collapse/move left)
  // If collapsed, show ChevronsRight (to expand/move right)
  const ToggleIcon = isMinimized ? ChevronsRight : ChevronsLeft;

  return (
    <div
      // Adjust width based on isMinimized prop
      className={`fixed top-0 left-0 bg-linear-to-b from-cyan-700 via-blue-500 to-indigo-600 text-white ${
              isMinimized ? "w-25" : "w-56"
            } min-h-screen p-6 flex flex-col space-y-8 shadow-2xl transition-all duration-300 z-50`}
        >
      {/* Header with Title and Toggle Button */}
      <div className={`flex ${isMinimized ? "justify-center" : "justify-between"} items-center mb-4`}>
        {/* Hide Title when minimized */}
        {!isMinimized && (
          <h2 className="text-xl font-extrabold tracking-wide">
            Lims Dashboard
          </h2>
        )}

        {/* Toggle Button - positioned appropriately */}
        <button
          onClick={onToggleMinimize}
          className={`p-1 rounded-lg hover:bg-white/20 transition-colors ${isMinimized ? "" : "ml-auto"}`}
          aria-label={isMinimized ? "Expand Menu" : "Collapse Menu"}
        >
          <ToggleIcon className="w-6 h-6" />
        </button>
      </div>

      <nav className="flex-1 space-y-8">
        {/* Searching Section */}
        <div>
          {/* Hide Section Header when minimized */}
          {!isMinimized && (
            <h3 className="text-xs font-semibold uppercase text-cyan-200 mb-3 tracking-wider">
              Searching
            </h3>
          )}
          <ul className="space-y-3">
            {searchingMenus.map(renderMenuItem)}
          </ul>
        </div>

        {/* Analysis Section */}
        <div>
          {/* Hide Section Header when minimized */}
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