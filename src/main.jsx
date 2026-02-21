import React, { useState, useMemo, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { 
  Plus, Search, Home, MoreHorizontal, Wallet, Briefcase, 
  Utensils, Lock, ChevronRight, Download, KeyRound, 
  Shield, Eye, EyeOff, X, Calendar, Trash2, TrendingUp, 
  Fingerprint, CreditCard, Activity, ArrowUpRight, ArrowDownLeft,
  ShoppingBag, Coffee, Zap, Landmark, PieChart, Layers
} from 'lucide-react';

// --- THEME DEFINITIONS ---
const THEME = {
  bg: '#05070a',         
  surface: '#0f1218',    
  border: '#1e2532',
  gold: '#c5a059',       
  mint: '#10b981',       
  rose: '#ef4444',
  fiduciary: '#8b5cf6',
  textMain: '#ffffff',
  textMuted: '#64748b'
};

// --- DATA PERSISTENCE ---
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) { return initialValue; }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {}
  };
  return [storedValue, setValue];
}

// --- ICON RESOLVER ---
const getIcon = (title, flow) => {
  const t = title.toLowerCase();
  if (t.includes('salary') || t.includes('dividend')) return <Landmark size={20} className="text-[#10b981]" />;
  if (t.includes('shop') || t.includes('store') || t.includes('mall')) return <ShoppingBag size={20} className="text-[#c5a059]" />;
  if (t.includes('food') || t.includes('eat') || t.includes('tailor')) return <Utensils size={20} className="text-[#ef4444]" />;
  if (t.includes('bill') || t.includes('power') || t.includes('sub')) return <Zap size={20} className="text-[#c5a059]" />;
  if (t.includes('trust') || t.includes('fund')) return <Shield size={20} className="text-[#8b5cf6]" />;
  return flow === 'in' ? <ArrowDownLeft size={20} className="text-[#10b981]" /> : <ArrowUpRight size={20} className="text-[#ef4444]" />;
};

// --- UI COMPONENTS ---
const Obscure = ({ children, isBlurred }) => (
  <span className={`transition-all duration-700 ease-in-out ${isBlurred ? 'blur-xl opacity-20 select-none scale-95' : 'blur-0 opacity-100'}`}>
    {children}
  </span>
);

