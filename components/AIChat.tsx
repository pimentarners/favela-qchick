
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Droplets } from 'lucide-react';
import { motion as framerMotion, AnimatePresence } from 'framer-motion';
import { sendMessageToGemini } from '../services/geminiService';
import { ChatMessage } from '../types';

const motion = framerMotion as any;

const AIChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Ola! Bem-vindo a Favela +Q Chick! Como posso ajudar com seu pedido hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const whatsappUrl = `https://api.whatsapp.com/send?phone=5511977668767&text=${encodeURIComponent("Ola Favela +Q Chick! Gostaria de saber mais sobre as pecas.")}`;

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      const { scrollHeight, clientHeight } = chatContainerRef.current;
      chatContainerRef.current.scrollTo({
        top: scrollHeight - clientHeight,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    setTimeout(scrollToBottom, 100);

    const responseText = await sendMessageToGemini(input);
    
    setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 flex flex-col items-end pointer-events-auto">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-4 w-[90vw] md:w-96 bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="bg-[#E8FF00] p-4 flex justify-between items-center border-b border-black/10">
              <div className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-black" />
                <h3 className="font-heading font-bold text-black tracking-wider uppercase text-xs">Suporte Favela +Q Chick</h3>
              </div>
              
              <div className="flex items-center gap-3">
                 <a 
                    href={whatsappUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-black/80 hover:text-black transition-colors flex items-center gap-1"
                    title="WhatsApp"
                >
                    <MessageCircle className="w-5 h-5" />
                </a>

                <button onClick={() => setIsOpen(false)} className="text-black/80 hover:text-black">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div 
              ref={chatContainerRef}
              className="h-64 md:h-80 overflow-y-auto p-4 space-y-3 scroll-smooth bg-[#F9FAFB]"
            >
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-lg text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[#E8FF00] text-black font-medium rounded-tr-none shadow-md border border-[#0097A7]'
                        : 'bg-white text-[#1A2F25] rounded-tl-none border border-[#E2E8F0] shadow-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white p-3 rounded-lg rounded-tl-none flex gap-1 border border-[#E2E8F0]">
                    <span className="w-1.5 h-1.5 bg-[#E8FF00] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-[#E8FF00] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-[#E8FF00] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-[#E2E8F0] bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Dúvidas sobre espécies ou produtos..."
                  className="flex-1 bg-[#F9FAFB] border border-[#E2E8F0] rounded-lg px-3 py-2 text-[#1A2F25] placeholder-[#5A6A75]/40 text-sm focus:outline-none focus:border-[#00B8D4]"
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="bg-[#00B8D4] p-2 rounded-lg hover:bg-[#0097A7] transition-colors disabled:opacity-50 text-black"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-[#00B8D4] flex items-center justify-center shadow-lg shadow-[#00B8D4]/30 text-black z-50 border-2 border-black"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </motion.button>
    </div>
  );
};

export default AIChat;
