import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, Search, Home, MoreHorizontal, 
  Wallet, Briefcase, Utensils, ChevronDown, Lock,
  ChevronRight, ArrowDownRight, ArrowUpRight, Download, AlertTriangle, KeyRound
} from 'lucide-react';

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
};

const INITIAL_TRANSACTIONS = [
  { id: 1, date: 'Feb 21, 2026', title: 'Salary Deposit', type: 'income', amount: 450000, category: 'Work', currency: 'NGN', note: 'Monthly pay', flow: 'in' },
  { id: 2, date: 'Feb 20, 2026', title: 'Grocery Run', type: 'expense', amount: 15000, category: 'Food', currency: 'NGN', note: 'Weekly supplies', flow: 'out' },
];

export default function App() {
  const [view, setView] = useState('home'); 
  const [showModal, setShowModal] = useState(false); 
  const [deepDiveId, setDeepDiveId] = useState(null);
  const [expandNetWorth, setExpandNetWorth] = useState(false);
  
  const [blurAmounts, setBlurAmounts] = useLocalStorage('financeos_blur', false);
  const [transactions, setTransactions] = useLocalStorage('financeos_txs', INITIAL_TRANSACTIONS);
  const [appPin, setAppPin] = useLocalStorage('financeos_pin', null);
  const [isLocked, setIsLocked] = useState(!!appPin);
  const [pinInput, setPinInput] = useState('');
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const handlePinPad = (num) => {
    if (pinInput.length < 4) {
      const newPin = pinInput + num;
      setPinInput(newPin);
      if (newPin.length === 4) {
        if (newPin === appPin) {
          setIsLocked(false);
          setPinInput('');
        } else {
          setTimeout(() => setPinInput(''), 300);
        }
      }
    }
  };

  const deleteTransaction = (id) => {
    setTransactions(transactions.filter(tx => tx.id !== id));
    setDeepDiveId(null);
  };

  const exportJSON = () => {
    const payload = { transactions, settings: { blurAmounts } };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", "finance_backup.json");
    dlAnchor.click();
  };

  const Obscure = ({ children, className = '' }) => (
    <span className={`transition-all duration-300 ${blurAmounts ? 'blur-[8px] opacity-40' : ''} ${className}`}>
      {children}
    </span>
  );

  if (isLocked) {
    return (
      <div className="min-h-screen bg-[#05070a] flex flex-col items-center justify-center p-6">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-10" style={{ background: `linear-gradient(135deg, ${COLORS.gold}, #8a6d2d)` }}>
          <Lock className="text-black w-6 h-6" />
        </div>
        <div className="flex gap-5 mb-16">
          {[0,1,2,3].map(i => <div key={i} className={`w-4 h-4 rounded-full border-2 transition-all ${pinInput.length > i ? 'bg-gold border-gold' : 'border-slate-800'}`} />)}
        </div>
        <div className="grid grid-cols-3 gap-8">
          {[1,2,3,4,5,6,7,8,9].map(num => (
            <button key={num} onClick={() => handlePinPad(num)} className="w-16 h-16 rounded-full bg-[#11151f] border border-[#1e2532] text-xl font-bold text-white active:bg-gold active:text-black transition-all">{num}</button>
          ))}
          <div />
          <button onClick={() => handlePinPad(0)} className="w-16 h-16 rounded-full bg-[#11151f] border border-[#1e2532] text-xl font-bold text-white active:bg-gold active:text-black transition-all">0</button>
          <button onClick={() => setPinInput('')} className="w-16 h-16 flex items-center justify-center text-[10px] font-black text-slate-600">CLR</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-300 font-sans pb-32">
      <header className="flex items-center justify-between px-6 pt-10 pb-6 sticky top-0 z-30 bg-[#05070a]/80 backdrop-blur-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${COLORS.gold}, #8a6d2d)` }}>
            <Wallet className="text-black w-4 h-4" />
          </div>
          <h1 className="text-lg font-bold text-white">FinanceOS</h1>
        </div>
        <button onClick={() => setIsSearching(true)} className="p-2 bg-[#11151f] rounded-full border border-[#1e2532]"><Search className="w-4 h-4 text-slate-500" /></button>
      </header>

      {view === 'home' ? (
        <main className="px-6 space-y-8">
          <div onClick={() => setExpandNetWorth(!expandNetWorth)} className="rounded-[2.5rem] p-8 border bg-[#11151f] border-[#1e2532] shadow-2xl transition-all active:scale-95">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Net Wealth</span>
              <span className="text-[9px] px-2 py-0.5 rounded border border-gold/30 text-gold bg-gold/5">NGN</span>
            </div>
            <div className="text-4xl font-serif text-white"><Obscure>₦62.05M</Obscure></div>
            {expandNetWorth && (
              <div className="mt-6 pt-6 border-t border-[#1e2532] space-y-4 animate-in fade-in">
                <div className="flex justify-between items-center text-xs"><span className="flex items-center gap-2"><ArrowDownRight className="w-4 h-4 text-mint" /> Owed to you</span><Obscure>₦1.01M</Obscure></div>
                <div className="flex justify-between items-center text-xs"><span className="flex items-center gap-2"><ArrowUpRight className="w-4 h-4 text-rose" /> You owe</span><Obscure>₦2.80M</Obscure></div>
              </div>
            )}
          </div>

          <section className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Audit Trail</h3>
            <div className="space-y-3">
              {transactions.map(tx => (
                <div key={tx.id} onClick={() => setDeepDiveId(deepDiveId === tx.id ? null : tx.id)} className="bg-[#11151f] border border-[#1e2532] p-4 rounded-2xl active:scale-[0.98] transition-all">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#05070a] flex items-center justify-center border border-[#1e2532]">
                        {tx.type === 'income' ? <Briefcase className="w-4 h-4 text-mint" /> : <Utensils className="w-4 h-4 text-rose" />}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">{tx.title}</div>
                        <div className="text-[10px] text-slate-500">{tx.note}</div>
                      </div>
                    </div>
                    <div className={`text-sm font-serif font-bold ${tx.flow === 'in' ? 'text-mint' : 'text-rose'}`}>
                      <Obscure>{tx.flow === 'in' ? '+' : '-'}₦{tx.amount.toLocaleString()}</Obscure>
                    </div>
                  </div>
                  {deepDiveId === tx.id && (
                    <div className="mt-4 pt-4 border-t border-[#1e2532]/50 flex gap-2 animate-in slide-in-from-top-2">
                       <button onClick={(e) => {e.stopPropagation(); deleteTransaction(tx.id)}} className="flex-1 py-2 bg-rose/10 text-rose text-[10px] font-black uppercase rounded-lg">Delete Entry</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </main>
      ) : (
        <main className="px-6 space-y-10 animate-in slide-in-from-right duration-300">
           <section className="space-y-3 pt-4">
              <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Security & Privacy</h3>
              <div className="bg-[#11151f] border border-[#1e2532] rounded-[2rem] divide-y divide-[#1e2532]">
                <div className="p-6 flex justify-between items-center">
                  <span className="text-sm font-bold text-white">PIN Protection</span>
                  <button onClick={() => { if(appPin) setAppPin(null); else setShowPinSetup(true); }} className={`w-12 h-6 rounded-full relative transition-all ${appPin ? 'bg-mint' : 'bg-slate-800'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${appPin ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>
                <div className="p-6 flex justify-between items-center">
                  <span className="text-sm font-bold text-white">Blur Amounts</span>
                  <button onClick={() => setBlurAmounts(!blurAmounts)} className={`w-12 h-6 rounded-full relative transition-all ${blurAmounts ? 'bg-mint' : 'bg-slate-800'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${blurAmounts ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>
              </div>
           </section>
           <section className="space-y-3">
              <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Data Vault</h3>
              <button onClick={exportJSON} className="w-full p-6 bg-[#11151f] border border-[#1e2532] rounded-[2rem] flex items-center justify-between active:scale-95 transition-all">
                <div className="flex items-center gap-4">
                  <Download className="w-5 h-5 text-mint" />
                  <span className="text-sm font-bold text-white">Export Local Backup</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
           </section>
        </main>
      )}

      {showPinSetup && (
        <div className="fixed inset-0 z-[100] bg-[#05070a]/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-in fade-in">
           <KeyRound className="w-10 h-10 text-gold mb-6" />
           <h2 className="text-white font-serif text-xl mb-10">Set 4-Digit PIN</h2>
           <input type="password" inputMode="numeric" maxLength="4" autoFocus value={pinInput} onChange={(e) => setPinInput(e.target.value)} className="bg-[#11151f] border border-[#1e2532] w-48 h-16 text-center text-3xl font-bold text-white rounded-2xl tracking-[1em] focus:outline-none mb-10" />
           <button onClick={() => { if(pinInput.length === 4) { setAppPin(pinInput); setShowPinSetup(false); setPinInput(''); } }} className="bg-gold text-black px-10 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest active:scale-90 transition">Save PIN</button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-end justify-center animate-in slide-in-from-bottom" onClick={() => setShowModal(false)}>
           <div className="w-full bg-[#05070a] border-t border-[#1e2532] rounded-t-[3rem] p-10 pb-20 space-y-6" onClick={e => e.stopPropagation()}>
              <h2 className="text-white text-2xl font-serif">Quick Entry</h2>
              <div className="grid grid-cols-2 gap-4">
                <button className="p-6 bg-[#11151f] border border-[#1e2532] rounded-3xl flex flex-col items-center gap-3 active:scale-90 transition">
                  <Briefcase className="w-6 h-6 text-mint" />
                  <span className="text-[10px] font-black uppercase text-slate-400">Income</span>
                </button>
                <button className="p-6 bg-[#11151f] border border-[#1e2532] rounded-3xl flex flex-col items-center gap-3 active:scale-90 transition">
                  <Utensils className="w-4 h-4 text-rose" />
                  <span className="text-[10px] font-black uppercase text-slate-400">Expense</span>
                </button>
              </div>
              <button onClick={() => setShowModal(false)} className="w-full py-4 text-[10px] font-black uppercase text-slate-600">Cancel</button>
           </div>
        </div>
      )}

      {isSearching && (
        <div className="fixed inset-0 z-[110] bg-[#05070a]/95 backdrop-blur-xl flex flex-col animate-in fade-in">
          <div className="px-6 pt-12 pb-4 border-b border-[#1e2532] bg-[#11151f] flex items-center gap-4">
            <div className="flex-1 flex items-center gap-3 bg-[#05070a] border border-[#1e2532] rounded-2xl px-4 py-3">
              <Search className="w-5 h-5 text-gold" />
              <input autoFocus type="text" placeholder="Search..." className="w-full bg-transparent text-white focus:outline-none" />
            </div>
            <button onClick={() => setIsSearching(false)} className="text-[10px] font-black uppercase">Close</button>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-10 py-6 bg-[#05070a]/90 backdrop-blur-xl border-t border-[#1e2532] flex justify-between items-center z-40">
        <button onClick={() => setView('home')} className={`flex flex-col items-center gap-1 ${view === 'home' ? 'text-mint' : 'text-slate-600'}`}><Home className="w-6 h-6" /><span className="text-[9px] font-black uppercase">Home</span></button>
        <button onClick={() => setShowModal(true)} className="w-14 h-14 rounded-full bg-mint flex items-center justify-center text-black shadow-lg active:scale-90 transition-all -translate-y-4"><Plus className="w-8 h-8 stroke-[3]" /></button>
        <button onClick={() => setView('menu')} className={`flex flex-col items-center gap-1 ${view === 'menu' ? 'text-mint' : 'text-slate-600'}`}><MoreHorizontal className="w-6 h-6" /><span className="text-[9px] font-black uppercase">Menu</span></button>
      </nav>
    </div>
  );
}
