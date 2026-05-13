
import React from 'react';
import { Mail, MapPin, Instagram, Phone, ShoppingBag, Youtube } from 'lucide-react';
// @ts-ignore
import { useNavigate } from 'react-router-dom';

const Footer: React.FC = () => {
  const navigate = useNavigate();

  const handleNav = (path: string) => {
    navigate(path);
    window.scrollTo(0, 0);
  };

  const handleScrollTo = (id: string) => {
    navigate('/');
    setTimeout(() => {
        const element = document.getElementById(id);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const openExternal = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <footer className="bg-[#050505] border-t border-[#00B8D4]/20 pt-16 pb-8 px-6 text-gray-300">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        {/* Marca */}
        <div className="md:col-span-1">
           <h4 className="font-heading font-bold text-2xl text-white mb-4">Aquarismo Panucci</h4>
           <p className="text-gray-500 text-sm leading-relaxed mb-4">
             Aquarismo de alto padrão. Espécies exclusivas, equipamentos premium e tudo para transformar seu aquário em uma obra de arte.
           </p>
           <div className="flex gap-4">
              <button onClick={() => openExternal('https://api.whatsapp.com/send/?phone=5511971036922')} className="text-[#00B8D4] hover:text-white transition-colors"><Phone className="w-5 h-5"/></button>
           </div>
        </div>

        {/* Contato */}
        <div className="md:col-span-1">
           <h4 className="font-bold uppercase tracking-widest text-xs text-[#00B8D4] mb-6">Contato</h4>
           <ul className="space-y-4 text-sm text-gray-400 cursor-pointer">
             <li onClick={() => openExternal('https://api.whatsapp.com/send/?phone=5511971036922')} className="flex items-center gap-3 hover:text-[#00B8D4] transition-colors">
               <Phone className="w-4 h-4 text-[#00B8D4]" />
               <span>(11) 97103-6922</span>
             </li>
           </ul>
        </div>

        {/* Links Rápidos */}
        <div className="md:col-span-1">
           <h4 className="font-bold uppercase tracking-widest text-xs text-[#00B8D4] mb-6">Navegação</h4>
           <ul className="space-y-2 text-sm text-gray-400 cursor-pointer">
             <li><button onClick={() => handleNav('/')} className="hover:text-[#00B8D4] transition-colors text-left">Início</button></li>
             <li><button onClick={() => handleNav('/catalog')} className="hover:text-[#00B8D4] transition-colors text-left">Catálogo de Espécies</button></li>
             <li><button onClick={() => handleScrollTo('sobre')} className="hover:text-[#00B8D4] transition-colors text-left">Sobre Nós</button></li>
           </ul>
        </div>

        {/* Pagamento */}
        <div className="md:col-span-1">
           <h4 className="font-bold uppercase tracking-widest text-xs text-[#00B8D4] mb-6">Envio & Pagamento</h4>
           <p className="text-xs text-gray-500 mb-4">Envio seguro para todo o Brasil com garantia de entrega viva.</p>
           <div className="flex flex-wrap gap-2">
              <div className="px-3 py-1 bg-[#111] rounded text-xs border border-[#00B8D4]/30 text-white">Pix</div>
              <div className="px-3 py-1 bg-[#111] rounded text-xs border border-[#00B8D4]/30 text-white">Cartão</div>
              <div className="px-3 py-1 bg-[#111] rounded text-xs border border-[#00B8D4]/30 text-white">Boleto</div>
           </div>
        </div>
      </div>
      
      <div className="text-center border-t border-[#00B8D4]/10 pt-8 flex flex-col items-center gap-2">
        <p className="text-gray-600 text-xs uppercase tracking-widest">
          © 2025 Aquarismo Panucci. Todos os direitos reservados.
        </p>
        <p className="text-gray-600 text-xs uppercase tracking-widest flex items-center gap-1">
          Criado por 
          <button 
            onClick={() => openExternal('https://instagram.com/didipimentaclub')}
            className="hover:text-[#00B8D4] transition-colors font-bold border-b border-transparent hover:border-[#00B8D4]"
          >
            Didi Pimenta (@didipimentaclub)
          </button>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
