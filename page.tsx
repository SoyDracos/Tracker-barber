'use client';

import React, { useState, useEffect, useRef } from 'react';

/**
 * THE 6-FIGURE BARBER DASHBOARD
 * Definitive Unified Version - Optimized for Vercel Deployment
 */

// --- Types ---
interface Transaction {
  id: number;
  amount: number;
  type: 'cash' | 'card';
  category?: 'service' | 'tip';
  date: string; // ISO String
}

interface Expense {
  id: number;
  name: string;
  amount: number;
  frequency: 'daily' | 'weekly';
}

interface UserData {
  name: string;
  goalType: 'weekly' | 'monthly';
  goalAmount: number;
  simulatorValue: number;
}

interface AppData {
  user: UserData | null;
  transactions: Transaction[];
  expenses: Expense[];
}

interface DaySummary {
  dateStr: string;
  dateObj: Date;
  total: number;
  count: number;
}

// --- Constants ---
const STORAGE_KEY = 'barber_empire_data';
const AVG_CUT_PRICE = 35; 

// --- Helper Functions ---
const getInitialData = (): AppData => {
  if (typeof window === 'undefined') return { user: null, transactions: [], expenses: [] };
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.user && typeof parsed.user.simulatorValue === 'undefined') {
        parsed.user.simulatorValue = 0;
      }
      return parsed;
    } catch (e) {
      console.error("Failed to parse data", e);
    }
  }
  return { user: null, transactions: [], expenses: [] };
};

const saveData = (data: AppData) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
};

const getStartOfPeriod = (date: Date, type: 'weekly' | 'monthly'): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  if (type === 'monthly') {
    d.setDate(1);
  } else {
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); 
    d.setDate(diff);
  }
  return d;
};

// --- Sub-Components ---

