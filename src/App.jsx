import React, { useState } from 'react';
import { Plus, Home, MoreHorizontal, Wallet, Briefcase, Utensils, Lock, Shield, Download, X } from 'lucide-react';

export default function App() {
  const [view, setView] = useState('home');
  const [showModal, setShowModal] = useState(false);
  const [transactions, setTransactions] = useState([
    { id: 1, title: 'Salary', amount: 450000, flow: 'in' },
    { id: 2, title: 'Groceries', amount: 15000, flow: 'out' }
  ]);

  const addEntry = (type) => {
    const name = prompt("Enter Name:");
    const amt = prompt("Enter Amount:");
    if (name && amt) {
      setTransactions([{ id: Date.now(), title: name, amount: parseInt(amt), flow: type }, ...transactions]);
    }
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-white font-sans pb-32">
      {/* Header */}
      <header className="p-6 pt-12 flex justify-between items-center bg-[#05070a]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-yellow-600 rounded-lg flex items-center justify-center"><Wallet className="text-black w-4 h-4" /></div>
          <h1 className="text-lg font-bold">FinanceOS</h1>
        </div>
      </header>

      {view === 'home' ? (
        <main className="px-6 space-y-8">
          <div className="bg-[#11151f] border border-[#1e2532] p-8 rounded-[2rem]">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Total Balance</p>
            <h2 className="text-4xl font-serif">₦{transactions.reduce((acc, t) => acc + (t.flow === 'in' ? t.amount : -t.amount), 0).toLocaleString()}</h2>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-widest text-slate-600">Transactions</p>
            {transactions.map(t => (
              <div key={t.id} className="bg-[#11151f] border border-[#1e2532] p-5 rounded-2xl flex justify-between items-center">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                     {t.flow === 'in' ? <Briefcase className="text-emerald-500 w-4 h-4" /> : <Utensils className="text-rose-500 w-4 h-4" />}
                   </div>
                   <span className="font-bold">{t.title}</span>
                </div>
                <span className={t.flow === 'in' ? 'text-emerald-500' : 'text-rose-500'}>₦{t.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </main>
      ) : (
        <main className="p-6 text-center">
          <h2 className="text-xl font-serif mb-6">Settings</h2>
          <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="w-full p-6 bg-[#11151f] border border-[#1e2532] rounded-2xl text-rose-500 font-bold">Reset All Data</button>
        </main>
      )}

      {/* Quick Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-end">
          <div className="w-full bg-[#05070a] border-t border-[#1e2532] rounded-t-[3rem] p-10 pb-24 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-serif">Add Entry</h3>
              <button onClick={() => setShowModal(false)}><X /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => addEntry('in')} className="p-8 bg-[#11151f] rounded-3xl border border-[#1e2532] text-emerald-500 font-bold">Income</button>
              <button onClick={() => addEntry('out')} className="p-8 bg-[#11151f] rounded-3xl border border-[#1e2532] text-rose-500 font-bold">Expense</button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 p-8 bg-[#05070a] border-t border-[#1e2532] flex justify-between items-center z-40">
        <button onClick={() => setView('home')} className={view === 'home' ? 'text-emerald-500' : 'text-slate-600'}><Home /></button>
        <button onClick={() => setShowModal(true)} className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-black -translate-y-6 shadow-lg"><Plus /></button>
        <button onClick={() => setView('menu')} className={view === 'menu' ? 'text-emerald-500' : 'text-slate-600'}><MoreHorizontal /></button>
      </nav>
    </div>
  );
}
