
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion as framerMotion, AnimatePresence } from 'framer-motion';
// @ts-ignore
import { HashRouter, Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom';
import { 
  ShoppingBag, Waves, Menu, X, Settings, LogIn, 
  ChevronRight, Droplets, Fish, Layers, Search, 
  LayoutGrid, List, Plus, Trash2, Edit, CreditCard, ExternalLink,
  Copy, Ruler, AlertTriangle, TrendingUp, Package, Image as ImageIcon,
  QrCode, Upload, Filter, Zap, Activity, Tag, Home, User, CheckCircle, Share2, ArrowLeft, ArrowDownCircle, AlertCircle, Info, Leaf, Award, Heart, Star, Database, RefreshCw, CheckSquare, Square, MessageCircle, Truck, Calendar, Clock, DollarSign, Save, AlertOctagon, UploadCloud, Skull
} from 'lucide-react';
import FluidBackground from './components/FluidBackground';
import GradientText from './components/GlitchText';
import ArtistCard from './components/ArtistCard';
import Footer from './components/Footer';
import PWAInstallPrompt from './components/PWAInstallPrompt'; 
import { Product, Order } from './types';
import { supabase } from './supabaseClient';
import { fetchBaserowProducts, saveBaserowConfig, getBaserowConfig, saveProductToBaserow, deleteBaserowProduct, testBaserowConnection, deleteBaserowBatch, deleteAllRemoteProducts } from './services/baserowService';
import { MOCK_ORDERS } from './data/mockOrders';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import Sidebar from './components/Sidebar';
import { useProductCache } from './hooks/useProductCache'; 


const motion = framerMotion as any;

// --- DADOS PARA MIGRAÇÃO ---
const RAW_MIGRATION_DATA = `SUBSTRATOS PREMIUM AQUARISMO PANUCCI 20KG
TERRACOTA - 200,00
NATURE SAND - 200,00
BRANCO PEROLADO - 220,00

LISTA PEIXES
ARUANÃ PRATA 35/37CM - 350,00
BAGRE CHICOTE (BARGADA) RAÇÃO 35/40CM - 1.000,00
BICO DE PATO (JURUPENSEM) 32/37CM - 320,00
CENTRODORAS BRACHIATUS 18/20CM - 300,00
CACHARA PURA 25/30CM - 340,00
CAPARARI 30/48CM - 1.000,00
CASCUDO PANAQUE SCHAEFERI 35/40CM (RARIDADE) - 650,00
CASCUDO PITANGA L24 35/37CM - 450,00
CASCUDO HÍBRIDO L24xL25 34/36CM - 450,00
CASCUDO PICOTA DE OURO L14 27/30CM - 320,00
CASCUDO LUTEUS FASE 2 20/25CM - 350,00
CASCUDO LUTEUS FASE 2 ESPECIAL 30/35CM - 600,00
CACHORRA ARMATUS 30/34CM - 320,00
DATNIOIDE MICROLEPIS 6/8CM - 750,00
DATNIOIDE POLOTA 10/11CM - 750,00
FACA PALHAÇO 14/16CM - 200,00
FACA GOLD 20/22CM - 550,00
JURUENSE CATFISH 25/35CM - 1.600,00
JURUPOCA X JUNDIÁ ONÇA 28/30CM - 300,00
LEPSOSTEUS OSSEUS (LONGNOSE GAR) 32/35CM - 2.500,00
LINCE CATFISH 23/25CM - 600,00
MUSSUM 60/65CM - 150,00
MANDUBÉ 27/28CM - 700,00
MANDUBÉ 34/36CM - 900,00
MANDI AÇU 22/25CM - 300,00
MOREIA FIRE EEL 45/48CM - 1.300,00
OXYDORA NÍGER 22/25CM - 270,00
OXYDORA KNERI 17/20CM - 350,00
OSCAR RED TIGRE ALBINO (LUTINO) 10/12CM - 90,00
OSCAR BRONZE 10/12CM - 70,00
OSCAR BRONZE 17/20CM - 300,00
OSCAR HÍBRIDO BUMBLEBEE X TIGRE 10/12CM TOP - 90,00
OSCAR NEMO IMPORTADO 10/12CM - 450,00
OSCAR RED TIGER ALBINO 15/18cm - 300,00
OSCAR BRINZE FULL 28/30CM - 1.700,00
PIRARARA SHORTBODY 15/18CM - 550,00
PIRAÍBA 26/28CM - 580,00
PIRAMUTABA 12/17CM - 130,00
POLYPTERUS SENEGALUS COMUM 10/12CM - 80,00
POLYPTERUS SENEGALUS COMUM 27/30CM - 270,00
POLYPTERUS SENEGALUS ALBINO 23/26CM - 480,00
POLYPTERUS BICHIR 35/38CM - 1.100,00
POLYPTERUS ENDLICHERI 13/15CM - 250,00
POLYPTERUS ENDLICHERI 27/30CM - 510,00
POLYPTERUS ENDLICHERI 38/42CM - 750,00
POLYPTERUS ORNATIPINNIS 35/38CM - 1.400,00
TUCUNARÉ AÇU RORAIMA 18/20CM - 370,00
TUCUNARE AÇU RORAIMA 30/34CM - 700,00
TUCUNARÉ AMARELO 20/25CM - 270,00
TUCUNARÉ AZUL 30/34CM - 300,00
TUCUNARÉ FOGO 10/12CM (PADRÃO TOP) - 280,00
TUCUNARÉ MOGU (MONO GRINGO X XINGU) 15/18CM - 330,00
TUCUNARÉ MIRIANAE 33/35CM - 750,00
TUCUNARÉ POPOCA AMAZÔNICO TOOP 30/33CM - 550,00`;

// --- TYPES & INTERFACES ---

type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  onClose: (id: string) => void;
}

// --- CONSTANTS ---
const PANUCCI_LOGO_URL = "https://i.postimg.cc/brDgBVTJ/Logo-Panucci.png"; 
const STORE_PIX_KEY = "11973828507";

const CATEGORIES = [
  'Jumbos',
  'Peixes Marinhos Importados',
  'Peixes Marinhos Nacionais',
  'Primitivos',
  'Ciclideos Africanos',
  'Amazonicos',
  'Cascudos',
  'Poecilideos',
  'Bettas',
  'Variados',
  'Equipamentos',
  'Aquários',
  'Plantas',
  'Alimentos',
  'Substratos'
];

