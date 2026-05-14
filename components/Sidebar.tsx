
import React, { useState } from 'react';
import { motion as framerMotion, AnimatePresence } from 'framer-motion';
import { 
  Home, Grid, Package, Users, MessageSquare, 
  Settings, Shirt, Crown, Box,
  Menu, X, User, ShoppingBag, Truck
} from 'lucide-react';
// @ts-ignore
import { useNavigate, useLocation } from 'react-router-dom';
import { Layers, CheckSquare } from 'lucide-react';

const motion = framerMotion as any;

// --- Types ---
type NavItem = {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
  subItems?: { label: string; href: string; icon: React.ElementType; badge?: number }[];
};

// URL do Logo Atualizada
const LOGO_URL = "https://i.postimg.cc/j28sZ4hF/Favela-q-chick.png"; 

// --- Configuration ---
const NAV_ITEMS: NavItem[] = [
  {
    id: 'home',
    label: 'Inicio',
    icon: Home,
    subItems: [
      { label: 'Visao Geral', href: '/', icon: Grid },
      { label: 'Destaques', href: '/#featured', icon: Box },
      { label: 'Sobre Nos', href: '/#sobre', icon: Users },
      { label: 'Novidades', href: '/catalog', icon: Package, badge: 4 },
    ]
  },
  {
    id: 'store',
    label: 'Loja',
    icon: Package,
    subItems: [
      { label: 'Todo Catalogo', href: '/catalog', icon: Grid },
      { label: 'Camisetas', href: '/catalog?cat=Camisetas', icon: Shirt },
      { label: 'Calcas', href: '/catalog?cat=Calcas', icon: Layers },
      { label: 'Tenis', href: '/catalog?cat=Tenis', icon: Crown },
      { label: 'Acessorios', href: '/catalog?cat=Acessorios', icon: Box },
    ]
  },
  {
    id: 'account',
    label: 'Minha Conta',
    icon: User,
    subItems: [
      { label: 'Meus Pedidos', href: '/orders', icon: Truck },
      { label: 'Perfil', href: '/#', icon: Settings },
    ]
  },
  {
    id: 'social',
    label: 'Comunidade',
    icon: Users,
    subItems: [
      { label: 'WhatsApp', href: 'https://api.whatsapp.com/send/?phone=5511977668767', icon: MessageSquare },
      { label: 'Instagram', href: 'https://www.instagram.com/favelamaisqchick', icon: Users },
    ]
  },
];

