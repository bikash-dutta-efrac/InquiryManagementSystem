import React from "react";

export default function LoaderOverlay({ loading }) {
  if (!loading) return null;

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-sm z-[1000] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
