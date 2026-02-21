import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Eye, EyeOff, Plus, Search, Trash2, Shield, ShoppingBag, 
  Utensils, Coffee, Landmark, ArrowUpRight, ArrowDownLeft, 
  Settings, Download, Lock, Check, X, ChevronRight,
  TrendingUp, Wallet, Briefcase, FileText
} from 'lucide-react';

// --- CONFIGURATION & THEME ---
const COLORS = {
  black: '#05070a',
  surface: '#0f1218',
  gold: '#c5a059',
  fiduciary: '#8b5cf6',
  textMuted: '#94a3b8',
  textMain: '#f8fafc'
};

const APP_ID = 'finance-os-v65';

// --- UTILS ---
const formatCurrency = (val) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0
  }).format(val);
};

const generateAuthorityId = () => {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};

const initialAddState = {
  type: 'outflow',
  title: '',
  amount: 1000,
  category: 'Other',
  memo: '',
  isFiduciary: false
};

// --- COMPONENTS ---

const SlideToConfirm = ({ onConfirm, label = "Slide to Confirm", color = COLORS.gold }) => {
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const threshold = 0.8;

  const handleStart = (e) => {
    const x = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    setStartX(x);
    setIsDragging(true);
  };

  const handleMove = (e) => {
    if (!isDragging) return;
    const x = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    const diff = x - startX;
    const width = containerRef.current.offsetWidth - 60;
    setCurrentX(Math.max(0, Math.min(diff, width)));
  };

  const handleEnd = () => {
    const width = containerRef.current.offsetWidth - 60;
    if (currentX > width * threshold) {
      onConfirm();
    }
    setCurrentX(0);
    setIsDragging(false);
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-14 rounded-full overflow-hidden flex items-center justify-center border border-white/10"
      style={{ backgroundColor: `${COLORS.surface}` }}
      onMouseMove={handleMove}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
    >
      <span className="text-xs font-semibold tracking-widest opacity-40 uppercase select-none">
        {label}
      </span>
      <div 
        className="absolute left-1 h-12 w-12 rounded-full flex items-center justify-center shadow-lg cursor-grab active:cursor-grabbing transition-transform duration-75"
        style={{ 
          backgroundColor: color, 
          transform: `translateX(${currentX}px)`,
          boxShadow: `0 0 15px ${color}44`
        }}
        onMouseDown={handleStart}
        onTouchStart={handleStart}
      >
        <ChevronRight size={20} color="#000" />
      </div>
    </div>
  );
};

const QuantumSlider = ({ value, onChange }) => {
  const minPos = 0;
  const maxPos = 1000;
  const minVal = Math.log(1000);
  const maxVal = Math.log(10000000);
  const scale = (maxVal - minVal) / (maxPos - minPos);

  const posToVal = (pos) => Math.round(Math.exp(minVal + scale * (pos - minPos)));
  const valToPos = (val) => (Math.log(val || 1000) - minVal) / scale + minPos;

  const [sliderPos, setSliderPos] = useState(valToPos(value));

  const handleChange = (e) => {
    const pos = parseInt(e.target.value);
    setSliderPos(pos);
    onChange(posToVal(pos));
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between items-baseline">
        <span className="text-xs font-medium uppercase tracking-tighter opacity-50">Quantum Input</span>
        <span className="text-2xl font-serif" style={{ color: COLORS.gold }}>
          {formatCurrency(value)}
        </span>
      </div>
      <div className="relative h-2 w-full">
        <input 
          type="range"
          min={minPos}
          max={maxPos}
          value={sliderPos}
          onChange={handleChange}
          className="absolute inset-0 w-full h-2 appearance-none bg-white/5 rounded-full outline-none cursor-pointer overflow-hidden"
        />
        <div 
          className="absolute top-0 left-0 h-2 rounded-full pointer-events-none transition-all"
          style={{ 
            width: `${(sliderPos / maxPos) * 100}%`, 
            backgroundColor: COLORS.gold,
            boxShadow: `0 0 10px ${COLORS.gold}88`
          }}
        />
      </div>
    </div>
  );
};

// --- MAIN APPLICATION ---

