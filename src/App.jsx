import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, Home, MoreHorizontal, 
  Wallet, Briefcase, Utensils, Lock,
  ChevronRight, Download, KeyRound, 
  Shield, Eye, EyeOff, X, Calendar, Trash2
} from 'lucide-react';

// --- Local Storage Hook ---
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
  border: '#1e2532',
  gold: '#c5a059',       
  mint: '#00c896',       
  rose: '#991b1b',
  fiduciary: '#8b5cf6'
};

export default function App() {
  const [view, setView] = useState('home'); 
  const [showAddModal, setShowAddModal] = useState(false); 
  const [deepDiveId, setDeepDiveId] = useState(null);
  
  const [blurAmounts, setBlurAmounts] = useLocalStorage('financeos_blur', false);
  const [showFiduciary, setShowFiduciary] = useLocalStorage('financeos_showFid', false);
  const [appPin, setAppPin] = useLocalStorage('financeos_pin', null);
  
  const [transactions, setTransactions] = useLocalStorage('financeos_txs', [
    { id: 1, date: 'Feb 21, 2026', title: 'Salary Credit', type: 'income', amount: 450000, flow: 'in', note: 'Monthly Net' },
    { id: 2, date: 'Feb 20, 2026', title: 'Grocery Shopping', type: 'expense', amount: 15000, flow: 'out', note: 'Weekly Restock' }
  ]);

  const [isLocked, setIsLocked] = useState(!!appPin);
  const [pinInput, setPinInput] = useState('');
  const [showPinSetup, setShowPinSetup] = useState(false);

  const handlePinPad = (num) => {
    if (pinInput.length < 4) {
      const next = pinInput + num;
      setPinInput(next);
      if (next.length === 4) {
        if (next === appPin) {
          setIsLocked(false);
          setPinInput('');
        } else {
          setTimeout(() => setPinInput(''), 400);
        }
      }
    }
  };

  const totals = useMemo(() => {
    const personal = transactions.filter(t => t.type !== 'fiduciary');
    const fid = transactions.filter(t => t.type === 'fiduciary');
    const sum = (list) => list.reduce((acc, t) => acc + (t.flow === 'in' ? t.amount : -t.amount), 0);
    return { personal: sum(personal), fiduciary: sum(fid) };
  }, [transactions]);

  const addTransaction = (type, flow) => {
    const title = prompt(`What is this ${type} for?`);
    if (!title) return;
    const amountStr = prompt(`Enter amount:`);
    const amount = parseInt(amountStr?.replace(/[^0-9]/g, ''));
    if (!amount) return;

    const newTx = {
      id: Date.now(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      title,
      type,
      amount,
      flow,
      note: 'Manual Entry'
    };

    setTransactions([newTx, ...transactions]);
    setShowAddModal(false);
  };

  const Obscure = ({ children, className = '' }) => (
    <span className={`transition-all duration-500 ${blurAmounts ? 'blur-[12px] opacity-20' : ''} ${className}`}>
      {children}
    </span>
  );

  if (isLocked) {
    return (
      <div className="min-h-screen bg-[#05070a] flex flex-col items-center justify-center p-8">
        <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-12 shadow-2xl" style={{ background: `linear-gradient(135deg, ${COLORS.gold}, #8a6d2d)` }}>
          <Lock className="text-black w-7 h-7" />
        </div>
        <div className="flex gap-6 mb-20">
          {[0,1,2,3].map(i => <div key={i} className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${pinInput.length > i ? 'bg-gold border-gold' : 'border-slate-800'}`} />)}
        </div>
        <div className="grid grid-cols-3 gap-8">
          {[1,2,3,4,5,6,7,8,9].map(n => (
            <button key={n} onClick={() => handlePinPad(n)} className="w-16 h-16 rounded-full bg-[#11151f] border border-[#1e2532] text-xl font-bold text-white active:bg-gold active:text-black">{n}</button>
          ))}
          <div />
          <button onClick={() => handlePinPad(0)} className="w-16 h-16 rounded-full bg-[#11151f] border border-[#1e2532] text-xl font-bold text-white active:bg-gold active:text-black">0</button>
          <button onClick={() => setPinInput('')} className="text-[10px] font-black uppercase text-slate-600">CLR</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-300 font-sans pb-32">
      <header className="flex items-center justify-between px-6 pt-12 pb-6 sticky top-0 z-30 bg-[#05070a]/90 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg" style={{ background: `linear-gradient(135deg, ${COLORS.gold}, #8a6d2d)` }}>
            <Wallet className="text-black w-4 h-4" />
          </div>
          <h1 className="text-lg font-bold text-white tracking-tight">FinanceOS</h1>
        </div>
        <button onClick={() => setBlurAmounts(!blurAmounts)} className="p-2.5 bg-[#11151f] rounded-full border border-[#1e2532] text-slate-500 active:scale-95 transition-all">
          {blurAmounts ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </header>

      {view === 'home' ? (
        <main className="px-6 space-y-8 animate-in fade-in">
          <div className="rounded-[2.5rem] p-8 border bg-[#11151f] border-[#1e2532] shadow-2xl transition-all active:scale-[0.98]">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Net Assets</span>
              <span className="text-[9px] px-2 py-0.5 rounded border border-gold/30 text-gold bg-gold/5 font-black uppercase">NGN</span>
            </div>
            <div className="text-5xl font-serif text-white tracking-tighter"><Obscure>₦{(totals.personal / 1000000).toFixed(2)}M</Obscure></div>
          </div>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Audit Trail</h3>
              <button onClick={() => setShowFiduciary(!showFiduciary)} className={`text-[8px] font-black uppercase px-2.5 py-1 rounded-full border transition-all ${showFiduciary ? 'bg-fiduciary border-fiduciary text-white' : 'border-slate-800 text-slate-600'}`}>
                {showFiduciary ? 'Fiduciary On' : 'Fid Off'}
              </button>
            </div>
            
            <div className="space-y-3">
              {transactions.filter(t => showFiduciary ? true : t.type !== 'fiduciary').map(tx => (
                <div key={tx.id} onClick={() => setDeepDiveId(deepDiveId === tx.id ? null : tx.id)} className="bg-[#11151f] border border-[#1e2532] p-5 rounded-3xl active:scale-[0.98] transition-all relative">
                   {tx.type === 'fiduciary' && <div className="absolute top-0 right-0 w-1 h-full bg-fiduciary" />}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-2xl bg-[#05070a] flex items-center justify-center border border-[#1e2532]">
                        {tx.type === 'income' ? <Briefcase className="w-5 h-5 text-mint" /> : tx.type === 'fiduciary' ? <Shield className="w-5 h-5 text-fiduciary" /> : <Utensils className="w-5 h-5 text-rose" />}
                      </div>
                      <div>
                        <div className="text-[13px] font-bold text-white tracking-tight">{tx.title}</div>
                        <div className="text-[10px] text-slate-500 font-medium mt-0.5">{tx.date}</div>
                      </div>
                    </div>
                    <div className={`text-sm font-serif font-black ${tx.flow === 'in' ? 'text-mint' : 'text-rose'}`}>
                      <Obscure>₦{tx.amount.toLocaleString()}</Obscure>
                    </div>
                  </div>
                  {deepDiveId === tx.id && (
                    <div className="mt-5 pt-5 border-t border-[#1e2532]/50 flex gap-2">
                      <button onClick={(e) => {
                        e.stopPropagation();
                        setTransactions(transactions.filter(t => t.id !== tx.id));
                      }} className="flex-1 py-3 bg-rose/10 text-rose text-[9px] font-black uppercase rounded-xl border border-rose/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                        <Trash2 className="w-3 h-3" /> Delete Entry
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </main>
      ) : (
        <main className="px-6 pt-4 space-y-10 animate-in slide-in-from-right">
           <section className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Security</h3>
              <div className="bg-[#11151f] border border-[#1e2532] rounded-[2.5rem] p-7 flex justify-between items-center shadow-lg">
                  <div>
                    <div className="text-sm font-bold text-white">PIN Access</div>
                    <div className="text-[10px] text-slate-500 mt-1 uppercase font-black">Startup Lock</div>
                  </div>
                  <button onClick={() => { if(appPin) setAppPin(null); else setShowPinSetup(true); }} className={`w-12 h-6 rounded-full relative transition-all ${appPin ? 'bg-mint' : 'bg-slate-800'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg transition-all ${appPin ? 'right-1' : 'left-1'}`} />
                  </button>
              </div>
           </section>
           
           <section className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Database</h3>
              <button onClick={() => {
                const payload = { transactions };
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload));
                const dlAnchor = document.createElement('a');
                dlAnchor.setAttribute("href", dataStr);
                dlAnchor.setAttribute("download", "FinanceOS_Backup.json");
                dlAnchor.click();
              }} className="w-full p-7 bg-[#11151f] border border-[#1e2532] rounded-[2.5rem] flex items-center justify-between active:scale-95 transition-all">
                <div className="flex items-center gap-5">
                  <div className="w-10 h-10 bg-mint/10 rounded-xl flex items-center justify-center text-mint"><Download className="w-5 h-5" /></div>
                  <div className="text-sm font-bold text-white">Export Vault</div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-700" />
              </button>
           </section>
        </main>
      )}

      {showPinSetup && (
        <div className="fixed inset-0 z-[100] bg-[#05070a]/98 backdrop-blur-2xl flex flex-col items-center justify-center p-8">
           <KeyRound className="w-12 h-12 text-gold mb-8" />
           <h2 className="text-white font-serif text-2xl mb-12">Set Security PIN</h2>
           <input type="password" inputMode="numeric" maxLength="4" autoFocus value={pinInput} onChange={(e) => setPinInput(e.target.value)} className="bg-[#11151f] border border-[#1e2532] w-56 h-20 text-center text-4xl font-bold text-white rounded-3xl tracking-[0.8em] focus:outline-none mb-12 shadow-2xl" />
           <button onClick={() => { if(pinInput.length === 4) { setAppPin(pinInput); setShowPinSetup(false); setPinInput(''); } }} className="bg-gold text-black px-12 py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] active:scale-95 transition">Save PIN</button>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-end justify-center" onClick={() => setShowAddModal(false)}>
           <div className="w-full max-w-md bg-[#05070a] border-t border-[#1e2532] rounded-t-[3.5rem] p-10 pb-24 space-y-8" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center px-2">
                <h2 className="text-white text-3xl font-serif">New Entry</h2>
                <button onClick={() => setShowAddModal(false)} className="p-2 bg-[#11151f] rounded-full border border-[#1e2532] text-slate-500"><X className="w-5 h-5" /></button>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <button onClick={() => addTransaction('income', 'in')} className="p-8 bg-[#11151f] border border-[#1e2532] rounded-[2.5rem] flex flex-col items-center gap-4 active:scale-90 transition-all">
                  <Briefcase className="text-mint w-6 h-6" />
                  <span className="text-[10px] font-black uppercase text-slate-500">Income</span>
                </button>
                <button onClick={() => addTransaction('expense', 'out')} className="p-8 bg-[#11151f] border border-[#1e2532] rounded-[2.5rem] flex flex-col items-center gap-4 active:scale-90 transition-all">
                  <Utensils className="text-rose w-6 h-6" />
                  <span className="text-[10px] font-black uppercase text-slate-500">Expense</span>
                </button>
              </div>
           </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-12 py-8 bg-[#05070a]/95 backdrop-blur-3xl border-t border-[#1e2532] flex justify-between items-center z-40 shadow-2xl">
        <button onClick={() => setView('home')} className={`flex flex-col items-center gap-2 transition-all ${view === 'home' ? 'text-mint' : 'text-slate-700'}`}>
          <Home className="w-6 h-6" />
          <span className="text-[8px] font-black uppercase tracking-widest">Vault</span>
        </button>
        <button onClick={() => setShowAddModal(true)} className="w-16 h-16 rounded-full bg-mint flex items-center justify-center text-black shadow-[0_10px_40px_rgba(0,200,150,0.3)] active:scale-90 transition-all -translate-y-6">
          <Plus className="w-9 h-9 stroke-[3]" />
        </button>
        <button onClick={() => setView('menu')} className={`flex flex-col items-center gap-2 transition-all ${view === 'menu' ? 'text-mint' : 'text-slate-700'}`}>
          <MoreHorizontal className="w-6 h-6" />
          <span className="text-[8px] font-black uppercase tracking-widest">Settings</span>
        </button>
      </nav>
    </div>
  );
}
