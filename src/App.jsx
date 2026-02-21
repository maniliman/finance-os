import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, Search, Home, MoreHorizontal, 
  Wallet, PieChart, Briefcase, Utensils, ChevronDown, Shield, RefreshCw, BarChart2, BookOpen, Camera, Lock,
  ChevronRight, ChevronLeft, ArrowLeftRight, X, ChevronUp, User, Target, ArrowDownRight, ArrowUpRight, Filter, Calculator, Edit2, Trash2, Download, Upload, AlertTriangle, KeyRound, Moon, Sun
} from 'lucide-react';

// --- Local Storage Engine ---
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
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

const COLORS = {
  bg: '#05070a',         
  surface: '#11151f',    
  surfaceLight: '#1a202c',
  border: '#1e2532',
  gold: '#c5a059',       
  mint: '#00c896',       
  rose: '#991b1b',       
  fiduciary: '#8b5cf6',  
};

const INITIAL_TRANSACTIONS = [
  { id: 1, date: 'Feb 21, 2026', title: 'Medical Fund Deposit', type: 'fiduciary', amount: 250000, category: 'Trustee', currency: 'NGN', note: 'Q1 allocation received', contributor: 'Sarah', purpose: 'Family Medical Fund', flow: 'in' },
  { id: 2, date: 'Feb 21, 2026', title: 'Monthly Salary', type: 'income', amount: 450000, category: 'Salary', meta: 'GTBank credit', currency: 'NGN', note: 'Net salary after tax' },
  { id: 3, date: 'Feb 20, 2026', title: 'Freelance - UK Client', type: 'income', amount: 350, category: 'Freelance', meta: 'Website redesign', currency: 'GBP', fx: '≈ ₦672,100', note: 'Project milestone 3' },
  { id: 4, date: 'Feb 20, 2026', title: 'Dinner with John', type: 'expense', amount: 45000, category: 'Food', meta: 'RSVP Restaurant', currency: 'NGN', note: 'Split the bill' },
  { id: 5, date: 'Feb 18, 2026', title: 'Tuition Payment', type: 'fiduciary', amount: 150000, category: 'Trustee', currency: 'NGN', note: 'Paid directly to school', contributor: 'Michael', purpose: 'Education Trust', flow: 'out' },
  { id: 6, date: 'Feb 15, 2026', title: 'Loan to John', type: 'debt', subtype: 'debtor', amount: 500000, category: 'Personal', meta: 'Owed to me', currency: 'NGN', note: 'To be repaid in April' },
];

