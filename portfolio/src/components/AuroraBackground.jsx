import React from 'react';

export default function AuroraBackground({ children, className = "" }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Decorative ambient aurora blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-30%] left-[-20%] w-[100vw] h-[100vw] rounded-full bg-gradient-to-br from-violet-500/20 via-purple-500/10 to-transparent blur-[140px] dark:from-violet-500/10 dark:via-purple-500/5 animate-pulse duration-[12s]"></div>
        <div className="absolute bottom-[-30%] right-[-10%] w-[80vw] h-[80vw] rounded-full bg-gradient-to-tr from-cyan-400/20 via-blue-500/10 to-transparent blur-[130px] dark:from-cyan-400/10 dark:via-blue-500/5 animate-pulse duration-[15s]"></div>
        <div className="absolute top-[20%] right-[10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-bl from-pink-500/15 via-rose-500/5 to-transparent blur-[120px] dark:from-pink-500/5 animate-pulse duration-[10s]"></div>
      </div>
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
