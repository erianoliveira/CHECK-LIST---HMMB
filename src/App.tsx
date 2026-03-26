/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  AlertCircle, 
  ClipboardCheck, 
  Stethoscope, 
  TestTube2, 
  Pill, 
  Building2, 
  Truck, 
  Search,
  RotateCcw,
  ChevronRight,
  MessageSquare,
  Save,
  FileText,
  Users,
  Wrench,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Logo URL provided by user
const HOSPITAL_LOGO_URL = 'https://i.ibb.co/v6drnf84/logo.png';

const TECHNICIANS = ['ERIAN', 'DAVI', 'YURI', 'ANY INDRIELLY'];

const SOUNDS = {
  ok: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  issue: 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3'
};

const COMMON_ISSUES = [
  {
    category: '🖥️ Infraestrutura',
    issues: ['Queda ou lentidão da rede/internet', 'Wi-Fi instável']
  },
  {
    category: '💻 Sistemas',
    issues: ['Sistema fora do ar ou lento', 'Erros de acesso/login']
  },
  {
    category: '🖨️ Equipamentos',
    issues: ['Impressoras com falha', 'Limpar cabeçote', 'Abastecer com tinta', 'Computadores travando']
  },
  {
    category: '🔐 Segurança',
    issues: ['Senhas compartilhadas', 'Vírus ou falta de backup']
  },
  {
    category: '👨‍⚕️ Usuários',
    issues: ['Falta de treinamento', 'Chamados repetitivos']
  },
  {
    category: '📞 Telefone',
    issues: ['Telefone mudo / sem sinal', 'Problemas no ramal']
  }
];

// Types
type SectorStatus = 'pending' | 'ok' | 'issue';

interface Sector {
  id: string;
  name: string;
  status: SectorStatus;
  notes: string;
}

interface Category {
  id: string;
  title: string;
  iconId: string;
  sectors: Sector[];
}

const ICON_MAP: Record<string, React.ReactNode> = {
  stethoscope: <Stethoscope className="w-5 h-5" />,
  testTube: <TestTube2 className="w-5 h-5" />,
  pill: <Pill className="w-5 h-5" />,
  building: <Building2 className="w-5 h-5" />,
  truck: <Truck className="w-5 h-5" />,
};

const INITIAL_DATA: Category[] = [
  {
    id: 'assistenciais',
    title: 'Assistenciais',
    iconId: 'stethoscope',
    sectors: [
      { id: 'triagem', name: 'Triagem', status: 'pending', notes: '' },
      { id: 'consultorios', name: 'Consultórios Médicos', status: 'pending', notes: '' },
      { id: 'ambulatorio', name: 'Ambulatório', status: 'pending', notes: '' },
      { id: 'centro-cirurgico', name: 'Centro Cirúrgico', status: 'pending', notes: '' },
      { id: 'centro-obstetrico', name: 'Centro Obstétrico', status: 'pending', notes: '' },
      { id: 'regulacao', name: 'Regulação (NIR)', status: 'pending', notes: '' },
    ]
  },
  {
    id: 'diagnostico',
    title: 'Diagnóstico e Exames',
    iconId: 'testTube',
    sectors: [
      { id: 'laboratorio', name: 'Laboratório de Análises Clínicas', status: 'pending', notes: '' },
      { id: 'raio-x', name: 'Raio-X', status: 'pending', notes: '' },
      { id: 'ecg', name: 'Eletrocardiograma (ECG)', status: 'pending', notes: '' },
    ]
  },
  {
    id: 'apoio-assistencial',
    title: 'Apoio Assistencial',
    iconId: 'pill',
    sectors: [
      { id: 'farmacia', name: 'Farmácia Satélite', status: 'pending', notes: '' },
      { id: 'nutricao', name: 'Nutrição', status: 'pending', notes: '' },
      { id: 'psicologia', name: 'Psicologia', status: 'pending', notes: '' },
      { id: 'servico-social', name: 'Serviço Social', status: 'pending', notes: '' },
    ]
  },
  {
    id: 'administrativos',
    title: 'Administrativos',
    iconId: 'building',
    sectors: [
      { id: 'administracao', name: 'Administração', status: 'pending', notes: '' },
      { id: 'diretoria', name: 'Diretoria', status: 'pending', notes: '' },
      { id: 'coord-enfermagem', name: 'Coordenação de Enfermagem', status: 'pending', notes: '' },
      { id: 'faturamento', name: 'Faturamento', status: 'pending', notes: '' },
      { id: 'almoxarifado', name: 'Almoxarifado', status: 'pending', notes: '' },
    ]
  },
  {
    id: 'logistica',
    title: 'Logística e Apoio Externo',
    iconId: 'truck',
    sectors: [
      { id: 'transporte', name: 'Central de Transporte', status: 'pending', notes: '' },
    ]
  }
];

