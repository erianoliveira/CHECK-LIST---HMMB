import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  Users, 
  FileText, 
  LifeBuoy, 
  Maximize2, 
  Search, 
  Save, 
  Smartphone, 
  ShieldCheck,
  Zap,
  X,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const features: Feature[] = [
  {
    title: "Checklist Inteligente",
    description: "Organização completa por setores: Assistenciais, Diagnóstico, Apoio e Administrativos.",
    icon: <CheckCircle2 className="w-8 h-8" />,
    color: "bg-emerald-500"
  },
  {
    title: "Gestão de Equipes",
    description: "Alternância rápida entre equipes de Infraestrutura e Sistemas para foco total.",
    icon: <Users className="w-8 h-8" />,
    color: "bg-blue-500"
  },
  {
    title: "Relatórios PDF",
    description: "Gere relatórios profissionais com logomarca, estatísticas e detalhes de cada setor.",
    icon: <FileText className="w-8 h-8" />,
    color: "bg-orange-500"
  },
  {
    title: "Help Desk Integrado",
    description: "Acesso direto ao sistema de chamados para reportar problemas complexos instantaneamente.",
    icon: <LifeBuoy className="w-8 h-8" />,
    color: "bg-red-500"
  },
  {
    title: "Acessibilidade Móvel",
    description: "Controle de zoom flutuante que pode ser movido para qualquer lugar da tela.",
    icon: <Maximize2 className="w-8 h-8" />,
    color: "bg-purple-500"
  },
  {
    title: "Busca Instantânea",
    description: "Encontre qualquer setor ou categoria em segundos com o filtro de busca inteligente.",
    icon: <Search className="w-8 h-8" />,
    color: "bg-slate-500"
  },
  {
    title: "Persistência de Dados",
    description: "Seu progresso é salvo automaticamente no navegador. Nunca perca uma ronda.",
    icon: <Save className="w-8 h-8" />,
    color: "bg-indigo-500"
  },
  {
    title: "Interface Responsiva",
    description: "Design otimizado para tablets e smartphones, ideal para uso em movimento.",
    icon: <Smartphone className="w-8 h-8" />,
    color: "bg-pink-500"
  },
  {
    title: "Segurança & Validação",
    description: "Trava de segurança: setores com problemas relatados não podem ser marcados como OK.",
    icon: <ShieldCheck className="w-8 h-8" />,
    color: "bg-amber-500"
  },
  {
    title: "Feedback Sonoro",
    description: "Confirmações auditivas para cada ação, garantindo que o registro foi computado.",
    icon: <Zap className="w-8 h-8" />,
    color: "bg-yellow-500"
  }
];

interface ShowcaseProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Showcase({ isOpen, onClose }: ShowcaseProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const next = () => setCurrentIndex((prev) => (prev + 1) % features.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + features.length) % features.length);

  const playTestSound = (type: 'ok' | 'issue') => {
    const soundUrl = type === 'ok' 
      ? 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg?hl=pt-br' 
      : 'https://assets.mixkit.co/sfx/preview/mixkit-negative-answer-740.mp3';
    const audio = new Audio(soundUrl);
    audio.preload = 'auto';
    audio.volume = 0.5;
    audio.play().catch((err) => {
      console.warn(`Erro ao reproduzir som de teste: ${err.message}`);
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-8"
        >
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors"
          >
            <X className="w-8 h-8" />
          </button>

          <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left Side: Visual Showcase */}
            <div className="relative aspect-square md:aspect-auto md:h-[500px] flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ scale: 0.8, opacity: 0, rotateY: -20 }}
                  animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                  exit={{ scale: 1.2, opacity: 0, rotateY: 20 }}
                  transition={{ type: "spring", damping: 20, stiffness: 100 }}
                  className="w-64 h-64 md:w-80 md:h-80 rounded-[40px] bg-white border-2 border-slate-100 shadow-2xl flex items-center justify-center text-[#F27D26] relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-[#F27D26]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <motion.div
                    animate={{ 
                      y: [0, -10, 0],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 4, 
                      repeat: Infinity,
                      ease: "easeInOut" 
                    }}
                  >
                    {React.cloneElement(features[currentIndex].icon as React.ReactElement, { className: "w-32 h-32 md:w-40 md:h-40" })}
                  </motion.div>
                  
                  {/* Decorative Elements */}
                  <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#F27D26]/10 rounded-full blur-3xl" />
                  <div className="absolute -top-10 -left-10 w-32 h-32 bg-slate-100 rounded-full blur-3xl" />
                </motion.div>
              </AnimatePresence>

              {/* Navigation Dots */}
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex gap-2">
                {features.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-1.5 rounded-full transition-all ${idx === currentIndex ? 'w-8 bg-[#F27D26]' : 'w-2 bg-slate-200'}`}
                  />
                ))}
              </div>
            </div>

            {/* Right Side: Content */}
            <div className="text-slate-900 space-y-6">
              <motion.div
                key={`text-${currentIndex}`}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="space-y-4"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F27D26]/10 text-[#F27D26] text-[10px] font-black uppercase tracking-[0.2em]">
                  Recurso {currentIndex + 1} de {features.length}
                </div>
                <h2 className="text-4xl md:text-6xl font-black leading-tight tracking-tighter italic text-slate-800">
                  {features[currentIndex].title}
                </h2>
                <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed max-w-md">
                  {features[currentIndex].description}
                </p>

                {features[currentIndex].title === "Feedback Sonoro" && (
                  <div className="flex gap-3 pt-4">
                    <button 
                      onClick={() => playTestSound('ok')}
                      className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-black uppercase tracking-widest border border-emerald-100 hover:bg-emerald-100 transition-colors"
                    >
                      Testar OK
                    </button>
                    <button 
                      onClick={() => playTestSound('issue')}
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-black uppercase tracking-widest border border-red-100 hover:bg-red-100 transition-colors"
                    >
                      Testar Erro
                    </button>
                  </div>
                )}
              </motion.div>

              <div className="flex gap-4 pt-8">
                <button 
                  onClick={prev}
                  className="w-14 h-14 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button 
                  onClick={next}
                  className="flex-1 h-14 rounded-full bg-[#F27D26] text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-[#d66a1e] transition-colors shadow-lg shadow-orange-200"
                >
                  Próximo Recurso <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Background Text Decor */}
          <div className="absolute bottom-0 left-0 w-full overflow-hidden pointer-events-none opacity-[0.03] select-none">
            <div className="text-[20vw] font-black whitespace-nowrap leading-none -mb-8 tracking-tighter italic text-slate-900">
              HMMB TI SYSTEM • HMMB TI SYSTEM • HMMB TI SYSTEM
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
