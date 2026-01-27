"use client";

import { motion } from "framer-motion";

export default function AppLoader({
  text = "Loading",
}: {
  text?: string;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      
      {/* Loader */}
      <div className="relative w-24 h-24">
        {/* Outer rings */}
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border-2 border-indigo-500/20"
            style={{
              width: `${100 - i * 15}%`,
              height: `${100 - i * 15}%`,
              top: `${i * 7.5}%`,
              left: `${i * 7.5}%`,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.8, 0.3],
              borderColor: ["rgba(99, 102, 241, 0.2)", "rgba(99, 102, 241, 0.6)", "rgba(99, 102, 241, 0.2)"],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Center glow */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-radial from-indigo-400/30 via-indigo-500/20 to-transparent"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Center dot */}
        <motion.div
          className="absolute inset-1/2 w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-400 shadow-lg"
          animate={{
            boxShadow: [
              "0 0 20px rgba(99, 102, 241, 0.6)",
              "0 0 40px rgba(99, 102, 241, 0.9)",
              "0 0 20px rgba(99, 102, 241, 0.6)",
            ],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Text */}
      <motion.p
        className="mt-8 text-sm font-medium tracking-wide text-indigo-300/80 uppercase"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.8, repeat: Infinity }}
      >
        {text}
      </motion.p>
    </div>
  );
}