export default function App() {
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('hospital-ti-checklist');
    if (!saved) return INITIAL_DATA;
    
    try {
      const parsed = JSON.parse(saved);
      // Simple migration: if the first category doesn't have iconId, it's the old format
      if (parsed.length > 0 && !parsed[0].iconId) {
        return INITIAL_DATA;
      }
      return parsed;
    } catch (e) {
      return INITIAL_DATA;
    }
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState<{catId: string, sectorId: string} | null>(null);
  const [selectedTechs, setSelectedTechs] = useState<string[]>([]);
  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem('hospital-ti-fontsize');
    return saved ? parseInt(saved) : 100;
  });

  useEffect(() => {
    localStorage.setItem('hospital-ti-checklist', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('hospital-ti-fontsize', fontSize.toString());
    document.documentElement.style.fontSize = `${fontSize}%`;
  }, [fontSize]);

  const updateStatus = (catId: string, sectorId: string, status: SectorStatus) => {
    // Logic: OK status only if no notes/problems
    let finalStatus = status;
    
    if (status === 'ok') {
      const category = categories.find(c => c.id === catId);
      const sector = category?.sectors.find(s => s.id === sectorId);
      if (sector && sector.notes.trim() !== '') {
        finalStatus = 'pending';
        alert('Não é possível marcar como OK se houver problemas relatados. Limpe as notas primeiro.');
      }
    }

    if (finalStatus !== 'pending') {
      const audio = new Audio(finalStatus === 'ok' ? SOUNDS.ok : SOUNDS.issue);
      audio.play().catch(() => {
        // Ignore errors if browser blocks autoplay
      });
    }
    setCategories(prev => prev.map(cat => {
      if (cat.id !== catId) return cat;
      return {
        ...cat,
        sectors: cat.sectors.map(s => s.id === sectorId ? { ...s, status: finalStatus } : s)
      };
    }));
  };

  const updateNotes = (catId: string, sectorId: string, notes: string) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id !== catId) return cat;
      return {
        ...cat,
        sectors: cat.sectors.map(s => s.id === sectorId ? { ...s, notes } : s)
      };
    }));
  };

  const resetChecklist = () => {
    if (confirm('Deseja realmente resetar todo o checklist?')) {
      setCategories(INITIAL_DATA);
    }
  };

  const generatePDF = async () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    try {
      // Add Logo
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = HOSPITAL_LOGO_URL;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      
      // Calculate logo size (maintaining aspect ratio)
      const logoWidth = 50;
      const logoHeight = (img.height * logoWidth) / img.width;
      doc.addImage(img, 'PNG', 15, 10, logoWidth, logoHeight);
      
      // Header Info
      doc.setFontSize(18);
      doc.setTextColor(30, 41, 59); // slate-800
      doc.text('Relatório de Checklist TI', pageWidth - 15, 20, { align: 'right' });
      
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth - 15, 28, { align: 'right' });
      doc.text(`Hora: ${new Date().toLocaleTimeString('pt-BR')}`, pageWidth - 15, 33, { align: 'right' });
      
      if (selectedTechs.length > 0) {
        doc.setFontSize(9);
        doc.text(`Técnicos: ${selectedTechs.join(', ')}`, pageWidth - 15, 38, { align: 'right' });
      }
      
      // Summary Stats
      const statsY = Math.max(logoHeight + 20, 45);
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.line(15, statsY, pageWidth - 15, statsY);
      
      doc.setFontSize(12);
      doc.setTextColor(30, 41, 59);
      const total = categories.reduce((acc, cat) => acc + cat.sectors.length, 0);
      const ok = categories.reduce((acc, cat) => acc + cat.sectors.filter(s => s.status === 'ok').length, 0);
      const issues = categories.reduce((acc, cat) => acc + cat.sectors.filter(s => s.status === 'issue').length, 0);
      const pending = categories.reduce((acc, cat) => acc + cat.sectors.filter(s => s.status === 'pending').length, 0);
      
      doc.text(`Resumo: ${ok} OK | ${issues} Problemas | ${pending} Pendentes (Total: ${total})`, 15, statsY + 10);

      // Table Data
      const tableData: any[] = [];
      categories.forEach(cat => {
        cat.sectors.forEach(s => {
          tableData.push([
            cat.title,
            s.name,
            s.status === 'ok' ? 'OK' : s.status === 'issue' ? 'PROBLEMA' : 'PENDENTE',
            s.notes || '-'
          ]);
        });
      });

      autoTable(doc, {
        startY: statsY + 15,
        head: [['Categoria', 'Setor', 'Status', 'Observações']],
        body: tableData,
        headStyles: { fillColor: [37, 99, 235] }, // blue-600
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          2: { fontStyle: 'bold' }
        },
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index === 2) {
            if (data.cell.text[0] === 'PROBLEMA') {
              data.cell.styles.textColor = [217, 119, 6]; // amber-600
            } else if (data.cell.text[0] === 'OK') {
              data.cell.styles.textColor = [22, 163, 74]; // green-600
            }
          }
        }
      });

      doc.save(`checklist-ti-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao carregar o logo ou gerar o PDF. Verifique sua conexão.');
    }
  };

  const totalSectors = categories.reduce((acc, cat) => acc + cat.sectors.length, 0);
  const completedSectors = categories.reduce((acc, cat) => 
    acc + cat.sectors.filter(s => s.status !== 'pending').length, 0
  );
  const progress = (completedSectors / totalSectors) * 100;

  const filteredCategories = categories.map(cat => ({
    ...cat,
    sectors: cat.sectors.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(cat => cat.sectors.length > 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <img 
                src={HOSPITAL_LOGO_URL} 
                alt="Logo HMMB" 
                className="h-10 sm:h-12 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
              <div className="h-8 w-px bg-slate-200 hidden sm:block" />
              <div>
                <h1 className="text-base sm:text-2xl font-black tracking-tighter text-[#F27D26] leading-none">Checklist - TI - HMMB</h1>
                <p className="text-[6px] sm:text-[10px] text-slate-500 font-bold uppercase tracking-[0.1em] sm:tracking-[0.2em] mt-1 border-l-2 border-[#F27D26] pl-2 whitespace-nowrap sm:max-w-none overflow-hidden text-ellipsis">
                  <span className="hidden sm:inline">HMMB - </span>HOSPITAL MUNICIPAL MONSENHOR BERENGUER
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={resetChecklist}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                title="Resetar Checklist"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-4">
            {/* Technician Selection */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#F27D26]" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Técnicos na Ronda</span>
                </div>
                <a 
                  href="https://hmmb.vercel.app/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-[#F27D26] text-white px-2 py-1.5 rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-[#d66a1e] transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                  title="Abrir Chamado (Help Desk)"
                >
                  <Wrench className="w-3 h-3" />
                  <span>Abrir Chamado</span>
                </a>
              </div>
              <div className="flex flex-wrap gap-2">
                {TECHNICIANS.map(tech => (
                  <button
                    key={tech}
                    onClick={() => {
                      setSelectedTechs(prev => 
                        prev.includes(tech) ? prev.filter(t => t !== tech) : [...prev, tech]
                      );
                    }}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${
                      selectedTechs.includes(tech)
                        ? 'bg-[#F27D26] text-white border-[#F27D26] shadow-sm'
                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {tech}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-600">
              <span>Progresso da Ronda</span>
              <span>{completedSectors} de {totalSectors} setores</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-[#F27D26]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 pb-24">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar setor no HMMB..." 
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F27D26]/20 focus:border-[#F27D26] transition-all text-sm shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Categories & Sectors */}
        <div className="space-y-8">
          {filteredCategories.map((category) => (
            <section key={category.id} className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <span className="text-[#F27D26]">{ICON_MAP[category.iconId]}</span>
                <h2 className="text-xs font-black uppercase tracking-[0.15em] text-slate-400">{category.title}</h2>
              </div>
              
              <div className="grid gap-2">
                {category.sectors.map((sector) => (
                  <div 
                    key={sector.id}
                    className={`group bg-white border rounded-xl transition-all duration-200 ${
                      selectedSector?.sectorId === sector.id 
                        ? 'border-[#F27D26] ring-4 ring-[#F27D26]/5 shadow-sm' 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center p-3 gap-3">
                      <button 
                        onClick={() => updateStatus(category.id, sector.id, sector.status === 'ok' ? 'pending' : 'ok')}
                        className={`flex-shrink-0 transition-colors ${
                          sector.status === 'ok' ? 'text-green-500' : 'text-slate-300 hover:text-slate-400'
                        }`}
                      >
                        {sector.status === 'ok' ? <CheckCircle2 className="w-7 h-7" /> : <Circle className="w-7 h-7" />}
                      </button>

                      <div 
                        className="flex-grow cursor-pointer"
                        onClick={() => setSelectedSector(selectedSector?.sectorId === sector.id ? null : { catId: category.id, sectorId: sector.id })}
                      >
                        <h3 className={`text-sm font-bold ${sector.status === 'ok' ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                          {sector.name}
                        </h3>
                        {sector.notes && (
                          <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1 font-medium">
                            <MessageSquare className="w-3 h-3" /> {sector.notes}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => updateStatus(category.id, sector.id, sector.status === 'issue' ? 'pending' : 'issue')}
                          className={`p-2 rounded-lg transition-colors ${
                            sector.status === 'issue' ? 'bg-red-50 text-red-600' : 'text-slate-300 hover:bg-slate-50 hover:text-slate-400'
                          }`}
                          title="Reportar Problema"
                        >
                          <AlertCircle className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => setSelectedSector(selectedSector?.sectorId === sector.id ? null : { catId: category.id, sectorId: sector.id })}
                          className={`p-2 rounded-lg transition-colors ${
                            selectedSector?.sectorId === sector.id ? 'bg-slate-100 text-slate-600' : 'text-slate-300 hover:bg-slate-50 hover:text-slate-400'
                          }`}
                        >
                          <ChevronRight className={`w-5 h-5 transition-transform ${selectedSector?.sectorId === sector.id ? 'rotate-90' : ''}`} />
                        </button>
                      </div>
                    </div>

                    <AnimatePresence>
                      {selectedSector?.sectorId === sector.id && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden border-t border-slate-100 bg-slate-50/50"
                        >
                          <div className="p-4 space-y-4">
                            <div className="space-y-3">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Problemas Comuns</label>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {COMMON_ISSUES.map((group) => (
                                  <div key={group.category} className="space-y-1.5">
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{group.category}</p>
                                    <div className="flex flex-wrap gap-1.5">
                                      {group.issues.map((issue) => (
                                        <button
                                          key={issue}
                                          onClick={() => {
                                            const currentNotes = sector.notes.trim();
                                            const newNote = currentNotes ? `${currentNotes}\n- ${issue}` : `- ${issue}`;
                                            updateNotes(category.id, sector.id, newNote);
                                            updateStatus(category.id, sector.id, 'issue');
                                          }}
                                          className="px-2 py-1 bg-white border border-slate-200 rounded text-[10px] text-slate-600 hover:border-[#F27D26] hover:text-[#F27D26] transition-colors text-left"
                                        >
                                          {issue}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Relato Técnico / Outros</label>
                              <textarea 
                                className="w-full p-3 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F27D26]/20 focus:border-[#F27D26] min-h-[100px] resize-none shadow-inner"
                                placeholder="Descreva outros problemas ou detalhes adicionais..."
                                value={sector.notes}
                                onChange={(e) => updateNotes(category.id, sector.id, e.target.value)}
                              />
                            </div>
                            
                            <div className="flex justify-end">
                              <button 
                                onClick={() => setSelectedSector(null)}
                                className="flex items-center gap-2 px-4 py-2 bg-[#F27D26] text-white text-[11px] font-black uppercase tracking-widest rounded-lg hover:bg-[#d66a1e] transition-colors shadow-sm"
                              >
                                <Save className="w-3.5 h-3.5" /> Salvar Notas
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-slate-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Search className="w-6 h-6" />
            </div>
            <p className="text-slate-500 text-sm">Nenhum setor encontrado para "{searchTerm}"</p>
          </div>
        )}
      </main>

      {/* Floating Accessibility Control */}
      <div className="fixed bottom-24 left-4 z-50 flex flex-col gap-2">
        <div className="bg-white/90 backdrop-blur-md border border-slate-200 rounded-2xl p-1.5 shadow-xl flex flex-col items-center gap-1">
          <button 
            onClick={() => setFontSize(prev => Math.min(200, prev + 15))}
            className="w-12 h-12 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-xl transition-all active:scale-90"
            title="Aumentar Zoom"
          >
            <ZoomIn className="w-6 h-6" />
          </button>
          <div className="w-8 h-px bg-slate-100" />
          <button 
            onClick={() => setFontSize(prev => Math.max(80, prev - 15))}
            className="w-12 h-12 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-xl transition-all active:scale-90"
            title="Diminuir Zoom"
          >
            <ZoomOut className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Summary Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-2xl z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">OK</p>
              <p className="text-xl font-black text-green-600 leading-tight">{categories.reduce((acc, cat) => acc + cat.sectors.filter(s => s.status === 'ok').length, 0)}</p>
            </div>
            <div className="text-center">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ERROS</p>
              <p className="text-xl font-black text-red-600 leading-tight">{categories.reduce((acc, cat) => acc + cat.sectors.filter(s => s.status === 'issue').length, 0)}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => {
                const report = categories.map(cat => {
                  const checkedSectors = cat.sectors.filter(s => s.status !== 'pending');
                  if (checkedSectors.length === 0) return null;
                  
                  return `*${cat.title}*\n${checkedSectors.map(s => {
                    const statusEmoji = s.status === 'ok' ? '✅' : '⚠️';
                    const statusText = s.status === 'ok' ? 'OK' : 'PROBLEMA';
                    const notesText = s.notes ? ` - 📝 ${s.notes}` : '';
                    return `${statusEmoji} ${s.name}: ${statusText}${notesText}`;
                  }).join('\n')}`;
                }).filter(Boolean).join('\n\n');
                
                if (!report) {
                  alert('Nenhum setor foi verificado ainda.');
                  return;
                }
                
                const techsText = selectedTechs.length > 0 ? `*Técnicos:* ${selectedTechs.join(', ')}\n` : '';
                const text = `📋 *Relatório TI HMMB - ${new Date().toLocaleDateString()}*\n${techsText}\n${report}`;
                navigator.clipboard.writeText(text);
                alert('Relatório completo copiado para a área de transferência!');
              }}
              className="bg-slate-100 text-slate-700 px-3 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center gap-2 active:scale-95"
              title="Copiar Texto"
            >
              <MessageSquare className="w-4 h-4" />
            </button>

            <button 
              onClick={generatePDF}
              className="bg-[#F27D26] text-white px-4 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-[#d66a1e] transition-all flex items-center gap-2 shadow-lg active:scale-95"
            >
              <FileText className="w-4 h-4" /> Gerar Relatório
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
