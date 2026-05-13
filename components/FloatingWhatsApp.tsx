
import React from 'react';
import { MessageSquare } from 'lucide-react';
import { motion as framerMotion } from 'framer-motion';

const motion = framerMotion as any;

const FloatingWhatsApp: React.FC = () => {
  const phoneNumber = "5511971036922";
  const message = encodeURIComponent("Olá Aquarismo Panucci! Gostaria de saber mais sobre as espécies e equipamentos.");
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${message}`;

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[100] bg-[#00B8D4] text-black p-3 md:p-4 rounded-full shadow-[0_0_20px_rgba(0,184,212,0.4)] flex items-center justify-center group hover:bg-white transition-colors border-2 border-black"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <MessageSquare className="w-6 h-6 md:w-8 md:h-8" />
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 transition-all duration-300 font-bold whitespace-nowrap hidden md:inline-block">
        Falar no WhatsApp
      </span>
    </motion.a>
  );
};

export default FloatingWhatsApp;
