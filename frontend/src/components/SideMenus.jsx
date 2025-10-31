import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiBeaker } from "react-icons/hi2";
import {
  ChevronsLeft,
  ChevronsRight,
  NotepadText,
  TestTube2,
  LogOut,
  AlertTriangle,
} from "lucide-react";
import {
  MdAppRegistration,
  MdAssignment,
  MdBusiness,
  MdTrendingUp,
} from "react-icons/md";
import { IoAnalytics } from "react-icons/io5";

// Removed getInitialBdCode and direct localStorage access

export default function SideMenus({
  activeView,
  onViewChange,
  isMinimized = false,
  onToggleMinimize,
  onLogout,
  // NEW PROP: BdCode passed from the parent (Dashboard)
  bdCodeProp, 
}) {
  // Use a local state derived from the prop for consistency check, 
  // but direct use of bdCodeProp in logic is safer.
  const bdCode = bdCodeProp;
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const searchingMenus = [
    { key: "inqDate", label: "Inquiry", icon: MdAssignment },
    { key: "quotDate", label: "Quotation", icon: NotepadText },
    { key: "regisDate", label: "Registration", icon: MdAppRegistration },
  ];

  // ----------------------------------------------------
  // FIX: BD Projection is only included if bdCode is present.
  // bdPerformanceAnalysis, Business Analysis, and Lab Analysis
  // are included only if bdCode is NOT present (Admin/Superuser view).
  // ----------------------------------------------------
  const analysisMenus = [
    // Visible ONLY if bdCode is present (i.e., BD user is logged in/locked)
    bdCode && { key: "bdProjection", label: "BD Projection", icon: MdTrendingUp },
    
    // These menus are excluded if bdCode is found (i.e., visible to Admins/non-BD users)
    !bdCode && { key: "bdPerformanceAnalysis", label: "BD Performance", icon: IoAnalytics },
    !bdCode && { key: "businessAnalysis", label: "Business Analysis", icon: MdBusiness },
    !bdCode && { key: "labAnalysis", label: "LAB Analysis", icon: HiBeaker },
    
    // Always visible
    { key: "sampleAnalysis", label: "Sample Analysis", icon: TestTube2 },
  ].filter(Boolean); // Removes null/false entries

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
        <span className={`text-sm ${isMinimized ? "hidden" : "ml-3"}`}>
          {menu.label}
        </span>

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
    <>
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 bg-gradient-to-b from-blue-600 to-cyan-600 opacity-95 text-white ${
          isMinimized ? "w-25" : "w-56"
        } min-h-screen h-full overflow-y-auto p-6 flex flex-col space-y-8 shadow-2xl transition-all duration-300 z-50 custom-scrollbar`}
      >
        {/* Header */}
        <div
          className={`flex ${
            isMinimized ? "justify-center" : "justify-between"
          } items-center`}
        >
          {!isMinimized && (
            <h2 className="text-xl font-extrabold tracking-wide">
              LIMS DASHBOARD
            </h2>
          )}
          <button
            onClick={onToggleMinimize}
            className={`p-1 rounded-lg hover:bg-white/20 transition-colors ${
              isMinimized ? "" : "ml-auto"
            }`}
          >
            <ToggleIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Menus */}
        <nav className="flex-1 space-y-8">
          <div>
            {!isMinimized && (
              <h3 className="text-xs font-semibold uppercase text-cyan-200 mb-3 tracking-wider">
                Searching
              </h3>
            )}
            <ul className="space-y-3">{searchingMenus.map(renderMenuItem)}</ul>
          </div>

          <div>
            {!isMinimized && (
              <h3 className="text-xs font-semibold uppercase text-cyan-200 mb-3 tracking-wider">
                Analysis
              </h3>
            )}
            <ul className="space-y-3">{analysisMenus.map(renderMenuItem)}</ul>
          </div>
        </nav>

        {/* Logout Button */}
        <div className="mt-auto border-t border-white/20 pt-4">
          <motion.button
            whileHover={{ scale: 1.05, rotate: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowLogoutConfirm(true)}
            className={`flex items-center w-full p-3 rounded-xl transition-all duration-300 ${
              isMinimized ? "justify-center" : ""
            } hover:bg-white/15 text-white`}
          >
            <LogOut className="w-5 h-5" />
            <span className={`text-sm ${isMinimized ? "hidden" : "ml-3"}`}>
              Logout
            </span>
          </motion.button>
        </div>
      </div>

      {/* Animated Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className="fixed inset-0 flex items-center justify-center z-[101] px-4"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: 1,
                scale: 1,
                transition: { type: "spring", stiffness: 300, damping: 20 },
              }}
              exit={{
                opacity: 0,
                scale: 0.8,
                transition: { duration: 0.2 },
              }}
            >
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 30, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-6 max-w-sm w-full border border-gray-100"
              >
                <div className="flex items-center gap-3 mb-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    className="p-2 bg-red-100 rounded-full"
                  >
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Confirm Logout
                  </h3>
                </div>

                <p className="text-gray-600 mb-6 text-sm">
                  Are you sure you want to log out? You’ll need to sign in again
                  to access the dashboard.
                </p>

                <div className="flex justify-end gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowLogoutConfirm(false)}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-all text-sm font-medium"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{
                      scale: 1.1,
                      rotate: -2,
                      boxShadow: "0 0 8px rgba(239, 68, 68, 0.4)",
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setShowLogoutConfirm(false);
                      onLogout?.();
                    }}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-md hover:shadow-lg transition-all text-sm font-semibold"
                  >
                    Logout
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Blue Custom Scrollbar */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(147, 197, 253, 0.8); /* blue-300 */
          border-radius: 10px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background-color: rgba(96, 165, 250, 0.9); /* blue-400 */
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(147, 197, 253, 0.8) transparent;
        }
      `}</style>
    </>
  );
}