const COLLECTIONS_OPTIONS = [
  'Destaques da Semana',
  'Raridades',
  'Monstros',
  'Iniciantes',
  'Nano',
  'Plantados'
];

// --- COMPONENTS AUXILIARES ---
// (MarqueeStrip, PixIcon, ToastNotification mantidos)

// Marquee / Faixa Lumina
const MarqueeStrip = () => {
  return (
    <div className="w-full bg-[#00B8D4] py-3 overflow-hidden border-y border-black relative z-20">
      <div className="flex whitespace-nowrap">
        <motion.div 
          className="flex gap-12 items-center"
          animate={{ x: "-50%" }}
          transition={{ 
            repeat: Infinity, 
            ease: "linear", 
            duration: 20 
          }}
        >
          {[...Array(4)].map((_, i) => (
            <React.Fragment key={i}>
              <span className="text-black font-heading font-bold text-lg md:text-xl uppercase tracking-widest flex items-center gap-4">
                ESPÉCIES EXCLUSIVAS <Fish className="w-6 h-6 fill-black" />
              </span>
              <span className="text-black font-heading font-bold text-lg md:text-xl uppercase tracking-widest flex items-center gap-4">
                ENVIO SEGURO PARA TODO BRASIL <Package className="w-6 h-6 fill-black" />
              </span>
              <span className="text-black font-heading font-bold text-lg md:text-xl uppercase tracking-widest flex items-center gap-4">
                AQUARISMO DE ELITE <Layers className="w-6 h-6 fill-black" />
              </span>
            </React.Fragment>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

const PixIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.005 2.522l4.897 4.896-4.897 4.897-4.897-4.897 4.897-4.896zm4.897 4.896l4.897 4.897-4.897 4.897-4.897-4.897 4.897-4.897zm-4.897 4.897l4.897 4.897-4.897 4.897-4.897-4.897 4.897-4.897zm-4.897-4.897l4.897 4.897-4.897 4.897-4.897-4.897 4.897-4.897z" />
  </svg>
);

const ToastNotification: React.FC<ToastProps> = ({ id, message, type, onClose }) => {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-black" />,
    error: <AlertCircle className="w-5 h-5 text-white" />,
    info: <Info className="w-5 h-5 text-black" />
  };

  const bgColors = {
    success: 'bg-[#00B8D4] border-[#00B8D4] text-black',
    error: 'bg-red-600 border-red-600 text-white',
    info: 'bg-white border-white text-black'
  };

  useEffect(() => {
    const timer = setTimeout(() => onClose(id), 4000);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl ${bgColors[type]} min-w-[300px] pointer-events-auto font-bold`}
    >
      {icons[type]}
      <p className="text-sm flex-1">{message}</p>
      <button onClick={() => onClose(id)} className="opacity-70 hover:opacity-100 transition-colors">
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

// --- VIEWS COMPONENTS ---
// (Views anteriores mantidas)
const HomeView: React.FC<{ products: Product[], onNavigate: (path: string) => void, onAddToCart: (p: Product) => void }> = ({ products, onNavigate, onAddToCart }) => {
  return (
    <main>
      <header className="relative min-h-[90vh] flex flex-col justify-between overflow-hidden pt-12 md:pt-0">
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.8, ease: "easeOut" }} 
              className="max-w-5xl w-full flex flex-col items-center"
            >
              <div className="mb-8 relative group">
                <div className="absolute inset-0 bg-[#00B8D4] blur-[40px] opacity-10 rounded-full group-hover:opacity-20 transition-opacity"></div>
                <img src={PANUCCI_LOGO_URL} alt="Aquarismo Panucci" className="w-48 h-48 md:w-64 md:h-64 object-contain relative z-10 drop-shadow-2xl" />
              </div>

              <div className="inline-flex items-center gap-2 text-[#00B8D4] font-sans text-xs uppercase tracking-[0.3em] mb-6 px-4 py-2 bg-[#00B8D4]/10 rounded-full border border-[#00B8D4]/20">
                <Droplets className="w-3 h-3" /> Referência em Aquarismo
              </div>
              
              <h1 className="text-4xl sm:text-6xl md:text-8xl font-heading font-black text-white mb-6 tracking-tight leading-[1] drop-shadow-lg">
                AQUARISMO <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B8D4] to-white">PANUCCI</span>
              </h1>
              
              <h2 className="text-base md:text-xl font-light text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
                Peixes raros, equipamentos premium e paixão por aquarismo. Do tanque dos seus sonhos à espécie que você procura.
              </h2>

              <div className="flex flex-col md:flex-row gap-4">
                <button 
                  onClick={() => onNavigate('/catalog')}
                  className="group bg-[#00B8D4] text-black px-10 py-4 font-black uppercase tracking-widest hover:bg-white transition-all rounded flex items-center gap-3 shadow-[0_0_20px_rgba(0,184,212,0.3)] active:scale-95"
                >
                  Ver Catálogo
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => window.open('https://chat.whatsapp.com/IdUOY2Q7Ct43sukFGmyhvs', '_blank')}
                  className="group bg-transparent border-2 border-[#00B8D4] text-[#00B8D4] px-10 py-4 font-black uppercase tracking-widest hover:bg-[#00B8D4]/10 transition-all rounded flex items-center gap-3 shadow-[0_0_15px_rgba(0,184,212,0.2)] animate-pulse hover:animate-none"
                >
                  Rifas Panucci
                  <ExternalLink className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
        </div>
        <div className="w-full mt-12">
            <MarqueeStrip />
        </div>
      </header>
      <section id="featured" className="py-20 md:py-24 px-4 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
          <div>
             <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-2">Seleção Premium</h2>
             <p className="text-gray-500">Exemplares selecionados a dedo para você</p>
          </div>
          <button onClick={() => onNavigate('/catalog')} className="text-[#00B8D4] hover:text-white flex items-center gap-2 text-sm font-bold uppercase tracking-wider transition-colors">
            Ver Todos <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.length === 0 ? (
             <div className="col-span-full text-center text-gray-600 py-10 italic">Carregando estoque...</div>
          ) : (
            products.slice(0, 3).map(p => (
              <div key={p.id} className="rounded-xl overflow-hidden shadow-2xl border border-[#222] bg-[#0a0a0a]">
                <ArtistCard 
                  artist={{ id: p.id, name: p.name, genre: `R$ ${p.price.toFixed(2)}`, image: p.image, day: p.category, description: p.description }} 
                  onClick={() => onNavigate(`/product/${p.id}`)} 
                  onAddToCart={() => onAddToCart(p)}
                  onShare={() => onNavigate(`/product/${p.id}`)}
                />
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
};

const CatalogView: React.FC<{ products: Product[], onAddToCart: (p: Product) => void, isLoading: boolean, onNavigate: (path: string) => void }> = ({ products, onAddToCart, isLoading, onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todos');
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get('cat');
    if (cat) {
      setCategoryFilter(cat);
    }
  }, [location]);
  
  const ITEMS_PER_PAGE = 12;
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [searchTerm, categoryFilter]);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'Todos' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const currentProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setTimeout(() => {
            setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, filteredProducts.length));
          }, 300);
        }
      },
      { threshold: 0.1 }
    );
    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hasMore, visibleCount, filteredProducts.length]);

  return (
    <main className="pt-20 pb-24 px-4 md:px-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 border-b border-[#222] pb-8">
           <h2 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4">Catálogo Completo</h2>
           <p className="text-gray-400 max-w-xl text-lg">Selecione sua categoria ou busque pelo nome da espécie.</p>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
          <div className="w-full flex flex-col gap-4">
            <div className="relative group w-full">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#00B8D4] transition-colors" />
               <input type="text" placeholder="Buscar espécie (Ex: Tucunaré, Aruanã...)" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-[#111] border border-[#333] rounded-lg py-4 pl-12 pr-6 text-white focus:border-[#00B8D4] focus:outline-none transition-all placeholder-gray-600 shadow-inner" />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
              {['Todos', ...CATEGORIES].map(cat => (
                <button key={cat} onClick={() => setCategoryFilter(cat)} className={`px-5 py-2 rounded-full border text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap flex-shrink-0 ${categoryFilter === cat ? 'bg-[#00B8D4] border-[#00B8D4] text-black' : 'bg-[#111] border-[#333] text-gray-400 hover:border-[#00B8D4] hover:text-[#00B8D4]'}`}>{cat}</button>
              ))}
            </div>
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {currentProducts.map((p) => (
                <div key={p.id} className="rounded-xl overflow-hidden shadow-lg border border-[#222] bg-[#0a0a0a] hover:border-[#00B8D4] transition-all group">
                  <ArtistCard artist={{ id: p.id, name: p.name, genre: `R$ ${p.price.toFixed(2)}`, image: p.image, day: p.category, description: p.description }} onClick={() => onNavigate(`/product/${p.id}`)} onAddToCart={() => onAddToCart(p)} onShare={() => onNavigate(`/product/${p.id}`)} />
                  <div className="p-4 bg-[#0a0a0a]">
                     <p className="text-[10px] text-[#00B8D4] font-bold uppercase tracking-wider mb-1 truncate">{p.category}</p>
                     <h3 className="text-white font-bold truncate mb-2 text-sm md:text-base">{p.name}</h3>
                     <p className="text-gray-400 text-sm font-medium">R$ {p.price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
            {hasMore && (
              <div ref={observerRef} className="mt-16 flex flex-col items-center justify-center gap-4 py-8">
                <div className="flex flex-col items-center">
                   <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#00B8D4] mb-2"></div>
                   <p className="text-xs text-gray-500 uppercase tracking-wider">Carregando mais espécies...</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-32 text-gray-500 flex flex-col items-center">
            {isLoading ? (
               <>
                 <RefreshCw className="w-8 h-8 animate-spin mb-4 text-[#00B8D4]" />
                 <p>Carregando catálogo...</p>
               </>
            ) : (
               <>
                 <Fish className="w-12 h-12 mb-4 opacity-20" />
                 <p>Nenhum item encontrado nesta categoria.</p>
               </>
            )}
          </div>
        )}
      </div>
    </main>
  );
};

// ... ProductDetailView e AdminView (Atualizada abaixo) ...
const ProductDetailView: React.FC<{ products: Product[], onNavigate: (path: string) => void, onAddToCart: (p: Product) => void, onShowToast: (msg: string, type: ToastType) => void }> = ({ products, onNavigate, onAddToCart, onShowToast }) => {
  const { id } = useParams();
  const product = products.find(p => p.id === id);
  if (!product) return <div className="pt-32 text-center">Produto não encontrado.</div>;
  return (
    <main className="pt-24 pb-32 px-4 md:px-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <button onClick={() => onNavigate('/catalog')} className="mb-8 flex items-center gap-2 text-[#00B8D4] uppercase text-xs font-bold tracking-widest hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar ao Catálogo
        </button>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
           <div className="relative aspect-square lg:aspect-[4/3] bg-black rounded-2xl overflow-hidden border border-[#333] shadow-2xl group">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" decoding="async" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-50" />
           </div>
           <div className="flex flex-col text-white">
              <div className="inline-flex items-center gap-2 text-[#00B8D4] font-mono text-xs uppercase tracking-[0.2em] mb-4">
                 <Tag className="w-3 h-3" /> {product.category}
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6 leading-tight text-white">{product.name}</h1>
              <div className="flex items-center gap-6 mb-8 pb-8 border-b border-[#222]">
                 <p className="text-4xl font-bold text-[#00B8D4] drop-shadow-[0_0_15px_rgba(0,184,212,0.3)]">R$ {product.price.toFixed(2)}</p>
                 {product.stock > 0 ? (
                   <span className="px-4 py-2 bg-[#00B8D4]/10 text-[#00B8D4] text-xs font-bold uppercase rounded-full border border-[#00B8D4]/20 flex items-center gap-2"><div className="w-2 h-2 bg-[#00B8D4] rounded-full animate-pulse" /> Disponível</span>
                 ) : (
                   <span className="px-4 py-2 bg-red-900/20 text-red-500 text-xs font-bold uppercase rounded-full border border-red-900/30">Esgotado</span>
                 )}
              </div>
              <div className="mb-10">
                 <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">Ficha Técnica</h3>
                 <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed text-lg whitespace-pre-line"><p>{product.description || "Descrição não disponível."}</p></div>
              </div>
              {(product.size || product.ph) && (
                <div className="grid grid-cols-2 gap-4 mb-10">
                   {product.size && (<div className="p-4 bg-[#111] border border-[#333] rounded-xl flex flex-col"><span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Tamanho</span><span className="text-white font-mono text-lg">{product.size}</span></div>)}
                   {product.ph && (<div className="p-4 bg-[#111] border border-[#333] rounded-xl flex flex-col"><span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">pH Ideal</span><span className="text-white font-mono text-lg">{product.ph}</span></div>)}
                </div>
              )}
              <div className="mt-auto flex flex-col gap-4 fixed bottom-0 left-0 right-0 p-4 bg-[#050505]/90 backdrop-blur-md border-t border-[#333] z-50 md:static md:bg-transparent md:p-0 md:border-0">
                 <button onClick={() => onAddToCart(product)} disabled={product.stock <= 0} className="w-full bg-[#00B8D4] hover:bg-white hover:text-black text-black py-4 md:py-5 rounded-xl font-black uppercase tracking-widest text-lg transition-all shadow-[0_0_30px_rgba(0,184,212,0.3)] hover:shadow-[0_0_50px_rgba(0,184,212,0.6)] transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"><ShoppingBag className="w-6 h-6" /> {product.stock > 0 ? 'Adicionar ao Carrinho' : 'Indisponível'}</button>
                 <button onClick={() => { navigator.clipboard.writeText(product.pixKey || STORE_PIX_KEY); onShowToast('Chave Pix copiada.', 'success'); }} className="w-full bg-[#111] hover:bg-[#222] text-gray-400 hover:text-white py-3 rounded-xl font-bold uppercase tracking-widest transition-all border border-[#333] flex items-center justify-center gap-2 text-sm"><PixIcon className="w-4 h-4" /> Pagamento Direto (Pix)</button>
              </div>
              <div className="h-24 md:hidden" />
           </div>
        </div>
      </div>
    </main>
  );
};

// ... AdminView atualizada com Reset Simplificado ...
const AdminView: React.FC<{ 
    products: Product[], 
    onUpdateProducts: () => void, 
    onShowToast: (msg: string, type: ToastType) => void,
    removeProduct: (id: string) => void,
    removeProducts: (ids: string[]) => void,
    clearAllProducts: () => void
}> = ({ products, onUpdateProducts, onShowToast, removeProduct, removeProducts, clearAllProducts }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  
  const [adminTab, setAdminTab] = useState<'dashboard' | 'list' | 'add' | 'db'>('dashboard');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [categoryFilterAdmin, setCategoryFilterAdmin] = useState('Todos');

  const [migrationProgress, setMigrationProgress] = useState<string>('');

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '', category: 'Jumbos', price: 0, stock: 1, description: '', 
    ph: '', size: '', pixKey: STORE_PIX_KEY, tags: [], collections: []
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [newTag, setNewTag] = useState('');
  
  const [pixKeyError, setPixKeyError] = useState<string>('');
  const [configToken, setConfigToken] = useState('');
  const [configTableId, setConfigTableId] = useState('');
  const [configStatus, setConfigStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    const { token, tableId } = getBaserowConfig();
    setConfigToken(token);
    setConfigTableId(tableId);
  }, []);

  const handleLogin = (e: React.FormEvent) => { 
     e.preventDefault(); 
     if (loginUser === 'jhonathan@panucci.com' && loginPass === 'snakehead2026') { 
        setIsAuthenticated(true); 
        onShowToast('Acesso Admin Concedido', 'success'); 
     } else { 
        onShowToast('Credenciais inválidas.', 'error'); 
     } 
  };

  const resetForm = () => {
    setFormData({ name: '', category: 'Jumbos', price: 0, stock: 1, description: '', ph: '', size: '', pixKey: STORE_PIX_KEY, tags: [], collections: [] });
    setImageFile(null);
    setPreviewImage('');
    setEditingId(null);
    setPixKeyError('');
  };

  const handleEdit = (product: Product) => {
    setFormData(product);
    setPreviewImage(product.image);
    setEditingId(product.id);
    setPixKeyError(''); 
    setAdminTab('add');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este monstro?")) return;
    removeProduct(id);
    onShowToast('Produto removido.', 'success');
    try {
      await deleteBaserowProduct(id);
    } catch (e) {
      console.error("Falha na exclusão remota:", e);
    }
  };

  const handleClearAll = () => {
      // Função depreciada visualmente em favor do Reset Total
      handleFactoryReset();
  };
  
  // NOVA FUNÇÃO DE RESET TOTAL
  const handleFactoryReset = async () => {
    // 1. Confirmação Simples
    if (!window.confirm("ATENÇÃO: Você deseja apagar TODOS os produtos do banco de dados e limpar o site?")) {
        return;
    }
    // 2. Confirmação Dupla
    if (!window.confirm("Tem certeza absoluta? Essa ação não pode ser desfeita.")) {
        return;
    }

    setIsLoadingAction(true);
    setMigrationProgress('Limpando banco de dados remoto...');
    
    // Limpa Remoto
    const remoteResult = await deleteAllRemoteProducts();
    if (!remoteResult.success) {
        onShowToast('Erro ao conectar com Baserow. Verifique se o Token está correto.', 'error');
        setIsLoadingAction(false);
        return;
    }

    setMigrationProgress('Limpando dados locais...');
    
    // Limpa Local (Estado + LocalStorage)
    clearAllProducts();
    
    // NUKE: Limpa todo o LocalStorage para remover configs velhas da Metazoa
    localStorage.clear();
    
    setMigrationProgress('Reiniciando sistema...');
    
    // Força reload
    setTimeout(() => {
        window.location.reload();
    }, 1000);
  };

  // --- MIGRATION LOGIC ---
  const handleMigration = async () => {
    if (!window.confirm("Isso iniciará a migração de toda a lista crua para o Baserow. Continuar?")) return;
    
    setIsLoadingAction(true);
    setMigrationProgress('Iniciando...');

    const lines = RAW_MIGRATION_DATA.split('\n').filter(l => l.trim());
    let currentCategory = 'Variados';
    const itemsToProcess = [];

    // 1. Parsing
    for (const line of lines) {
        if (line.includes('SUBSTRATOS')) {
          currentCategory = 'Substratos';
          continue;
        }
        if (line.includes('LISTA PEIXES')) {
          currentCategory = 'Jumbos'; 
          continue;
        }

        const parts = line.split('-');
        if (parts.length < 2) continue;

        const priceStr = parts[parts.length - 1].trim();
        const namePart = parts.slice(0, parts.length - 1).join('-').trim();

        const priceClean = priceStr.replace(/\./g, '').replace(',', '.');
        const price = parseFloat(priceClean);

        if (isNaN(price)) continue;

        let name = namePart;
        let size = '';

        const sizeMatch = namePart.match(/(\d+[\/\d]*\s*[cC][mM])/i);
        if (sizeMatch) {
            size = sizeMatch[0];
            name = namePart.replace(sizeMatch[0], '').trim();
        }

        name = name.replace(/\(\)/g, '').trim();

        itemsToProcess.push({
            name,
            price,
            size,
            category: currentCategory,
            description: size ? `Tamanho: ${size}` : ''
        });
    }

    // 2. Sending
    let count = 0;
    for (const item of itemsToProcess) {
        count++;
        setMigrationProgress(`Enviando ${count} de ${itemsToProcess.length}: ${item.name}...`);
        
        await saveProductToBaserow({
            name: item.name,
            price: item.price,
            category: item.category as any,
            size: item.size, 
            description: item.description,
            stock: 1,
            pixKey: STORE_PIX_KEY
        });
        
        // Intervalo curto para não sobrecarregar
        await new Promise(r => setTimeout(r, 400)); 
    }

    setMigrationProgress('Concluído!');
    setIsLoadingAction(false);
    onShowToast(`Migração finalizada! ${count} itens enviados.`, 'success');
    onUpdateProducts();
  };

  // --- BULK ACTIONS ---
  const filteredList = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilterAdmin === 'Todos' || p.category === categoryFilterAdmin;
    return matchesSearch && matchesCat;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredList.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Excluir ${selectedIds.length} itens selecionados?`)) return;

    setIsLoadingAction(true);
    const idsToDelete = [...selectedIds];
    removeProducts(idsToDelete);
    setSelectedIds([]);

    await deleteBaserowBatch(idsToDelete);
    
    onShowToast(`${idsToDelete.length} itens removidos.`, 'success');
    setIsLoadingAction(false);
  };

  const validatePixKey = (key: string) => {
    if (!key) return true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const evpRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const digitsOnly = key.replace(/\D/g, '');
    if (emailRegex.test(key)) return true;
    if (evpRegex.test(key)) return true;
    if (digitsOnly.length === 11) return true;
    if (digitsOnly.length === 14) return true;
    if (digitsOnly.length >= 12 && digitsOnly.length <= 14) return true;
    return false;
  };

  const handlePixChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setFormData({ ...formData, pixKey: val });
      if (val && !validatePixKey(val)) {
          setPixKeyError('Formato inválido');
      } else {
          setPixKeyError('');
      }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      onShowToast('Preencha nome e preço.', 'error');
      return;
    }

    setIsLoadingAction(true);
    
    const productToSend = { ...formData, id: editingId || undefined };
    const result = await saveProductToBaserow(productToSend, imageFile || undefined);
    
    if (result.success) {
      onShowToast(editingId ? 'Produto atualizado!' : 'Produto criado!', 'success');
      resetForm();
      onUpdateProducts();
      if (!editingId) setAdminTab('list'); 
    } else {
      onShowToast(result.error || 'Erro ao salvar.', 'error');
    }
    setIsLoadingAction(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleTestConnection = async () => {
    setConfigStatus('idle');
    const success = await testBaserowConnection();
    setConfigStatus(success ? 'success' : 'error');
    if (success) {
      saveBaserowConfig(configToken, configTableId);
      onShowToast('Conexão Baserow OK!', 'success');
      onUpdateProducts();
    } else {
      onShowToast('Falha na conexão. Verifique Token/ID.', 'error');
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData(prev => ({ ...prev, tags: [...(prev.tags || []), newTag.trim()] }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags?.filter(t => t !== tag) }));
  };

  const toggleCollection = (col: string) => {
    const current = formData.collections || [];
    if (current.includes(col)) {
      setFormData(prev => ({ ...prev, collections: current.filter(c => c !== col) }));
    } else {
      setFormData(prev => ({ ...prev, collections: [...current, col] }));
    }
  };

  const totalStockValue = products.reduce((acc, p) => acc + (p.price * (p.stock || 0)), 0);
  const lowStockCount = products.filter(p => p.stock < 5).length;

  if (!isAuthenticated) return (
    <main className="pt-32 pb-24 px-4 min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full bg-[#111] border border-[#333] p-8 rounded-lg shadow-2xl">
        <div className="text-center mb-8">
           <img src={PANUCCI_LOGO_URL} alt="Admin" className="h-24 mx-auto mb-4 object-contain" />
           <h2 className="text-2xl font-heading text-white">Admin Access</h2>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="text" placeholder="Email" value={loginUser} onChange={e => setLoginUser(e.target.value)} className="w-full bg-[#050505] border border-[#333] rounded p-3 text-white focus:border-[#00B8D4] outline-none" />
          <input type="password" placeholder="Senha" value={loginPass} onChange={e => setLoginPass(e.target.value)} className="w-full bg-[#050505] border border-[#333] rounded p-3 text-white focus:border-[#00B8D4] outline-none" />
          <button type="submit" className="w-full bg-[#00B8D4] text-black py-3 rounded font-bold uppercase hover:bg-white transition-colors">Entrar</button>
        </form>
      </div>
    </main>
  );

  return (
    <main className="pt-24 px-4 md:px-6 min-h-screen bg-[#050505] text-gray-200">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8 border-b border-[#222] pb-6">
           <div>
             <h1 className="text-3xl font-heading text-white">Painel <span className="text-[#00B8D4]">Gerencial</span></h1>
             <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">Aquarismo Panucci v2.0</p>
           </div>
           <button onClick={() => setIsAuthenticated(false)} className="bg-[#111] hover:bg-red-900/20 text-gray-400 hover:text-red-500 px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider border border-[#333] transition-colors">Sair</button>
        </div>
        
        <div className="flex gap-2 mb-8 overflow-x-auto scrollbar-hide pb-2">
          {[
            { id: 'dashboard', label: 'Visão Geral', icon: Activity },
            { id: 'list', label: 'Catálogo', icon: List },
            { id: 'add', label: editingId ? 'Editar Item' : 'Novo Item', icon: Plus },
            { id: 'db', label: 'Integração BD', icon: Database },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => { setAdminTab(tab.id as any); if (tab.id === 'add' && !editingId) resetForm(); }}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wider transition-all whitespace-nowrap ${adminTab === tab.id ? 'bg-[#00B8D4] text-black shadow-[0_0_15px_rgba(0,184,212,0.3)]' : 'bg-[#111] text-gray-500 hover:text-white border border-[#222]'}`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        {/* --- CONTEÚDO DAS ABAS --- */}
        {adminTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
             <div className="bg-[#111] p-6 rounded-2xl border border-[#333] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Package className="w-16 h-16 text-[#00B8D4]" /></div>
                <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Total de Itens</h3>
                <p className="text-4xl font-heading text-white">{products.length}</p>
             </div>
             <div className="bg-[#111] p-6 rounded-2xl border border-[#333] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><DollarSign className="w-16 h-16 text-[#00B8D4]" /></div>
                <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Valor em Estoque</h3>
                <p className="text-4xl font-heading text-[#00B8D4]">R$ {totalStockValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
             </div>
             <div className="bg-[#111] p-6 rounded-2xl border border-[#333] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><AlertTriangle className="w-16 h-16 text-red-500" /></div>
                <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Estoque Baixo</h3>
                <p className="text-4xl font-heading text-red-500">{lowStockCount}</p>
             </div>
          </div>
        )}

        {adminTab === 'list' && (
          <div className="bg-[#111] border border-[#333] rounded-2xl overflow-hidden animate-fade-in relative">
             <AnimatePresence>
               {selectedIds.length > 0 && (
                 <motion.div 
                   initial={{ y: -50, opacity: 0 }}
                   animate={{ y: 0, opacity: 1 }}
                   exit={{ y: -50, opacity: 0 }}
                   className="absolute top-0 left-0 right-0 bg-red-900/90 backdrop-blur-md text-white p-4 z-20 flex justify-between items-center border-b border-red-500"
                 >
                    <span className="font-bold uppercase tracking-wider text-sm">{selectedIds.length} itens selecionados</span>
                    <button 
                      onClick={handleBulkDelete}
                      className="bg-white text-red-900 px-4 py-2 rounded font-bold uppercase text-xs hover:bg-gray-200 transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" /> Excluir Selecionados
                    </button>
                 </motion.div>
               )}
             </AnimatePresence>

             <div className="p-4 border-b border-[#222] flex flex-col md:flex-row gap-4 justify-between items-center mt-2">
                <div className="flex gap-4 w-full md:w-auto flex-1">
                    <div className="relative flex-1 md:flex-initial md:w-80">
                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                       <input 
                          type="text" 
                          placeholder="Buscar por nome..." 
                          value={searchTerm}
                          onChange={e => setSearchTerm(e.target.value)}
                          className="w-full bg-[#050505] border border-[#333] rounded pl-10 pr-4 py-2 text-sm text-white focus:border-[#00B8D4] outline-none"
                       />
                    </div>
                    <select 
                        value={categoryFilterAdmin} 
                        onChange={e => setCategoryFilterAdmin(e.target.value)}
                        className="bg-[#050505] border border-[#333] rounded px-4 py-2 text-sm text-white focus:border-[#00B8D4] outline-none"
                    >
                        <option value="Todos">Todas Categorias</option>
                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
                <div className="text-xs text-gray-500 font-bold uppercase whitespace-nowrap">{filteredList.length} Espécies</div>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left text-sm text-gray-400">
                 <thead className="bg-[#0a0a0a] text-xs uppercase font-bold text-gray-500 border-b border-[#222]">
                   <tr>
                     <th className="p-4 w-10">
                        <input 
                          type="checkbox" 
                          onChange={handleSelectAll} 
                          checked={filteredList.length > 0 && selectedIds.length === filteredList.length}
                          className="accent-[#00B8D4] h-4 w-4"
                        />
                     </th>
                     <th className="p-4">Imagem</th>
                     <th className="p-4">Nome</th>
                     <th className="p-4">Categoria</th>
                     <th className="p-4">Preço</th>
                     <th className="p-4">Estoque</th>
                     <th className="p-4 text-right">Ações</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-[#222]">
                   {filteredList.map(product => (
                     <tr key={product.id} className={`hover:bg-[#151515] transition-colors ${selectedIds.includes(product.id) ? 'bg-[#00B8D4]/5' : ''}`}>
                       <td className="p-4">
                          <input 
                            type="checkbox" 
                            checked={selectedIds.includes(product.id)}
                            onChange={() => handleSelect(product.id)}
                            className="accent-[#00B8D4] h-4 w-4"
                          />
                       </td>
                       <td className="p-4">
                         <div className="w-10 h-10 rounded bg-black border border-[#333] overflow-hidden">
                           <img src={product.image || PANUCCI_LOGO_URL} className="w-full h-full object-cover" />
                         </div>
                       </td>
                       <td className="p-4 font-medium text-white">{product.name}</td>
                       <td className="p-4"><span className="px-2 py-1 bg-[#222] rounded text-[10px] uppercase font-bold text-gray-300">{product.category}</span></td>
                       <td className="p-4 text-[#00B8D4] font-bold">R$ {product.price.toFixed(2)}</td>
                       <td className="p-4">
                         <span className={`font-bold ${product.stock < 5 ? 'text-red-500' : 'text-gray-400'}`}>{product.stock}</span>
                       </td>
                       <td className="p-4 text-right space-x-2">
                         <button onClick={() => handleEdit(product)} className="text-[#00B8D4] hover:text-white p-1" title="Editar"><Edit className="w-4 h-4" /></button>
                         <button onClick={() => handleDelete(product.id)} className="text-red-500 hover:text-white p-1" title="Excluir"><Trash2 className="w-4 h-4" /></button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        )}

        {/* ... Aba 'add' mantida ... */}
        {adminTab === 'add' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
             <div className="lg:col-span-2 space-y-6">
                <div className="bg-[#111] p-6 rounded-2xl border border-[#333]">
                   <h3 className="text-white font-bold uppercase tracking-widest text-sm mb-6 border-b border-[#222] pb-2">Informações Básicas</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs text-gray-500 uppercase font-bold mb-1">Nome do Produto</label>
                        <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#050505] border border-[#333] rounded p-3 text-white focus:border-[#00B8D4] outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 uppercase font-bold mb-1">Categoria</label>
                        <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as any})} className="w-full bg-[#050505] border border-[#333] rounded p-3 text-white focus:border-[#00B8D4] outline-none appearance-none">
                          {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                      </div>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-xs text-gray-500 uppercase font-bold mb-1">Preço (R$)</label>
                        <input type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} className="w-full bg-[#050505] border border-[#333] rounded p-3 text-white focus:border-[#00B8D4] outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 uppercase font-bold mb-1">Estoque</label>
                        <input type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})} className="w-full bg-[#050505] border border-[#333] rounded p-3 text-white focus:border-[#00B8D4] outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 uppercase font-bold mb-1">Tamanho/Dimensões</label>
                        <input type="text" placeholder="Ex: 15-20cm" value={formData.size} onChange={e => setFormData({...formData, size: e.target.value})} className="w-full bg-[#050505] border border-[#333] rounded p-3 text-white focus:border-[#00B8D4] outline-none" />
                      </div>
                   </div>
                   <div className="mb-4">
                      <label className="block text-xs text-gray-500 uppercase font-bold mb-1">Descrição Detalhada</label>
                      <textarea rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-[#050505] border border-[#333] rounded p-3 text-white focus:border-[#00B8D4] outline-none resize-none" />
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 uppercase font-bold mb-1">pH Ideal</label>
                        <input type="text" placeholder="Ex: 6.8 - 7.0" value={formData.ph} onChange={e => setFormData({...formData, ph: e.target.value})} className="w-full bg-[#050505] border border-[#333] rounded p-3 text-white focus:border-[#00B8D4] outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 uppercase font-bold mb-1">Chave Pix Específica (Opcional)</label>
                        <input 
                           type="text" 
                           value={formData.pixKey} 
                           onChange={handlePixChange}
                           className={`w-full bg-[#050505] border rounded p-3 text-white focus:outline-none transition-colors ${pixKeyError ? 'border-red-500 focus:border-red-500' : 'border-[#333] focus:border-[#00B8D4]'}`} 
                        />
                      </div>
                   </div>
                </div>

                <div className="bg-[#111] p-6 rounded-2xl border border-[#333]">
                   <h3 className="text-white font-bold uppercase tracking-widest text-sm mb-6 border-b border-[#222] pb-2">Taxonomia & Organização</h3>
                   
                   <div className="mb-6">
                     <label className="block text-xs text-gray-500 uppercase font-bold mb-2">Coleções</label>
                     <div className="flex flex-wrap gap-2">
                       {COLLECTIONS_OPTIONS.map(col => (
                         <button 
                           key={col} 
                           type="button"
                           onClick={() => toggleCollection(col)}
                           className={`px-3 py-1 rounded-full text-xs font-bold uppercase transition-all border ${formData.collections?.includes(col) ? 'bg-[#00B8D4] text-black border-[#00B8D4]' : 'bg-[#050505] text-gray-500 border-[#333] hover:border-[#00B8D4]'}`}
                         >
                           {col}
                         </button>
                       ))}
                     </div>
                   </div>

                   <div>
                     <label className="block text-xs text-gray-500 uppercase font-bold mb-2">Tags</label>
                     <div className="flex gap-2 mb-3">
                       <input 
                         type="text" 
                         placeholder="Nova tag..." 
                         value={newTag} 
                         onChange={e => setNewTag(e.target.value)}
                         onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                         className="flex-1 bg-[#050505] border border-[#333] rounded p-2 text-sm text-white focus:border-[#00B8D4] outline-none" 
                       />
                       <button type="button" onClick={addTag} className="bg-[#222] hover:bg-[#00B8D4] hover:text-black text-white px-4 rounded font-bold text-sm transition-colors">+</button>
                     </div>
                     <div className="flex flex-wrap gap-2">
                       {formData.tags?.map(tag => (
                         <span key={tag} className="px-3 py-1 bg-[#222] rounded-full text-xs text-gray-300 flex items-center gap-2 border border-[#333]">
                           #{tag}
                           <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500"><X className="w-3 h-3"/></button>
                         </span>
                       ))}
                     </div>
                   </div>
                </div>
             </div>

             <div className="space-y-6">
                <div className="bg-[#111] p-6 rounded-2xl border border-[#333]">
                   <h3 className="text-white font-bold uppercase tracking-widest text-sm mb-6 border-b border-[#222] pb-2">Mídia</h3>
                   <div className="aspect-square bg-[#050505] border-2 border-dashed border-[#333] rounded-xl flex flex-col items-center justify-center relative overflow-hidden group hover:border-[#00B8D4] transition-colors">
                      {previewImage ? (
                        <img src={previewImage} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center text-gray-600">
                          <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p className="text-xs uppercase font-bold">Sem Imagem</p>
                        </div>
                      )}
                      <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                         <p className="text-[#00B8D4] font-bold text-sm uppercase">Alterar Imagem</p>
                      </div>
                   </div>
                   <p className="text-[10px] text-gray-500 mt-4 text-center">Clique na área acima para fazer upload. (Max 5MB)</p>
                </div>

                <div className="bg-[#111] p-6 rounded-2xl border border-[#333]">
                   <button 
                     onClick={handleSaveProduct} 
                     disabled={isLoadingAction}
                     className="w-full bg-[#00B8D4] text-black py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mb-3"
                   >
                     {isLoadingAction ? <RefreshCw className="w-5 h-5 animate-spin"/> : <Save className="w-5 h-5" />}
                     {editingId ? 'Atualizar Produto' : 'Criar Produto'}
                   </button>
                   {editingId && (
                     <button onClick={resetForm} className="w-full bg-[#222] text-gray-400 py-3 rounded-xl font-bold uppercase tracking-widest hover:text-white transition-colors">
                       Cancelar
                     </button>
                   )}
                </div>
             </div>
          </div>
        )}

        {/* --- ABA INTEGRAÇÃO BD (Atualizada) --- */}
        {adminTab === 'db' && (
          <div className="max-w-2xl mx-auto bg-[#111] border border-[#333] p-8 rounded-2xl animate-fade-in">
             <div className="flex items-center gap-4 mb-8">
                <Database className="w-8 h-8 text-[#00B8D4]" />
                <div>
                  <h3 className="text-xl font-heading text-white">Configuração Baserow</h3>
                  <p className="text-sm text-gray-500">Conecte sua base de dados para sincronização em tempo real.</p>
                </div>
             </div>

             <div className="space-y-6">
               <div>
                  <label className="block text-xs text-gray-500 uppercase font-bold mb-2">API Token</label>
                  <input type="text" value={configToken} onChange={e => setConfigToken(e.target.value)} className="w-full bg-[#050505] border border-[#333] rounded p-4 text-white focus:border-[#00B8D4] outline-none font-mono text-sm" placeholder="Token..." />
               </div>
               <div>
                  <label className="block text-xs text-gray-500 uppercase font-bold mb-2">Table ID</label>
                  <input type="text" value={configTableId} onChange={e => setConfigTableId(e.target.value)} className="w-full bg-[#050505] border border-[#333] rounded p-4 text-white focus:border-[#00B8D4] outline-none font-mono text-sm" placeholder="ID da Tabela..." />
               </div>
               
               <div className="pt-4 border-t border-[#222] flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <span className={`w-3 h-3 rounded-full ${configStatus === 'success' ? 'bg-[#00B8D4]' : configStatus === 'error' ? 'bg-red-500' : 'bg-gray-600'}`}></span>
                         <span className="text-xs text-gray-400 uppercase font-bold">{configStatus === 'success' ? 'Conectado' : configStatus === 'error' ? 'Erro de Conexão' : 'Não Testado'}</span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={onUpdateProducts} className="bg-[#111] text-gray-400 hover:text-white px-4 py-2 rounded font-bold uppercase tracking-wider text-xs border border-[#333]">
                            Sincronizar Agora
                        </button>
                        <button onClick={handleTestConnection} className="bg-[#00B8D4]/10 text-[#00B8D4] hover:bg-[#00B8D4] hover:text-black px-6 py-2 rounded font-bold uppercase tracking-wider text-sm transition-colors border border-[#00B8D4]/20">
                            Salvar & Testar
                        </button>
                      </div>
                  </div>
                  
                  {configToken && configTableId && (
                    <div className="mt-8 pt-8 border-t border-[#222]">
                        <h4 className="text-white font-bold mb-2 flex items-center gap-2"><UploadCloud className="w-4 h-4"/> Ferramentas de Manutenção</h4>
                        <p className="text-xs text-gray-500 mb-4">Use com cautela. Ações diretas no banco de dados.</p>
                        
                        <div className="space-y-3">
                             {migrationProgress ? (
                                <div className="bg-[#050505] border border-[#333] rounded-lg p-4 text-center">
                                    <div className="animate-spin w-6 h-6 border-2 border-[#00B8D4] border-t-transparent rounded-full mx-auto mb-2"></div>
                                    <p className="text-[#00B8D4] font-mono text-xs">{migrationProgress}</p>
                                </div>
                             ) : (
                                <>
                                    <button 
                                        onClick={handleMigration}
                                        disabled={isLoadingAction}
                                        className="w-full bg-[#111] hover:bg-[#222] text-white border border-[#333] hover:border-[#00B8D4] py-3 rounded-lg font-bold uppercase text-xs tracking-widest transition-all"
                                    >
                                        Enviar Carga Inicial de Produtos
                                    </button>
                                    
                                    <button 
                                        onClick={handleFactoryReset}
                                        disabled={isLoadingAction}
                                        className="w-full bg-red-900 text-white border border-red-500 py-4 rounded-lg font-black uppercase text-sm tracking-widest transition-all flex items-center justify-center gap-2 hover:bg-red-700 shadow-[0_0_15px_rgba(255,0,0,0.4)]"
                                    >
                                        <Skull className="w-5 h-5" /> RESET TOTAL DE FÁBRICA (APAGAR TUDO)
                                    </button>
                                </>
                             )}
                        </div>
                    </div>
                  )}
               </div>
             </div>
          </div>
        )}
      </div>
    </main>
  );
};

const AppContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { products, isLoading, refreshProducts, removeProduct, removeProducts, clearAllProducts } = useProductCache();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Cart state could be more complex, but for now simple array
  const [cart, setCart] = useState<Product[]>([]);

  const showToast = (message: string, type: ToastType) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const addToCart = (product: Product) => {
    setCart(prev => [...prev, product]);
    showToast(`${product.name} adicionado ao carrinho!`, 'success');
  };
  
  const handleNavigate = (path: string) => {
    navigate(path);
    window.scrollTo(0, 0);
  };
  
  // Close sidebar on route change (mobile)
  useEffect(() => {
      setIsSidebarOpen(false);
  }, [location]);

  return (
    <div className="bg-[#050505] min-h-screen text-white font-sans selection:bg-[#00B8D4] selection:text-black">
        <FluidBackground />
        
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        
        {/* Mobile Sidebar Toggle Button - Only visible when sidebar is closed (handled by z-index or conditional) */}
        {/* Sidebar z-index is 50. This button z-index 40. */}
        <button 
             onClick={() => setIsSidebarOpen(true)}
             className="md:hidden fixed top-4 left-4 z-40 bg-black/50 p-2 rounded-lg border border-[#333] backdrop-blur text-white shadow-lg"
        >
             <Menu className="w-6 h-6" />
        </button>

        <div className="md:ml-20 min-h-screen flex flex-col">
            <AnimatePresence>
                {toasts.map(toast => (
                <div key={toast.id} className="fixed top-4 right-4 z-[100] pointer-events-none">
                    <ToastNotification {...toast} onClose={removeToast} />
                </div>
                ))}
            </AnimatePresence>

            <div className="flex-1">
                <Routes>
                    <Route path="/" element={<HomeView products={products} onNavigate={handleNavigate} onAddToCart={addToCart} />} />
                    <Route path="/catalog" element={<CatalogView products={products} onAddToCart={addToCart} isLoading={isLoading} onNavigate={handleNavigate} />} />
                    <Route path="/product/:id" element={<ProductDetailView products={products} onNavigate={handleNavigate} onAddToCart={addToCart} onShowToast={showToast} />} />
                    <Route path="/admin" element={
                        <AdminView 
                            products={products} 
                            onUpdateProducts={() => refreshProducts(true)} 
                            onShowToast={showToast} 
                            removeProduct={removeProduct}
                            removeProducts={removeProducts}
                            clearAllProducts={clearAllProducts}
                        />
                    } />
                    <Route path="*" element={<div className="pt-32 text-center text-gray-500">Página não encontrada.</div>} />
                </Routes>
            </div>

            <Footer />
        </div>
        
        <PWAInstallPrompt />
        <FloatingWhatsApp />

    </div>
  );
};

const App = () => {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
};

export default App;