export default function App() {
  const [isLocked, setIsLocked] = useState(true);
  const [pin, setPin] = useState("");
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);
  const [isFiduciaryGhosted, setIsFiduciaryGhosted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState('all'); 
  const [showAddModal, setShowAddModal] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [addData, setAddData] = useState(initialAddState);

  // Global Styling Injection
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      input[type=range]::-webkit-slider-thumb {
        appearance: none;
        height: 24px;
        width: 24px;
        border-radius: 50%;
        background: #c5a059;
        cursor: pointer;
        border: 4px solid #05070a;
        box-shadow: 0 0 10px rgba(197, 160, 89, 0.5);
        z-index: 10;
        position: relative;
      }
      @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,600;1,400&family=Inter:wght@400;600;800&display=swap');
      body { font-family: 'Inter', sans-serif; background-color: #05070a; margin: 0; color: #f8fafc; }
      .font-serif { font-family: 'EB Garamond', serif; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Persistence
  useEffect(() => {
    try {
      const saved = localStorage.getItem(APP_ID);
      if (saved) setTransactions(JSON.parse(saved));
    } catch (e) {
      console.warn("Storage access restricted or corrupted.");
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(APP_ID, JSON.stringify(transactions));
    } catch (e) {
      // Silent fail for storage restrictions
    }
  }, [transactions]);

  // Auth Logic
  const handlePinInput = (num) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin === "1234") { 
        setTimeout(() => setIsLocked(false), 200);
      } else if (newPin.length === 4) {
        setTimeout(() => setPin(""), 500);
      }
    }
  };

  // Financial Calculations
  const totals = useMemo(() => {
    return transactions.reduce((acc, curr) => {
      if (isFiduciaryGhosted && curr.isFiduciary) return acc;
      
      if (curr.type === 'inflow') {
        acc.balance += curr.amount;
        acc.inflow += curr.amount;
      } else {
        acc.balance -= curr.amount;
        acc.outflow += curr.amount;
      }
      return acc;
    }, { balance: 0, inflow: 0, outflow: 0 });
  }, [transactions, isFiduciaryGhosted]);

  const liquidityRatio = totals.inflow > 0 ? (totals.outflow / totals.inflow) * 100 : 0;
  
  const getPortfolioStatus = (ratio) => {
    if (ratio < 30) return { label: "Elite", color: COLORS.gold };
    if (ratio < 60) return { label: "Stable", color: "#10b981" };
    return { label: "Aggressive", color: "#ef4444" };
  };

  const portfolio = getPortfolioStatus(liquidityRatio);

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         t.memo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || t.type === filterType;
    return matchesSearch && matchesFilter;
  }).sort((a, b) => b.timestamp - a.timestamp);

  const addTransaction = (data) => {
    const newTx = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      authorityId: generateAuthorityId(),
      timestamp: Date.now()
    };
    setTransactions([newTx, ...transactions]);
    setShowAddModal(false);
    setAddData(initialAddState);
  };

  const deleteTransaction = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
    setExpandedId(null);
  };

  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(transactions));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `finance_os_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  if (isLocked) {
    return (
      <div className="fixed inset-0 bg-[#05070a] text-white flex flex-col items-center justify-center p-8 select-none z-[100]">
        <div className="mb-12 text-center">
          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-2xl">
            <Lock size={28} className="text-[#c5a059]" />
          </div>
          <h1 className="text-xl font-serif tracking-widest uppercase text-[#f8fafc]">FinanceOS</h1>
          <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-widest">Executive Blueprint V6.5</p>
        </div>

        <div className="flex gap-4 mb-12">
          {[0, 1, 2, 3].map(i => (
            <div 
              key={i} 
              className={`w-3 h-3 rounded-full border border-[#c5a059] transition-all duration-300 ${pin.length > i ? 'bg-[#c5a059] shadow-[0_0_10px_#c5a059]' : 'bg-transparent'}`}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6 max-w-xs w-full">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, "delete"].map((val, i) => (
            <button
              key={i}
              onClick={() => val === "delete" ? setPin(pin.slice(0, -1)) : (val !== "" && handlePinInput(val))}
              className="h-16 w-16 rounded-full flex items-center justify-center text-xl font-medium active:scale-90 active:bg-white/10 transition-all border border-transparent active:border-white/10"
            >
              {val === "delete" ? <X size={20} /> : val}
            </button>
          ))}
        </div>
        <p className="mt-12 text-[10px] text-white/20 uppercase tracking-[0.2em]">Default Terminal PIN: 1234</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070a] text-[#f8fafc] font-sans overflow-x-hidden pb-24">
      <header className="sticky top-0 z-40 bg-[#05070a]/80 backdrop-blur-xl border-b border-white/5 p-4 md:px-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xs font-semibold tracking-[0.3em] uppercase opacity-40">Blueprint V6.5</h2>
            <h1 className="text-lg font-serif italic text-[#c5a059]">Executive Terminal</h1>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsPrivacyMode(!isPrivacyMode)}
              className="p-2 rounded-full bg-white/5 border border-white/10 active:scale-90 transition-transform"
            >
              {isPrivacyMode ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            <button 
              onClick={exportData}
              className="p-2 rounded-full bg-white/5 border border-white/10 active:scale-90 transition-transform"
            >
              <Download size={20} />
            </button>
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" size={16} />
          <input 
            type="text"
            placeholder="Query Operational Log..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#c5a059]/50 transition-colors"
          />
        </div>
      </header>

      <main className="p-4 md:p-8 space-y-6">
        <section className={`relative overflow-hidden rounded-3xl p-6 border border-white/10 bg-[#0f1218] transition-all duration-700 ${isPrivacyMode ? 'blur-md grayscale' : ''}`}>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50 flex items-center gap-2">
                <Shield size={12} /> Personal Net Worth
              </span>
              <div className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10" style={{ color: portfolio.color }}>
                {portfolio.label}
              </div>
            </div>
            
            <h3 className="text-4xl font-serif mb-2 tracking-tight">
              {formatCurrency(totals.balance)}
            </h3>

            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                <div className="text-[9px] uppercase tracking-widest opacity-40 mb-1">Liquidity Ratio</div>
                <div className="text-lg font-serif text-[#c5a059]">{liquidityRatio.toFixed(1)}%</div>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                <div className="text-[9px] uppercase tracking-widest opacity-40 mb-1">Total Assets</div>
                <div className="text-lg font-serif">{transactions.length} Units</div>
              </div>
            </div>
          </div>
          <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-[#c5a059]/5 rounded-full blur-[80px]" />
        </section>

        <button 
          onClick={() => setIsFiduciaryGhosted(!isFiduciaryGhosted)}
          className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-all duration-300 active:scale-[0.98] ${isFiduciaryGhosted ? 'bg-white/5 border-white/10' : 'bg-[#8b5cf6]/10 border-[#8b5cf6]/30 shadow-[0_0_20px_#8b5cf622]'}`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isFiduciaryGhosted ? 'bg-white/10' : 'bg-[#8b5cf6] text-white'}`}>
              <Briefcase size={18} />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold uppercase tracking-wider">Fiduciary Shadow Layer</div>
              <div className="text-[10px] opacity-50">{isFiduciaryGhosted ? 'Ghosted from net worth' : 'Active and aggregated'}</div>
            </div>
          </div>
          <div className={`w-10 h-5 rounded-full relative transition-colors ${isFiduciaryGhosted ? 'bg-white/20' : 'bg-[#8b5cf6]'}`}>
             <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isFiduciaryGhosted ? 'left-1' : 'left-6'}`} />
          </div>
        </button>

        <div className="flex gap-2">
          {['all', 'inflow', 'outflow'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-full border transition-all active:scale-95 ${filterType === type ? 'bg-[#c5a059] text-black border-[#c5a059]' : 'bg-white/5 border-white/10 opacity-60'}`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">Operational Log</h4>
            <span className="text-[10px] font-mono opacity-20">{filteredTransactions.length} ENTRIES</span>
          </div>

          {filteredTransactions.map(tx => (
            <div 
              key={tx.id}
              onClick={() => setExpandedId(expandedId === tx.id ? null : tx.id)}
              className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${expandedId === tx.id ? 'bg-[#0f1218] border-white/20 p-5' : 'bg-[#0f1218]/50 border-white/5 p-4 active:scale-[0.98]'}`}
              style={tx.isFiduciary && !isFiduciaryGhosted ? { boxShadow: `inset 0 0 15px #8b5cf622`, borderColor: '#8b5cf633' } : {}}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center border border-white/5 ${tx.type === 'inflow' ? 'bg-[#10b981]/10 text-[#10b981]' : 'bg-[#ef4444]/10 text-[#ef4444]'}`}>
                    {tx.category === 'Landmark' && <Landmark size={20} />}
                    {tx.category === 'Lifestyle' && <ShoppingBag size={20} />}
                    {tx.category === 'Dining' && <Utensils size={20} />}
                    {tx.category === 'Fiduciary' && <Shield size={20} />}
                    {tx.category === 'Other' && (tx.type === 'inflow' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />)}
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold tracking-wide">{tx.title}</h5>
                    <p className="text-[10px] opacity-40 uppercase tracking-tighter">{new Date(tx.timestamp).toLocaleDateString()} • {tx.category}</p>
                  </div>
                </div>
                <div className={`text-right font-serif ${isPrivacyMode ? 'blur-sm' : ''} ${tx.type === 'inflow' ? 'text-[#10b981]' : 'text-[#f8fafc]'}`}>
                  <span className="text-xs mr-1 opacity-50">{tx.type === 'inflow' ? '+' : '-'}</span>
                  {formatCurrency(tx.amount)}
                </div>
              </div>

              {expandedId === tx.id && (
                <div className="mt-6 pt-6 border-t border-white/5 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <span className="text-[9px] uppercase tracking-widest opacity-40 block mb-1">Authority ID</span>
                      <span className="text-xs font-mono tracking-widest text-[#c5a059]">{tx.authorityId}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-widest opacity-40 block mb-1">Status</span>
                      <span className={`text-[9px] uppercase font-bold tracking-widest flex items-center gap-1 ${tx.type === 'inflow' ? 'text-[#10b981]' : 'text-slate-400'}`}>
                        <Check size={10} /> Verified
                      </span>
                    </div>
                  </div>
                  <div className="mb-8">
                    <span className="text-[9px] uppercase tracking-widest opacity-40 block mb-1">Executive Memo</span>
                    <p className="text-sm italic opacity-80 leading-relaxed text-slate-300">"{tx.memo || 'No situational notes provided.'}"</p>
                  </div>
                  
                  <SlideToConfirm 
                    label="Slide to Purge Entry" 
                    color="#ef4444" 
                    onConfirm={() => deleteTransaction(tx.id)} 
                  />
                </div>
              )}
            </div>
          ))}

          {filteredTransactions.length === 0 && (
            <div className="py-20 text-center opacity-20 flex flex-col items-center">
              <FileText size={48} strokeWidth={1} className="mb-4" />
              <p className="text-xs uppercase tracking-[0.2em]">Log is currently sterile</p>
            </div>
          )}
        </div>
      </main>

      <button 
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-8 right-8 h-16 w-16 rounded-full bg-[#c5a059] text-black shadow-[0_10px_30px_#c5a05944] flex items-center justify-center active:scale-90 transition-all z-50"
      >
        <Plus size={32} />
      </button>

      {showAddModal && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative w-full max-w-lg bg-[#0f1218] border border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-500">
            <div className="p-8 pb-4 flex justify-between items-center">
              <h3 className="text-xl font-serif">New Asset Entry</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 opacity-50 text-white"><X /></button>
            </div>

            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
              <div className="flex p-1 bg-white/5 rounded-2xl">
                {['inflow', 'outflow'].map(type => (
                  <button 
                    key={type}
                    onClick={() => setAddData({...addData, type})}
                    className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${addData.type === type ? 'bg-white/10 text-[#c5a059]' : 'opacity-40'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Entry Label</label>
                <input 
                  autoFocus
                  className="w-full bg-transparent border-b border-white/10 py-2 text-xl outline-none focus:border-[#c5a059] transition-colors text-white"
                  placeholder="e.g. Dividend Distribution"
                  value={addData.title}
                  onChange={e => setAddData({...addData, title: e.target.value})}
                />
              </div>

              <QuantumSlider 
                value={addData.amount} 
                onChange={val => setAddData({...addData, amount: val})} 
              />

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Categorization</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Landmark', 'Lifestyle', 'Dining', 'Fiduciary', 'Other'].map(cat => (
                    <button 
                      key={cat}
                      onClick={() => setAddData({...addData, category: cat, isFiduciary: cat === 'Fiduciary'})}
                      className={`py-3 px-4 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all ${addData.category === cat ? 'bg-[#c5a059]/10 border-[#c5a059] text-[#c5a059]' : 'bg-white/5 border-white/5 opacity-50'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Executive Memo</label>
                <textarea 
                  className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-sm outline-none focus:border-[#c5a059]/30 min-h-[100px] text-white"
                  placeholder="Optional situational context..."
                  value={addData.memo}
                  onChange={e => setAddData({...addData, memo: e.target.value})}
                />
              </div>

              <button 
                disabled={!addData.title || addData.amount <= 0}
                onClick={() => addTransaction(addData)}
                className="w-full py-5 bg-[#c5a059] text-black font-bold uppercase tracking-[0.2em] rounded-2xl shadow-[0_10px_30px_#c5a05922] active:scale-95 transition-all disabled:opacity-20"
              >
                Authorize Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
