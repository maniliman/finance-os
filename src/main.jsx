import React, { useState, useMemo, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { 
  Plus, Search, Home, MoreHorizontal, Wallet, Briefcase, 
  Utensils, Lock, ChevronRight, Download, KeyRound, 
  Shield, Eye, EyeOff, X, Calendar, Trash2, TrendingUp, 
  Fingerprint, CreditCard, Activity, ArrowUpRight, ArrowDownLeft,
  ShoppingBag, Coffee, Zap, Landmark, PieChart, Layers, Gauge,
  Filter, ChevronDown, BarChart3, Clock
} from 'lucide-react';

// --- CONFIGURATION ---
const THEME = {
  bg: '#05070a',         
  surface: '#0f1218',    
  border: '#1e2532',
  gold: '#c5a059',       
  mint: '#10b981',       
  rose: '#ef4444',
  fiduciary: '#8b5cf6'
};

// --- STORAGE ENGINE ---
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

// --- INTELLIGENCE HELPERS ---
const resolveMeta = (title, flow) => {
  const t = title.toLowerCase();
  if (t.includes('salary') || t.includes('dividend') || t.includes('credit')) return { icon: <Landmark size={20} />, color: THEME.mint, label: 'Capital' };
  if (t.includes('shop') || t.includes('store') || t.includes('mall') || t.includes('suit')) return { icon: <ShoppingBag size={20} />, color: THEME.gold, label: 'Lifestyle' };
  if (t.includes('food') || t.includes('eat') || t.includes('coffee')) return { icon: <Coffee size={20} />, color: THEME.rose, label: 'Subsistence' };
  if (t.includes('bill') || t.includes('power') || t.includes('sub')) return { icon: <Zap size={20} />, color: THEME.gold, label: 'Fixed' };
  if (t.includes('trust') || t.includes('fund') || t.includes('offshore')) return { icon: <Shield size={20} />, color: THEME.fiduciary, label: 'Reserve' };
  return flow === 'in' ? { icon: <ArrowDownLeft size={20} />, color: THEME.mint, label: 'Inflow' } : { icon: <ArrowUpRight size={20} />, color: THEME.rose, label: 'Outflow' };
};

const Obscure = ({ children, isBlurred }) => (
  <span className={`transition-all duration-700 ease-in-out ${isBlurred ? 'blur-xl opacity-20 select-none' : 'blur-0 opacity-100'}`}>
    {children}
  </span>
);

function App() {
  // --- STATE ---
  const [view, setView] = useState('home'); 
  const [showAddModal, setShowAddModal] = useState(false); 
  const [activeTxId, setActiveTxId] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const [blurMode, setBlurMode] = useLocalStorage('fos_v6_blur', false);
  const [fidMode, setFidMode] = useLocalStorage('fos_v6_fid', false);
  const [appPin, setAppPin] = useLocalStorage('fos_v6_pin', null);
  
  const [transactions, setTransactions] = useLocalStorage('fos_v6_vault', [
    { id: 1, date: 'Feb 21, 2026', title: 'Executive Dividends', type: 'income', amount: 1250000, flow: 'in', note: 'Q1' },
    { id: 2, date: 'Feb 20, 2026', title: 'Savile Row Suit', type: 'expense', amount: 85000, flow: 'out', note: 'Tailoring' },
    { id: 3, date: 'Feb 19, 2026', title: 'Offshore Trust', type: 'fiduciary', amount: 5000000, flow: 'in', note: 'Managed fund' }
  ]);

  const [isLocked, setIsLocked] = useState(!!appPin);
  const [pinInput, setPinInput] = useState('');
  const [showPinSetup, setShowPinSetup] = useState(false);

  // --- ANALYTICS ---
  const stats = useMemo(() => {
    const personal = transactions.filter(t => t.type !== 'fiduciary');
    const income = personal.filter(t => t.flow === 'in').reduce((acc, t) => acc + t.amount, 0);
    const expense = personal.filter(t => t.flow === 'out').reduce((acc, t) => acc + t.amount, 0);
    const fiduciary = transactions.filter(t => t.type === 'fiduciary').reduce((acc, t) => acc + (t.flow === 'in' ? t.amount : -t.amount), 0);
    const ratio = income > 0 ? Math.round(((income - expense) / income) * 100) : 0;
    
    return { balance: income - expense, fiduciary, ratio, income, expense };
  }, [transactions]);

  const filteredTxs = useMemo(() => {
    let list = transactions;
    if (!fidMode) list = list.filter(t => t.type !== 'fiduciary');
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(t => t.title.toLowerCase().includes(q) || (t.note && t.note.toLowerCase().includes(q)));
    }
    if (filter !== 'all') list = list.filter(t => t.flow === filter);
    return list.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, fidMode, searchQuery, filter]);

  // --- ACTIONS ---
  const handlePinAction = (n) => {
    if (pinInput.length < 4) {
      const next = pinInput + n;
      setPinInput(next);
      if (next.length === 4) {
        if (next === appPin) { setIsLocked(false); setPinInput(''); }
        else { setTimeout(() => setPinInput(''), 300); }
      }
    }
  };

  const createEntry = (type, flow) => {
    const title = prompt(`Entry Title:`);
    if (!title) return;
    const val = prompt(`Amount:`);
    const amount = parseInt(val?.replace(/[^0-9]/g, ''));
    if (!amount) return;

    const entry = {
      id: Date.now(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      title, type, amount, flow, note: prompt(`Add note (optional):`) || 'Vault Entry'
    };
    setTransactions([entry, ...transactions]);
    setShowAddModal(false);
  };

  if (isLocked) {
    return (
      <div className="min-h-screen bg-[#05070a] flex flex-col items-center justify-between py-24 px-10">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-[2.2rem] bg-[#c5a059] flex items-center justify-center shadow-2xl mb-8">
            <Fingerprint className="text-black w-10 h-10" />
          </div>
          <h2 className="text-white font-serif text-3xl">System Locked</h2>
          <p className="text-slate-500 text-[10px] uppercase tracking-[0.4em] mt-3">Authentication Required</p>
        </div>
        <div className="w-full max-w-xs">
          <div className="flex justify-center gap-6 mb-16">
            {[0,1,2,3].map(i => <div key={i} className={`w-3 h-3 rounded-full border border-slate-800 transition-all ${pinInput.length > i ? 'bg-[#c5a059] border-[#c5a059] scale-125' : ''}`} />)}
          </div>
          <div className="grid grid-cols-3 gap-6">
            {[1,2,3,4,5,6,7,8,9,0].map(n => (
              <button key={n} onClick={() => handlePinAction(n)} className={`w-16 h-16 rounded-2xl bg-[#0f1218] border border-[#1e2532] text-xl font-bold text-white active:bg-[#c5a059] active:text-black ${n === 0 ? 'col-start-2' : ''}`}>{n}</button>
            ))}
            <button onClick={() => setPinInput('')} className="text-[#c5a059] text-[10px] uppercase font-black tracking-widest">Reset</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-300 font-sans pb-44 selection:bg-[#c5a059]/30 no-scrollbar">
      
      {/* --- HEADER --- */}
      <header className="px-6 pt-16 pb-6 sticky top-0 z-50 bg-[#05070a]/90 backdrop-blur-3xl border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#c5a059] to-[#ecd4a5] flex items-center justify-center shadow-2xl"><Layers className="text-black w-5 h-5" /></div>
          <div><h1 className="text-xs font-black text-white tracking-widest uppercase">FinanceOS</h1><span className="text-[7px] text-slate-500 uppercase tracking-widest">V6.0 Premium</span></div>
        </div>
        <div className="flex gap-2.5">
          <button onClick={() => setIsSearching(!isSearching)} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isSearching ? 'bg-[#c5a059] text-black' : 'bg-[#0f1218] border border-[#1e2532] text-slate-400'}`}>
            <Search size={18} />
          </button>
          <button onClick={() => setBlurMode(!blurMode)} className="w-10 h-10 rounded-full bg-[#0f1218] border border-[#1e2532] flex items-center justify-center text-slate-400">
            {blurMode ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
          <button onClick={() => setView(view === 'home' ? 'stats' : 'home')} className="w-10 h-10 rounded-full bg-[#0f1218] border border-[#1e2532] flex items-center justify-center text-slate-400">
             {view === 'home' ? <BarChart3 size={18} /> : <Home size={18} />}
          </button>
        </div>
      </header>

      {/* --- SEARCH BAR (MODAL-LIKE) --- */}
      {isSearching && (
        <div className="px-6 py-4 animate-in slide-in-from-top-4 duration-300 bg-[#0f1218] border-b border-white/5">
           <input autoFocus placeholder="Querying vault..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-transparent text-white text-lg font-serif focus:outline-none placeholder:opacity-20" />
        </div>
      )}

      {view === 'home' ? (
        <main className="p-6 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* --- BALANCE CARD --- */}
          <section className="bg-gradient-to-b from-[#1a1f26] to-[#0f1218] border border-white/10 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden cursor-pointer" onClick={() => setBlurMode(!blurMode)}>
            <div className="flex justify-between items-center mb-8">
               <span className="text-[10px] font-black text-[#c5a059] uppercase tracking-[0.4em]">Personal Vault</span>
               <div className="flex items-center gap-1.5 bg-[#10b981]/10 px-2 py-1 rounded-lg"><TrendingUp size={10} className="text-[#10b981]" /><span className="text-[9px] font-bold text-[#10b981]">{stats.ratio}%</span></div>
            </div>
            <div className="text-6xl font-serif text-white tracking-tighter flex items-baseline gap-2">
              <span className="text-2xl text-[#c5a059] font-sans">₦</span>
              <Obscure isBlurred={blurMode}>{(stats.balance / 1000000).toFixed(2)}<span className="text-3xl opacity-20 ml-1">M</span></Obscure>
            </div>
            <div className="mt-8 flex justify-between items-center border-t border-white/5 pt-6">
               <div><p className="text-[8px] text-slate-500 uppercase font-black tracking-widest">Inflow</p><p className="text-sm font-bold text-[#10b981] mt-1">₦{stats.income.toLocaleString()}</p></div>
               <div className="w-[1px] h-6 bg-white/5" />
               <div><p className="text-[8px] text-slate-500 uppercase font-black tracking-widest">Outflow</p><p className="text-sm font-bold text-[#ef4444] mt-1">₦{stats.expense.toLocaleString()}</p></div>
            </div>
          </section>

          {/* --- FIDUCIARY (CONDITIONAL) --- */}
          {fidMode && (
            <div className="bg-[#8b5cf6]/5 border border-[#8b5cf6]/20 rounded-[2.2rem] p-8 flex items-center justify-between animate-in slide-in-from-top-4 duration-500">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-[#8b5cf6]/10 flex items-center justify-center text-[#8b5cf6]"><Shield size={28} /></div>
                <div>
                  <p className="text-[9px] font-black text-[#8b5cf6] uppercase tracking-[0.3em]">Managed Reserve</p>
                  <p className="text-3xl font-serif text-white mt-1"><Obscure isBlurred={blurMode}>₦{(stats.fiduciary / 1000000).toFixed(2)}M</Obscure></p>
                </div>
              </div>
            </div>
          )}

          {/* --- AUDIT TRAIL --- */}
          <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
               <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Audit Trail</h3>
               <div className="flex gap-2">
                  <button onClick={() => setFilter(filter === 'in' ? 'all' : 'in')} className={`text-[8px] font-black uppercase px-3 py-1.5 rounded-full border transition-all ${filter === 'in' ? 'bg-[#10b981] border-[#10b981] text-white' : 'border-[#1e2532] text-slate-500'}`}>Inflow</button>
                  <button onClick={() => setFilter(filter === 'out' ? 'all' : 'out')} className={`text-[8px] font-black uppercase px-3 py-1.5 rounded-full border transition-all ${filter === 'out' ? 'bg-[#ef4444] border-[#ef4444] text-white' : 'border-[#1e2532] text-slate-500'}`}>Outflow</button>
               </div>
            </div>

            <div className="space-y-4">
              {filteredTxs.map(tx => {
                const meta = resolveMeta(tx.title, tx.flow);
                return (
                  <div key={tx.id} onClick={() => setActiveTxId(activeTxId === tx.id ? null : tx.id)} className="bg-[#0f1218] border border-white/5 rounded-[2.5rem] p-6 active:scale-[0.98] transition-all relative overflow-hidden group cursor-pointer shadow-xl">
                    {tx.type === 'fiduciary' && <div className="absolute top-0 right-0 w-1.5 h-full bg-[#8b5cf6]" />}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center border border-white/5 bg-[#05070a]" style={{ color: meta.color }}>{meta.icon}</div>
                        <div>
                          <p className="text-[15px] font-bold text-white tracking-tight group-hover:text-[#c5a059] transition-colors">{tx.title}</p>
                          <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.15em] mt-1.5">{tx.date} • {meta.label}</p>
                        </div>
                      </div>
                      <p className={`text-sm font-serif font-black ${tx.flow === 'in' ? 'text-[#10b981]' : 'text-white'}`}>
                        <Obscure isBlurred={blurMode}>{tx.flow === 'in' ? '+' : '-'}₦{tx.amount.toLocaleString()}</Obscure>
                      </p>
                    </div>
                    {activeTxId === tx.id && (
                      <div className="mt-8 pt-8 border-t border-white/5 animate-in slide-in-from-top-4">
                         <div className="grid grid-cols-2 gap-3 mb-6">
                            <div className="bg-[#05070a] p-4 rounded-2xl border border-white/5"><p className="text-[8px] text-slate-500 uppercase font-black">Memo</p><p className="text-[10px] text-white mt-1">{tx.note || 'No metadata'}</p></div>
                            <div className="bg-[#05070a] p-4 rounded-2xl border border-white/5"><p className="text-[8px] text-slate-500 uppercase font-black">Auth ID</p><p className="text-[10px] text-white mt-1">#{tx.id.toString().slice(-6)}</p></div>
                         </div>
                         <div className="flex gap-2">
                           <button className="flex-1 h-14 rounded-[1.2rem] bg-white/5 border border-white/5 flex items-center justify-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-white"><CreditCard size={14} /> Receipt</button>
                           <button onClick={(e) => { e.stopPropagation(); setTransactions(transactions.filter(t => t.id !== tx.id)); }} className="flex-1 h-14 rounded-[1.2rem] bg-rose/10 border border-rose/20 flex items-center justify-center gap-2 text-[10px] font-black uppercase text-rose"><Trash2 size={14} /> Delete</button>
                         </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </main>
      ) : (
        /* --- STATS / PROTOCOLS VIEW --- */
        <main className="p-6 space-y-12 animate-in slide-in-from-right duration-500">
           <section className="space-y-5">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Vault Security</h3>
              <div className="bg-[#0f1218] border border-white/5 rounded-[2.5rem] p-8 flex items-center justify-between shadow-2xl">
                 <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-[#c5a059]/10 flex items-center justify-center text-[#c5a059]"><KeyRound size={26} /></div>
                    <div><p className="text-[15px] font-bold text-white">Entry PIN</p><p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-1">Startup Auth Required</p></div>
                 </div>
                 <button onClick={() => { if(appPin) setAppPin(null); else setShowPinSetup(true); }} className={`w-14 h-7 rounded-full relative transition-all duration-500 ${appPin ? 'bg-[#10b981]' : 'bg-slate-800'}`}><div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${appPin ? 'right-1' : 'left-1'}`} /></button>
              </div>
           </section>

           <section className="space-y-5">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Managed Mode</h3>
              <div className="bg-[#0f1218] border border-white/5 rounded-[2.5rem] p-8 flex items-center justify-between shadow-2xl">
                 <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-[#8b5cf6]/10 flex items-center justify-center text-[#8b5cf6]"><Shield size={26} /></div>
                    <div><p className="text-[15px] font-bold text-white">Fiduciary Layer</p><p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-1">Display Shadow Reserves</p></div>
                 </div>
                 <button onClick={() => setFidMode(!fidMode)} className={`w-14 h-7 rounded-full relative transition-all duration-500 ${fidMode ? 'bg-[#8b5cf6]' : 'bg-slate-800'}`}><div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${fidMode ? 'right-1' : 'left-1'}`} /></button>
              </div>
           </section>

           <section className="space-y-5">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Data Backup</h3>
              <button onClick={() => { const data = JSON.stringify(transactions); const blob = new Blob([data], { type: 'application/json' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `VAULT_DUMP.json`; link.click(); }} className="w-full p-9 bg-[#0f1218] border border-white/5 rounded-[2.8rem] flex items-center justify-between shadow-2xl active:scale-95 transition-all group">
                 <div className="flex items-center gap-6"><div className="w-14 h-14 rounded-2xl bg-[#10b981]/10 flex items-center justify-center text-[#10b981]"><Download size={26} /></div><div className="text-left"><p className="text-[15px] font-bold text-white">Export Local Archive</p><p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-1">JSON Protocol</p></div></div>
                 <ChevronRight size={20} className="text-slate-800 group-hover:text-white transition-colors" />
              </button>
           </section>
        </main>
      )}

      {/* --- OVERLAYS --- */}
      {showPinSetup && (
        <div className="fixed inset-0 z-[100] bg-[#05070a]/98 backdrop-blur-3xl flex flex-col items-center justify-center p-8">
           <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-[#c5a059] to-[#8a6d2d] flex items-center justify-center mb-10 shadow-2xl"><KeyRound className="text-black" size={32} /></div>
           <h2 className="text-white font-serif text-3xl mb-12">New System PIN</h2>
           <input type="password" inputMode="numeric" maxLength="4" autoFocus value={pinInput} onChange={(e) => setPinInput(e.target.value)} className="bg-[#0f1218] border border-white/10 w-60 h-24 text-center text-5xl font-bold text-white rounded-[2.5rem] tracking-[0.5em] focus:outline-none focus:border-[#c5a059] mb-14 shadow-2xl transition-all" />
           <button onClick={() => { if(pinInput.length === 4) { setAppPin(pinInput); setShowPinSetup(false); setPinInput(''); } }} className="bg-[#c5a059] text-black px-16 py-6 rounded-[1.8rem] font-black uppercase text-[12px] tracking-widest shadow-2xl active:scale-90 transition-all">Enable Protection</button>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex items-end justify-center" onClick={() => setShowAddModal(false)}>
           <div className="w-full max-w-md bg-[#05070a] border-t border-white/10 rounded-t-[4rem] p-12 pb-24 space-y-12 animate-in slide-in-from-bottom duration-700" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center"><h2 className="text-white text-4xl font-serif">Input Capital</h2><button onClick={() => setShowAddModal(false)} className="w-12 h-12 rounded-full bg-[#0f1218] flex items-center justify-center text-slate-500"><X size={20} /></button></div>
              <div className="grid grid-cols-2 gap-6">
                <button onClick={() => createEntry('income', 'in')} className="p-10 bg-[#0f1218] border border-white/5 rounded-[2.5rem] flex flex-col items-center gap-5 active:scale-90 transition-all group">
                  <div className="w-16 h-16 rounded-2xl bg-[#10b981]/10 flex items-center justify-center group-hover:scale-110 transition-transform"><ArrowDownLeft size={32} className="text-[#10b981]" /></div>
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Inflow</span>
                </button>
                <button onClick={() => createEntry('expense', 'out')} className="p-10 bg-[#0f1218] border border-white/5 rounded-[2.5rem] flex flex-col items-center gap-5 active:scale-90 transition-all group">
                  <div className="w-16 h-16 rounded-2xl bg-[#ef4444]/10 flex items-center justify-center group-hover:scale-110 transition-transform"><ArrowUpRight size={32} className="text-[#ef4444]" /></div>
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Outflow</span>
                </button>
              </div>
              <button onClick={() => createEntry('fiduciary', 'in')} className="w-full p-8 bg-[#8b5cf6]/5 border border-[#8b5cf6]/20 rounded-[2rem] flex items-center justify-center gap-5 active:scale-95 transition-all group">
                <Shield size={22} className="text-[#8b5cf6]" /><span className="text-[10px] font-black uppercase text-[#8b5cf6] tracking-[0.25em]">Managed Fiduciary Entry</span>
              </button>
           </div>
        </div>
      )}

      {/* --- NAVIGATION --- */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-12 py-12 bg-[#05070a]/90 backdrop-blur-3xl border-t border-white/5 flex justify-between items-center z-50">
        <button onClick={() => setView('home')} className={`flex flex-col items-center gap-3 transition-all ${view === 'home' ? 'text-[#c5a059] scale-110' : 'text-slate-700 hover:text-slate-400'}`}>
          <Home size={28} />
          <span className="text-[9px] font-black uppercase tracking-widest">Vault</span>
        </button>
        <button onClick={() => setShowAddModal(true)} className="w-20 h-20 rounded-full bg-gradient-to-br from-[#c5a059] to-[#8a6d2d] flex items-center justify-center text-black shadow-[0_15px_60px_rgba(197,160,89,0.5)] active:scale-90 transition-all -translate-y-10 border-[8px] border-[#05070a]"><Plus size={40} strokeWidth={3} /></button>
        <button onClick={() => setView('menu')} className={`flex flex-col items-center gap-3 transition-all ${view === 'menu' ? 'text-[#c5a059] scale-110' : 'text-slate-700 hover:text-slate-400'}`}>
          <Gauge size={28} />
          <span className="text-[9px] font-black uppercase tracking-widest">Protocol</span>
        </button>
      </nav>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode><App /></React.StrictMode>);