function App() {
  const [view, setView] = useState('home'); 
  const [showAddModal, setShowAddModal] = useState(false); 
  const [activeTxId, setActiveTxId] = useState(null);
  
  const [blurMode, setBlurMode] = useLocalStorage('fos_v4_blur', false);
  const [fidMode, setFidMode] = useLocalStorage('fos_v4_fid', false);
  const [appPin, setAppPin] = useLocalStorage('fos_v4_pin', null);
  
  const [transactions, setTransactions] = useLocalStorage('fos_v4_vault', [
    { id: 1, date: 'Feb 21, 2026', title: 'Executive Dividends', type: 'income', amount: 1250000, flow: 'in', note: 'Q1 Payout' },
    { id: 2, date: 'Feb 20, 2026', title: 'Savile Row Suit', type: 'expense', amount: 85000, flow: 'out', note: 'Bespoke' },
    { id: 3, date: 'Feb 19, 2026', title: 'Offshore Trust', type: 'fiduciary', amount: 5000000, flow: 'in', note: 'Cayman Allocation' }
  ]);

  const [isLocked, setIsLocked] = useState(!!appPin);
  const [pinInput, setPinInput] = useState('');
  const [showPinSetup, setShowPinSetup] = useState(false);

  // Dynamic Math
  const totals = useMemo(() => {
    const calc = (list) => list.reduce((acc, t) => acc + (t.flow === 'in' ? t.amount : -t.amount), 0);
    const personalList = transactions.filter(t => t.type !== 'fiduciary');
    const income = personalList.filter(t => t.flow === 'in').reduce((acc, t) => acc + t.amount, 0);
    const expense = personalList.filter(t => t.flow === 'out').reduce((acc, t) => acc + t.amount, 0);
    
    return {
      personal: calc(personalList),
      fiduciary: calc(transactions.filter(t => t.type === 'fiduciary')),
      margin: income > 0 ? (((income - expense) / income) * 100).toFixed(1) : 0
    };
  }, [transactions]);

  const sortedTxs = useMemo(() => {
    return transactions
      .filter(t => fidMode ? true : t.type !== 'fiduciary')
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, fidMode]);

  const handlePinAction = (n) => {
    if (pinInput.length < 4) {
      const next = pinInput + n;
      setPinInput(next);
      if (next.length === 4) {
        if (next === appPin) {
          setIsLocked(false);
          setPinInput('');
        } else {
          setTimeout(() => setPinInput(''), 300);
        }
      }
    }
  };

  const createEntry = (type, flow) => {
    const title = prompt(`Entry Title:`);
    if (!title) return;
    const val = prompt(`Amount (NGN):`);
    const amount = parseInt(val?.replace(/[^0-9]/g, ''));
    if (!amount) return;

    const entry = {
      id: Date.now(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      title, type, amount, flow, note: 'Direct Vault Entry'
    };
    setTransactions([entry, ...transactions]);
    setShowAddModal(false);
  };

  if (isLocked) {
    return (
      <div className="min-h-screen bg-[#05070a] flex flex-col items-center justify-between py-20 px-10">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-[#c5a059] to-[#8a6d2d] flex items-center justify-center shadow-[0_20px_50px_rgba(197,160,89,0.3)] mb-8">
            <Fingerprint className="text-black w-10 h-10" />
          </div>
          <h2 className="text-white font-serif text-2xl tracking-tight">System Locked</h2>
          <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em] mt-2 italic">Awaiting Authorization</p>
        </div>

        <div className="w-full max-w-xs">
          <div className="flex justify-center gap-5 mb-16">
            {[0,1,2,3].map(i => (
              <div key={i} className={`w-3 h-3 rounded-full border border-slate-800 transition-all duration-300 ${pinInput.length > i ? 'bg-[#c5a059] border-[#c5a059] scale-125 shadow-[0_0_15px_#c5a059]' : ''}`} />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-6">
            {[1,2,3,4,5,6,7,8,9].map(n => (
              <button key={n} onClick={() => handlePinAction(n)} className="w-16 h-16 rounded-2xl bg-[#0f1218] border border-[#1e2532] text-xl font-bold text-white active:bg-[#c5a059] active:text-black transition-all">{n}</button>
            ))}
            <div />
            <button onClick={() => handlePinAction(0)} className="w-16 h-16 rounded-2xl bg-[#0f1218] border border-[#1e2532] text-xl font-bold text-white active:bg-[#c5a059] active:text-black transition-all">0</button>
            <button onClick={() => setPinInput('')} className="flex items-center justify-center text-[#c5a059] font-black text-[10px] uppercase tracking-widest">Clr</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-300 font-sans pb-40 overflow-x-hidden no-scrollbar">
      
      {/* --- STATUS BAR & HEADER --- */}
      <header className="px-6 pt-14 pb-6 sticky top-0 z-40 bg-[#05070a]/80 backdrop-blur-2xl border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#c5a059] to-[#ecd4a5] flex items-center justify-center shadow-lg">
            <Layers className="text-black w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white tracking-tighter uppercase">FinanceOS</h1>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Secured Core</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setBlurMode(!blurMode)} className="w-10 h-10 rounded-full bg-[#0f1218] border border-[#1e2532] flex items-center justify-center text-slate-400 active:scale-90 transition-all">
            {blurMode ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
          <button onClick={() => setView(view === 'home' ? 'menu' : 'home')} className="w-10 h-10 rounded-full bg-[#0f1218] border border-[#1e2532] flex items-center justify-center text-slate-400 active:scale-90 transition-all">
             {view === 'home' ? <MoreHorizontal size={18} /> : <Home size={18} />}
          </button>
        </div>
      </header>

      {view === 'home' ? (
        <main className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* --- PERSONAL WEALTH CARD --- */}
          <section className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#c5a059]/20 to-transparent blur-3xl opacity-30 -z-10" />
            <div className="bg-gradient-to-b from-[#161a22] to-[#0f1218] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <PieChart className="text-[#c5a059] w-24 h-24 -rotate-12" />
              </div>
              
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-black text-[#c5a059] uppercase tracking-[0.3em] bg-[#c5a059]/10 px-3 py-1.5 rounded-full border border-[#c5a059]/20">Liquid Capital</span>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic opacity-50">Vault 001</span>
              </div>

              <div className="relative">
                <div className="text-6xl font-serif text-white tracking-tighter flex items-baseline gap-1">
                  <span className="text-2xl text-[#c5a059] font-sans">₦</span>
                  <Obscure isBlurred={blurMode}>
                    {(totals.personal / 1000000).toFixed(2)}<span className="text-3xl opacity-40 ml-1">M</span>
                  </Obscure>
                </div>
                <div className="mt-8 flex items-center gap-5">
                  <div className="flex items-center gap-1.5 text-[#10b981] text-[10px] font-black uppercase tracking-tighter bg-[#10b981]/10 px-2.5 py-1 rounded-lg">
                    <TrendingUp size={12} /> +{totals.margin}% <span className="opacity-60 ml-1">Yield</span>
                  </div>
                  <div className="w-[1px] h-4 bg-white/10" />
                  <div className="text-slate-400 text-[10px] font-black uppercase tracking-tighter">
                    Managed Portfolio
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* --- FIDUCIARY INDICATOR --- */}
          {fidMode && (
            <div className="bg-[#8b5cf6]/5 border border-[#8b5cf6]/20 rounded-[2rem] p-6 flex items-center justify-between animate-in slide-in-from-top-2">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#8b5cf6]/10 flex items-center justify-center text-[#8b5cf6] shadow-inner">
                  <Shield size={24} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-[#8b5cf6] uppercase tracking-[0.25em]">Fiduciary Holdings</p>
                  <p className="text-2xl font-serif text-white tracking-tight mt-0.5">
                    <Obscure isBlurred={blurMode}>₦{(totals.fiduciary / 1000000).toFixed(2)}M</Obscure>
                  </p>
                </div>
              </div>
              <Activity className="text-[#8b5cf6]/20 w-6 h-6 animate-pulse" />
            </div>
          )}

          {/* --- AUDIT TRAIL (TRANSACTIONS) --- */}
          <section className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Operational Log</h3>
              <button 
                onClick={() => setFidMode(!fidMode)}
                className={`text-[8px] font-black uppercase px-3.5 py-2 rounded-full border transition-all ${fidMode ? 'bg-[#8b5cf6] border-[#8b5cf6] text-white' : 'border-[#1e2532] text-slate-500'}`}
              >
                Fiduciary: {fidMode ? 'Active' : 'Locked'}
              </button>
            </div>

            <div className="space-y-3 pb-10">
              {sortedTxs.map(tx => (
                <div 
                  key={tx.id} 
                  onClick={() => setActiveTxId(activeTxId === tx.id ? null : tx.id)}
                  className="bg-[#0f1218] border border-white/5 rounded-[2.2rem] p-5 active:scale-[0.98] transition-all relative overflow-hidden group cursor-pointer"
                >
                  {tx.type === 'fiduciary' && <div className="absolute top-0 right-0 w-1.5 h-full bg-[#8b5cf6] shadow-[0_0_20px_#8b5cf6]" />}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center border border-white/5 bg-[#05070a] shadow-inner">
                        {getIcon(tx.title, tx.flow)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white tracking-tight group-hover:text-[#c5a059] transition-colors">{tx.title}</p>
                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-1 opacity-60">{tx.date} • {tx.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-serif font-black ${tx.flow === 'in' ? 'text-[#10b981]' : 'text-white'}`}>
                        <Obscure isBlurred={blurMode}>
                          {tx.flow === 'in' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                        </Obscure>
                      </p>
                    </div>
                  </div>

                  {activeTxId === tx.id && (
                    <div className="mt-6 pt-6 border-t border-white/5 flex gap-2 animate-in slide-in-from-top-4">
                       <button className="flex-1 h-14 rounded-[1.2rem] bg-[#05070a] border border-white/5 flex items-center justify-center gap-2 text-[10px] font-black uppercase text-slate-500 hover:text-white transition-all">
                          <CreditCard size={14} /> Receipt
                       </button>
                       <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setTransactions(transactions.filter(t => t.id !== tx.id));
                        }}
                        className="flex-1 h-14 rounded-[1.2rem] bg-rose/10 border border-rose/20 flex items-center justify-center gap-2 text-[10px] font-black uppercase text-rose active:bg-rose active:text-black transition-all"
                       >
                          <Trash2 size={14} /> Purge
                       </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </main>
      ) : (
        /* --- PROTOCOLS (SETTINGS) VIEW --- */
        <main className="p-6 space-y-10 animate-in slide-in-from-right duration-500 pb-20">
          <section className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Security Protocol</h3>
            <div className="bg-[#0f1218] border border-white/5 rounded-[2.5rem] divide-y divide-white/5 overflow-hidden shadow-2xl">
              <div className="p-8 flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-[#c5a059]/10 flex items-center justify-center text-[#c5a059]">
                    <KeyRound size={22} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Startup Vault PIN</p>
                    <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-1">Manual Auth Required</p>
                  </div>
                </div>
                <button 
                  onClick={() => { if(appPin) setAppPin(null); else setShowPinSetup(true); }}
                  className={`w-14 h-7 rounded-full relative transition-all duration-500 ${appPin ? 'bg-[#10b981]' : 'bg-slate-800'}`}
                >
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-xl ${appPin ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Asset Intelligence</h3>
            <div className="space-y-3">
              <button 
                onClick={() => {
                  const data = JSON.stringify({ transactions, totals }, null, 2);
                  const blob = new Blob([data], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `FO_VAULT_BACKUP_${new Date().toISOString().split('T')[0]}.json`;
                  link.click();
                }}
                className="w-full p-8 bg-[#0f1218] border border-white/5 rounded-[2.5rem] flex items-center justify-between shadow-2xl active:scale-95 transition-all group"
              >
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-[#10b981]/10 flex items-center justify-center text-[#10b981]">
                    <Download size={22} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-white">Export Vault JSON</p>
                    <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-1">Full Encrypted Backup</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-slate-800 group-hover:text-white transition-colors" />
              </button>
            </div>
          </section>
        </main>
      )}

      {/* --- OVERLAYS: PIN SETUP & ADD ENTRY --- */}
      {showPinSetup && (
        <div className="fixed inset-0 z-[100] bg-[#05070a]/98 backdrop-blur-3xl flex flex-col items-center justify-center p-8">
           <div className="w-20 h-20 rounded-[1.8rem] bg-gradient-to-br from-[#c5a059] to-[#8a6d2d] flex items-center justify-center mb-10 shadow-[0_0_50px_rgba(197,160,89,0.3)]">
              <KeyRound className="text-black" size={32} />
           </div>
           <h2 className="text-white font-serif text-3xl mb-12 tracking-tight">System PIN</h2>
           <input 
            type="password" inputMode="numeric" maxLength="4" autoFocus
            value={pinInput} onChange={(e) => setPinInput(e.target.value)}
            className="bg-[#0f1218] border border-white/10 w-56 h-24 text-center text-5xl font-bold text-white rounded-[2.5rem] tracking-[0.6em] focus:outline-none focus:border-[#c5a059] mb-12 shadow-2xl transition-all" 
           />
           <button 
            onClick={() => { if(pinInput.length === 4) { setAppPin(pinInput); setShowPinSetup(false); setPinInput(''); } }}
            className="bg-[#c5a059] text-black px-16 py-6 rounded-[1.5rem] font-black uppercase text-[12px] tracking-widest shadow-2xl active:scale-90 transition-all"
           >
              Authorize Vault
           </button>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex items-end justify-center" onClick={() => setShowAddModal(false)}>
           <div className="w-full max-w-md bg-[#05070a] border-t border-white/10 rounded-t-[3.5rem] p-10 pb-24 space-y-10 animate-in slide-in-from-bottom duration-500" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center">
                <h2 className="text-white text-3xl font-serif">Input Capital</h2>
                <button onClick={() => setShowAddModal(false)} className="w-12 h-12 rounded-full bg-[#0f1218] border border-white/5 flex items-center justify-center text-slate-500">
                  <X size={20} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <button onClick={() => createEntry('income', 'in')} className="p-10 bg-[#0f1218] border border-white/5 rounded-[2.5rem] flex flex-col items-center gap-5 active:scale-90 transition-all group">
                  <div className="w-14 h-14 rounded-2xl bg-[#10b981]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ArrowDownLeft size={28} className="text-[#10b981]" />
                  </div>
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Credit</span>
                </button>
                <button onClick={() => createEntry('expense', 'out')} className="p-10 bg-[#0f1218] border border-white/5 rounded-[2.5rem] flex flex-col items-center gap-5 active:scale-90 transition-all group">
                  <div className="w-14 h-14 rounded-2xl bg-[#ef4444]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ArrowUpRight size={28} className="text-[#ef4444]" />
                  </div>
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Debit</span>
                </button>
              </div>
              <button onClick={() => createEntry('fiduciary', 'in')} className="w-full p-7 bg-[#8b5cf6]/5 border border-[#8b5cf6]/20 rounded-[1.8rem] flex items-center justify-center gap-4 active:scale-95 transition-all group">
                <Shield size={20} className="text-[#8b5cf6] group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase text-[#8b5cf6] tracking-[0.2em]">Managed Fiduciary Entry</span>
              </button>
           </div>
        </div>
      )}

      {/* --- BOTTOM NAVIGATION --- */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-10 py-10 bg-[#05070a]/90 backdrop-blur-3xl border-t border-white/5 flex justify-between items-center z-50">
        <button onClick={() => setView('home')} className={`flex flex-col items-center gap-2.5 transition-all ${view === 'home' ? 'text-[#c5a059] scale-110' : 'text-slate-700 hover:text-slate-400'}`}>
          <Home size={26} />
          <span className="text-[9px] font-black uppercase tracking-widest">Vault</span>
        </button>
        
        <button onClick={() => setShowAddModal(true)} className="w-18 h-18 rounded-full bg-gradient-to-br from-[#c5a059] to-[#8a6d2d] flex items-center justify-center text-black shadow-[0_15px_50px_rgba(197,160,89,0.4)] active:scale-90 transition-all -translate-y-10 border-[6px] border-[#05070a]">
          <Plus size={36} strokeWidth={3} />
        </button>
        
        <button onClick={() => setView('menu')} className={`flex flex-col items-center gap-2.5 transition-all ${view === 'menu' ? 'text-[#c5a059] scale-110' : 'text-slate-700 hover:text-slate-400'}`}>
          <PieChart size={26} />
          <span className="text-[9px] font-black uppercase tracking-widest">Stats</span>
        </button>
      </nav>
    </div>
  );
}

// BOOTSTRAP
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode><App /></React.StrictMode>);
