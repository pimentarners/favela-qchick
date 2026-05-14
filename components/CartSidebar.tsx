import React from 'react';
import { motion as framerMotion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, MessageCircle } from 'lucide-react';
import { CartItem } from '../types';

const motion = framerMotion as any;

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
}

const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose, cart, onUpdateQuantity, onRemoveItem }) => {
  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;

    let message = `*Novo Pedido Aquarismo Panucci*\n\n`;
    cart.forEach(item => {
      message += `- ${item.name} (R$ ${item.price.toFixed(2)}) x${item.quantity}\n`;
    });
    message += `\n*Total: R$ ${total.toFixed(2)}*`;

    // 5511971036922 is the store's phone number found in Sidebar.tsx
    const whatsappUrl = `https://api.whatsapp.com/send/?phone=5511971036922&text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0a0a0a] z-50 flex flex-col border-l border-[#222] shadow-[0_0_50px_rgba(0,0,0,0.8)]"
          >
            {/* Header */}
            <div className="bg-[#00B8D4] text-black h-16 flex items-center justify-between px-6 shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingBagIcon className="w-5 h-5" />
                <h2 className="font-bold tracking-wider text-sm">SEU PEDIDO</h2>
              </div>
              <button onClick={onClose} className="hover:scale-110 transition-transform">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {cart.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-500 gap-4">
                  <ShoppingBagIcon className="w-12 h-12 opacity-20" />
                  <p>Seu carrinho está vazio.</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="bg-[#111] border border-[#222] rounded-xl p-3 flex gap-4 relative group">
                    {/* Item Image */}
                    <div className="w-16 h-16 bg-black rounded-lg overflow-hidden shrink-0 border border-[#333]">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 flex flex-col justify-center">
                      <h3 className="text-white text-xs font-bold uppercase truncate">{item.name}</h3>
                      <p className="text-[#00B8D4] font-bold text-sm mt-1">R$ {item.price.toFixed(2)}</p>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3 mt-2">
                        <button 
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          className="w-6 h-6 rounded-full border border-[#444] flex items-center justify-center text-gray-400 hover:text-white hover:border-white transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-white text-sm font-bold w-4 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          className="w-6 h-6 rounded-full border border-[#444] flex items-center justify-center text-gray-400 hover:text-white hover:border-white transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button 
                      onClick={() => onRemoveItem(item.id)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500/50 hover:text-red-500 transition-colors p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="border-t border-[#222] p-6 bg-[#0a0a0a] shrink-0">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-gray-500 text-xs font-bold tracking-widest uppercase">Total Estimado</span>
                  <span className="text-[#00B8D4] text-2xl font-bold">R$ {total.toFixed(2)}</span>
                </div>
                
                <button 
                  onClick={handleCheckout}
                  className="w-full bg-[#00B8D4] hover:bg-white text-black py-4 rounded-xl font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-3 relative group"
                >
                  <MessageCircle className="w-5 h-5" />
                  Enviar Pedido
                  <div className="absolute right-4 w-8 h-8 bg-black rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-2 h-2 bg-[#00B8D4] rounded-full" />
                  </div>
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Simple Shopping Bag SVG component to use in Header
const ShoppingBagIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
    <path d="M3 6h18"/>
    <path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
);

export default CartSidebar;
