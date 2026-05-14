
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion as framerMotion } from 'framer-motion';

const motion = framerMotion as any;

const FluidBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#050505]">
      {/* Base Gradient - Dark Atmosphere */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#111111] to-[#050505]" />

      {/* Neon Yellow Spot - Favela +Q Chick Primary */}
      <motion.div
        className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] bg-[#E8FF00] rounded-full mix-blend-screen filter blur-[150px] opacity-[0.06]"
        animate={{
          scale: [1, 1.1, 1],
          x: [0, 30, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Red Spot - Secondary Accent */}
      <motion.div
        className="absolute bottom-[-20%] right-[-10%] w-[90vw] h-[90vw] bg-[#FF3131] rounded-full mix-blend-screen filter blur-[150px] opacity-[0.04]"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, -40, 0],
          y: [0, -40, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Noise Texture for Gritty Feel */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
    </div>
  );
};

export default FluidBackground;
