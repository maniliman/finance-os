import React, { useState, useMemo, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { 
  Plus, Search, Home, MoreHorizontal, Wallet, Briefcase, 
  Utensils, Lock, ChevronRight, Download, KeyRound, 
  Shield, Eye, EyeOff, X, Calendar, Trash2, TrendingUp, 
  Fingerprint, CreditCard, Activity, ArrowUpRight, ArrowDownLeft
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
  
  const [blurMode, setBlurMode] = useLocalStorage('fos_v3_blur', false);
  const [fidMode, setFidMode] = useLocalStorage('fos_v3_fid', false);
  const [appPin, setAppPin] = useLocalStorage('fos_v3_pin', null);
  
  const [transactions, setTransactions] = useLocalStorage('fos_v3_vault', [
    { id: 1, date: 'Feb 21, 2026', title: 'Executive Dividends', type: 'income', amount: 1250000, flow: 'in', note: 'Q1 Payout' },
    { id: 2, date: 'Feb 20, 2026', title: 'Bespoke Tailoring', type: 'expense', amount: 85000, flow: 'out', note: 'Savile Row' },
    { id: 3, date: 'Feb 19, 2026', title: 'Offshore Trust', type: 'fiduciary', amount: 5000000, flow: 'in', note: 'Cayman Allocation' }
  ]);

  const [isLocked, setIsLocked] = useState(!!appPin);
  const [pinInput, setPinInput] = useState('');
  const [showPinSetup, setShowPinSetup] = useState(false);

  // Math
  const totals = useMemo(() => {
    const calc = (list) => list.reduce((acc, t) => acc + (t.flow === 'in' ? t.amount : -t.amount), 0);
    return {
      personal: calc(transactions.filter(t => t.type !== 'fiduciary')),
      fiduciary: calc(transactions.filter(t => t.type === 'fiduciary'))
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
      title, type, amount, flow, note: 'Direct Entry'
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
          <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em] mt-2">Biometric or PIN Required</p>
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
            <button onClick={() => setPinInput('')} className="flex items-center justify-center text-[#c5a059] font-black text-[10px] uppercase">Clear</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-300 font-sans pb-32 overflow-x-hidden">
      
      {/* --- STATUS BAR & HEADER --- */}
      <header className="px-6 pt-14 pb-6 sticky top-0 z-40 bg-[#05070a]/80 backdrop-blur-2xl border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#c5a059] to-[#ecd4a5] flex items-center justify-center shadow-lg">
            <Wallet className="text-black w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white tracking-tighter uppercase">FinanceOS</h1>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-mint animate-pulse" />
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Vault Encrypted</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setBlurMode(!blurMode)} className="w-10 h-10 rounded-full bg-[#0f1218] border border-[#1e2532] flex items-center justify-center text-slate-400 active:scale-90 transition-all">
            {blurMode ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
          <button className="w-10 h-10 rounded-full bg-[#0f1218] border border-[#1e2532] flex items-center justify-center text-slate-400 active:scale-90 transition-all">
            <Search size={16} />
          </button>
        </div>
      </header>

      {view === 'home' ? (
        <main className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* --- PERSONAL WEALTH CARD --- */}
          <section className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#c5a059]/20 to-transparent blur-3xl opacity-30 -z-10" />
            <div className="bg-[#0f1218] border border-[#1e2532] rounded-[2.5rem] p-8 shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8">
                <TrendingUp className="text-[#c5a059]/20 w-16 h-16 -rotate-12" />
              </div>
              
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-black text-[#c5a059] uppercase tracking-[0.3em] bg-[#c5a059]/10 px-3 py-1 rounded-full border border-[#c5a059]/20">Net Capital</span>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">NGN Vault</span>
              </div>

              <div className="relative">
                <div className="text-5xl font-serif text-white tracking-tighter flex items-baseline gap-1">
                  <span className="text-2xl text-[#c5a059]">₦</span>
                  <Obscure isBlurred={blurMode}>
                    {(totals.personal / 1000000).toFixed(2)}<span className="text-3xl opacity-50">M</span>
                  </Obscure>
                </div>
                <div className="mt-6 flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-mint text-[10px] font-black uppercase tracking-tighter">
                    <ArrowUpRight size={12} /> +12.4% <span className="text-slate-600 font-normal">MTD</span>
                  </div>
                  <div className="w-[1px] h-3 bg-slate-800" />
                  <div className="text-slate-500 text-[10px] font-black uppercase tracking-tighter">
                    Liquid Assets
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* --- FIDUCIARY INDICATOR --- */}
          {fidMode && (
            <div className="bg-[#8b5cf6]/5 border border-[#8b5cf6]/20 rounded-3xl p-6 flex items-center justify-between animate-in slide-in-from-top-2">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#8b5cf6]/10 flex items-center justify-center text-[#8b5cf6]">
                  <Shield size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-[#8b5cf6] uppercase tracking-widest">Fiduciary Holdings</p>
                  <p className="text-xl font-serif text-white tracking-tight mt-0.5">
                    <Obscure isBlurred={blurMode}>₦{(totals.fiduciary / 1000000).toFixed(2)}M</Obscure>
                  </p>
                </div>
              </div>
              <Activity className="text-[#8b5cf6]/30 w-5 h-5 animate-pulse" />
            </div>
          )}

          {/* --- AUDIT TRAIL (TRANSACTIONS) --- */}
          <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Operational Log</h3>
              <button 
                onClick={() => setFidMode(!fidMode)}
                className={`text-[8px] font-black uppercase px-3 py-1.5 rounded-full border transition-all ${fidMode ? 'bg-[#8b5cf6] border-[#8b5cf6] text-white' : 'border-[#1e2532] text-slate-500'}`}
              >
                Fiduciary: {fidMode ? 'Engaged' : 'Hidden'}
              </button>
            </div>

            <div className="space-y-3">
              {sortedTxs.map(tx => (
                <div 
                  key={tx.id} 
                  onClick={() => setActiveTxId(activeTxId === tx.id ? null : tx.id)}
                  className="bg-[#0f1218] border border-[#1e2532] rounded-[2rem] p-5 active:scale-[0.98] transition-all relative overflow-hidden group cursor-pointer"
                >
                  {tx.type === 'fiduciary' && <div className="absolute top-0 right-0 w-1.5 h-full bg-[#8b5cf6]" />}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border border-[#1e2532] ${tx.flow === 'in' ? 'bg-mint/5' : 'bg-rose/5'}`}>
                        {tx.flow === 'in' ? <ArrowDownLeft size={20} className="text-mint" /> : <ArrowUpRight size={20} className="text-rose" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white tracking-tight group-hover:text-[#c5a059] transition-colors">{tx.title}</p>
                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-0.5">{tx.date} • {tx.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-serif font-black ${tx.flow === 'in' ? 'text-mint' : 'text-white opacity-80'}`}>
                        <Obscure isBlurred={blurMode}>
                          {tx.flow === 'in' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                        </Obscure>
                      </p>
                    </div>
                  </div>

                  {activeTxId === tx.id && (
                    <div className="mt-6 pt-5 border-t border-white/5 flex gap-2 animate-in slide-in-from-top-2">
                       <button className="flex-1 h-12 rounded-2xl bg-[#05070a] border border-[#1e2532] flex items-center justify-center gap-2 text-[9px] font-black uppercase text-slate-400">
                          <Download size={12} /> Receipt
                       </button>
                       <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setTransactions(transactions.filter(t => t.id !== tx.id));
                        }}
                        className="flex-1 h-12 rounded-2xl bg-rose/10 border border-rose/20 flex items-center justify-center gap-2 text-[9px] font-black uppercase text-rose"
                       >
                          <Trash2 size={12} /> Purge
                       </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </main>
      ) : (
        /* --- SETTINGS VIEW --- */
        <main className="p-6 space-y-10 animate-in slide-in-from-right duration-500">
          <section className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Security Protocol</h3>
            <div className="bg-[#0f1218] border border-[#1e2532] rounded-[2.5rem] divide-y divide-white/5 overflow-hidden shadow-2xl">
              <div className="p-8 flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-[#c5a059]/10 flex items-center justify-center text-[#c5a059]">
                    <KeyRound size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Startup PIN</p>
                    <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-1">Biometric Bypass Disabled</p>
                  </div>
                </div>
                <button 
                  onClick={() => { if(appPin) setAppPin(null); else setShowPinSetup(true); }}
                  className={`w-12 h-6 rounded-full relative transition-all duration-500 ${appPin ? 'bg-mint' : 'bg-slate-800'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${appPin ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Asset Data</h3>
            <button 
              onClick={() => {
                const data = JSON.stringify({ transactions, totals }, null, 2);
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `FO_VAULT_${Date.now()}.json`;
                link.click();
              }}
              className="w-full p-8 bg-[#0f1218] border border-[#1e2532] rounded-[2.5rem] flex items-center justify-between shadow-2xl active:scale-95 transition-all group"
            >
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-mint/10 flex items-center justify-center text-mint">
                  <Download size={20} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-white">Export Vault JSON</p>
                  <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-1">Local Encrypted Backup</p>
                </div>
              </div>
              <ChevronRight className="text-slate-800 group-hover:text-white transition-colors" />
            </button>
          </section>
        </main>
      )}

      {/* --- OVERLAYS: PIN SETUP & ADD ENTRY --- */}
      {showPinSetup && (
        <div className="fixed inset-0 z-[100] bg-[#05070a]/98 backdrop-blur-3xl flex flex-col items-center justify-center p-8">
           <div className="w-16 h-16 rounded-[1.5rem] bg-[#c5a059] flex items-center justify-center mb-8 shadow-2xl">
              <KeyRound className="text-black" />
           </div>
           <h2 className="text-white font-serif text-2xl mb-12">Set System PIN</h2>
           <input 
            type="password" inputMode="numeric" maxLength="4" autoFocus
            value={pinInput} onChange={(e) => setPinInput(e.target.value)}
            className="bg-[#0f1218] border border-[#1e2532] w-52 h-20 text-center text-4xl font-bold text-white rounded-[2rem] tracking-[0.6em] focus:outline-none focus:border-[#c5a059] mb-12 shadow-2xl" 
           />
           <button 
            onClick={() => { if(pinInput.length === 4) { setAppPin(pinInput); setShowPinSetup(false); setPinInput(''); } }}
            className="bg-[#c5a059] text-black px-12 py-5 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-2xl active:scale-90 transition-all"
           >
              Initialize Vault
           </button>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex items-end justify-center" onClick={() => setShowAddModal(false)}>
           <div className="w-full max-w-md bg-[#05070a] border-t border-[#1e2532] rounded-t-[3.5rem] p-10 pb-20 space-y-10 animate-in slide-in-from-bottom duration-500" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center">
                <h2 className="text-white text-3xl font-serif">Input Capital</h2>
                <button onClick={() => setShowAddModal(false)} className="w-10 h-10 rounded-full bg-[#0f1218] border border-[#1e2532] flex items-center justify-center text-slate-500">
                  <X size={18} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <button onClick={() => createEntry('income', 'in')} className="p-8 bg-[#0f1218] border border-[#1e2532] rounded-[2.5rem] flex flex-col items-center gap-4 active:scale-90 transition-all">
                  <ArrowDownLeft size={24} className="text-mint" />
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Credit</span>
                </button>
                <button onClick={() => createEntry('expense', 'out')} className="p-8 bg-[#0f1218] border border-[#1e2532] rounded-[2.5rem] flex flex-col items-center gap-4 active:scale-90 transition-all">
                  <ArrowUpRight size={24} className="text-rose" />
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Debit</span>
                </button>
              </div>
              <button onClick={() => createEntry('fiduciary', 'in')} className="w-full p-6 bg-[#8b5cf6]/5 border border-[#8b5cf6]/20 rounded-3xl flex items-center justify-center gap-3 active:scale-95 transition-all">
                <Shield size={18} className="text-[#8b5cf6]" />
                <span className="text-[10px] font-black uppercase text-[#8b5cf6] tracking-widest">Managed Entry</span>
              </button>
           </div>
        </div>
      )}

      {/* --- BOTTOM NAVIGATION --- */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-10 py-8 bg-[#05070a]/90 backdrop-blur-3xl border-t border-white/5 flex justify-between items-center z-50">
        <button onClick={() => setView('home')} className={`flex flex-col items-center gap-2 transition-all ${view === 'home' ? 'text-[#c5a059] scale-110' : 'text-slate-700 hover:text-slate-400'}`}>
          <Home size={24} />
          <span className="text-[8px] font-black uppercase tracking-widest">Vault</span>
        </button>
        
        <button onClick={() => setShowAddModal(true)} className="w-16 h-16 rounded-full bg-[#c5a059] flex items-center justify-center text-black shadow-[0_10px_40px_rgba(197,160,89,0.3)] active:scale-90 transition-all -translate-y-8">
          <Plus size={32} strokeWidth={3} />
        </button>
        
        <button onClick={() => setView('menu')} className={`flex flex-col items-center gap-2 transition-all ${view === 'menu' ? 'text-[#c5a059] scale-110' : 'text-slate-700 hover:text-slate-400'}`}>
          <MoreHorizontal size={24} />
          <span className="text-[8px] font-black uppercase tracking-widest">Protocols</span>
        </button>
      </nav>
    </div>
  );
}

// BOOTSTRAP
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode><App /></React.StrictMode>);
