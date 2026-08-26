import React from "react";

export function Header() {
  return (
    <header className="w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-black/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Waskita
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-medium">
            Alpha
          </span>
        </div>
        <nav className="flex items-center space-x-4 text-sm font-medium text-gray-600 dark:text-gray-300">
          <span className="text-xs text-gray-400">AI / Deepfake Verification</span>
        </nav>
      </div>
    </header>
  );
}
