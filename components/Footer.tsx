
import React from 'react';
import { Mail, MapPin, Instagram, Phone, ShoppingBag } from 'lucide-react';
// @ts-ignore
import { useNavigate } from 'react-router-dom';

const Footer: React.FC = () => {
  const navigate = useNavigate();

  const handleNav = (path: string) => {
    navigate(path);
    window.scrollTo(0, 0);
  };

  const openExternal = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <footer className="bg-[#050505] border-t border-[#E8FF00]/20 pt-16 pb-8 px-6 text-gray-300">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        {/* Marca */}
        <div className="md:col-span-1">
           <h4 className="font-heading font-bold text-2xl text-white mb-4">Favela +Q Chick</h4>
           <p className="text-gray-500 text-sm leading-relaxed mb-4">
             Da quebrada pro mundo. Streetwear de elite com a essencia da favela. Cada peca conta uma historia de corre e vitoria.
           </p>
           <div className="flex gap-4">
              <button onClick={() => openExternal('https://www.instagram.com/favelamaisqchick')} className="text-[#E8FF00] hover:text-white transition-colors"><Instagram className="w-5 h-5"/></button>
              <button onClick={() => openExternal('https://api.whatsapp.com/send/?phone=5511977668767')} className="text-[#E8FF00] hover:text-white transition-colors"><Phone className="w-5 h-5"/></button>
           </div>
        </div>

        {/* Contato */}
        <div className="md:col-span-1">
           <h4 className="font-bold uppercase tracking-widest text-xs text-[#E8FF00] mb-6">Contato</h4>
           <ul className="space-y-4 text-sm text-gray-400 cursor-pointer">
             <li onClick={() => openExternal('https://api.whatsapp.com/send/?phone=5511977668767')} className="flex items-center gap-3 hover:text-[#E8FF00] transition-colors">
               <Phone className="w-4 h-4 text-[#E8FF00]" />
               <span>(11) 97766-8767</span>
             </li>
             <li className="flex items-center gap-3 text-gray-500">
               <MapPin className="w-4 h-4 text-[#E8FF00]" />
               <span>R. Sao Goncalo do Rio das Pedras, 1023</span>
             </li>
             <li onClick={() => openExternal('https://www.instagram.com/favelamaisqchick')} className="flex items-center gap-3 hover:text-[#E8FF00] transition-colors">
               <Instagram className="w-4 h-4 text-[#E8FF00]" />
               <span>@favelamaisqchick</span>
             </li>
           </ul>
        </div>

        {/* Links Rapidos */}
        <div className="md:col-span-1">
           <h4 className="font-bold uppercase tracking-widest text-xs text-[#E8FF00] mb-6">Navegacao</h4>
           <ul className="space-y-2 text-sm text-gray-400 cursor-pointer">
             <li><button onClick={() => handleNav('/')} className="hover:text-[#E8FF00] transition-colors text-left">Inicio</button></li>
             <li><button onClick={() => handleNav('/catalog')} className="hover:text-[#E8FF00] transition-colors text-left">Catalogo</button></li>
           </ul>
        </div>

        {/* Pagamento */}
        <div className="md:col-span-1">
           <h4 className="font-bold uppercase tracking-widest text-xs text-[#E8FF00] mb-6">Envio & Pagamento</h4>
           <p className="text-xs text-gray-500 mb-2">Envios para todo o Brasil</p>
           <p className="text-xs text-gray-500 mb-4">Pix: +55 11 97766-8767</p>
           <div className="flex flex-wrap gap-2">
              <div className="px-3 py-1 bg-[#111] rounded text-xs border border-[#E8FF00]/30 text-white">Pix</div>
              <div className="px-3 py-1 bg-[#111] rounded text-xs border border-[#E8FF00]/30 text-white">Cartao</div>
              <div className="px-3 py-1 bg-[#111] rounded text-xs border border-[#E8FF00]/30 text-white">Boleto</div>
           </div>
        </div>
      </div>
      
      <div className="text-center border-t border-[#E8FF00]/10 pt-8 flex flex-col items-center gap-2">
        <p className="text-gray-600 text-xs uppercase tracking-widest">
          &copy; 2025 Favela +Q Chick. Todos os direitos reservados.
        </p>
        <p className="text-gray-600 text-xs uppercase tracking-widest flex items-center gap-1">
          Criado por 
          <button 
            onClick={() => openExternal('https://instagram.com/didipimentaclub')}
            className="hover:text-[#E8FF00] transition-colors font-bold border-b border-transparent hover:border-[#E8FF00]"
          >
            Didi Pimenta (@didipimentaclub)
          </button>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
