
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { motion as framerMotion, AnimatePresence } from 'framer-motion';
import { Artist } from '../types';
import { ShoppingBag, Eye, Check, Share2, Image as ImageIcon } from 'lucide-react';

const motion = framerMotion as any;

interface ArtistCardProps {
  artist: Artist;
  onClick: () => void;
  onAddToCart?: (e: React.MouseEvent) => void;
  onShare?: (e: React.MouseEvent) => void;
}

const ArtistCard: React.FC<ArtistCardProps> = ({ artist, onClick, onAddToCart, onShare }) => {
  const [isAdded, setIsAdded] = useState(false);
  const [isShareHovered, setIsShareHovered] = useState(false);
  const [isBuyHovered, setIsBuyHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    e.preventDefault(); 
    if (isAdded) return;
    
    setIsAdded(true);
    if (onAddToCart) onAddToCart(e);
    
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onShare) {
      onShare(e);
    } else {
      onClick();
    }
  };

  const handleViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onClick();
  }

  return (
    <motion.div
      className={`group relative h-[320px] md:h-[450px] w-full overflow-hidden bg-[#050505] cursor-pointer transition-all duration-300 ${isAdded ? 'ring-2 ring-green-500 shadow-[0_0_30px_rgba(34,197,94,0.3)]' : ''}`}
      initial="rest"
      whileHover="hover"
      whileTap="hover"
      animate="rest"
      onClick={onClick}
    >
      {/* Background Image Optimized */}
      <div className="absolute inset-0 overflow-hidden z-0 bg-[#111]">
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-8 h-8 border-2 border-[#00B8D4] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        <motion.img 
          src={artist.image} 
          alt={artist.name} 
          className={`h-full w-full object-cover grayscale will-change-transform transition-opacity duration-500 ${imageLoaded ? 'opacity-60' : 'opacity-0'}`}
          loading="lazy" 
          decoding="async"
          onLoad={() => setImageLoaded(true)}
          variants={{
            rest: { scale: 1, filter: 'grayscale(100%) brightness(80%)' },
            hover: { scale: 1.05, filter: 'grayscale(0%) brightness(100%)', opacity: 0.9 }
          }}
          transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />
      </div>

      {/* Action Buttons Pill */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
        <motion.div
          variants={{
            rest: { opacity: 1, y: 0, scale: 1 }, 
            hover: { opacity: 1, y: 0, scale: 1 }
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex items-center gap-0 shadow-[0_10px_30px_rgba(0,0,0,0.8)] pointer-events-auto bg-black border border-[#333] rounded-full p-1"
        >
          {/* Botão Ver */}
          <motion.button 
            whileTap={{ scale: 0.9, backgroundColor: "#111" }}
            className="relative bg-black text-white px-5 py-4 md:px-4 md:py-2 rounded-l-full flex items-center justify-center gap-2 border-r border-[#333] hover:text-[#00B8D4] transition-colors h-full min-w-[60px]"
            onClick={handleViewClick}
            title="Visualizar Detalhes"
          >
            <Eye className="w-5 h-5 md:w-4 md:h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest hidden md:inline">Ver</span>
          </motion.button>

          {/* Botão Compartilhar */}
          <motion.button 
            whileTap={{ scale: 0.9, backgroundColor: "#111" }}
            className="relative bg-black text-white px-5 py-4 md:px-4 md:py-2 flex items-center justify-center gap-2 border-r border-[#333] hover:text-[#00B8D4] transition-colors h-full min-w-[60px]"
            onClick={handleShareClick}
            onMouseEnter={() => setIsShareHovered(true)}
            onMouseLeave={() => setIsShareHovered(false)}
            title="Compartilhar"
          >
            <Share2 className="w-5 h-5 md:w-4 md:h-4" />
          </motion.button>

          {/* Botão Comprar */}
          <motion.button 
            whileTap={{ scale: 0.95 }}
            className={`relative px-6 py-4 md:px-4 md:py-2 rounded-r-full flex items-center justify-center gap-2 transition-colors h-full min-w-[60px] ${isAdded ? 'bg-green-500 text-white' : 'bg-[#00B8D4] text-black hover:bg-white'}`}
            onClick={handleQuickAdd}
            onMouseEnter={() => setIsBuyHovered(true)}
            onMouseLeave={() => setIsBuyHovered(false)}
            title="Adicionar ao Carrinho"
          >
            <AnimatePresence mode="wait">
              {isAdded ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <Check className="w-5 h-5 md:w-4 md:h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest hidden md:inline">Add</span>
                </motion.div>
              ) : (
                <motion.div
                  key="bag"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <ShoppingBag className="w-5 h-5 md:w-4 md:h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest hidden md:inline">Comprar</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </motion.div>
      </div>

      {/* Info Overlay */}
      <div className="absolute inset-x-0 bottom-0 p-4 md:p-6 flex flex-col pointer-events-none z-10 bg-gradient-to-t from-black via-black/80 to-transparent">
        <motion.span 
          className="text-[10px] font-mono text-[#00B8D4] font-bold uppercase tracking-[0.2em] mb-1 truncate"
          variants={{
            rest: { opacity: 0.8, x: 0 },
            hover: { opacity: 1, x: 0 }
          }}
        >
          {artist.day}
        </motion.span>
        
        <div className="overflow-hidden">
          <motion.h3 
            className="font-heading text-lg md:text-xl font-bold uppercase text-white leading-tight truncate"
            variants={{
              rest: { y: 0 },
              hover: { y: -2, color: '#00B8D4' }
            }}
          >
            {artist.name}
          </motion.h3>
        </div>

        <motion.p 
          className="text-lg md:text-lg font-bold text-white/90 mt-1"
          variants={{
            rest: { opacity: 0.9 },
            hover: { opacity: 1, color: '#fff' }
          }}
        >
          {artist.genre}
        </motion.p>
      </div>
    </motion.div>
  );
};

export default ArtistCard;