const Onboarding = ({ onComplete }: { onComplete: (user: UserData) => void }) => {
  const [name, setName] = useState('');
  const [goalType, setGoalType] = useState<'weekly' | 'monthly'>('weekly');
  const [amount, setAmount] = useState('');

  const handleSubmit = () => {
    if (!name || !amount) return;
    onComplete({
      name,
      goalType,
      goalAmount: parseFloat(amount),
      simulatorValue: 0,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#121212] flex flex-col justify-center items-center p-6 w-full animate-in fade-in duration-500">
      <div className="w-full max-w-md text-center space-y-8">
        <div>
            <h1 className="font-oswald text-5xl text-[#D4AF37] uppercase tracking-widest drop-shadow-lg leading-tight">Barber<br/>Empire</h1>
            <p className="text-gray-500 text-sm mt-2 font-montserrat">Setup your financial command center.</p>
        </div>

        <div className="space-y-6 text-left">
          <div>
            <label className="text-xs text-[#D4AF37] uppercase font-bold ml-1 font-montserrat">Your Name / Nickname</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: The King"
              className="w-full bg-[#1E1E1E] border border-gray-800 text-white p-4 rounded-xl focus:border-[#D4AF37] focus:outline-none transition-colors font-oswald text-lg placeholder-gray-600 mt-1"
            />
          </div>

          <div>
            <label className="text-xs text-[#D4AF37] uppercase font-bold ml-1 font-montserrat">Goal Type</label>
            <div className="grid grid-cols-2 gap-3 mt-1">
              <button
                onClick={() => setGoalType('weekly')}
                className={`p-3 rounded-xl border font-bold transition-all font-montserrat text-sm ${
                  goalType === 'weekly' ? 'border-[#D4AF37] text-[#D4AF37] bg-[#1E1E1E]' : 'border-gray-800 bg-[#1E1E1E] text-gray-500'
                }`}
              >
                WEEKLY
              </button>
              <button
                onClick={() => setGoalType('monthly')}
                className={`p-3 rounded-xl border font-bold transition-all font-montserrat text-sm ${
                  goalType === 'monthly' ? 'border-[#D4AF37] text-[#D4AF37] bg-[#1E1E1E]' : 'border-gray-800 bg-[#1E1E1E] text-gray-500'
                }`}
              >
                MONTHLY
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs text-[#D4AF37] uppercase font-bold ml-1 font-montserrat">Goal Amount ($)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={goalType === 'weekly' ? "Ex: 1500" : "Ex: 6000"}
              className="w-full bg-[#1E1E1E] border border-gray-800 text-white p-4 rounded-xl focus:border-[#D4AF37] focus:outline-none transition-colors font-oswald text-lg placeholder-gray-600 mt-1"
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-[#D4AF37] text-[#121212] font-oswald font-bold text-xl py-4 rounded-xl shadow-[0_0_15px_rgba(212,175,55,0.4)] hover:scale-[1.02] active:scale-95 transition-transform"
        >
          LAUNCH MY EMPIRE <i className="fas fa-crown ml-2"></i>
        </button>
      </div>
    </div>
  );
};

const SettingsModal = ({ 
  isOpen, 
  user, 
  onClose, 
  onSave 
}: { 
  isOpen: boolean; 
  user: UserData; 
  onClose: () => void; 
  onSave: (data: Partial<UserData>) => void; 
}) => {
  const [name, setName] = useState(user.name);
  const [goalType, setGoalType] = useState(user.goalType);
  const [amount, setAmount] = useState(user.goalAmount.toString());

  useEffect(() => {
    if (isOpen) {
      setName(user.name);
      setGoalType(user.goalType);
      setAmount(user.goalAmount.toString());
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center animate-in fade-in duration-300 p-4">
      <div className="bg-[#1E1E1E] w-full max-w-md p-6 rounded-2xl border border-gray-800 animate-in slide-in-from-bottom-10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-oswald text-2xl text-white uppercase">Settings</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl p-2">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 uppercase font-bold ml-1 font-montserrat">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#121212] border border-gray-700 text-white p-3 rounded-xl focus:border-[#D4AF37] outline-none font-oswald"
            />
          </div>

          <div>
             <label className="text-xs text-gray-500 uppercase font-bold ml-1 font-montserrat">Goal Type</label>
             <div className="grid grid-cols-2 gap-2 mt-1">
               <button
                 onClick={() => setGoalType('weekly')}
                 className={`p-2 rounded-lg border font-bold text-xs ${
                   goalType === 'weekly' ? 'border-[#D4AF37] text-[#D4AF37] bg-gray-900' : 'border-gray-700 text-gray-500 bg-[#121212]'
                 }`}
               >
                 WEEKLY
               </button>
               <button
                 onClick={() => setGoalType('monthly')}
                 className={`p-2 rounded-lg border font-bold text-xs ${
                   goalType === 'monthly' ? 'border-[#D4AF37] text-[#D4AF37] bg-gray-900' : 'border-gray-700 text-gray-500 bg-[#121212]'
                 }`}
               >
                 MONTHLY
               </button>
             </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 uppercase font-bold ml-1 font-montserrat">Goal Amount ($)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-[#121212] border border-gray-700 text-white p-3 rounded-xl focus:border-[#D4AF37] outline-none font-oswald"
            />
          </div>
        </div>

        <button
          onClick={() => {
            if (name && amount) {
              onSave({ name, goalType, goalAmount: parseFloat(amount) });
              onClose();
            }
          }}
          className="w-full bg-[#D4AF37] text-[#121212] font-oswald font-bold text-lg py-3 rounded-xl shadow-lg mt-6 active:scale-95 transition-transform"
        >
          SAVE CHANGES
        </button>
      </div>
    </div>
  );
};

const TransactionModal = ({ 
  isOpen, 
  type,
  category, 
  onClose, 
  onSave 
}: { 
  isOpen: boolean; 
  type: 'cash' | 'card';
  category: 'service' | 'tip';
  onClose: () => void; 
  onSave: (amount: number) => void; 
}) => {
  const [val, setVal] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setVal('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getTitle = () => {
    if (category === 'tip') return 'New Tip';
    return type === 'cash' ? 'Cash Entry' : 'Digital Entry';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-end sm:items-center justify-center animate-in fade-in duration-300">
      <div className="bg-[#1E1E1E] w-full max-w-md p-6 rounded-t-3xl sm:rounded-2xl border-t sm:border border-gray-800 animate-in slide-in-from-bottom-10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-oswald text-2xl text-white uppercase">
            {getTitle()}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl p-2">
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="relative mb-6">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C5A028] text-3xl font-oswald">$</span>
          <input
            ref={inputRef}
            type="number"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            placeholder="0"
            className="w-full bg-[#121212] border border-gray-700 text-white text-right font-oswald text-5xl p-4 pl-12 rounded-xl focus:border-[#D4AF37] focus:outline-none"
          />
        </div>
        
        <button
          onClick={() => {
            if (val) {
              onSave(parseFloat(val));
              onClose();
            }
          }}
          className="w-full bg-[#D4AF37] text-[#121212] font-oswald font-bold text-xl py-4 rounded-xl shadow-lg active:scale-95 transition-transform"
        >
          CONFIRM
        </button>
      </div>
    </div>
  );
};

const HistoryModal = ({ isOpen, transactions, onClose }: { isOpen: boolean, transactions: Transaction[], onClose: () => void }) => {
  if (!isOpen) return null;

  const grouped: Record<string, DaySummary> = {};
  
  transactions.forEach(t => {
    const d = new Date(t.date);
    const key = d.toDateString(); 
    
    if (!grouped[key]) {
      grouped[key] = {
        dateStr: key,
        dateObj: d,
        total: 0,
        count: 0
      };
    }
    grouped[key].total += t.amount;
    grouped[key].count += 1;
  });

  const historyList = Object.values(grouped).sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());

  return (
    <div className="fixed inset-0 z-50 bg-[#121212] flex flex-col pt-12 animate-in fade-in duration-300">
      <div className="flex justify-between items-center px-6 pb-4 border-b border-gray-800">
        <h2 className="font-oswald text-2xl text-white uppercase">Earnings History</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white text-xl p-2">
          <i className="fas fa-times"></i>
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {historyList.length === 0 ? (
          <p className="text-center text-gray-600 mt-10 font-montserrat">No days recorded yet.</p>
        ) : (
          historyList.map((day, idx) => (
            <div key={idx} className="bg-[#1E1E1E] border border-gray-800 p-4 rounded-xl flex justify-between items-center">
              <div>
                <p className="text-[#D4AF37] font-bold font-oswald text-lg">
                  {day.dateObj.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' }).toUpperCase()}
                </p>
                <p className="text-xs text-gray-500 font-montserrat">{day.count} transactions</p>
              </div>
              <p className="text-2xl text-white font-oswald font-bold">${day.total.toLocaleString()}</p>
            </div>
          ))
        )}
      </div>
      <div className="p-4 border-t border-gray-800 text-center">
        <p className="text-xs text-gray-500">System automatically closes the day at midnight.</p>
      </div>
    </div>
  );
};

// --- Main App / Export ---

export default function Dashboard() {
  const [data, setData] = useState<AppData>(getInitialData());
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'cash' | 'card'>('cash');
  const [modalCategory, setModalCategory] = useState<'service' | 'tip'>('service');
  
  const [historyOpen, setHistoryOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  
  const [expName, setExpName] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expFreq, setExpFreq] = useState<'daily' | 'weekly'>('weekly');
  
  // Sync to localstorage (Auto-save)
  useEffect(() => {
    saveData(data);
  }, [data]);

  const handleTransaction = (amount: number) => {
    const newTx: Transaction = {
      id: Date.now(),
      amount,
      type: modalType,
      category: modalCategory,
      date: new Date().toISOString(),
    };
    
    setData(prev => ({
      ...prev,
      transactions: [...prev.transactions, newTx]
    }));
  };

  const handleUpdateUser = (updates: Partial<UserData>) => {
    setData(prev => ({
      ...prev,
      user: { ...prev.user!, ...updates }
    }));
  };

  const handleSimulatorChange = (val: number) => {
    setData(prev => ({
        ...prev,
        user: { ...prev.user!, simulatorValue: val }
    }));
  };

  const openTransactionModal = (type: 'cash' | 'card', category: 'service' | 'tip' = 'service') => {
    setModalType(type);
    setModalCategory(category);
    setModalOpen(true);
  };

  const addExpense = () => {
    if (!expName || !expAmount) return;
    const newExp: Expense = {
      id: Date.now(),
      name: expName,
      amount: parseFloat(expAmount),
      frequency: expFreq
    };
    setData(prev => ({
      ...prev,
      expenses: [...prev.expenses, newExp]
    }));
    setExpName('');
    setExpAmount('');
    setShowExpenseForm(false);
  };

  const removeExpense = (id: number) => {
    setData(prev => ({
      ...prev,
      expenses: prev.expenses.filter(e => e.id !== id)
    }));
  };
  
  const resetApp = () => {
    if (confirm("ARE YOU SURE? This will wipe ALL your data and start fresh. This cannot be undone.")) {
        localStorage.removeItem(STORAGE_KEY);
        window.location.reload();
    }
  };

  const resetDay = () => {
    if (confirm("RESET TODAY? This will delete all transactions from today. This cannot be undone.")) {
        const startOfDay = new Date();
        startOfDay.setHours(0,0,0,0);
        const startOfDayIso = startOfDay.toISOString();
        
        setData(prev => ({
            ...prev,
            transactions: prev.transactions.filter(t => t.date < startOfDayIso)
        }));
    }
  };

  if (!data.user) {
    return (
        <>
            <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet" />
            <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;700&family=Montserrat:wght@400;700&display=swap" rel="stylesheet" />
            <Onboarding onComplete={(user) => setData({ ...data, user })} />
        </>
    );
  }

  // --- Calculations ---
  const now = new Date();
  const startOfDayStr = new Date(now.setHours(0,0,0,0)).toISOString();
  
  const transactionsToday = data.transactions.filter(t => t.date >= startOfDayStr);
  const grossToday = transactionsToday.reduce((sum, t) => sum + t.amount, 0);
  
  const tipsToday = transactionsToday
    .filter(t => t.category === 'tip')
    .reduce((sum, t) => sum + t.amount, 0);

  const dailyExpenses = data.expenses.reduce((sum, exp) => {
    if (exp.frequency === 'daily') return sum + exp.amount;
    return sum + (exp.amount / 7); 
  }, 0);

  const netToday = grossToday - dailyExpenses;

  const startOfPeriod = getStartOfPeriod(new Date(), data.user.goalType);
  const transactionsPeriod = data.transactions.filter(t => new Date(t.date) >= startOfPeriod);
  const periodTotal = transactionsPeriod.reduce((sum, t) => sum + t.amount, 0);
  const goalProgress = Math.min(100, (periodTotal / data.user.goalAmount) * 100);
  
  let daysLeft = 1;
  if (data.user.goalType === 'weekly') {
      const day = new Date().getDay(); 
      daysLeft = 7 - (day === 0 ? 7 : day) + 1;
  } else {
      const nowObj = new Date();
      const lastDay = new Date(nowObj.getFullYear(), nowObj.getMonth() + 1, 0);
      daysLeft = lastDay.getDate() - nowObj.getDate() + 1;
  }
  
  const remainingGoal = Math.max(0, data.user.goalAmount - periodTotal);
  const cutsNeededTotal = remainingGoal / AVG_CUT_PRICE;
  const cutsPerDay = Math.ceil(cutsNeededTotal / daysLeft);

  const simValue = data.user.simulatorValue || 0;

  return (
    <>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet" />
    <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;700&family=Montserrat:wght@400;700&display=swap" rel="stylesheet" />
    
    <div className="min-h-screen pb-12 w-full max-w-md mx-auto px-5 pt-6 animate-in fade-in duration-500 relative font-sans">
      
      {/* HEADER */}
      <header className="flex justify-between items-end border-b border-gray-800 pb-4 mb-6">
        <div>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider font-montserrat">Welcome</p>
          <h2 className="font-oswald text-3xl text-white uppercase leading-none tracking-tight">{data.user.name}</h2>
        </div>
        <div className="flex items-center gap-3">
            <button 
              onClick={() => setHistoryOpen(true)}
              className="text-[#D4AF37] border border-gray-800 bg-gray-900 p-2 rounded-lg hover:bg-gray-800 transition-colors"
              aria-label="View History"
            >
                <i className="fas fa-calendar-alt text-lg"></i>
            </button>
            <button 
              onClick={() => setSettingsOpen(true)}
              className="text-gray-400 border border-gray-800 bg-gray-900 p-2 rounded-lg hover:text-white hover:bg-gray-800 transition-colors"
              aria-label="Settings"
            >
                <i className="fas fa-cog text-lg"></i>
            </button>
        </div>
      </header>

      {/* FAST CASH ENTRY */}
      <section className="bg-[#1E1E1E] rounded-2xl p-6 shadow-2xl border border-gray-800 relative overflow-hidden mb-6">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <i className="fas fa-dollar-sign text-9xl text-white"></i>
        </div>
        
        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1 font-montserrat">Gross Total Today</p>
        <div className="flex items-baseline relative z-10">
            <span className="text-[#D4AF37] text-2xl mr-1 font-bold font-oswald">$</span>
            <span className="font-oswald text-6xl text-white font-bold tracking-tight">{grossToday.toLocaleString()}</span>
        </div>
        
        {tipsToday > 0 && (
          <div className="relative z-10 mt-1 mb-4 flex items-center gap-2">
            <i className="fas fa-coins text-[#C5A028] text-xs"></i>
            <p className="text-gray-400 text-xs font-montserrat">Includes <span className="text-white font-bold">${tipsToday}</span> in tips</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mt-4 relative z-10">
            <button 
              onClick={() => openTransactionModal('cash')}
              className="col-span-1 bg-gradient-to-br from-green-600 to-green-800 text-white p-4 rounded-xl shadow-lg active:scale-95 transition-all flex flex-col items-center justify-center gap-1 group border border-green-900 hover:border-green-400"
            >
                <i className="fas fa-money-bill-wave text-xl group-hover:animate-bounce mb-1"></i>
                <span className="font-oswald font-bold text-base leading-none">CASH</span>
            </button>
            
            <button 
              onClick={() => openTransactionModal('card')}
              className="col-span-1 bg-gradient-to-br from-blue-600 to-blue-800 text-white p-4 rounded-xl shadow-lg active:scale-95 transition-all flex flex-col items-center justify-center gap-1 group border border-blue-900 hover:border-blue-400"
            >
                <i className="fas fa-credit-card text-xl group-hover:animate-pulse mb-1"></i>
                <span className="font-oswald font-bold text-base leading-none">DIGITAL</span>
            </button>
            
            <button 
              onClick={() => openTransactionModal('cash', 'tip')}
              className="col-span-2 bg-gray-800 text-[#D4AF37] border border-[#D4AF37]/30 p-3 rounded-xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-gray-700"
            >
                <i className="fas fa-hand-holding-dollar"></i>
                <span className="font-oswald font-bold text-base tracking-widest">+ TIP</span>
            </button>
        </div>
      </section>

      {/* GOAL CHASER */}
      <section className="space-y-2 mb-6">
        <div className="flex justify-between items-end">
            <h3 className="font-oswald text-white text-xl uppercase">{data.user.goalType === 'weekly' ? 'Weekly' : 'Monthly'} Goal</h3>
            <span className="text-[#D4AF37] font-bold font-oswald text-xl">{Math.round(goalProgress)}%</span>
        </div>
        
        <div className="w-full bg-gray-900 rounded-full h-4 relative overflow-hidden border border-gray-800">
            <div 
              className="bg-gradient-to-r from-[#C5A028] to-[#D4AF37] h-4 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_#D4AF37]"
              style={{ width: `${goalProgress}%` }}
            ></div>
        </div>
        
        <div className="flex justify-between text-xs text-gray-500 mt-1 font-semibold font-montserrat">
            <span>Progress: ${periodTotal.toLocaleString()}</span>
            <span>Target: ${data.user.goalAmount.toLocaleString()}</span>
        </div>
        
        <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800 flex items-center gap-3 mt-2">
            <i className={`fas fa-fire ${cutsPerDay > 0 ? 'text-orange-500 animate-pulse' : 'text-green-500'}`}></i>
            <p className="text-xs text-gray-300 font-montserrat">
              {cutsPerDay <= 0 
                ? <span className="text-[#D4AF37] font-bold">Goal crushed! Everything extra is pure profit.</span>
                : <span>You need approx. <strong className="text-white">{cutsPerDay} cuts today</strong> to hit your goal.</span>
              }
            </p>
        </div>
      </section>

      {/* BALANCE GRID */}
      <section className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-[#1E1E1E] p-4 rounded-xl border border-gray-800">
            <p className="text-gray-500 text-[10px] uppercase font-bold font-montserrat">Daily Burn Rate</p>
            <p className="font-oswald text-2xl text-[#ff4444] font-medium">-${Math.ceil(dailyExpenses)}</p>
        </div>
        <div className="bg-[#1E1E1E] p-4 rounded-xl border border-gray-800">
            <p className="text-gray-500 text-[10px] uppercase font-bold font-montserrat">Real Net (Today)</p>
            <p className={`font-oswald text-2xl font-bold ${netToday >= 0 ? 'text-green-500' : 'text-[#ff4444]'}`}>
              {netToday >= 0 ? '+' : ''}{Math.floor(netToday).toLocaleString()}
            </p>
        </div>
      </section>

      {/* REALITY CHECK (EXPENSES) */}
      <section className="bg-[#1E1E1E] rounded-xl p-5 border border-gray-800 mb-6">
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-oswald text-white text-lg uppercase flex items-center gap-2">
                <i className="fas fa-file-invoice-dollar text-[#ff4444]"></i> Fixed Expenses
            </h3>
            <button 
              onClick={() => setShowExpenseForm(!showExpenseForm)}
              className="text-xs bg-gray-800 text-gray-300 px-3 py-1 rounded hover:bg-gray-700 transition font-montserrat font-bold"
            >
                {showExpenseForm ? 'CANCEL' : '+ ADD'}
            </button>
        </div>

        {showExpenseForm && (
          <div className="space-y-3 mb-4 bg-black/30 p-3 rounded-lg animate-in fade-in duration-300">
              <input 
                type="text" 
                placeholder="Name (Ex: Chair Rental)" 
                value={expName}
                onChange={e => setExpName(e.target.value)}
                className="w-full bg-gray-900 text-white p-2 rounded text-sm border border-gray-700 focus:border-[#ff4444] outline-none" 
              />
              <div className="flex gap-2">
                  <input 
                    type="number" 
                    placeholder="$ Cost" 
                    value={expAmount}
                    onChange={e => setExpAmount(e.target.value)}
                    className="w-1/2 bg-gray-900 text-white p-2 rounded text-sm border border-gray-700 focus:border-[#ff4444] outline-none" 
                  />
                  <select 
                    value={expFreq}
                    onChange={e => setExpFreq(e.target.value as any)}
                    className="w-1/2 bg-gray-900 text-white p-2 rounded text-sm border border-gray-700 outline-none"
                  >
                      <option value="weekly">Weekly</option>
                      <option value="daily">Daily</option>
                  </select>
              </div>
              <button 
                onClick={addExpense}
                className="w-full bg-[#ff4444] text-white font-oswald text-sm py-2 rounded shadow hover:opacity-90"
              >
                SAVE EXPENSE
              </button>
          </div>
        )}

        <div className="space-y-2 max-h-40 overflow-y-auto no-scrollbar">
            {data.expenses.length === 0 ? (
              <p className="text-center text-gray-600 text-xs italic py-2 font-montserrat">No expenses recorded.</p>
            ) : (
              data.expenses.map(exp => (
                <div key={exp.id} className="flex justify-between items-center bg-gray-900/50 p-2 rounded border border-gray-800/50">
                    <div>
                        <p className="text-sm text-gray-300 font-bold font-montserrat">{exp.name}</p>
                        <p className="text-[10px] text-gray-500 uppercase font-montserrat">{exp.frequency === 'daily' ? 'Daily' : 'Weekly'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-[#ff4444] font-oswald text-sm">-${exp.amount}</span>
                        <button onClick={() => removeExpense(exp.id)} className="text-gray-600 hover:text-red-500 transition-colors">
                          <i className="fas fa-trash-alt text-xs"></i>
                        </button>
                    </div>
                </div>
              ))
            )}
        </div>
      </section>

      {/* PRICE RAISE SIMULATOR */}
      <section className="bg-gradient-to-br from-[#1E1E1E] to-gray-900 rounded-xl p-5 border border-[#D4AF37]/20">
        <h3 className="font-oswald text-[#D4AF37] text-lg uppercase mb-2">Price Raise Simulator</h3>
        <p className="text-xs text-gray-400 mb-4 font-montserrat">Simulate the impact of price adjustments.</p>
        
        <div className="mb-6 px-2">
            <div className="flex justify-between text-xs text-gray-500 mb-2 font-bold font-montserrat">
                <span>+$0</span>
                <span className="text-white text-sm bg-gray-800 px-2 py-1 rounded">Raise ${simValue}</span>
                <span>+$20</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="20" 
              step="1" 
              value={simValue} 
              onChange={(e) => handleSimulatorChange(parseInt(e.target.value))}
              className="w-full accent-[#D4AF37]"
            />
        </div>
        
        <div className="text-center">
            <span className="block text-xs text-gray-400 uppercase tracking-widest font-montserrat">Extra Yearly Profit</span>
            <span className="font-oswald text-4xl text-green-400 font-bold">
              +${(simValue * 5 * 260).toLocaleString()}
            </span>
            <span className="block text-[10px] text-gray-500 mt-1 font-montserrat italic">*Est: 5 cuts/day x 260 working days</span>
        </div>
      </section>

      {/* FOOTER & RESET */}
      <footer className="text-center text-gray-700 text-[10px] mt-12 pb-8 font-montserrat space-y-4">
          <div>
            <p className="font-bold tracking-widest text-[#C5A028]">THE 6-FIGURE BARBER DASHBOARD</p>
            <p>Your data is secured locally on this device.</p>
          </div>
          
          <div className="flex flex-col gap-2 items-center">
            <button 
                onClick={resetDay}
                className="text-gray-500 hover:text-white transition-colors border border-gray-800 px-4 py-2 rounded uppercase font-bold text-xs"
            >
                Reset Current Day
            </button>

            <button 
                onClick={resetApp}
                className="text-gray-800 hover:text-[#ff4444] transition-colors underline decoration-1 underline-offset-4"
            >
                Reset All (Factory Reset)
            </button>
          </div>
      </footer>

      {/* MODALS */}
      <TransactionModal 
        isOpen={modalOpen} 
        type={modalType}
        category={modalCategory} 
        onClose={() => setModalOpen(false)} 
        onSave={handleTransaction}
      />

      <HistoryModal 
        isOpen={historyOpen}
        transactions={data.transactions}
        onClose={() => setHistoryOpen(false)}
      />

      <SettingsModal
        isOpen={settingsOpen}
        user={data.user}
        onClose={() => setSettingsOpen(false)}
        onSave={handleUpdateUser}
      />

    </div>
    </>
  );
}