export default function App() {
  const [view, setView] = useState('home'); 
  const [showModal, setShowModal] = useState(null); 
  const [expandedDates, setExpandedDates] = useState(new Set(['Today', 'Yesterday']));
  const [deepDiveId, setDeepDiveId] = useState(null);
  const [expandNetWorth, setExpandNetWorth] = useState(false);
  
  // Persistent State
  const [blurAmounts, setBlurAmounts] = useLocalStorage('financeos_blur', false);
  const [showFiduciary, setShowFiduciary] = useLocalStorage('financeos_showFiduciary', false);
  const [autoBackup, setAutoBackup] = useLocalStorage('financeos_autoBackup', true);
  const [backupCadence, setBackupCadence] = useLocalStorage('financeos_backupCadence', 'Daily');
  const [lastBackupDate, setLastBackupDate] = useLocalStorage('financeos_lastBackup', Date.now());
  const [appTheme, setAppTheme] = useLocalStorage('financeos_theme', 'dark');
  const [transactions, setTransactions] = useLocalStorage('financeos_txs', INITIAL_TRANSACTIONS);
  const [snapshots, setSnapshots] = useLocalStorage('financeos_snapshots', []);

  // Security State
  const [appPin, setAppPin] = useLocalStorage('financeos_pin', null);
  const [isLocked, setIsLocked] = useState(!!appPin);
  const [pinInput, setPinInput] = useState('');
  const [showPinSetup, setShowPinSetup] = useState(false);

  // Advanced Search & Filter State
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLedgers, setActiveLedgers] = useState(new Set(['all']));
  const [activeContributors, setActiveContributors] = useState(new Set());
  const [activePurposes, setActivePurposes] = useState(new Set());
  const [showBalances, setShowBalances] = useState(false);

  // Nudge Logic
  const isBackupDue = useMemo(() => {
    if (backupCadence === 'Never') return false;
    const now = Date.now();
    const hoursSinceLast = (now - lastBackupDate) / (1000 * 60 * 60);
    if (backupCadence === 'Daily' && hoursSinceLast > 24) return true;
    if (backupCadence === 'Weekly' && hoursSinceLast > 168) return true;
    if (backupCadence === 'Monthly' && hoursSinceLast > 720) return true;
    return false;
  }, [backupCadence, lastBackupDate]);

  const handlePinPad = (num) => {
    if (pinInput.length < 4) {
      const newPin = pinInput + num;
      setPinInput(newPin);
      if (newPin.length === 4) {
        if (newPin === appPin) {
          setIsLocked(false);
          setPinInput('');
        } else {
          setTimeout(() => setPinInput(''), 400);
        }
      }
    }
  };

  const availableContributors = useMemo(() => [...new Set(transactions.filter(t => t.type === 'fiduciary').map(t => t.contributor).filter(Boolean))], [transactions]);
  const availablePurposes = useMemo(() => [...new Set(transactions.filter(t => t.type === 'fiduciary').map(t => t.purpose).filter(Boolean))], [transactions]);

  const getRelativeDate = (dateStr) => {
    if (dateStr === 'Feb 21, 2026') return 'Today';
    if (dateStr === 'Feb 20, 2026') return 'Yesterday';
    if (dateStr === 'Feb 18, 2026' || dateStr === 'Feb 15, 2026') return 'This Month';
    return 'Older';
  };

  const toggleLedger = (ledger) => {
    const next = new Set(activeLedgers);
    if (ledger === 'all') {
      next.clear();
      next.add('all');
    } else {
      next.delete('all');
      if (next.has(ledger)) next.delete(ledger);
      else next.add(ledger);
      if (next.size === 0) next.add('all');
    }
    setActiveLedgers(next);
    setShowBalances(false); 
  };

  const toggleFilter = (setFunc, value) => {
    setFunc(prev => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  const homeGroupedTransactions = useMemo(() => {
    const validTxs = transactions.filter(tx => showFiduciary ? true : tx.type !== 'fiduciary');
    return validTxs.reduce((acc, tx) => {
      const groupLabel = getRelativeDate(tx.date);
      if (!acc[groupLabel]) acc[groupLabel] = [];
      acc[groupLabel].push(tx);
      return acc;
    }, {});
  }, [transactions, showFiduciary]);

  const filteredTransactions = useMemo(() => {
    let baseData = transactions;
    if (!activeLedgers.has('all')) {
      baseData = baseData.filter(tx => {
        if (activeLedgers.has('personal') && ['income', 'expense', 'asset'].includes(tx.type)) return true;
        if (activeLedgers.has('fiduciary') && tx.type === 'fiduciary') return true;
        if (activeLedgers.has('debt') && tx.type === 'debt') return true;
        return false;
      });
    }
    baseData = baseData.filter(tx => {
      if (tx.type !== 'fiduciary') return true; 
      const matchContributor = activeContributors.size === 0 || activeContributors.has(tx.contributor);
      const matchPurpose = activePurposes.size === 0 || activePurposes.has(tx.purpose);
      return matchContributor && matchPurpose;
    });
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      baseData = baseData.filter(tx => 
        tx.title.toLowerCase().includes(q) || 
        tx.note?.toLowerCase().includes(q) ||
        tx.meta?.toLowerCase().includes(q) ||
        tx.contributor?.toLowerCase().includes(q) ||
        tx.purpose?.toLowerCase().includes(q) ||
        tx.category.toLowerCase().includes(q)
      );
    }
    return baseData;
  }, [transactions, searchQuery, activeLedgers, activeContributors, activePurposes]);

  const fiduciaryBalances = useMemo(() => {
    const fidTxs = filteredTransactions.filter(tx => tx.type === 'fiduciary');
    if (fidTxs.length === 0) return null;
    const balances = { netHeld: 0, contributors: {}, purposes: {} };
    fidTxs.forEach(tx => {
      const val = tx.flow === 'in' ? tx.amount : -tx.amount;
      balances.netHeld += val;
      if (tx.contributor) balances.contributors[tx.contributor] = (balances.contributors[tx.contributor] || 0) + val;
      if (tx.purpose) balances.purposes[tx.purpose] = (balances.purposes[tx.purpose] || 0) + val;
    });
    return balances;
  }, [filteredTransactions]);

  const deleteTransaction = (id) => {
    setTransactions(transactions.filter(tx => tx.id !== id));
    setDeepDiveId(null);
  };

  const exportJSON = () => {
    const payload = { transactions, snapshots, settings: { blurAmounts, showFiduciary, autoBackup, backupCadence } };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `FinanceOS_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode); 
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    setLastBackupDate(Date.now());
  };

  const Obscure = ({ children, className = '' }) => (
    <span className={`transition-all duration-300 ${blurAmounts ? 'blur-[6px] opacity-60 select-none' : ''} ${className}`}>
      {children}
    </span>
  );

  if (isLocked) {
    return (
      <div className="min-h-screen bg-[#05070a] text-slate-300 flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg mb-8" style={{ background: `linear-gradient(135deg, ${COLORS.gold}, #8a6d2d)` }}>
          <Lock className="text-black w-6 h-6" />
        </div>
        <h2 className="text-2xl font-serif text-white mb-2">FinanceOS</h2>
        <div className="flex gap-4 mb-12">
          {[0,1,2,3].map(i => <div key={i} className={`w-4 h-4 rounded-full border-2 transition-all ${pinInput.length > i ? 'bg-gold border-gold' : 'border-slate-700'}`} />)}
        </div>
        <div className="grid grid-cols-3 gap-6 max-w-[280px]">
          {[1,2,3,4,5,6,7,8,9].map(num => (
            <button key={num} onClick={() => handlePinPad(num)} className="w-16 h-16 rounded-full bg-[#11151f] border border-[#1e2532] flex items-center justify-center text-xl font-bold text-white active:scale-90 transition">{num}</button>
          ))}
          <div />
          <button onClick={() => handlePinPad(0)} className="w-16 h-16 rounded-full bg-[#11151f] border border-[#1e2532] flex items-center justify-center text-xl font-bold text-white active:scale-90 transition">0</button>
          <button onClick={() => setPinInput(pinInput.slice(0, -1))} className="w-16 h-16 flex items-center justify-center text-xs font-black uppercase text-slate-500 active:text-white">Del</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: COLORS.bg }} className="min-h-screen text-slate-300 font-sans">
      <div className="max-w-md mx-auto relative min-h-screen pb-32 overflow-x-hidden">
        
        <header className="flex items-center justify-between px-6 pt-10 pb-6 sticky top-0 z-30 bg-bg/80 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg" style={{ background: `linear-gradient(135deg, ${COLORS.gold}, #8a6d2d)` }}>
              <Wallet className="text-black w-4 h-4" />
            </div>
            <h1 className="text-lg font-bold tracking-tight" style={{ color: COLORS.gold }}>FinanceOS</h1>
          </div>
          <button onClick={() => setIsSearching(true)} className="bg-[#11151f] p-2 rounded-full border border-[#1e2532] active:scale-90 transition">
            <Search className="w-4 h-4 text-slate-500" />
          </button>
        </header>

        {view === 'home' ? (
          <div className="px-6 space-y-8 animate-in fade-in">
            {isBackupDue && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-yellow-500">Data Vault Reminder</h4>
                  <button onClick={exportJSON} className="mt-3 text-[9px] font-black uppercase bg-yellow-500 text-black px-4 py-2 rounded-lg tracking-widest active:scale-95 transition">Export Now</button>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between">
               <h2 className="text-3xl font-serif text-white">Dashboard</h2>
               <button onClick={() => setShowFiduciary(!showFiduciary)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest transition-all ${showFiduciary ? 'bg-fiduciary/10 border-fiduciary/30 text-fiduciary' : 'bg-[#11151f] border-[#1e2532] text-slate-500'}`}>
                 <Lock className="w-3 h-3" /> {showFiduciary ? 'Fiduciary On' : 'Fiduciary Off'}
               </button>
            </div>
            <section className="space-y-4">
              <div onClick={() => setExpandNetWorth(!expandNetWorth)} className="rounded-[2.5rem] p-8 border bg-[#11151f] border-[#1e2532] shadow-2xl transition-all active:scale-[0.98]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase">Personal Wealth</span>
                  <span className="text-[9px] px-2 py-0.5 rounded font-black border" style={{ color: COLORS.gold, borderColor: `${COLORS.gold}33` }}>NGN</span>
                </div>
                <div className="text-5xl font-serif text-white tracking-tighter mb-4"><Obscure>₦62.05M</Obscure></div>
                {expandNetWorth && (
                  <div className="mt-6 pt-6 border-t border-[#1e2532]/50 space-y-4">
                     <div className="flex justify-between items-center text-xs font-bold text-slate-400"><span className="flex items-center gap-2"><ArrowDownRight className="w-3.5 h-3.5 text-mint" /> Owed to you</span><Obscure className="text-mint">+ ₦1.01M</Obscure></div>
                     <div className="flex justify-between items-center text-xs font-bold text-slate-400"><span className="flex items-center gap-2"><ArrowUpRight className="w-3.5 h-3.5 text-rose" /> You owe</span><Obscure className="text-rose">- ₦2.80M</Obscure></div>
                  </div>
                )}
              </div>
              {showFiduciary && (
                <div className="rounded-[2rem] p-6 border bg-[#11151f] border-[#1e2532] shadow-lg animate-in slide-in-from-top-4">
                  <div className="flex items-center gap-2 mb-2"><Lock className="w-3 h-3 text-fiduciary" /><span className="text-[10px] font-black tracking-widest text-fiduciary uppercase">Managed Wealth</span></div>
                  <div className="text-3xl font-serif text-white tracking-tighter mb-1"><Obscure>₦12.50M</Obscure></div>
                </div>
              )}
            </section>
            <section className="space-y-4">
              {['Today', 'Yesterday', 'This Month', 'Older'].map((groupLabel) => {
                const items = homeGroupedTransactions[groupLabel];
                if (!items || items.length === 0) return null;
                return (
                  <div key={groupLabel} className="space-y-3">
                    <button className="flex items-center gap-3 w-full text-left py-1" onClick={() => {
                        const next = new Set(expandedDates);
                        if (next.has(groupLabel)) next.delete(groupLabel); else next.add(groupLabel);
                        setExpandedDates(next);
                    }}>
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-600 transition-transform ${expandedDates.has(groupLabel) ? '' : '-rotate-90'}`} />
                      <span className="text-[11px] font-black text-slate-600 uppercase tracking-[0.2em]">{groupLabel}</span>
                    </button>
                    {expandedDates.has(groupLabel) && (
                      <div className="space-y-2">
                        {items.map(tx => (
                          <div key={tx.id} onClick={() => setDeepDiveId(deepDiveId === tx.id ? null : tx.id)} className={`rounded-2xl p-4 border bg-[#11151f] border-[#1e2532] transition-all cursor-pointer`}>
                            <div className="flex items-start gap-4">
                                <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-[#05070a] border border-[#1e2532] shrink-0">
                                    {tx.type === 'fiduciary' ? <Lock className="w-5 h-5 text-fiduciary" /> : <Briefcase className="w-5 h-5 text-mint" />}
                                </div>
                                <div className="flex-1 min-w-0 pt-0.5">
                                    <div className="text-[13px] font-bold text-white leading-tight">{tx.title}</div>
                                    <div className="text-[10px] text-slate-500 font-medium flex items-center gap-2 mt-1.5"><span className="uppercase tracking-tighter text-[9px] font-black border border-[#1e2532] bg-[#05070a] px-1 rounded">{tx.currency}</span><span>{tx.meta || tx.contributor}</span></div>
                                </div>
                                <div className="text-right shrink-0 pt-0.5"><Obscure className={`text-[13px] font-serif font-bold ${tx.flow === 'in' ? 'text-mint' : 'text-rose'}`}>₦{tx.amount.toLocaleString()}</Obscure></div>
                            </div>
                            {deepDiveId === tx.id && (
                                <div className="mt-4 pt-4 border-t border-[#1e2532]/50 flex gap-2">
                                    <button onClick={(e) => {e.stopPropagation(); deleteTransaction(tx.id)}} className="flex-1 py-2 bg-rose/10 border border-rose/30 rounded-lg text-[9px] font-black uppercase text-rose">Delete</button>
                                </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </section>
          </div>
        ) : (
          <div className="px-6 space-y-10 animate-in slide-in-from-right duration-500 pb-20">
              <section className="space-y-3 pt-4">
                  <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Backup & Safety</h3>
                  <div className="rounded-[2rem] border border-[#1e2532] bg-[#11151f] divide-y divide-[#1e2532]">
                      <div className="p-6 flex items-center justify-between">
                          <div className="flex-1"><div className="text-sm font-bold text-white">Auto-Backup</div></div>
                          <button onClick={() => setAutoBackup(!autoBackup)} className={`w-12 h-6 rounded-full relative transition-colors ${autoBackup ? 'bg-mint' : 'bg-slate-800'}`}><div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${autoBackup ? 'right-1' : 'left-1'}`} /></button>
                      </div>
                      <div className="p-6 flex gap-3">
                          <button onClick={exportJSON} className="flex-1 py-3.5 bg-[#05070a] border border-[#1e2532] rounded-xl text-[10px] font-black uppercase text-slate-300 flex items-center justify-center gap-2"><Download className="w-4 h-4 text-mint" /> Export JSON</button>
                      </div>
                  </div>
              </section>
              <section className="space-y-3">
                  <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Security</h3>
                  <div className="rounded-[2rem] border border-[#1e2532] bg-[#11151f] p-6 flex items-center justify-between">
                      <div className="flex-1"><div className="text-sm font-bold text-white">PIN Startup</div></div>
                      <button onClick={() => { if(appPin) setAppPin(null); else setShowPinSetup(true); }} className={`w-12 h-6 rounded-full relative transition-colors ${appPin ? 'bg-mint' : 'bg-slate-800'}`}><div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${appPin ? 'right-1' : 'left-1'}`} /></button>
                  </div>
              </section>
          </div>
        )}

        {showPinSetup && (
          <div className="fixed inset-0 z-[200] bg-[#05070a]/95 backdrop-blur-xl flex flex-col items-center justify-center p-6">
             <KeyRound className="w-8 h-8 text-gold mb-6" />
             <input type="password" inputMode="numeric" maxLength="4" autoFocus value={pinInput} onChange={(e) => setPinInput(e.target.value)} className="bg-[#11151f] border border-[#1e2532] rounded-xl text-center text-2xl font-bold text-white tracking-[1em] w-48 h-16 focus:outline-none mb-8" />
             <button onClick={() => { if(pinInput.length === 4) { setAppPin(pinInput); setShowPinSetup(false); setPinInput(''); } }} className="px-10 py-4 rounded-xl bg-gold text-black text-[10px] font-black uppercase">Save PIN</button>
          </div>
        )}

        {isSearching && (
          <div className="fixed inset-0 z-[110] bg-[#05070a]/95 backdrop-blur-xl flex flex-col animate-in fade-in">
            <div className="px-6 pt-12 pb-4 border-b border-[#1e2532] bg-[#11151f] space-y-5">
               <div className="flex items-center gap-3"><div className="flex-1 flex items-center gap-3 bg-[#05070a] border border-[#1e2532] rounded-2xl px-4 py-3"><Search className="w-5 h-5 text-gold" /><input autoFocus type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." className="w-full bg-transparent text-white focus:outline-none" /></div></div>
               <div className="flex gap-2 overflow-x-auto pb-2"><FilterChip label="All" active={activeLedgers.has('all')} onClick={() => toggleLedger('all')} /><FilterChip label="Fiduciary" active={activeLedgers.has('fiduciary')} onClick={() => toggleLedger('fiduciary')} color={COLORS.fiduciary} /></div>
            </div>
            <div className="flex-1 overflow-y-auto p-6"><button onClick={closeSearch} className="w-full py-4 rounded-2xl border border-[#1e2532] bg-[#1a202c] text-[11px] font-black uppercase text-slate-300 tracking-[0.2em] flex items-center justify-center gap-2">Close Search</button></div>
          </div>
        )}

        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-12 py-6 flex items-center justify-between bg-[#05070a]/90 backdrop-blur-2xl border-t border-[#1e2532] z-40">
          <button onClick={() => setView('home')} className={`flex flex-col items-center gap-1.5 ${view === 'home' ? 'text-mint' : 'text-slate-400'}`}><Home className="w-6 h-6" /><span className="text-[9px] font-black uppercase tracking-widest">Home</span></button>
          <div className="w-16" />
          <button onClick={() => setView('menu')} className={`flex flex-col items-center gap-1.5 ${view === 'menu' ? 'text-mint' : 'text-slate-600'}`}><MoreHorizontal className="w-6 h-6" /><span className="text-[9px] font-black uppercase tracking-widest">Menu</span></button>
        </nav>

        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
           <button className="w-16 h-16 rounded-full flex items-center justify-center text-black shadow-lg" style={{ background: `linear-gradient(135deg, ${COLORS.mint}, #00a87d)` }}><Plus className="w-8 h-8 stroke-[3]" /></button>
        </div>
      </div>
    </div>
  );
}

const FilterChip = ({ label, active, onClick, color = COLORS.mint }) => (
  <button onClick={onClick} className={`rounded-xl uppercase tracking-widest px-4 py-2 text-[10px] font-black transition-all ${active ? `text-black` : 'bg-[#05070a] border border-[#1e2532] text-slate-500'}`} style={active ? { backgroundColor: color } : {}}>{label}</button>
);
