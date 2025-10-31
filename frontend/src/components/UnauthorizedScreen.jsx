import { AlertCircle, Lock, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const UnauthorizedScreen = ({ onLogout }) => {
    // Clear potentially lingering session data upon showing unauthorized screen
    // This makes sure the next login is fresh.
    localStorage.clear();

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-red-800 to-red-900 flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className="max-w-xl w-full bg-white rounded-3xl shadow-2xl p-8 sm:p-12 text-center border-t-8 border-red-500 overflow-hidden relative"
            >
                {/* Background Flare */}
                <Zap className="absolute top-0 right-0 w-32 h-32 text-red-500 opacity-5 -translate-y-1/4 translate-x-1/4 rotate-45" />
                <Zap className="absolute bottom-0 left-0 w-32 h-32 text-red-500 opacity-5 translate-y-1/4 -translate-x-1/4 -rotate-45" />

                <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="p-4 bg-red-100 rounded-full inline-block mb-6 shadow-md"
                >
                    <Lock className="w-10 h-10 text-red-600" />
                </motion.div>

                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
                    Access Denied
                </h1>
                
                <p className="text-lg text-gray-600 mb-6">
                    You are not authorized to access this specific application. 
                    This usually means your profile is missing a required Business Development Code.
                </p>

                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 flex items-start gap-3 text-left mb-8">
                    <AlertCircle className="w-5 h-5 mt-0.5 text-yellow-600 flex-shrink-0" />
                    <p className="text-sm text-yellow-800 font-medium">
                        If you believe this is an error, please contact your administrator to verify your user role and profile setup.
                    </p>
                </div>

                <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(239, 68, 68, 0.5)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onLogout}
                    className="w-full sm:w-auto px-8 py-3 bg-red-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-300 flex items-center justify-center mx-auto"
                >
                    <Lock className="w-4 h-4 mr-2" />
                    Log Out & Retry
                </motion.button>
            </motion.div>
        </div>
    );
};

export default UnauthorizedScreen;