const Sidebar: React.FC<{ isOpen: boolean; setIsOpen: (v: boolean) => void }> = ({ isOpen, setIsOpen }) => {
  const [activeTier1, setActiveTier1] = useState<string>('home');
  const navigate = useNavigate();
  const location = useLocation();

  const handleTier1Click = (id: string) => {
    if (activeTier1 === id && isOpen) {
        setIsOpen(false);
    } else {
        setActiveTier1(id);
        setIsOpen(true);
    }
  };

  const handleTier2Click = (href: string) => {
    if (href.startsWith('http')) {
      window.open(href, '_blank');
    } else {
      navigate(href);
    }
    setIsOpen(false);
  };

  const activeGroup = NAV_ITEMS.find(i => i.id === activeTier1);

  return (
    <>
      {/* Mobile Overlay (Backdrop) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      <div 
        className={`fixed top-0 left-0 h-full z-50 flex bg-[#050505] transition-transform duration-300 shadow-[0_0_30px_rgba(0,0,0,0.5)] border-r border-[#E8FF00]/20
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* TIER 1: Trilha de Icones */}
        <div className="w-20 flex flex-col items-center py-4 border-r border-[#222] bg-[#050505] z-20 shrink-0">
          {/* LOGO */}
          <div className="mb-6 px-1 w-full flex justify-center cursor-pointer" onClick={() => navigate('/')}>
             <img 
               src={LOGO_URL} 
               alt="Favela +Q Chick" 
               className="w-16 h-auto object-contain drop-shadow-[0_0_10px_rgba(232,255,0,0.3)] hover:scale-105 transition-transform" 
               onError={(e) => {
                 (e.target as HTMLImageElement).src = "https://placehold.co/128x128/050505/E8FF00.png?text=FQC";
               }}
             />
          </div>

          {/* Navegacao Principal */}
          <div className="flex-1 flex flex-col gap-4 w-full px-2 overflow-y-auto scrollbar-hide">
            {NAV_ITEMS.map((item) => {
              return (
                <button
                  key={item.id}
                  onClick={() => handleTier1Click(item.id)}
                  className={`relative group flex flex-col items-center justify-center w-full aspect-square rounded-xl transition-all duration-200 ${
                    activeTier1 === item.id 
                      ? 'bg-[#E8FF00] text-black shadow-[0_0_15px_rgba(232,255,0,0.4)]' 
                      : 'text-gray-500 hover:bg-[#111] hover:text-[#E8FF00]'
                  }`}
                >
                  <item.icon className="w-6 h-6" />
                  <span className="text-[10px] mt-1 font-bold">{item.label}</span>
                  {item.badge && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-600 rounded-full border-2 border-[#050505]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Botoes Inferiores */}
          <div className="flex flex-col gap-4 w-full px-2 mt-auto pt-4 border-t border-[#222]">
            <button 
                onClick={() => navigate('/admin')}
                className="flex flex-col items-center justify-center w-full aspect-square rounded-xl text-gray-500 hover:bg-[#111] hover:text-[#E8FF00] transition-colors"
                title="Admin"
            >
              <Settings className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* TIER 2: Painel de Submenu */}
        <div 
           className={`flex flex-col bg-[#0a0a0a] z-10 transition-all duration-300 ease-in-out overflow-hidden
             ${isOpen ? 'w-64 opacity-100' : 'w-0 opacity-0 md:w-0'} 
           `}
        >
          {/* Header do Painel */}
          <div className="h-20 flex items-center justify-between px-6 border-b border-[#222] shrink-0">
            <h2 className="text-xl font-heading font-bold text-white tracking-wider truncate">
              {activeGroup?.label}
            </h2>
            <button onClick={() => setIsOpen(false)} className="md:hidden text-gray-500 hover:text-white">
               <X className="w-5 h-5" />
            </button>
          </div>

          {/* Lista de Links */}
          <div className="flex-1 overflow-y-auto p-4 w-64">
            <div className="flex flex-col gap-1">
              {activeGroup?.subItems?.map((sub, idx) => {
                const isLinkActive = location.pathname === sub.href || location.hash === sub.href.replace('/', '');
                
                return (
                  <button
                    key={idx}
                    onClick={() => handleTier2Click(sub.href)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all group w-full text-left ${
                      isLinkActive
                        ? 'bg-[#E8FF00]/10 text-[#E8FF00] border border-[#E8FF00]/20'
                        : 'text-gray-400 hover:bg-[#111] hover:text-white'
                    }`}
                  >
                    <sub.icon className={`w-4 h-4 shrink-0 ${isLinkActive ? 'text-[#E8FF00]' : 'text-gray-500 group-hover:text-white'}`} />
                    <span className="flex-1 truncate">{sub.label}</span>
                    {sub.badge && (
                      <span className="bg-[#E8FF00] text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {sub.badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Card VIP */}
          <div className="p-4 border-t border-[#222] shrink-0 w-64">
            <div className="bg-gradient-to-br from-[#111] to-[#000] border border-[#E8FF00]/20 rounded-xl p-4 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-40 transition-opacity">
                  <Crown className="w-12 h-12 text-[#E8FF00]" />
               </div>
               <h3 className="text-white font-bold text-sm mb-1">Pecas Exclusivas</h3>
               <p className="text-xs text-gray-400 mb-3">Receba novidades de lancamentos e promocoes no seu WhatsApp.</p>
               <button 
                 onClick={() => window.open('https://api.whatsapp.com/send/?phone=5511977668767', '_blank')}
                 className="w-full bg-[#E8FF00] text-black text-xs font-bold py-2 rounded uppercase tracking-wider hover:bg-white transition-colors"
               >
                 Falar com a Favela
               </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
