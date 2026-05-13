
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { motion } from 'framer-motion';

interface GradientTextProps {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  className?: string;
}

const GradientText: React.FC<GradientTextProps> = ({ text, as: Component = 'span', className = '' }) => {
  return (
    <Component className={`relative inline-block tracking-tight isolate ${className}`}>
      {/* Neon Gradient Text */}
      <span
        className="bg-gradient-to-r from-[#ffffff] via-[#00B8D4] to-[#ffffff] bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(0,184,212,0.3)]"
        style={{ 
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        {text}
      </span>
    </Component>
  );
};

export default GradientText;
