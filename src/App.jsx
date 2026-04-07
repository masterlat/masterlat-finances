// Masterlat Finance v2.0 — Complete Application
// Auth + Plans + All Modules + Bug Fixes
import { useState, useMemo, useCallback, useEffect, useRef, createContext, useContext } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import {
  LayoutDashboard, Wallet, CreditCard, Receipt, Tag, Target,
  BarChart3, Calendar, Car, Plus, Search, Bell, Moon, Sun,
  ChevronRight, TrendingUp, TrendingDown, ArrowLeftRight,
  Edit3, Trash2, X, Check, ArrowUp, ArrowDown,
  Clock, Timer, ChevronLeft, Save, Info, Star, User,
  Eye, EyeOff, RefreshCw, Zap, Home, ShoppingCart, Heart,
  Plane, Book, Coffee, Music, Monitor, List, Route,
  GripVertical, Lock, Shield, Crown, Sparkles, LogOut,
  UserPlus, LogIn, Upload, CheckCircle, AlertTriangle, Package
} from "lucide-react";

// ─── AUTH CONTEXT ─────────────────────────────────────────────────────────────
const AuthContext = createContext(null);
const ADMIN_EMAIL = "admin@masterlat.com";

function useAuth() { return useContext(AuthContext); }

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mf_user')) || null; } catch { return null; }
  });

  const login = (email, password) => {
    const users = JSON.parse(localStorage.getItem('mf_users') || '[]');
    const found = users.find(u => u.email === email && u.password === password);
    if (!found) throw new Error('Email ou senha incorretos');
    const u = { ...found, password: undefined };
    setUser(u);
    localStorage.setItem('mf_user', JSON.stringify(u));
    return u;
  };

  const register = (name, email, password) => {
    const users = JSON.parse(localStorage.getItem('mf_users') || '[]');
    if (users.find(u => u.email === email)) throw new Error('Email já cadastrado');
    const newUser = {
      id: Date.now().toString(),
      name, email, password,
      role: email === ADMIN_EMAIL ? 'admin' : 'customer',
      plan: email === ADMIN_EMAIL ? 'pro' : 'starter',
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    localStorage.setItem('mf_users', JSON.stringify(users));
    const u = { ...newUser, password: undefined };
    setUser(u);
    localStorage.setItem('mf_user', JSON.stringify(u));
    return u;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mf_user');
  };

  const upgradePlan = (plan) => {
    const u = { ...user, plan };
    setUser(u);
    localStorage.setItem('mf_user', JSON.stringify(u));
    const users = JSON.parse(localStorage.getItem('mf_users') || '[]');
    const idx = users.findIndex(x => x.id === u.id);
    if (idx >= 0) { users[idx] = { ...users[idx], plan }; localStorage.setItem('mf_users', JSON.stringify(users)); }
  };

  return <AuthContext.Provider value={{ user, login, register, logout, upgradePlan, isAdmin: user?.role === 'admin' }}>
    {children}
  </AuthContext.Provider>;
}

// ─── PLAN LIMITS ─────────────────────────────────────────────────────────────
const PLAN_LIMITS = {
  starter: { accounts: 1, cards: 1, categories: 5, reports: false, corridas: false, agenda: false, label: 'Starter' },
  plus:    { accounts: 5, cards: 3, categories: 20, reports: true, corridas: false, agenda: true,  label: 'Plus'    },
  pro:     { accounts: 99,cards: 10,categories: 99, reports: true, corridas: true,  agenda: true,  label: 'Pro'     },
};
function canAccess(user, feature) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  return PLAN_LIMITS[user.plan]?.[feature] !== false;
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const MONTHS_FULL = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const MONTHS_SHORT = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const fmt = v => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v||0);
const fmtN = (v,d=1) => (v||0).toFixed(d).replace('.',',');
const today = new Date();

// ─── BANK SVG LOGOS ──────────────────────────────────────────────────────────
const BANK_SVGS = {
  Nubank: ({size=28}) => <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
    <rect width="28" height="28" rx="8" fill="#820AD1"/>
    <text x="14" y="19" textAnchor="middle" fill="white" fontSize="13" fontWeight="900" fontFamily="Arial">N</text>
  </svg>,
  Inter: ({size=28}) => <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
    <rect width="28" height="28" rx="8" fill="#FF7A00"/>
    <text x="14" y="19" textAnchor="middle" fill="white" fontSize="11" fontWeight="900" fontFamily="Arial">IT</text>
  </svg>,
  'Itaú': ({size=28}) => <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
    <rect width="28" height="28" rx="8" fill="#003D84"/>
    <text x="14" y="19" textAnchor="middle" fill="#F4A200" fontSize="11" fontWeight="900" fontFamily="Arial">itaú</text>
  </svg>,
  Bradesco: ({size=28}) => <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
    <rect width="28" height="28" rx="8" fill="#CC092F"/>
    <text x="14" y="19" textAnchor="middle" fill="white" fontSize="10" fontWeight="900" fontFamily="Arial">BRA</text>
  </svg>,
  Caixa: ({size=28}) => <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
    <rect width="28" height="28" rx="8" fill="#005CA9"/>
    <text x="14" y="19" textAnchor="middle" fill="#FF8C00" fontSize="10" fontWeight="900" fontFamily="Arial">CEF</text>
  </svg>,
  Santander: ({size=28}) => <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
    <rect width="28" height="28" rx="8" fill="#EC0000"/>
    <circle cx="14" cy="14" r="6" fill="white" fillOpacity="0.2"/>
    <text x="14" y="19" textAnchor="middle" fill="white" fontSize="9" fontWeight="900" fontFamily="Arial">SAN</text>
  </svg>,
  BB: ({size=28}) => <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
    <rect width="28" height="28" rx="8" fill="#FFCC00"/>
    <text x="14" y="19" textAnchor="middle" fill="#003087" fontSize="12" fontWeight="900" fontFamily="Arial">BB</text>
  </svg>,
  BTG: ({size=28}) => <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
    <rect width="28" height="28" rx="8" fill="#1A1A2E"/>
    <text x="14" y="19" textAnchor="middle" fill="#C49A1E" fontSize="10" fontWeight="900" fontFamily="Arial">BTG</text>
  </svg>,
  XP: ({size=28}) => <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
    <rect width="28" height="28" rx="8" fill="#000000"/>
    <text x="14" y="19" textAnchor="middle" fill="white" fontSize="12" fontWeight="900" fontFamily="Arial">XP</text>
  </svg>,
  'C6 Bank': ({size=28}) => <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
    <rect width="28" height="28" rx="8" fill="#242424"/>
    <text x="14" y="19" textAnchor="middle" fill="white" fontSize="10" fontWeight="900" fontFamily="Arial">C6</text>
  </svg>,
  Picpay: ({size=28}) => <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
    <rect width="28" height="28" rx="8" fill="#21C25E"/>
    <text x="14" y="19" textAnchor="middle" fill="white" fontSize="9" fontWeight="900" fontFamily="Arial">PIC</text>
  </svg>,
  Mercado: ({size=28}) => <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
    <rect width="28" height="28" rx="8" fill="#FFE600"/>
    <text x="14" y="19" textAnchor="middle" fill="#009EE3" fontSize="9" fontWeight="800" fontFamily="Arial">MP</text>
  </svg>,
  Carteira: ({size=28}) => <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
    <rect width="28" height="28" rx="8" fill="#16A34A"/>
    <text x="14" y="18" textAnchor="middle" fill="white" fontSize="16">💵</text>
  </svg>,
};
const BANK_LIST = Object.keys(BANK_SVGS);

function BankLogo({ bank, size=28 }) {
  const Comp = BANK_SVGS[bank];
  if (!Comp) return <div style={{width:size,height:size,borderRadius:8,background:'var(--bg-elevated)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,color:'var(--text-3)'}}>🏦</div>;
  return <Comp size={size}/>;
}

// Card brands
const BrandVisa = () => <svg viewBox="0 0 48 16" width="38" height="13"><text x="0" y="13" fontFamily="Arial" fontWeight="900" fontSize="15" fill="white" letterSpacing="-0.5">VISA</text></svg>;
const BrandMastercard = () => <svg viewBox="0 0 38 24" width="38" height="24">
  <circle cx="14" cy="12" r="12" fill="#EB001B" opacity="0.9"/>
  <circle cx="24" cy="12" r="12" fill="#F79E1B" opacity="0.9"/>
  <path d="M19 5.5a12 12 0 0 1 0 13A12 12 0 0 1 19 5.5z" fill="#FF5F00" opacity="0.85"/>
</svg>;
const BrandElo = () => <svg viewBox="0 0 40 16" width="38" height="14"><text x="0" y="13" fontFamily="Arial" fontWeight="900" fontSize="14" fill="white">elo</text></svg>;
const BrandAmex = () => <svg viewBox="0 0 52 16" width="48" height="14"><text x="0" y="13" fontFamily="Arial" fontWeight="700" fontSize="12" fill="white" letterSpacing="0.3">AMEX</text></svg>;
const BRANDS = { Visa:BrandVisa, Mastercard:BrandMastercard, Elo:BrandElo, Amex:BrandAmex };

// ─── EMOJI SETS FOR CATEGORIES ─────────────────────────────────────────────
const CATEGORY_EMOJIS = [
  '🏠','🍔','🚗','💊','🎮','📚','✈️','🎵','☕','🛍️','💰','💡','📱',
  '🏋️','🎬','🐶','🌿','🏖️','🎓','🔧','💻','🎯','🚿','🧴','🛒',
  '🍕','🍣','🍷','🎂','🛵','🚌','🚂','⛽','💈','🏥','💉','🦷',
  '📺','🎮','🎲','🏊','🤸','🎁','💐','🧹','🔑','📦','💳','🏧',
  '📊','📈','🏦','💼','🤝','🎤','🎸','🎺','🖥️','⌚','👕','👗',
  '👟','👜','🕶️','🌙','☀️','⭐','🌈','❤️','🔥','💫','✨','🎉',
];

// ─── INITIAL DATA ─────────────────────────────────────────────────────────────
const INIT_ACCOUNTS = [
  {id:1, name:'Nubank',  type:'digital',  balance:2450.80, initial:2000, bank:'Nubank',    hidden:false},
  {id:2, name:'Inter',   type:'poupança', balance:8200.00, initial:8000, bank:'Inter',     hidden:false},
  {id:3, name:'Itaú',    type:'corrente', balance:3100.50, initial:3000, bank:'Itaú',      hidden:false},
  {id:4, name:'Carteira',type:'carteira', balance:350.00,  initial:350,  bank:'Carteira',  hidden:false},
];
const INIT_CARDS = [
  {id:1,name:'Nubank',    brand:'Mastercard',bank:'Nubank',limit:5000,used:1240.50,closing:5, due:12,color1:'#820AD1',color2:'#5C0A95'},
  {id:2,name:'Inter Gold',brand:'Visa',      bank:'Inter', limit:3000,used:680.00, closing:10,due:17,color1:'#FF7A00',color2:'#CC5500'},
];
const INIT_CATS = [
  {id:1, name:'Moradia',     emoji:'🏠', color:'#3B82F6', type:'expense'},
  {id:2, name:'Alimentação', emoji:'🍔', color:'#F59E0B', type:'expense'},
  {id:3, name:'Transporte',  emoji:'🚗', color:'#8B5CF6', type:'expense'},
  {id:4, name:'Saúde',       emoji:'💊', color:'#EF4444', type:'expense'},
  {id:5, name:'Lazer',       emoji:'🎮', color:'#EC4899', type:'expense'},
  {id:6, name:'Assinaturas', emoji:'📱', color:'#06B6D4', type:'expense'},
  {id:7, name:'Compras',     emoji:'🛍️', color:'#F97316', type:'expense'},
  {id:8, name:'Salário',     emoji:'💰', color:'#10B981', type:'income'},
  {id:9, name:'Renda Extra', emoji:'⭐', color:'#84CC16', type:'income'},
  {id:10,name:'Investimentos',emoji:'📈', color:'#6366F1', type:'expense'},
  {id:11,name:'Outros',      emoji:'📦', color:'#64748B', type:'expense'},
];
const INIT_TX = [
  {id:1,type:'income',  desc:'Salário Abril',    amount:6500,   date:'2026-04-05',accountId:3,catId:8, status:'done'},
  {id:2,type:'expense', desc:'Aluguel Abril',    amount:1800,   date:'2026-04-05',accountId:3,catId:1, status:'done'},
  {id:3,type:'expense', desc:'Supermercado',     amount:340.50, date:'2026-04-04',accountId:1,catId:2, status:'done'},
  {id:4,type:'expense', desc:'Spotify + Netflix',amount:89.90,  date:'2026-04-03',accountId:1,catId:6, status:'done'},
  {id:5,type:'expense', desc:'Farmácia',         amount:120.00, date:'2026-04-03',accountId:4,catId:4, status:'done'},
  {id:6,type:'expense', desc:'Gasolina',         amount:200.00, date:'2026-04-02',accountId:3,catId:3, status:'done'},
  {id:7,type:'income',  desc:'Freelance Design', amount:1200,   date:'2026-04-01',accountId:1,catId:9, status:'done'},
  {id:8,type:'expense', desc:'Academia',         amount:99.90,  date:'2026-04-01',accountId:1,catId:5, status:'done'},
  {id:9,type:'transfer',desc:'Reserva mensal',   amount:500,    date:'2026-04-01',fromAccountId:3,toAccountId:2,status:'done'},
  {id:10,type:'expense',desc:'Restaurante',      amount:87.50,  date:'2026-03-30',accountId:4,catId:2, status:'done'},
  {id:11,type:'income', desc:'Salário Março',    amount:6500,   date:'2026-03-05',accountId:3,catId:8, status:'done'},
  {id:12,type:'expense',desc:'Aluguel Março',    amount:1800,   date:'2026-03-05',accountId:3,catId:1, status:'done'},
  {id:13,type:'expense',desc:'Supermercado',     amount:290.00, date:'2026-03-10',accountId:1,catId:2, status:'done'},
];
const INIT_INVOICES = [
  {id:1,cardId:1,month:4,year:2026,status:'open',  closingDate:'2026-04-05',dueDate:'2026-04-12',
   purchases:[{id:101,desc:'Amazon',amount:299.90,date:'2026-03-20',installments:1,catId:7},{id:102,desc:'Zara',amount:420.00,date:'2026-03-22',installments:3,catId:7},{id:103,desc:'iFood',amount:78.40,date:'2026-03-25',installments:1,catId:2},{id:104,desc:'Shopee',amount:150.00,date:'2026-04-01',installments:2,catId:7}]},
  {id:2,cardId:1,month:3,year:2026,status:'paid',  closingDate:'2026-03-05',dueDate:'2026-03-12',
   purchases:[{id:201,desc:'Mercado Livre',amount:380.00,date:'2026-02-20',installments:1,catId:7},{id:202,desc:'Cinema',amount:95.00,date:'2026-03-01',installments:1,catId:5}]},
  {id:3,cardId:2,month:4,year:2026,status:'open',  closingDate:'2026-04-10',dueDate:'2026-04-17',
   purchases:[{id:301,desc:'Supermercado',amount:430.00,date:'2026-03-28',installments:1,catId:2},{id:302,desc:'Decathlon',amount:250.00,date:'2026-04-01',installments:2,catId:5}]},
];
const INIT_BUDGETS = [
  {id:1,catId:1,name:'Moradia',     amount:2000,spent:1800, color:'#3B82F6'},
  {id:2,catId:2,name:'Alimentação', amount:1200,spent:427.9,color:'#F59E0B'},
  {id:3,catId:3,name:'Transporte',  amount:400, spent:200,  color:'#8B5CF6'},
  {id:4,catId:4,name:'Saúde',       amount:300, spent:120,  color:'#EF4444'},
  {id:5,catId:5,name:'Lazer',       amount:500, spent:187.4,color:'#EC4899'},
  {id:6,catId:6,name:'Assinaturas', amount:150, spent:89.9, color:'#06B6D4'},
];
const INIT_GOALS = [
  {id:1,name:'Reserva de Emergência',target:30000,current:8200, deadline:'2027-12-31',color:'#10B981'},
  {id:2,name:'Viagem para Europa',   target:15000,current:3500, deadline:'2027-06-30',color:'#3B82F6'},
  {id:3,name:'Trocar de Notebook',   target:6000, current:2800, deadline:'2026-08-01',color:'#8B5CF6'},
];
const INIT_AGENDA = [
  {id:1,desc:'Aluguel',      amount:1800,day:5, type:'expense',repeat:'monthly',catId:1,color:'#3B82F6'},
  {id:2,desc:'Spotify',      amount:21.90,day:8, type:'expense',repeat:'monthly',catId:6,color:'#1DB954'},
  {id:3,desc:'Netflix',      amount:55.90,day:8, type:'expense',repeat:'monthly',catId:6,color:'#E50914'},
  {id:4,desc:'Academia',     amount:99.90,day:10,type:'expense',repeat:'monthly',catId:5,color:'#F59E0B'},
  {id:5,desc:'Internet',     amount:129.90,day:15,type:'expense',repeat:'monthly',catId:6,color:'#06B6D4'},
  {id:6,desc:'Salário',      amount:6500, day:5, type:'income', repeat:'monthly',catId:8,color:'#10B981'},
  {id:7,desc:'Fatura Nubank',amount:1240.50,day:12,type:'expense',repeat:'monthly',catId:7,color:'#820AD1'},
];
const INIT_CORRIDAS = [
  {id:1,date:'2026-04-01',trips:18,km:142,autonomia:12.5,hours:8.5, earnings:310.50,fuelPrice:6.39},
  {id:2,date:'2026-04-02',trips:22,km:168,autonomia:12.5,hours:10,  earnings:390.00,fuelPrice:6.39},
  {id:3,date:'2026-04-03',trips:15,km:110,autonomia:12.5,hours:7,   earnings:245.80,fuelPrice:6.39},
  {id:4,date:'2026-04-04',trips:20,km:155,autonomia:12.5,hours:9,   earnings:355.00,fuelPrice:6.39},
  {id:5,date:'2026-04-05',trips:12,km:95, autonomia:12.5,hours:6,   earnings:198.50,fuelPrice:6.39},
  {id:6,date:'2026-03-28',trips:24,km:190,autonomia:12.5,hours:11,  earnings:430.00,fuelPrice:6.29},
  {id:7,date:'2026-03-29',trips:16,km:125,autonomia:12.5,hours:8,   earnings:280.00,fuelPrice:6.29},
  {id:8,date:'2026-03-30',trips:19,km:148,autonomia:12.5,hours:9.5, earnings:325.00,fuelPrice:6.29},
];

// ─── STYLES ──────────────────────────────────────────────────────────────────
const STYLES = `
  .fos-app { font-family:'Outfit',sans-serif; min-height:100vh; display:flex; overflow:hidden; }
  .fos-app.dark {
    --bg:#060D1A; --bg-card:#0C1929; --bg-elevated:#102035; --bg-hover:#142540;
    --border:rgba(99,179,237,0.08); --border-accent:rgba(34,211,238,0.2);
    --text-1:#E8EEF8; --text-2:#8FA8C8; --text-3:#4A6080;
    --accent:#22D3EE; --accent-dim:rgba(34,211,238,0.12); --accent-glow:rgba(34,211,238,0.05);
    --success:#34D399; --success-dim:rgba(52,211,153,0.12);
    --danger:#F87171; --danger-dim:rgba(248,113,113,0.12);
    --warning:#FBBF24; --warning-dim:rgba(251,191,36,0.12);
    --purple:#A78BFA; --purple-dim:rgba(167,139,250,0.12);
    background:var(--bg); color:var(--text-1);
  }
  .fos-app.light {
    --bg:#EEF2F8; --bg-card:#FFFFFF; --bg-elevated:#F4F7FC; --bg-hover:#EBF1F9;
    --border:rgba(100,130,180,0.14); --border-accent:rgba(8,145,178,0.25);
    --text-1:#0F1B2D; --text-2:#4A6080; --text-3:#94A3B8;
    --accent:#0891B2; --accent-dim:rgba(8,145,178,0.1); --accent-glow:rgba(8,145,178,0.04);
    --success:#059669; --success-dim:rgba(5,150,105,0.1);
    --danger:#DC2626; --danger-dim:rgba(220,38,38,0.1);
    --warning:#D97706; --warning-dim:rgba(217,119,6,0.1);
    --purple:#7C3AED; --purple-dim:rgba(124,58,237,0.1);
    background:var(--bg); color:var(--text-1);
  }
  .fos-sidebar { width:248px; min-height:100vh; background:var(--bg-card); border-right:1px solid var(--border); display:flex; flex-direction:column; flex-shrink:0; overflow-y:auto; }
  .fos-logo { padding:18px 16px 14px; border-bottom:1px solid var(--border); display:flex; align-items:center; gap:10px; }
  .fos-logo-text { font-family:'Syne',sans-serif; font-weight:800; font-size:16px; color:var(--text-1); line-height:1.1; }
  .fos-logo-sub { font-size:10px; font-weight:500; color:var(--text-3); letter-spacing:1px; text-transform:uppercase; }
  .fos-nav { padding:10px; flex:1; }
  .fos-nav-label { font-size:10px; font-weight:600; letter-spacing:1.2px; text-transform:uppercase; color:var(--text-3); padding:8px 10px 4px; }
  .fos-nav-item { display:flex; align-items:center; gap:10px; padding:8px 12px; border-radius:10px; cursor:pointer; color:var(--text-2); font-size:13.5px; font-weight:500; transition:all 0.15s; margin-bottom:2px; border:1px solid transparent; }
  .fos-nav-item:hover { background:var(--bg-hover); color:var(--text-1); }
  .fos-nav-item.active { background:var(--accent-dim); border-color:var(--border-accent); color:var(--accent); font-weight:600; }
  .nav-dot { width:5px; height:5px; background:var(--accent); border-radius:50%; margin-left:auto; box-shadow:0 0 8px var(--accent); }
  .fos-badge-nav { margin-left:auto; background:var(--danger); color:white; font-size:10px; font-weight:700; border-radius:20px; padding:1px 6px; }
  .fos-sidebar-footer { padding:10px; border-top:1px solid var(--border); }
  .fos-main { flex:1; display:flex; flex-direction:column; overflow:hidden; }
  .fos-header { height:58px; background:var(--bg-card); border-bottom:1px solid var(--border); display:flex; align-items:center; padding:0 24px; gap:10px; flex-shrink:0; }
  .fos-content { flex:1; overflow-y:auto; padding:24px; }
  .fos-card { background:var(--bg-card); border:1px solid var(--border); border-radius:16px; padding:20px; transition:border-color 0.2s; }
  .fos-card:hover { border-color:var(--border-accent); }
  .stat-card { background:var(--bg-card); border:1px solid var(--border); border-radius:16px; padding:18px 20px; display:flex; flex-direction:column; gap:10px; transition:all 0.2s; position:relative; overflow:hidden; cursor:pointer; }
  .stat-card:hover { transform:translateY(-2px); border-color:var(--border-accent); box-shadow:0 8px 24px rgba(0,0,0,0.15); }
  .stat-card::before { content:''; position:absolute; top:0;left:0;right:0; height:2px; border-radius:2px; }
  .stat-card.green::before { background:linear-gradient(90deg,var(--success),transparent); }
  .stat-card.red::before   { background:linear-gradient(90deg,var(--danger),transparent); }
  .stat-card.blue::before  { background:linear-gradient(90deg,var(--accent),transparent); }
  .stat-card.yellow::before { background:linear-gradient(90deg,var(--warning),transparent); }
  .stat-card.purple::before { background:linear-gradient(90deg,var(--purple),transparent); }
  .g4{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;}
  .g3{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;}
  .g2{display:grid;grid-template-columns:repeat(2,1fr);gap:16px;}
  .g21{display:grid;grid-template-columns:2fr 1fr;gap:16px;}
  .btn { display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:8px 16px;border-radius:10px;font-size:13.5px;font-weight:600;font-family:'Outfit',sans-serif;cursor:pointer;border:none;transition:all 0.15s; }
  .btn-p { background:var(--accent); color:#020B15; }
  .btn-p:hover { filter:brightness(1.1); transform:translateY(-1px); }
  .btn-g { background:var(--bg-elevated); color:var(--text-2); border:1px solid var(--border); }
  .btn-g:hover { color:var(--text-1); border-color:var(--border-accent); }
  .btn-d { background:var(--danger-dim); color:var(--danger); border:1px solid var(--danger-dim); }
  .btn-d:hover { background:var(--danger); color:white; }
  .btn-s { background:var(--success-dim); color:var(--success); border:1px solid var(--success-dim); }
  .ib { width:34px;height:34px;border-radius:9px;border:1px solid var(--border);background:var(--bg-elevated);color:var(--text-2);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.15s; }
  .ib:hover { color:var(--text-1); background:var(--bg-hover); }
  .inp { width:100%;background:var(--bg-elevated);border:1px solid var(--border);border-radius:10px;padding:10px 12px;font-size:14px;color:var(--text-1);font-family:'Outfit',sans-serif;outline:none;transition:border-color 0.15s; }
  .inp:focus { border-color:var(--accent); }
  .inp::placeholder { color:var(--text-3); }
  .lbl { display:block;font-size:11px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;color:var(--text-3);margin-bottom:5px; }
  .fg { margin-bottom:14px; }
  .tbl { width:100%;border-collapse:collapse; }
  .tbl th { text-align:left;font-size:11px;font-weight:600;letter-spacing:0.8px;text-transform:uppercase;color:var(--text-3);padding:10px 12px;border-bottom:1px solid var(--border);cursor:pointer;user-select:none;white-space:nowrap; }
  .tbl th:hover { color:var(--accent); }
  .tbl td { padding:11px 12px;font-size:13.5px;color:var(--text-2);border-bottom:1px solid var(--border);white-space:nowrap; }
  .tbl tr:last-child td { border-bottom:none; }
  .tbl tbody tr:hover td { background:var(--bg-hover); color:var(--text-1); }
  .badge { display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:20px;font-size:11px;font-weight:600; }
  .b-g{background:var(--success-dim);color:var(--success);}
  .b-r{background:var(--danger-dim);color:var(--danger);}
  .b-b{background:var(--accent-dim);color:var(--accent);}
  .b-y{background:var(--warning-dim);color:var(--warning);}
  .b-p{background:var(--purple-dim);color:var(--purple);}
  .b-gray{background:var(--bg-elevated);color:var(--text-2);}
  .overlay { position:fixed;inset:0;background:rgba(0,0,0,0.72);z-index:100;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(5px); }
  .modal { background:var(--bg-card);border:1px solid var(--border);border-radius:20px;padding:28px;width:100%;max-width:520px;max-height:90vh;overflow-y:auto; }
  .modal-lg { max-width:780px; }
  .modal-title { font-family:'Syne',sans-serif;font-size:18px;font-weight:700;color:var(--text-1);margin-bottom:20px;display:flex;align-items:center;justify-content:space-between; }
  .pg-title { font-family:'Syne',sans-serif;font-size:22px;font-weight:800;color:var(--text-1);margin-bottom:4px; }
  .pg-sub { font-size:13px;color:var(--text-3);margin-bottom:22px; }
  .sec-title { font-family:'Syne',sans-serif;font-size:14px;font-weight:700;color:var(--text-1);margin-bottom:14px;display:flex;align-items:center;justify-content:space-between; }
  .money { font-family:'Outfit',sans-serif;font-weight:700; }
  .pos{color:var(--success);font-weight:600;}
  .neg{color:var(--danger);font-weight:600;}
  .pbar-wrap{height:6px;background:var(--bg-elevated);border-radius:10px;overflow:hidden;}
  .pbar-fill{height:100%;border-radius:10px;transition:width 0.5s ease;}
  .search-box{display:flex;align-items:center;background:var(--bg-elevated);border:1px solid var(--border);border-radius:10px;padding:6px 12px;gap:8px;width:200px;}
  .search-box input{background:transparent;border:none;outline:none;font-size:13px;color:var(--text-1);font-family:'Outfit',sans-serif;width:100%;}
  .search-box input::placeholder{color:var(--text-3);}
  .month-nav{display:flex;align-items:center;gap:8px;background:var(--bg-card);border:1px solid var(--border);border-radius:12px;padding:6px 10px;}
  .month-nav button{background:none;border:none;cursor:pointer;color:var(--text-2);display:flex;align-items:center;padding:2px;border-radius:6px;transition:all 0.15s;}
  .month-nav button:hover{color:var(--accent);background:var(--accent-dim);}
  .month-nav span{font-family:'Syne',sans-serif;font-weight:700;font-size:14px;color:var(--text-1);min-width:130px;text-align:center;}
  .drag-item{transition:all 0.15s;user-select:none;}
  .drag-item.dragging{opacity:0.5;transform:scale(0.98);}
  .drag-item.drag-over{border-top:2px solid var(--accent);}
  .emoji-grid{display:grid;grid-template-columns:repeat(10,1fr);gap:4px;max-height:200px;overflow-y:auto;padding:4px;}
  .emoji-btn{background:none;border:1px solid transparent;border-radius:6px;cursor:pointer;font-size:18px;padding:4px;transition:all 0.1s;display:flex;align-items:center;justify-content:center;}
  .emoji-btn:hover{background:var(--accent-dim);border-color:var(--border-accent);}
  .emoji-btn.sel{background:var(--accent-dim);border-color:var(--accent);}
  .plan-card{background:var(--bg-card);border:1px solid var(--border);border-radius:20px;padding:28px;transition:all 0.2s;position:relative;overflow:hidden;}
  .plan-card:hover{transform:translateY(-4px);box-shadow:0 20px 40px rgba(0,0,0,0.2);}
  .plan-card.featured{border-color:var(--accent);box-shadow:0 0 0 1px var(--accent);}
  .plan-card.featured::before{content:'MAIS POPULAR';position:absolute;top:14px;right:-22px;background:var(--accent);color:#020B15;font-size:10px;font-weight:700;padding:3px 28px;transform:rotate(45deg);letter-spacing:1px;}
  .auth-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--bg);padding:20px;}
  .auth-box{background:var(--bg-card);border:1px solid var(--border);border-radius:24px;padding:40px;width:100%;max-width:440px;}
  .info-box{background:var(--accent-glow);border:1px solid var(--border-accent);border-radius:10px;padding:10px 14px;margin-bottom:16px;font-size:12px;color:var(--accent);display:flex;gap:8px;align-items:flex-start;}
  @keyframes fadeIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
  .fi{animation:fadeIn 0.22s ease forwards;}
  select.inp option{background:#0C1929;}
`;

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function PBar({pct,color}){const c=Math.min(100,Math.max(0,pct));const col=pct>90?'var(--danger)':pct>70?'var(--warning)':color||'var(--accent)';return<div className="pbar-wrap"><div className="pbar-fill" style={{width:`${c}%`,background:col}}/></div>;}
function Tip({active,payload,label}){if(!active||!payload?.length)return null;return<div style={{background:'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:10,padding:'10px 14px'}}><p style={{fontSize:12,color:'var(--text-3)',marginBottom:6}}>{label}</p>{payload.map((p,i)=><p key={i} style={{fontSize:13,fontWeight:600,color:p.color}}>{p.name}: {fmt(p.value)}</p>)}</div>;}
function Modal({open,onClose,title,children,lg}){if(!open)return null;return<div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}><div className={`modal fi${lg?' modal-lg':''}`}><div className="modal-title"><span>{title}</span><button className="ib" onClick={onClose}><X size={15}/></button></div>{children}</div></div>;}
function MonthNav({month,year,onChange}){
  const prev=()=>{if(month===0)onChange(11,year-1);else onChange(month-1,year);};
  const next=()=>{if(month===11)onChange(0,year+1);else onChange(month+1,year);};
  return<div className="month-nav"><button onClick={prev}><ChevronLeft size={16}/></button><span>{MONTHS_FULL[month]} {year}</span><button onClick={next}><ChevronRight size={16}/></button></div>;
}

// ─── AUTH SCREENS ─────────────────────────────────────────────────────────────
function AuthScreen() {
  const {login,register} = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({name:'',email:'',password:''});
  const [err, setErr]   = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setErr(''); setLoading(true);
    try {
      if(mode==='login') await login(form.email, form.password);
      else await register(form.name, form.email, form.password);
    } catch(e){ setErr(e.message); }
    setLoading(false);
  };

  return <div className="auth-wrap">
    <div className="auth-box fi">
      <div style={{textAlign:'center',marginBottom:32}}>
        <div style={{fontFamily:'Syne',fontWeight:800,fontSize:28,color:'var(--text-1)',marginBottom:4}}>Masterlat</div>
        <div style={{fontSize:14,color:'var(--text-3)',letterSpacing:2,textTransform:'uppercase',fontWeight:500}}>Finance</div>
      </div>
      <div style={{display:'flex',gap:8,marginBottom:24,background:'var(--bg-elevated)',borderRadius:12,padding:4}}>
        {[['login','Entrar'],['register','Criar conta']].map(([m,l])=>(
          <button key={m} className={`btn${mode===m?' btn-p':' btn-g'}`} style={{flex:1,border:'none'}} onClick={()=>setMode(m)}>{l}</button>
        ))}
      </div>
      {mode==='register'&&<div className="fg"><label className="lbl">Nome completo</label><input className="inp" placeholder="Seu nome" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/></div>}
      <div className="fg"><label className="lbl">E-mail</label><input className="inp" type="email" placeholder="email@exemplo.com" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}/></div>
      <div className="fg"><label className="lbl">Senha</label><input className="inp" type="password" placeholder="••••••••" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} onKeyDown={e=>e.key==='Enter'&&submit()}/></div>
      {err&&<div style={{background:'var(--danger-dim)',border:'1px solid var(--danger-dim)',borderRadius:10,padding:'10px 14px',fontSize:13,color:'var(--danger)',marginBottom:14}}>{err}</div>}
      <button className="btn btn-p" style={{width:'100%'}} onClick={submit} disabled={loading}>
        {loading?'Aguarde...':(mode==='login'?<><LogIn size={15}/> Entrar</>:<><UserPlus size={15}/> Criar conta</>)}
      </button>
      {mode==='login'&&<div style={{textAlign:'center',marginTop:16,fontSize:12,color:'var(--text-3)'}}>
        Conta demo admin: <strong style={{color:'var(--accent)'}}>admin@masterlat.com</strong> / <strong style={{color:'var(--accent)'}}>admin123</strong>
      </div>}
    </div>
  </div>;
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function DashboardView({data,setActiveView}) {
  const [month,setMonth] = useState(today.getMonth());
  const [year,setYear]   = useState(today.getFullYear());
  const prefix = `${year}-${String(month+1).padStart(2,'0')}`;

  const txMonth  = data.transactions.filter(t=>t.date.startsWith(prefix));
  const incomes  = txMonth.filter(t=>t.type==='income').reduce((a,c)=>a+c.amount,0);
  const expenses = txMonth.filter(t=>t.type==='expense').reduce((a,c)=>a+c.amount,0);
  const net      = incomes - expenses;
  const visAccs  = data.accounts.filter(a=>!a.hidden);
  const balance  = visAccs.reduce((a,c)=>a+c.balance,0);

  const pieData = data.categories.filter(c=>c.type==='expense').map(cat=>{
    const total = txMonth.filter(t=>t.type==='expense'&&t.catId===cat.id).reduce((a,c)=>a+c.amount,0);
    return {name:cat.emoji+' '+cat.name, value:total, color:cat.color};
  }).filter(d=>d.value>0).sort((a,b)=>b.value-a.value).slice(0,6);

  const chartData = Array.from({length:6},(_,i)=>{
    const d = new Date(year,month-5+i,1);
    const m = d.getMonth(); const y = d.getFullYear();
    const pfx = `${y}-${String(m+1).padStart(2,'0')}`;
    const txs = data.transactions.filter(t=>t.date.startsWith(pfx));
    return { name:MONTHS_SHORT[m], entradas:txs.filter(t=>t.type==='income').reduce((a,c)=>a+c.amount,0), saidas:txs.filter(t=>t.type==='expense').reduce((a,c)=>a+c.amount,0) };
  });

  const recent = [...data.transactions].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,7);
  const stats = [
    {l:'Saldo Total',   v:balance,   c:'blue',   ac:'accent',   to:'contas',      I:Wallet},
    {l:'Entradas',      v:incomes,   c:'green',  ac:'success',  to:'lancamentos', I:TrendingUp},
    {l:'Saídas',        v:expenses,  c:'red',    ac:'danger',   to:'lancamentos', I:TrendingDown},
    {l:'Resultado',     v:net,       c:net>=0?'green':'red', ac:net>=0?'success':'danger', to:'relatorios', I:BarChart3},
  ];

  return <div className="fi">
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:22}}>
      <div><div className="pg-title">Dashboard</div><div className="pg-sub" style={{marginBottom:0}}>Visão geral das suas finanças</div></div>
      <div style={{display:'flex',gap:10,alignItems:'center'}}>
        <MonthNav month={month} year={year} onChange={(m,y)=>{setMonth(m);setYear(y);}}/>
        <button className="btn btn-p" onClick={()=>setActiveView('lancamentos')}><Plus size={15}/> Lançamento</button>
      </div>
    </div>
    <div className="g4" style={{marginBottom:20}}>
      {stats.map(s=>(
        <div key={s.l} className={`stat-card ${s.c}`} onClick={()=>setActiveView(s.to)}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <span style={{fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:1,color:'var(--text-3)'}}>{s.l}</span>
            <div style={{width:30,height:30,background:`var(--${s.ac}-dim)`,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center'}}>
              <s.I size={14} color={`var(--${s.ac})`}/>
            </div>
          </div>
          <div className="money" style={{fontSize:22,color:`var(--${s.ac})`}}>{fmt(s.v)}</div>
          <div style={{fontSize:11,color:'var(--text-3)',display:'flex',gap:4}}><ChevronRight size={11}/> ver detalhes</div>
        </div>
      ))}
    </div>
    <div className="g21" style={{marginBottom:20}}>
      <div className="fos-card">
        <div className="sec-title">Evolução Mensal</div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="gi" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--success)" stopOpacity={0.3}/><stop offset="95%" stopColor="var(--success)" stopOpacity={0}/></linearGradient>
              <linearGradient id="go" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--danger)" stopOpacity={0.2}/><stop offset="95%" stopColor="var(--danger)" stopOpacity={0}/></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
            <XAxis dataKey="name" tick={{fontSize:11,fill:'var(--text-3)'}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fontSize:11,fill:'var(--text-3)'}} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}k`}/>
            <Tooltip content={<Tip/>}/>
            <Area type="monotone" dataKey="entradas" name="Entradas" stroke="var(--success)" strokeWidth={2} fill="url(#gi)"/>
            <Area type="monotone" dataKey="saidas"   name="Saídas"   stroke="var(--danger)"  strokeWidth={2} fill="url(#go)"/>
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="fos-card">
        <div className="sec-title">Por Categoria</div>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart><Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3}>
            {pieData.map((e,i)=><Cell key={i} fill={e.color}/>)}
          </Pie><Tooltip formatter={v=>fmt(v)} contentStyle={{background:'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:10}}/><Legend iconType="circle" iconSize={7} wrapperStyle={{fontSize:10}}/></PieChart>
        </ResponsiveContainer>
      </div>
    </div>
    <div className="g2" style={{marginBottom:20}}>
      <div className="fos-card">
        <div className="sec-title">
          <span>Lançamentos Recentes</span>
          <span style={{fontSize:12,color:'var(--accent)',cursor:'pointer'}} onClick={()=>setActiveView('lancamentos')}>Ver todos →</span>
        </div>
        {recent.map(tx=>{
          const cat=data.categories.find(c=>c.id===tx.catId);
          return <div key={tx.id} style={{display:'flex',alignItems:'center',gap:12,padding:'8px 0',borderBottom:'1px solid var(--border)'}}>
            <div style={{width:34,height:34,borderRadius:9,background:cat?cat.color+'20':'var(--bg-elevated)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0}}>{cat?.emoji||'💰'}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:13,fontWeight:600,color:'var(--text-1)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{tx.desc}</div>
              <div style={{fontSize:11,color:'var(--text-3)'}}>{tx.date} • {cat?.name||'—'}</div>
            </div>
            <div className="money" style={{fontSize:13,color:tx.type==='income'?'var(--success)':tx.type==='transfer'?'var(--accent)':'var(--danger)',flexShrink:0}}>
              {tx.type==='income'?'+':tx.type==='transfer'?'↔':'−'}{fmt(tx.amount)}
            </div>
          </div>;
        })}
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:16}}>
        <div className="fos-card">
          <div className="sec-title"><span>Orçamento</span><span style={{fontSize:12,color:'var(--accent)',cursor:'pointer'}} onClick={()=>setActiveView('orcamento')}>→</span></div>
          {data.budgets.slice(0,4).map(b=>{const p=b.amount>0?(b.spent/b.amount)*100:0;return<div key={b.id} style={{marginBottom:10}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}><span style={{fontSize:12,fontWeight:500,color:'var(--text-2)'}}>{b.name}</span><span style={{fontSize:11,color:p>90?'var(--danger)':p>70?'var(--warning)':'var(--text-3)'}}>{p.toFixed(0)}%</span></div>
            <PBar pct={p} color={b.color}/></div>;})}
        </div>
        <div className="fos-card">
          <div className="sec-title"><span>Metas</span></div>
          {data.goals.slice(0,2).map(g=>{const p=g.target>0?(g.current/g.target)*100:0;return<div key={g.id} style={{marginBottom:10}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}><span style={{fontSize:12,fontWeight:600,color:'var(--text-1)'}}>{g.name}</span><span style={{fontSize:12,color:'var(--accent)',fontWeight:600}}>{p.toFixed(0)}%</span></div>
            <PBar pct={p} color={g.color}/>
            <div style={{fontSize:11,color:'var(--text-3)',marginTop:2}}>{fmt(g.current)} de {fmt(g.target)}</div>
          </div>;})}
        </div>
      </div>
    </div>
    <div className="fos-card">
      <div className="sec-title"><span>Contas</span><span style={{fontSize:12,color:'var(--accent)',cursor:'pointer'}} onClick={()=>setActiveView('contas')}>Gerenciar →</span></div>
      <div className="g4">
        {data.accounts.filter(a=>!a.hidden).map(acc=>(
          <div key={acc.id} style={{borderRadius:14,padding:14,border:`1px solid var(--border)`,background:'var(--bg-elevated)',cursor:'pointer',transition:'all 0.2s',display:'flex',flexDirection:'column',gap:10}} onClick={()=>setActiveView('contas')}>
            <div style={{display:'flex',alignItems:'center',gap:8}}><BankLogo bank={acc.bank}/><span style={{fontSize:13,fontWeight:600,color:'var(--text-1)'}}>{acc.name}</span></div>
            <div className="money" style={{fontSize:17,color:'var(--text-1)'}}>{fmt(acc.balance)}</div>
            <div style={{fontSize:11,color:'var(--text-3)',textTransform:'capitalize'}}>{acc.type}</div>
          </div>
        ))}
      </div>
    </div>
  </div>;
}

// ─── CONTAS ────────────────────────────────────────────────────────────────────
function ContasView({data,setData}) {
  const [modal,setModal] = useState(false);
  const [editM,setEditM] = useState(null);
  const [imgMap,setImgMap] = useState({});
  const fileRefs = useRef({});
  const blank = {name:'',type:'corrente',balance:'',bank:'Nubank'};
  const [form,setForm] = useState(blank);

  const visAccs = data.accounts.filter(a=>!a.hidden);
  const total   = visAccs.reduce((a,c)=>a+c.balance,0);

  const toggleHide = id => setData(d=>({...d,accounts:d.accounts.map(a=>a.id===id?{...a,hidden:!a.hidden}:a)}));
  const deleteAcc  = id => setData(d=>({...d,accounts:d.accounts.filter(a=>a.id!==id)}));
  const save = () => {
    setData(d=>({...d,accounts:[...d.accounts,{id:Date.now(),name:form.name,type:form.type,balance:parseFloat(form.balance)||0,initial:parseFloat(form.balance)||0,bank:form.bank,hidden:false}]}));
    setModal(false); setForm(blank);
  };
  const saveEdit = () => {setData(d=>({...d,accounts:d.accounts.map(a=>a.id===editM.id?editM:a)}));setEditM(null);};

  const handleImg = (id,e) => {
    const file = e.target.files[0]; if(!file) return;
    const reader = new FileReader();
    reader.onload = ev => setImgMap(m=>({...m,[id]:ev.target.result}));
    reader.readAsDataURL(file);
  };

  return <div className="fi">
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:22}}>
      <div><div className="pg-title">Contas</div><div className="pg-sub" style={{marginBottom:0}}>Gerencie suas contas bancárias</div></div>
      <button className="btn btn-p" onClick={()=>setModal(true)}><Plus size={15}/> Nova Conta</button>
    </div>
    <div className="fos-card" style={{marginBottom:20}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <div style={{fontSize:11,color:'var(--text-3)',fontWeight:600,textTransform:'uppercase',letterSpacing:1}}>Patrimônio Visível</div>
          <div className="money" style={{fontSize:30,color:'var(--accent)',marginTop:4}}>{fmt(total)}</div>
          {data.accounts.some(a=>a.hidden)&&<div style={{fontSize:11,color:'var(--text-3)',marginTop:2}}>+{fmt(data.accounts.filter(a=>a.hidden).reduce((a,c)=>a+c.balance,0))} ocultado</div>}
        </div>
        <div style={{fontSize:12,color:'var(--text-3)'}}>{data.accounts.length} conta{data.accounts.length!==1?'s':''}</div>
      </div>
    </div>
    <div className="g2">
      {data.accounts.map(acc=>(
        <div key={acc.id} className="fos-card" style={{opacity:acc.hidden?0.55:1,transition:'opacity 0.2s'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              {/* Custom uploaded logo or bank SVG */}
              {imgMap[acc.id]
                ? <img src={imgMap[acc.id]} style={{width:36,height:36,borderRadius:10,objectFit:'contain',background:'white',padding:2}} alt={acc.name}/>
                : <BankLogo bank={acc.bank} size={36}/>
              }
              <div>
                <div style={{fontWeight:700,color:'var(--text-1)',fontSize:15}}>{acc.name}</div>
                <div style={{fontSize:11,color:'var(--text-3)',textTransform:'capitalize'}}>{acc.type}{acc.hidden?' • Oculta':''}</div>
              </div>
            </div>
            <div style={{display:'flex',gap:4}}>
              {/* Upload logo */}
              <input ref={el=>fileRefs.current[acc.id]=el} type="file" accept="image/*" style={{display:'none'}} onChange={e=>handleImg(acc.id,e)}/>
              <button className="ib" title="Upload logo" onClick={()=>fileRefs.current[acc.id]?.click()}><Upload size={13}/></button>
              <button className="ib" title={acc.hidden?'Mostrar':'Ocultar'} onClick={()=>toggleHide(acc.id)}>{acc.hidden?<Eye size={13} color="var(--accent)"/>:<EyeOff size={13}/>}</button>
              <button className="ib" title="Editar" onClick={()=>setEditM({...acc})}><Edit3 size={13}/></button>
              <button className="ib" title="Excluir" onClick={()=>deleteAcc(acc.id)}><Trash2 size={13} color="var(--danger)"/></button>
            </div>
          </div>
          <div className="money" style={{fontSize:24,color:'var(--text-1)',marginBottom:6}}>{fmt(acc.balance)}</div>
          <div style={{fontSize:12,color:'var(--text-3)'}}>Saldo inicial: {fmt(acc.initial)}</div>
        </div>
      ))}
    </div>

    <Modal open={modal} onClose={()=>setModal(false)} title="Nova Conta">
      <div className="fg"><label className="lbl">Nome</label><input className="inp" placeholder="Ex: Nubank" value={form.name} onChange={e=>setForm(x=>({...x,name:e.target.value}))}/></div>
      <div className="g2">
        <div className="fg"><label className="lbl">Tipo</label><select className="inp" value={form.type} onChange={e=>setForm(x=>({...x,type:e.target.value}))}>{['corrente','poupança','digital','carteira','caixa'].map(o=><option key={o} value={o}>{o.charAt(0).toUpperCase()+o.slice(1)}</option>)}</select></div>
        <div className="fg"><label className="lbl">Banco</label><select className="inp" value={form.bank} onChange={e=>setForm(x=>({...x,bank:e.target.value}))}>{BANK_LIST.map(b=><option key={b} value={b}>{b}</option>)}</select></div>
      </div>
      <div className="fg"><label className="lbl">Saldo Inicial</label><input className="inp" type="number" placeholder="0,00" value={form.balance} onChange={e=>setForm(x=>({...x,balance:e.target.value}))}/></div>
      <div style={{display:'flex',gap:10}}>
        <button className="btn btn-g" style={{flex:1}} onClick={()=>setModal(false)}>Cancelar</button>
        <button className="btn btn-p" style={{flex:1}} onClick={save}><Save size={14}/> Salvar</button>
      </div>
    </Modal>

    <Modal open={!!editM} onClose={()=>setEditM(null)} title="Editar Conta">
      {editM&&<><div className="fg"><label className="lbl">Nome</label><input className="inp" value={editM.name} onChange={e=>setEditM(m=>({...m,name:e.target.value}))}/></div>
      <div className="g2">
        <div className="fg"><label className="lbl">Tipo</label><select className="inp" value={editM.type} onChange={e=>setEditM(m=>({...m,type:e.target.value}))}>{['corrente','poupança','digital','carteira','caixa'].map(o=><option key={o} value={o}>{o.charAt(0).toUpperCase()+o.slice(1)}</option>)}</select></div>
        <div className="fg"><label className="lbl">Banco</label><select className="inp" value={editM.bank} onChange={e=>setEditM(m=>({...m,bank:e.target.value}))}>{BANK_LIST.map(b=><option key={b} value={b}>{b}</option>)}</select></div>
      </div>
      <div className="fg"><label className="lbl">Saldo Atual</label><input className="inp" type="number" value={editM.balance} onChange={e=>setEditM(m=>({...m,balance:parseFloat(e.target.value)||0}))}/></div>
      <div style={{display:'flex',gap:10}}>
        <button className="btn btn-g" style={{flex:1}} onClick={()=>setEditM(null)}>Cancelar</button>
        <button className="btn btn-p" style={{flex:1}} onClick={saveEdit}><Save size={14}/> Salvar</button>
      </div></>}
    </Modal>
  </div>;
}

// ─── LANÇAMENTOS ──────────────────────────────────────────────────────────────
function LancamentosView({data,setData}) {
  const [modal,setModal] = useState(false);
  const [editM,setEditM] = useState(null);
  const [filter,setFilter] = useState('all');
  const [sort,setSort]   = useState({col:'date',dir:'desc'});
  const blank = {type:'expense',desc:'',amount:'',date:today.toISOString().split('T')[0],accountId:data.accounts[0]?.id||1,catId:2};
  const [form,setForm]   = useState(blank);

  const hSort = col=>setSort(s=>({col,dir:s.col===col&&s.dir==='asc'?'desc':'asc'}));
  const SI = ({col})=>sort.col===col?(sort.dir==='asc'?<ArrowUp size={10} color="var(--accent)"/>:<ArrowDown size={10} color="var(--accent)"/>):<ArrowDown size={10} color="var(--text-3)" opacity={0.3}/>;

  const filtered = useMemo(()=>[...data.transactions].filter(t=>filter==='all'||t.type===filter).sort((a,b)=>{
    let va=a[sort.col],vb=b[sort.col];
    if(sort.col==='amount'){va=+va;vb=+vb;}
    return sort.dir==='asc'?(va<vb?-1:va>vb?1:0):(va>vb?-1:va<vb?1:0);
  }),[data.transactions,filter,sort]);

  const save = ()=>{
    const tx={...form,id:Date.now(),amount:parseFloat(form.amount)||0,accountId:+form.accountId,catId:+form.catId,status:'done'};
    setData(d=>({...d,transactions:[tx,...d.transactions]}));setModal(false);setForm(blank);
  };
  const saveEdit=()=>{setData(d=>({...d,transactions:d.transactions.map(t=>t.id===editM.id?{...editM,amount:+editM.amount}:t)}));setEditM(null);};
  const del=id=>setData(d=>({...d,transactions:d.transactions.filter(t=>t.id!==id)}));

  return <div className="fi">
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:22}}>
      <div><div className="pg-title">Lançamentos</div><div className="pg-sub" style={{marginBottom:0}}>Clique nos títulos para ordenar</div></div>
      <button className="btn btn-p" onClick={()=>setModal(true)}><Plus size={15}/> Novo</button>
    </div>
    <div style={{display:'flex',gap:8,marginBottom:18,flexWrap:'wrap'}}>
      {[['all','Todos'],['income','Entradas'],['expense','Saídas'],['transfer','Transferências']].map(([v,l])=>(
        <button key={v} className={`btn ${filter===v?'btn-p':'btn-g'}`} style={{padding:'7px 14px',fontSize:13}} onClick={()=>setFilter(v)}>{l}</button>
      ))}
    </div>
    {filter==='transfer'&&<div className="info-box"><Info size={14}/> Transferências entre contas não afetam entradas/saídas — são movimentações internas.</div>}
    <div className="fos-card">
      <table className="tbl">
        <thead><tr>
          {[['desc','Descrição'],['date','Data'],['catId','Categoria'],['accountId','Conta'],['type','Tipo'],['amount','Valor']].map(([c,l])=>(
            <th key={c} onClick={()=>hSort(c)}><span style={{display:'inline-flex',alignItems:'center',gap:3}}>{l}<SI col={c}/></span></th>
          ))}
          <th></th>
        </tr></thead>
        <tbody>{filtered.map(tx=>{
          const cat=data.categories.find(c=>c.id===tx.catId);
          const acc=data.accounts.find(a=>a.id===tx.accountId);
          return <tr key={tx.id}>
            <td style={{color:'var(--text-1)',fontWeight:500}}>{tx.desc}</td>
            <td>{tx.date}</td>
            <td>{cat&&<span className="badge b-gray">{cat.emoji} {cat.name}</span>}</td>
            <td>{acc&&<div style={{display:'flex',alignItems:'center',gap:6}}><BankLogo bank={acc.bank} size={20}/><span>{acc.name}</span></div>}</td>
            <td><span className={`badge ${tx.type==='income'?'b-g':tx.type==='transfer'?'b-b':'b-r'}`}>{tx.type==='income'?'Entrada':tx.type==='transfer'?'Transf.':'Saída'}</span></td>
            <td><span className={tx.type==='income'?'pos':tx.type==='transfer'?'money':'neg'}>{tx.type==='income'?'+':'−'}{fmt(tx.amount)}</span></td>
            <td><div style={{display:'flex',gap:4}}>
              <button className="ib" onClick={()=>setEditM({...tx})}><Edit3 size={13}/></button>
              <button className="ib" onClick={()=>del(tx.id)}><Trash2 size={13} color="var(--danger)"/></button>
            </div></td>
          </tr>;
        })}</tbody>
      </table>
    </div>

    {/* New / Edit modals */}
    {[{open:modal,onClose:()=>setModal(false),state:form,setState:setForm,onSave:save,title:'Novo Lançamento'},
      {open:!!editM,onClose:()=>setEditM(null),state:editM||{},setState:setEditM,onSave:saveEdit,title:'Editar Lançamento'}
    ].map(({open,onClose,state,setState,onSave,title})=>(
      <Modal key={title} open={open} onClose={onClose} title={title}>
        <div style={{display:'flex',gap:8,marginBottom:16}}>
          {[['income','Entrada','success'],['expense','Saída','danger'],['transfer','Transferência','accent']].map(([v,l,c])=>(
            <button key={v} className="btn" onClick={()=>setState(f=>({...f,type:v}))}
              style={{flex:1,background:state.type===v?`var(--${c}-dim)`:'var(--bg-elevated)',color:`var(--${c})`,border:`1px solid var(--${c}-dim)`,fontSize:12}}>{l}</button>
          ))}
        </div>
        <div className="fg"><label className="lbl">Descrição</label><input className="inp" placeholder="Ex: Supermercado..." value={state.desc||''} onChange={e=>setState(f=>({...f,desc:e.target.value}))}/></div>
        <div className="g2">
          <div className="fg"><label className="lbl">Valor</label><input type="number" className="inp" placeholder="0,00" value={state.amount||''} onChange={e=>setState(f=>({...f,amount:e.target.value}))}/></div>
          <div className="fg"><label className="lbl">Data</label><input type="date" className="inp" value={state.date||''} onChange={e=>setState(f=>({...f,date:e.target.value}))}/></div>
        </div>
        <div className="g2">
          <div className="fg"><label className="lbl">Conta</label><select className="inp" value={state.accountId||''} onChange={e=>setState(f=>({...f,accountId:+e.target.value}))}>{data.accounts.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select></div>
          <div className="fg"><label className="lbl">Categoria</label><select className="inp" value={state.catId||''} onChange={e=>setState(f=>({...f,catId:+e.target.value}))}>{data.categories.map(c=><option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}</select></div>
        </div>
        <div style={{display:'flex',gap:10}}>
          <button className="btn btn-g" style={{flex:1}} onClick={onClose}>Cancelar</button>
          <button className="btn btn-p" style={{flex:1}} onClick={onSave}><Save size={14}/> Salvar</button>
        </div>
      </Modal>
    ))}
  </div>;
}

// ─── CATEGORIAS ────────────────────────────────────────────────────────────────
function CategoriasView({data,setData}) {
  const [modal,setModal]   = useState(false);
  const [editM,setEditM]   = useState(null);
  const blank = {name:'',emoji:'📦',color:'#6366F1',type:'expense'};
  const [form,setForm]     = useState(blank);
  const [showEmoji,setShowEmoji] = useState(false);
  const [editEmoji,setEditEmoji] = useState(false);

  const save = () => {
    if(!form.name.trim()){alert('Informe o nome da categoria');return;}
    setData(d=>({...d,categories:[...d.categories,{id:Date.now(),name:form.name,emoji:form.emoji,color:form.color,type:form.type}]}));
    setModal(false);setForm(blank);setShowEmoji(false);
  };
  const saveEdit = () => {
    setData(d=>({...d,categories:d.categories.map(c=>c.id===editM.id?editM:c)}));
    setEditM(null);setEditEmoji(false);
  };
  const del = id => {
    if(!window.confirm('Excluir esta categoria?')) return;
    setData(d=>({...d,categories:d.categories.filter(c=>c.id!==id)}));
  };

  return <div className="fi">
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:22}}>
      <div><div className="pg-title">Categorias</div><div className="pg-sub" style={{marginBottom:0}}>Organize seus lançamentos</div></div>
      <button className="btn btn-p" onClick={()=>{setForm(blank);setShowEmoji(false);setModal(true);}}><Plus size={15}/> Nova</button>
    </div>
    <div className="g2" style={{marginBottom:16}}>
      {[['expense','Despesas'],['income','Receitas']].map(([t,l])=>(
        <div key={t}>
          <div style={{fontSize:12,fontWeight:600,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:1,marginBottom:12}}>{l}</div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {data.categories.filter(c=>c.type===t).map(cat=>(
              <div key={cat.id} className="fos-card" style={{display:'flex',alignItems:'center',gap:12,padding:'14px 16px'}}>
                <div style={{width:40,height:40,borderRadius:12,background:cat.color+'25',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>{cat.emoji}</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,color:'var(--text-1)',fontSize:14}}>{cat.name}</div>
                  <span className={`badge ${t==='income'?'b-g':'b-r'}`} style={{fontSize:10}}>{t==='income'?'Receita':'Despesa'}</span>
                </div>
                <div style={{display:'flex',gap:4}}>
                  <button className="ib" onClick={()=>{setEditM({...cat});setEditEmoji(false);}}><Edit3 size={13}/></button>
                  <button className="ib" onClick={()=>del(cat.id)}><Trash2 size={13} color="var(--danger)"/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>

    {/* CREATE MODAL */}
    <Modal open={modal} onClose={()=>setModal(false)} title="Nova Categoria">
      <div className="fg">
        <label className="lbl">Emoji</label>
        <button className="btn btn-g" style={{fontSize:22,padding:'6px 14px',marginBottom:8}} onClick={()=>setShowEmoji(v=>!v)}>{form.emoji} ▾</button>
        {showEmoji&&<div className="emoji-grid">{CATEGORY_EMOJIS.map(e=><button key={e} className={`emoji-btn${form.emoji===e?' sel':''}`} onClick={()=>{setForm(f=>({...f,emoji:e}));setShowEmoji(false);}}>{e}</button>)}</div>}
      </div>
      <div className="fg"><label className="lbl">Nome</label><input className="inp" placeholder="Ex: Alimentação" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/></div>
      <div className="g2">
        <div className="fg"><label className="lbl">Tipo</label><select className="inp" value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}><option value="expense">Despesa</option><option value="income">Receita</option></select></div>
        <div className="fg"><label className="lbl">Cor</label><input type="color" className="inp" style={{height:42,cursor:'pointer'}} value={form.color} onChange={e=>setForm(f=>({...f,color:e.target.value}))}/></div>
      </div>
      <div style={{display:'flex',gap:10}}>
        <button className="btn btn-g" style={{flex:1}} onClick={()=>setModal(false)}>Cancelar</button>
        <button className="btn btn-p" style={{flex:1}} onClick={save}><Save size={14}/> Salvar</button>
      </div>
    </Modal>

    {/* EDIT MODAL */}
    <Modal open={!!editM} onClose={()=>setEditM(null)} title="Editar Categoria">
      {editM&&<>
        <div className="fg">
          <label className="lbl">Emoji</label>
          <button className="btn btn-g" style={{fontSize:22,padding:'6px 14px',marginBottom:8}} onClick={()=>setEditEmoji(v=>!v)}>{editM.emoji} ▾</button>
          {editEmoji&&<div className="emoji-grid">{CATEGORY_EMOJIS.map(e=><button key={e} className={`emoji-btn${editM.emoji===e?' sel':''}`} onClick={()=>{setEditM(m=>({...m,emoji:e}));setEditEmoji(false);}}>{e}</button>)}</div>}
        </div>
        <div className="fg"><label className="lbl">Nome</label><input className="inp" value={editM.name} onChange={e=>setEditM(m=>({...m,name:e.target.value}))}/></div>
        <div className="g2">
          <div className="fg"><label className="lbl">Tipo</label><select className="inp" value={editM.type} onChange={e=>setEditM(m=>({...m,type:e.target.value}))}><option value="expense">Despesa</option><option value="income">Receita</option></select></div>
          <div className="fg"><label className="lbl">Cor</label><input type="color" className="inp" style={{height:42,cursor:'pointer'}} value={editM.color} onChange={e=>setEditM(m=>({...m,color:e.target.value}))}/></div>
        </div>
        <div style={{display:'flex',gap:10}}>
          <button className="btn btn-g" style={{flex:1}} onClick={()=>setEditM(null)}>Cancelar</button>
          <button className="btn btn-p" style={{flex:1}} onClick={saveEdit}><Save size={14}/> Salvar</button>
        </div>
      </>}
    </Modal>
  </div>;
}

// ─── CARTÕES ──────────────────────────────────────────────────────────────────
function CartoesView({data,setData}) {
  const [editM,setEditM] = useState(null);
  const [newM,setNewM]   = useState(false);
  const blank = {name:'',brand:'Mastercard',bank:'Nubank',limit:'',closing:'1',due:'5',color1:'#820AD1',color2:'#5C0A95'};
  const [form,setForm]   = useState(blank);

  const saveEdit=()=>{setData(d=>({...d,creditCards:d.creditCards.map(c=>c.id===editM.id?editM:c)}));setEditM(null);};
  const del=id=>setData(d=>({...d,creditCards:d.creditCards.filter(c=>c.id!==id)}));
  const saveNew=()=>{
    setData(d=>({...d,creditCards:[...d.creditCards,{id:Date.now(),name:form.name,brand:form.brand,bank:form.bank,limit:+form.limit||0,used:0,closing:+form.closing||1,due:+form.due||5,color1:form.color1,color2:form.color2}]}));
    setNewM(false);setForm(blank);
  };

  const CardForm = ({state,setState,onSave,onClose}) => <>
    <div className="fg"><label className="lbl">Nome</label><input className="inp" placeholder="Ex: Nubank Black" value={state.name||''} onChange={e=>setState(s=>({...s,name:e.target.value}))}/></div>
    <div className="g2">
      <div className="fg"><label className="lbl">Banco</label><select className="inp" value={state.bank||''} onChange={e=>setState(s=>({...s,bank:e.target.value}))}>{BANK_LIST.map(b=><option key={b} value={b}>{b}</option>)}</select></div>
      <div className="fg"><label className="lbl">Bandeira</label><select className="inp" value={state.brand||''} onChange={e=>setState(s=>({...s,brand:e.target.value}))}>{['Visa','Mastercard','Elo','Amex'].map(b=><option key={b} value={b}>{b}</option>)}</select></div>
      <div className="fg"><label className="lbl">Limite (R$)</label><input type="number" className="inp" value={state.limit||''} onChange={e=>setState(s=>({...s,limit:+e.target.value||0}))}/></div>
      <div className="fg"><label className="lbl">Fatura Atual</label><input type="number" className="inp" value={state.used||''} onChange={e=>setState(s=>({...s,used:+e.target.value||0}))}/></div>
      <div className="fg"><label className="lbl">Dia Fechamento</label><input type="number" min="1" max="31" className="inp" value={state.closing||''} onChange={e=>setState(s=>({...s,closing:+e.target.value||1}))}/></div>
      <div className="fg"><label className="lbl">Dia Vencimento</label><input type="number" min="1" max="31" className="inp" value={state.due||''} onChange={e=>setState(s=>({...s,due:+e.target.value||1}))}/></div>
      <div className="fg"><label className="lbl">Cor 1</label><input type="color" className="inp" style={{height:42}} value={state.color1||'#820AD1'} onChange={e=>setState(s=>({...s,color1:e.target.value}))}/></div>
      <div className="fg"><label className="lbl">Cor 2</label><input type="color" className="inp" style={{height:42}} value={state.color2||'#5C0A95'} onChange={e=>setState(s=>({...s,color2:e.target.value}))}/></div>
    </div>
    <div style={{display:'flex',gap:10}}>
      <button className="btn btn-g" style={{flex:1}} onClick={onClose}>Cancelar</button>
      <button className="btn btn-p" style={{flex:1}} onClick={onSave}><Save size={14}/> Salvar</button>
    </div>
  </>;

  return <div className="fi">
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:22}}>
      <div><div className="pg-title">Cartões de Crédito</div><div className="pg-sub" style={{marginBottom:0}}>Gerencie seus cartões e limites</div></div>
      <button className="btn btn-p" onClick={()=>setNewM(true)}><Plus size={15}/> Novo Cartão</button>
    </div>
    <div style={{display:'flex',flexDirection:'column',gap:20}}>
      {data.creditCards.map(card=>{
        const pct=card.limit>0?(card.used/card.limit)*100:0;
        const BrandComp=BRANDS[card.brand];
        return <div key={card.id}>
          <div style={{background:`linear-gradient(135deg,${card.color1},${card.color2})`,borderRadius:'16px 16px 0 0',padding:22,height:160,display:'flex',flexDirection:'column',justifyContent:'space-between',position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',top:-40,right:-40,width:140,height:140,borderRadius:'50%',background:'rgba(255,255,255,0.06)'}}/>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',zIndex:1}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <BankLogo bank={card.bank} size={36}/>
                <div><div style={{fontSize:11,opacity:0.7,color:'white'}}>CARTÃO DE CRÉDITO</div><div style={{fontFamily:'Syne',fontSize:16,fontWeight:700,color:'white'}}>{card.name}</div></div>
              </div>
              {BrandComp&&<BrandComp/>}
            </div>
            <div style={{zIndex:1}}>
              <div style={{fontSize:11,opacity:0.7,color:'white'}}>DISPONÍVEL</div>
              <div className="money" style={{fontSize:20,color:'white'}}>{fmt(card.limit-card.used)}</div>
              <div style={{fontSize:11,opacity:0.7,color:'white'}}>de {fmt(card.limit)}</div>
            </div>
          </div>
          <div className="fos-card" style={{borderRadius:'0 0 16px 16px',borderTop:'none'}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:10,flexWrap:'wrap',gap:8}}>
              <div><div style={{fontSize:11,color:'var(--text-3)'}}>Fatura atual</div><div className="money" style={{color:'var(--danger)',fontSize:16}}>{fmt(card.used)}</div></div>
              <div style={{textAlign:'center'}}><div style={{fontSize:11,color:'var(--text-3)'}}>Fecha</div><div style={{fontWeight:600}}>Dia {card.closing}</div></div>
              <div style={{textAlign:'center'}}><div style={{fontSize:11,color:'var(--text-3)'}}>Vence</div><div style={{fontWeight:600}}>Dia {card.due}</div></div>
              <div style={{display:'flex',gap:6,alignItems:'center'}}>
                <button className="btn btn-g" style={{fontSize:12}} onClick={()=>setEditM({...card})}><Edit3 size={13}/> Editar</button>
                <button className="ib" onClick={()=>del(card.id)}><Trash2 size={13} color="var(--danger)"/></button>
              </div>
            </div>
            <PBar pct={pct} color={card.color1}/>
            <div style={{fontSize:11,color:pct>80?'var(--danger)':'var(--text-3)',marginTop:6}}>{pct.toFixed(0)}% utilizado</div>
          </div>
        </div>;
      })}
    </div>
    <Modal open={newM} onClose={()=>setNewM(false)} title="Novo Cartão"><CardForm state={form} setState={setForm} onSave={saveNew} onClose={()=>setNewM(false)}/></Modal>
    <Modal open={!!editM} onClose={()=>setEditM(null)} title="Editar Cartão">{editM&&<CardForm state={editM} setState={setEditM} onSave={saveEdit} onClose={()=>setEditM(null)}/>}</Modal>
  </div>;
}

// ─── FATURAS ──────────────────────────────────────────────────────────────────
function FaturasView({data,setData}) {
  const [editInv,setEditInv]   = useState(null);
  const [editP,setEditP]       = useState(null);
  const [newP,setNewP]         = useState(null);
  const [selCard,setSelCard]   = useState(0);

  const filtered = selCard===0?data.invoices:data.invoices.filter(i=>i.cardId===selCard);
  const SL={open:'Aberta',closed:'Fechada',paid:'Paga',overdue:'Atrasada'};
  const SC={open:'b-b',closed:'b-y',paid:'b-g',overdue:'b-r'};

  const saveInv=()=>{setData(d=>({...d,invoices:d.invoices.map(i=>i.id===editInv.id?editInv:i)}));setEditInv(null);};
  const saveP=()=>{setData(d=>({...d,invoices:d.invoices.map(i=>i.id===editP.invId?{...i,purchases:i.purchases.map(p=>p.id===editP.id?editP:p)}:i)}));setEditP(null);};
  const delP=(invId,pId)=>setData(d=>({...d,invoices:d.invoices.map(i=>i.id===invId?{...i,purchases:i.purchases.filter(p=>p.id!==pId)}:i)}));
  const addP=()=>{const p={id:Date.now(),desc:newP.desc,amount:+newP.amount||0,date:newP.date,installments:+newP.installments||1,catId:7};setData(d=>({...d,invoices:d.invoices.map(i=>i.id===newP.invId?{...i,purchases:[...i.purchases,p]}:i)}));setNewP(null);};

  return <div className="fi">
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:22}}>
      <div><div className="pg-title">Faturas</div><div className="pg-sub" style={{marginBottom:0}}>Compras e parcelamentos no cartão</div></div>
      <select className="inp" style={{width:'auto'}} value={selCard} onChange={e=>setSelCard(+e.target.value)}>
        <option value={0}>Todos os cartões</option>{data.creditCards.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
    </div>
    {filtered.map(inv=>{
      const card=data.creditCards.find(c=>c.id===inv.cardId);
      const total=inv.purchases.reduce((a,p)=>a+p.amount,0);
      return <div key={inv.id} className="fos-card" style={{marginBottom:16}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14,flexWrap:'wrap',gap:10}}>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <BankLogo bank={card?.bank||'Carteira'} size={36}/>
            <div>
              <div style={{fontFamily:'Syne',fontWeight:700,fontSize:15,color:'var(--text-1)'}}>{card?.name} — {MONTHS_FULL[(inv.month-1+12)%12]} {inv.year}</div>
              <div style={{fontSize:12,color:'var(--text-3)'}}>Fecha: {inv.closingDate} • Vence: {inv.dueDate}</div>
            </div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{textAlign:'right'}}>
              <div className="money" style={{fontSize:18,color:inv.status==='paid'?'var(--success)':'var(--danger)'}}>{fmt(total)}</div>
              <span className={`badge ${SC[inv.status]}`}>{SL[inv.status]}</span>
            </div>
            <button className="btn btn-g" style={{fontSize:12}} onClick={()=>setEditInv({...inv})}><Edit3 size={13}/> Editar Fatura</button>
            {inv.status==='open'&&<button className="btn btn-s" style={{fontSize:12}}><Check size={13}/> Pagar</button>}
          </div>
        </div>
        <table className="tbl"><thead><tr><th>Compra</th><th>Data</th><th>Parcelas</th><th>Valor</th><th>Ações</th></tr></thead>
          <tbody>{inv.purchases.map(p=><tr key={p.id}>
            <td style={{color:'var(--text-1)',fontWeight:500}}>{p.desc}</td>
            <td>{p.date}</td><td>{p.installments>1?`${p.installments}x`:'À vista'}</td>
            <td><span className="neg">{fmt(p.amount)}</span></td>
            <td><div style={{display:'flex',gap:4}}>
              <button className="ib" onClick={()=>setEditP({...p,invId:inv.id})}><Edit3 size={13}/></button>
              <button className="ib" onClick={()=>delP(inv.id,p.id)}><Trash2 size={13} color="var(--danger)"/></button>
            </div></td>
          </tr>)}</tbody>
        </table>
        {inv.status==='open'&&<button className="btn btn-g" style={{marginTop:10,fontSize:12}} onClick={()=>setNewP({invId:inv.id,desc:'',amount:'',date:today.toISOString().split('T')[0],installments:'1'})}><Plus size={13}/> Adicionar Compra</button>}
      </div>;
    })}

    <Modal open={!!editInv} onClose={()=>setEditInv(null)} title="Editar Fatura">
      {editInv&&<><div className="info-box"><Info size={14}/> Altere datas de fechamento, vencimento e status.</div>
      <div className="g2">
        <div className="fg"><label className="lbl">Fechamento</label><input type="date" className="inp" value={editInv.closingDate} onChange={e=>setEditInv(m=>({...m,closingDate:e.target.value}))}/></div>
        <div className="fg"><label className="lbl">Vencimento</label><input type="date" className="inp" value={editInv.dueDate} onChange={e=>setEditInv(m=>({...m,dueDate:e.target.value}))}/></div>
      </div>
      <div className="fg"><label className="lbl">Status</label><select className="inp" value={editInv.status} onChange={e=>setEditInv(m=>({...m,status:e.target.value}))}><option value="open">Aberta</option><option value="closed">Fechada</option><option value="paid">Paga</option><option value="overdue">Atrasada</option></select></div>
      <div style={{display:'flex',gap:10}}><button className="btn btn-g" style={{flex:1}} onClick={()=>setEditInv(null)}>Cancelar</button><button className="btn btn-p" style={{flex:1}} onClick={saveInv}><Save size={14}/> Salvar</button></div></>}
    </Modal>

    {[{open:!!editP,onClose:()=>setEditP(null),state:editP,setState:setEditP,onSave:saveP,title:'Editar Compra'},
      {open:!!newP,onClose:()=>setNewP(null),state:newP,setState:setNewP,onSave:addP,title:'Nova Compra'}
    ].map(({open,onClose,state,setState,onSave,title})=>(
      <Modal key={title} open={open} onClose={onClose} title={title}>
        {state&&<><div className="fg"><label className="lbl">Descrição</label><input className="inp" placeholder="Ex: Shopee..." value={state.desc||''} onChange={e=>setState(m=>({...m,desc:e.target.value}))}/></div>
        <div className="g2">
          <div className="fg"><label className="lbl">Valor</label><input type="number" className="inp" value={state.amount||''} onChange={e=>setState(m=>({...m,amount:e.target.value}))}/></div>
          <div className="fg"><label className="lbl">Data</label><input type="date" className="inp" value={state.date||''} onChange={e=>setState(m=>({...m,date:e.target.value}))}/></div>
        </div>
        <div className="fg"><label className="lbl">Parcelas</label><input type="number" min="1" className="inp" value={state.installments||''} onChange={e=>setState(m=>({...m,installments:e.target.value}))}/></div>
        <div style={{display:'flex',gap:10}}><button className="btn btn-g" style={{flex:1}} onClick={onClose}>Cancelar</button><button className="btn btn-p" style={{flex:1}} onClick={onSave}><Save size={14}/> Salvar</button></div></>}
      </Modal>
    ))}
  </div>;
}

// ─── ORÇAMENTO ────────────────────────────────────────────────────────────────
function OrcamentoView({data}) {
  const total=data.budgets.reduce((a,b)=>a+b.amount,0);
  const spent=data.budgets.reduce((a,b)=>a+b.spent,0);
  return <div className="fi">
    <div className="pg-title">Orçamento Mensal</div><div className="pg-sub">Controle por categoria</div>
    <div className="g3" style={{marginBottom:20}}>
      {[[fmt(total),'Orçamento','blue'],[fmt(spent),'Gasto',spent/total>0.8?'red':'yellow'],[fmt(total-spent),'Disponível','green']].map(([v,l,c])=>(
        <div key={l} className={`stat-card ${c}`}><div style={{fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:1,color:'var(--text-3)'}}>{l}</div>
        <div className="money" style={{fontSize:20,color:`var(--${c==='blue'?'accent':c==='red'?'danger':c==='yellow'?'warning':'success'})`}}>{v}</div></div>
      ))}
    </div>
    <div className="fos-card">
      {data.budgets.map(b=>{const p=b.amount>0?(b.spent/b.amount)*100:0;return<div key={b.id} style={{padding:'14px 0',borderBottom:'1px solid var(--border)'}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
          <div style={{width:10,height:10,borderRadius:3,background:b.color,flexShrink:0}}/>
          <span style={{fontWeight:600,color:'var(--text-1)',flex:1}}>{b.name}</span>
          <span style={{fontSize:12,color:p>90?'var(--danger)':p>70?'var(--warning)':'var(--text-3)'}}>{fmt(b.spent)} / {fmt(b.amount)}</span>
          <span style={{fontSize:12,fontWeight:700,color:p>90?'var(--danger)':p>70?'var(--warning)':'var(--text-2)',minWidth:36,textAlign:'right'}}>{p.toFixed(0)}%</span>
        </div>
        <PBar pct={p} color={b.color}/>
        {p>90&&<div style={{fontSize:11,color:'var(--danger)',marginTop:4}}>⚠ Quase esgotado</div>}
      </div>;})}
    </div>
  </div>;
}

// ─── METAS ────────────────────────────────────────────────────────────────────
function MetasView({data,setData}) {
  const [modal,setModal] = useState(false);
  const [aporte,setAporte] = useState(null);
  const [form,setForm] = useState({name:'',target:'',current:'',deadline:'',color:'#10B981'});
  const save=()=>{setData(d=>({...d,goals:[...d.goals,{id:Date.now(),name:form.name,target:+form.target||0,current:+form.current||0,deadline:form.deadline,color:form.color}]}));setModal(false);};
  const doAporte=()=>{const v=+aporte.value||0;setData(d=>({...d,goals:d.goals.map(g=>g.id===aporte.id?{...g,current:Math.min(g.target,g.current+v)}:g)}));setAporte(null);};
  const del=id=>setData(d=>({...d,goals:d.goals.filter(g=>g.id!==id)}));
  const EMOJIS={'Emergência':'🛡️','Viagem':'✈️','Notebook':'💻','Cartão':'💳','Carro':'🚗'};
  return <div className="fi">
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:22}}>
      <div><div className="pg-title">Metas Financeiras</div><div className="pg-sub" style={{marginBottom:0}}>Acompanhe seus objetivos</div></div>
      <button className="btn btn-p" onClick={()=>setModal(true)}><Plus size={15}/> Nova Meta</button>
    </div>
    <div className="g2">
      {data.goals.map(g=>{
        const pct=g.target>0?(g.current/g.target)*100:0;const done=pct>=100;
        const emoji=Object.entries(EMOJIS).find(([k])=>g.name.includes(k))?.[1]||'🎯';
        return <div key={g.id} className="fos-card" style={{borderTop:`3px solid ${g.color}`}}>
          <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:12}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div style={{fontSize:24}}>{emoji}</div>
              <div><div style={{fontFamily:'Syne',fontWeight:700,fontSize:14,color:'var(--text-1)'}}>{g.name}</div>
              {g.deadline&&<div style={{fontSize:11,color:'var(--text-3)'}}>Prazo: {g.deadline}</div>}</div>
            </div>
            <div style={{display:'flex',gap:4,alignItems:'center'}}>
              {done?<span className="badge b-g"><Check size={10}/> Concluída</span>:<span className="money" style={{fontSize:17,color:g.color}}>{pct.toFixed(0)}%</span>}
              <button className="ib" onClick={()=>del(g.id)}><Trash2 size={12} color="var(--danger)"/></button>
            </div>
          </div>
          <PBar pct={pct} color={g.color}/>
          <div style={{display:'flex',justifyContent:'space-between',margin:'12px 0 14px'}}>
            <div><div style={{fontSize:11,color:'var(--text-3)'}}>Acumulado</div><div className="money pos">{fmt(g.current)}</div></div>
            <div style={{textAlign:'center'}}><div style={{fontSize:11,color:'var(--text-3)'}}>Faltam</div><div className="money neg">{fmt(g.target-g.current)}</div></div>
            <div style={{textAlign:'right'}}><div style={{fontSize:11,color:'var(--text-3)'}}>Objetivo</div><div className="money">{fmt(g.target)}</div></div>
          </div>
          {!done&&<button className="btn btn-g" style={{width:'100%',fontSize:12}} onClick={()=>setAporte({id:g.id,name:g.name,value:''})}><Plus size={13}/> Registrar Aporte</button>}
        </div>;
      })}
    </div>
    <Modal open={modal} onClose={()=>setModal(false)} title="Nova Meta">
      {[['name','Objetivo','text'],['target','Valor Alvo','number'],['current','Valor Atual','number'],['deadline','Prazo','date']].map(([f,l,t])=>(
        <div key={f} className="fg"><label className="lbl">{l}</label><input type={t} className="inp" value={form[f]} onChange={e=>setForm(x=>({...x,[f]:e.target.value}))}/></div>
      ))}
      <div className="fg"><label className="lbl">Cor</label><input type="color" className="inp" style={{height:42}} value={form.color} onChange={e=>setForm(x=>({...x,color:e.target.value}))}/></div>
      <div style={{display:'flex',gap:10}}><button className="btn btn-g" style={{flex:1}} onClick={()=>setModal(false)}>Cancelar</button><button className="btn btn-p" style={{flex:1}} onClick={save}><Save size={14}/> Salvar</button></div>
    </Modal>
    <Modal open={!!aporte} onClose={()=>setAporte(null)} title="Registrar Aporte">
      {aporte&&<><p style={{fontSize:14,color:'var(--text-2)',marginBottom:14}}>Meta: <strong style={{color:'var(--text-1)'}}>{aporte.name}</strong></p>
      <div className="fg"><label className="lbl">Valor</label><input type="number" className="inp" placeholder="0,00" value={aporte.value} onChange={e=>setAporte(m=>({...m,value:e.target.value}))}/></div>
      <div style={{display:'flex',gap:10}}><button className="btn btn-g" style={{flex:1}} onClick={()=>setAporte(null)}>Cancelar</button><button className="btn btn-p" style={{flex:1}} onClick={doAporte}><Save size={14}/> Confirmar</button></div></>}
    </Modal>
  </div>;
}

// ─── RELATÓRIOS ────────────────────────────────────────────────────────────────
function RelatoriosView({data}) {
  const [month,setMonth] = useState(today.getMonth());
  const [year,setYear]   = useState(today.getFullYear());

  const chartData = Array.from({length:6},(_,i)=>{
    const d=new Date(year,month-5+i,1); const m=d.getMonth(); const y=d.getFullYear();
    const pfx=`${y}-${String(m+1).padStart(2,'0')}`;
    const txs=data.transactions.filter(t=>t.date.startsWith(pfx));
    return{name:MONTHS_SHORT[m],entradas:txs.filter(t=>t.type==='income').reduce((a,c)=>a+c.amount,0),saidas:txs.filter(t=>t.type==='expense').reduce((a,c)=>a+c.amount,0)};
  });

  const prefix=`${year}-${String(month+1).padStart(2,'0')}`;
  const txM=data.transactions.filter(t=>t.date.startsWith(prefix));
  const catData=data.categories.filter(c=>c.type==='expense').map(cat=>({name:cat.emoji+' '+cat.name,value:txM.filter(t=>t.type==='expense'&&t.catId===cat.id).reduce((a,c)=>a+c.amount,0),color:cat.color})).filter(d=>d.value>0).sort((a,b)=>b.value-a.value);

  return <div className="fi">
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:22}}>
      <div><div className="pg-title">Relatórios</div><div className="pg-sub" style={{marginBottom:0}}>Análise financeira por período</div></div>
      <MonthNav month={month} year={year} onChange={(m,y)=>{setMonth(m);setYear(y);}}/>
    </div>
    <div className="g2" style={{marginBottom:20}}>
      <div className="fos-card">
        <div className="sec-title">Entradas × Saídas (6 meses)</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
            <XAxis dataKey="name" tick={{fontSize:11,fill:'var(--text-3)'}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fontSize:11,fill:'var(--text-3)'}} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}k`}/>
            <Tooltip content={<Tip/>}/>
            <Bar dataKey="entradas" name="Entradas" fill="var(--success)" radius={[4,4,0,0]} opacity={0.85}/>
            <Bar dataKey="saidas"   name="Saídas"   fill="var(--danger)"  radius={[4,4,0,0]} opacity={0.85}/>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="fos-card">
        <div className="sec-title">Gastos de {MONTHS_FULL[month]}</div>
        {catData.length===0?<div style={{textAlign:'center',padding:40,color:'var(--text-3)'}}>Sem despesas neste mês</div>:
        <ResponsiveContainer width="100%" height={220}>
          <PieChart><Pie data={catData} dataKey="value" cx="50%" cy="50%" outerRadius={88} paddingAngle={2} label={({name,percent})=>`${(percent*100).toFixed(0)}%`} labelLine={false}>
            {catData.map((e,i)=><Cell key={i} fill={e.color}/>)}
          </Pie><Tooltip formatter={v=>fmt(v)} contentStyle={{background:'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:10}}/></PieChart>
        </ResponsiveContainer>}
      </div>
    </div>
    <div className="fos-card">
      <div className="sec-title">Ranking de Gastos — {MONTHS_FULL[month]}</div>
      {catData.length===0?<div style={{textAlign:'center',padding:20,color:'var(--text-3)'}}>Sem dados</div>:
      catData.map((c,i)=><div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
        <div style={{width:24,height:24,borderRadius:6,background:c.color,display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:11,fontWeight:700,flexShrink:0}}>{i+1}</div>
        <span style={{fontSize:13,fontWeight:600,color:'var(--text-1)',flex:1}}>{c.name}</span>
        <div style={{flex:2,marginRight:16}}><div style={{height:5,background:'var(--bg-elevated)',borderRadius:10,overflow:'hidden'}}><div style={{width:`${(c.value/catData[0].value)*100}%`,height:'100%',background:c.color,borderRadius:10}}/></div></div>
        <span className="money" style={{color:c.color,minWidth:90,textAlign:'right'}}>{fmt(c.value)}</span>
      </div>)}
    </div>
  </div>;
}

// ─── AGENDA ───────────────────────────────────────────────────────────────────
function AgendaView({data,setData}) {
  const [modal,setModal]   = useState(false);
  const [editM,setEditM]   = useState(null);
  const [dragId,setDragId] = useState(null);
  const [overIdx,setOverIdx] = useState(null);
  const blank = {desc:'',amount:'',day:'1',type:'expense',catId:1,color:'#3B82F6',repeat:'monthly'};
  const [form,setForm] = useState(blank);

  // DRAG AND DROP
  const onDragStart = (e,id) => {setDragId(id); e.dataTransfer.effectAllowed='move';};
  const onDragOver  = (e,idx) => {e.preventDefault();setOverIdx(idx);};
  const onDrop      = (e,idx) => {
    e.preventDefault();
    const fromIdx = data.agenda.findIndex(a=>a.id===dragId);
    if(fromIdx===idx||fromIdx<0) {setDragId(null);setOverIdx(null);return;}
    const arr=[...data.agenda];
    const [item]=arr.splice(fromIdx,1); arr.splice(idx,0,item);
    setData(d=>({...d,agenda:arr}));
    setDragId(null);setOverIdx(null);
  };

  const save=()=>{
    setData(d=>({...d,agenda:[...d.agenda,{id:Date.now(),desc:form.desc,amount:+form.amount||0,day:+form.day||1,type:form.type,catId:+form.catId,color:form.color,repeat:form.repeat}]}));
    setModal(false);setForm(blank);
  };
  const saveEdit=()=>{setData(d=>({...d,agenda:d.agenda.map(a=>a.id===editM.id?editM:a)}));setEditM(null);};
  const del=id=>setData(d=>({...d,agenda:d.agenda.filter(a=>a.id!==id)}));

  const totalExp = data.agenda.filter(a=>a.type==='expense').reduce((acc,a)=>acc+a.amount,0);
  const totalInc = data.agenda.filter(a=>a.type==='income').reduce((acc,a)=>acc+a.amount,0);

  const AgendaForm=({state,setState,onSave,onClose})=><>
    <div className="fg"><label className="lbl">Descrição</label><input className="inp" placeholder="Ex: Aluguel, Netflix..." value={state.desc||''} onChange={e=>setState(s=>({...s,desc:e.target.value}))}/></div>
    <div className="g2">
      <div className="fg"><label className="lbl">Valor (R$)</label><input type="number" className="inp" placeholder="0,00" value={state.amount||''} onChange={e=>setState(s=>({...s,amount:e.target.value}))}/></div>
      <div className="fg"><label className="lbl">Dia do mês</label><input type="number" min="1" max="31" className="inp" value={state.day||''} onChange={e=>setState(s=>({...s,day:e.target.value}))}/></div>
      <div className="fg"><label className="lbl">Tipo</label><select className="inp" value={state.type||''} onChange={e=>setState(s=>({...s,type:e.target.value}))}><option value="expense">Despesa</option><option value="income">Receita</option></select></div>
      <div className="fg"><label className="lbl">Categoria</label><select className="inp" value={state.catId||''} onChange={e=>setState(s=>({...s,catId:+e.target.value}))}>{data.categories.map(c=><option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}</select></div>
      <div className="fg"><label className="lbl">Recorrência</label><select className="inp" value={state.repeat||''} onChange={e=>setState(s=>({...s,repeat:e.target.value}))}><option value="monthly">Mensal</option><option value="weekly">Semanal</option><option value="yearly">Anual</option><option value="once">Única</option></select></div>
      <div className="fg"><label className="lbl">Cor</label><input type="color" className="inp" style={{height:42}} value={state.color||'#3B82F6'} onChange={e=>setState(s=>({...s,color:e.target.value}))}/></div>
    </div>
    <div style={{display:'flex',gap:10}}><button className="btn btn-g" style={{flex:1}} onClick={onClose}>Cancelar</button><button className="btn btn-p" style={{flex:1}} onClick={onSave}><Save size={14}/> Salvar</button></div>
  </>;

  return <div className="fi">
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:22}}>
      <div><div className="pg-title">Agenda Financeira</div><div className="pg-sub" style={{marginBottom:0}}>Arraste para reordenar • {data.agenda.length} eventos</div></div>
      <button className="btn btn-p" onClick={()=>{setForm(blank);setModal(true);}}><Plus size={15}/> Novo Evento</button>
    </div>
    <div className="g2" style={{marginBottom:20}}>
      {[[fmt(totalInc),'Total de Entradas','green','success'],[fmt(totalExp),'Total de Despesas','red','danger']].map(([v,l,c,ac])=>(
        <div key={l} className={`stat-card ${c}`}><div style={{fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:1,color:'var(--text-3)'}}>{l}</div><div className="money" style={{fontSize:20,color:`var(--${ac})`}}>{v}</div></div>
      ))}
    </div>
    <div>
      {data.agenda.map((ev,idx)=>{
        const cat=data.categories.find(c=>c.id===ev.catId);
        const isDragging=dragId===ev.id; const isOver=overIdx===idx&&dragId!==ev.id;
        return <div key={ev.id} className={`drag-item${isDragging?' dragging':''}${isOver?' drag-over':''}`}
          draggable onDragStart={e=>onDragStart(e,ev.id)} onDragOver={e=>onDragOver(e,idx)} onDrop={e=>onDrop(e,idx)} onDragEnd={()=>{setDragId(null);setOverIdx(null);}}>
          <div className="fos-card" style={{marginBottom:8,display:'flex',alignItems:'center',gap:14,padding:'14px 16px',borderLeft:`3px solid ${ev.color}`,cursor:'grab'}}>
            <GripVertical size={16} color="var(--text-3)" style={{flexShrink:0,cursor:'grab'}}/>
            <div style={{width:32,height:32,borderRadius:8,background:ev.color+'25',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0}}>{cat?.emoji||'💰'}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontWeight:700,color:'var(--text-1)',fontSize:14}}>{ev.desc}</div>
              <div style={{fontSize:11,color:'var(--text-3)'}}>Dia {ev.day} • {ev.repeat==='monthly'?'Mensal':ev.repeat==='weekly'?'Semanal':ev.repeat==='yearly'?'Anual':'Único'} • {cat?.name||'—'}</div>
            </div>
            <div className={`money ${ev.type==='income'?'pos':'neg'}`} style={{fontSize:15,flexShrink:0}}>{ev.type==='income'?'+':'−'}{fmt(ev.amount)}</div>
            <span className={`badge ${ev.type==='income'?'b-g':'b-r'}`} style={{flexShrink:0}}>{ev.type==='income'?'Receita':'Despesa'}</span>
            <div style={{display:'flex',gap:4,flexShrink:0}}>
              <button className="ib" onClick={()=>setEditM({...ev})}><Edit3 size={13}/></button>
              <button className="ib" onClick={()=>del(ev.id)}><Trash2 size={13} color="var(--danger)"/></button>
            </div>
          </div>
        </div>;
      })}
      {data.agenda.length===0&&<div className="fos-card" style={{textAlign:'center',padding:40,color:'var(--text-3)'}}>
        Nenhum evento agendado. Clique em "Novo Evento" para começar.
      </div>}
    </div>

    <Modal open={modal} onClose={()=>setModal(false)} title="Novo Evento na Agenda"><AgendaForm state={form} setState={setForm} onSave={save} onClose={()=>setModal(false)}/></Modal>
    <Modal open={!!editM} onClose={()=>setEditM(null)} title="Editar Evento">{editM&&<AgendaForm state={editM} setState={setEditM} onSave={saveEdit} onClose={()=>setEditM(null)}/>}</Modal>
  </div>;
}

// ─── CORRIDAS ─────────────────────────────────────────────────────────────────
function CorridasView({data,setData}) {
  const [month,setMonth] = useState(today.getMonth());
  const [year,setYear]   = useState(today.getFullYear());
  const [editing,setEditing] = useState(null);
  const [addModal,setAddModal] = useState(false);
  const blank = {date:'',trips:'',km:'',autonomia:'12.5',hours:'',earnings:'',fuelPrice:'6.39'};
  const [newRow,setNewRow] = useState(blank);

  const filtered = useMemo(()=>data.corridas.filter(c=>{const d=new Date(c.date);return d.getMonth()===month&&d.getFullYear()===year;}).sort((a,b)=>new Date(b.date)-new Date(a.date)),[data.corridas,month,year]);

  // ✅ Fixed calculations
  const calc = useCallback(c=>{
    const trips  = Number(c.trips)  || 0;
    const km     = Number(c.km)     || 0;
    const auto   = Number(c.autonomia) || 1;
    const hours  = Number(c.hours)  || 0;
    const earn   = Number(c.earnings) || 0;
    const fuel   = Number(c.fuelPrice) || 0;
    const fuelCost = km > 0 ? (km / auto) * fuel : 0;
    return {
      ganhoHora:  hours > 0 ? earn / hours  : 0,
      ganhoKm:    km    > 0 ? earn / km     : 0,
      ticketMedio:trips > 0 ? earn / trips  : 0,
      custoComb:  fuelCost,
      custoKm:    km    > 0 ? fuelCost / km : 0,
      lucro:      earn - fuelCost,
    };
  },[]);

  const totals = useMemo(()=>filtered.reduce((acc,c)=>{
    const cl=calc(c);
    return{trips:acc.trips+(+c.trips||0),km:acc.km+(+c.km||0),earnings:acc.earnings+(+c.earnings||0),hours:acc.hours+(+c.hours||0),fuelCost:acc.fuelCost+cl.custoComb,lucro:acc.lucro+cl.lucro,days:acc.days+1};
  },{trips:0,km:0,earnings:0,hours:0,fuelCost:0,lucro:0,days:0}),[filtered,calc]);

  const avgHour  = totals.hours>0?totals.earnings/totals.hours:0;
  const avgKm    = totals.km>0?totals.earnings/totals.km:0;
  const avgTicket= totals.trips>0?totals.earnings/totals.trips:0;

  const addRow=()=>{
    const c={id:Date.now(),date:newRow.date,trips:+newRow.trips||0,km:+newRow.km||0,autonomia:+newRow.autonomia||12,hours:+newRow.hours||0,earnings:+newRow.earnings||0,fuelPrice:+newRow.fuelPrice||0};
    setData(d=>({...d,corridas:[...d.corridas,c]}));
    setAddModal(false);setNewRow(blank);
  };
  const update=(id,field,val)=>setData(d=>({...d,corridas:d.corridas.map(c=>c.id===id?{...c,[field]:+val||val}:c)}));
  const del=id=>setData(d=>({...d,corridas:d.corridas.filter(c=>c.id!==id)}));

  const EditCell=({id,field,val})=>(
    editing===id
    ?<input style={{background:'var(--accent-dim)',borderRadius:4,padding:'0 4px',color:'var(--text-1)',width:'70px',border:'1px solid var(--border-accent)',outline:'none',fontFamily:'Outfit',fontSize:13}} defaultValue={val} onBlur={e=>update(id,field,e.target.value)}/>
    :<span>{val}</span>
  );

  // Preview for add modal
  const preview = useMemo(()=>{
    if(!newRow.km||!newRow.earnings) return null;
    return calc({...newRow});
  },[newRow,calc]);

  return <div className="fi">
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:22}}>
      <div><div className="pg-title">🚗 Corridas</div><div className="pg-sub" style={{marginBottom:0}}>Performance — não integrado ao dashboard financeiro</div></div>
      <div style={{display:'flex',gap:10,alignItems:'center'}}>
        <MonthNav month={month} year={year} onChange={(m,y)=>{setMonth(m);setYear(y);}}/>
        <button className="btn btn-p" onClick={()=>setAddModal(true)}><Plus size={15}/> Novo Dia</button>
      </div>
    </div>
    <div className="g4" style={{marginBottom:18}}>
      {[[fmt(totals.earnings),'Ganho Bruto',`${totals.days} dias`,'success'],[fmt(totals.lucro),'Lucro Líquido','Após combustível','accent'],[fmt(totals.fuelCost),'Combustível','Total no mês','warning'],[`${(totals.km||0).toLocaleString('pt-BR')} km`,'Quilômetros',`${totals.trips} corridas`,'purple']].map(([v,l,s,c])=>(
        <div key={l} className={`stat-card ${c==='accent'?'blue':c==='warning'?'yellow':c==='purple'?'purple':'green'}`}>
          <div style={{fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:1,color:'var(--text-3)'}}>{l}</div>
          <div className="money" style={{fontSize:18,color:`var(--${c})`}}>{v}</div>
          <div style={{fontSize:11,color:'var(--text-3)'}}>{s}</div>
        </div>
      ))}
    </div>
    <div className="g4" style={{marginBottom:18}}>
      {[[fmt(avgHour),'Ganho/Hora',Timer],[`R$ ${fmtN(avgKm,2)}`,'Ganho/KM',Route],[fmt(avgTicket),'Ticket Médio',Car],[`${fmtN(totals.hours,1)}h`,'Horas Online',Clock]].map(([v,l,I])=>(
        <div key={l} className="fos-card" style={{textAlign:'center',padding:14}}>
          <I size={16} color="var(--accent)" style={{margin:'0 auto 8px',display:'block'}}/>
          <div className="money" style={{fontSize:16,color:'var(--accent)'}}>{v}</div>
          <div style={{fontSize:11,color:'var(--text-3)',marginTop:3}}>{l}</div>
        </div>
      ))}
    </div>
    <div className="fos-card" style={{overflowX:'auto'}}>
      <div style={{marginBottom:12,display:'flex',alignItems:'center',gap:8}}>
        <div style={{width:8,height:8,background:'var(--accent)',borderRadius:2}}/>
        <span style={{fontFamily:'Syne',fontWeight:700,fontSize:14,color:'var(--text-1)'}}>Planilha — {MONTHS_FULL[month]} {year}</span>
        <span style={{fontSize:11,color:'var(--text-3)',background:'var(--accent-glow)',padding:'2px 8px',borderRadius:20,border:'1px solid var(--border-accent)'}}>⚡ Colunas azuis calculadas automaticamente</span>
      </div>
      <table className="tbl" style={{minWidth:900}}>
        <thead><tr>
          <th>Data</th><th>Viagens</th><th>KM</th><th>Autonomia</th><th>H. Online</th><th>Ganhos</th><th>R$/L</th>
          <th style={{color:'var(--accent)',background:'var(--accent-glow)'}}>Ganho/h</th>
          <th style={{color:'var(--accent)',background:'var(--accent-glow)'}}>Ganho/km</th>
          <th style={{color:'var(--accent)',background:'var(--accent-glow)'}}>Ticket</th>
          <th style={{color:'var(--warning)',background:'var(--warning-dim)'}}>Comb.</th>
          <th style={{color:'var(--warning)',background:'var(--warning-dim)'}}>Custo/km</th>
          <th></th>
        </tr></thead>
        <tbody>
          {filtered.length===0&&<tr><td colSpan={13} style={{textAlign:'center',padding:30,color:'var(--text-3)'}}>Nenhum registro para {MONTHS_FULL[month]} {year}. Clique em "Novo Dia" para adicionar.</td></tr>}
          {filtered.map(c=>{
            const cl=calc(c); const isEd=editing===c.id;
            return <tr key={c.id}>
              <td style={{color:'var(--text-1)',fontWeight:600}}>{isEd?<input type="date" defaultValue={c.date} className="inp" style={{padding:'2px 6px',fontSize:12,width:130}} onBlur={e=>update(c.id,'date',e.target.value)}/>:c.date}</td>
              <td><EditCell id={c.id} field="trips" val={c.trips}/></td>
              <td><EditCell id={c.id} field="km" val={c.km}/></td>
              <td><EditCell id={c.id} field="autonomia" val={c.autonomia}/></td>
              <td><EditCell id={c.id} field="hours" val={c.hours}/></td>
              <td style={{color:'var(--success)',fontWeight:600}}>{isEd?<input defaultValue={c.earnings} style={{background:'var(--success-dim)',borderRadius:4,padding:'0 4px',color:'var(--success)',width:80,border:'none',outline:'none',fontFamily:'Outfit',fontSize:13}} onBlur={e=>update(c.id,'earnings',e.target.value)}/>:fmt(c.earnings)}</td>
              <td><EditCell id={c.id} field="fuelPrice" val={c.fuelPrice}/></td>
              <td style={{color:'var(--accent)',fontWeight:500}}>{fmt(cl.ganhoHora)}</td>
              <td style={{color:'var(--accent)',fontWeight:500}}>R$ {fmtN(cl.ganhoKm,2)}</td>
              <td style={{color:'var(--accent)',fontWeight:500}}>{fmt(cl.ticketMedio)}</td>
              <td style={{color:'var(--warning)',fontWeight:500}}>{fmt(cl.custoComb)}</td>
              <td style={{color:'var(--warning)',fontWeight:500}}>R$ {fmtN(cl.custoKm,3)}</td>
              <td><div style={{display:'flex',gap:4}}>
                <button className="ib" onClick={()=>setEditing(isEd?null:c.id)} title={isEd?'Salvar':'Editar'}>{isEd?<Check size={13} color="var(--success)"/>:<Edit3 size={13}/>}</button>
                <button className="ib" onClick={()=>del(c.id)}><Trash2 size={13} color="var(--danger)"/></button>
              </div></td>
            </tr>;
          })}
        </tbody>
        {filtered.length>0&&<tfoot><tr style={{background:'var(--bg-elevated)'}}>
          <td style={{fontWeight:700,color:'var(--text-1)'}}>TOTAIS</td>
          <td style={{fontWeight:700}}>{totals.trips}</td>
          <td style={{fontWeight:700}}>{fmtN(totals.km,0)}</td>
          <td>—</td><td style={{fontWeight:700}}>{fmtN(totals.hours,1)}h</td>
          <td style={{fontWeight:700,color:'var(--success)'}}>{fmt(totals.earnings)}</td><td>—</td>
          <td style={{color:'var(--accent)',fontWeight:700}}>{fmt(avgHour)}</td>
          <td style={{color:'var(--accent)',fontWeight:700}}>R$ {fmtN(avgKm,2)}</td>
          <td style={{color:'var(--accent)',fontWeight:700}}>{fmt(avgTicket)}</td>
          <td style={{color:'var(--warning)',fontWeight:700}}>{fmt(totals.fuelCost)}</td>
          <td>—</td><td></td>
        </tr></tfoot>}
      </table>
    </div>

    <Modal open={addModal} onClose={()=>setAddModal(false)} title="Registrar Novo Dia">
      <div className="info-box"><Info size={14}/> Preencha os dados manualmente. Os cálculos são automáticos.</div>
      <div className="g2">
        {[['date','Data','date',''],['trips','Nº de Viagens','number','Ex: 18'],['km','KM Percorrido','number','Ex: 142'],['autonomia','Autonomia (km/L)','number','Ex: 12.5'],['hours','Horas Online','number','Ex: 8.5'],['earnings','Ganhos do Dia (R$)','number','Ex: 310.50'],['fuelPrice','Preço do Litro (R$)','number','Ex: 6.39']].map(([f,l,t,p])=>(
          <div key={f} className="fg"><label className="lbl">{l}</label><input type={t} className="inp" placeholder={p} value={newRow[f]} onChange={e=>setNewRow(r=>({...r,[f]:e.target.value}))}/></div>
        ))}
      </div>
      {preview&&<div style={{background:'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:12,padding:'12px 14px',marginBottom:14}}>
        <div style={{fontSize:11,fontWeight:600,color:'var(--accent)',marginBottom:8,textTransform:'uppercase',letterSpacing:1}}>📊 Pré-visualização Automática</div>
        <div className="g2">
          {[['Ganho/hora',fmt(preview.ganhoHora)],['Ganho/km',`R$ ${fmtN(preview.ganhoKm,2)}`],['Ticket Médio',fmt(preview.ticketMedio)],['Custo Comb.',fmt(preview.custoComb)],['Custo/km',`R$ ${fmtN(preview.custoKm,3)}`],['Lucro Líq.',fmt(preview.lucro)]].map(([l,v])=>(
            <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'3px 0'}}>
              <span style={{fontSize:12,color:'var(--text-3)'}}>{l}</span>
              <span style={{fontSize:12,fontWeight:700,color:'var(--accent)'}}>{v}</span>
            </div>
          ))}
        </div>
      </div>}
      <div style={{display:'flex',gap:10}}>
        <button className="btn btn-g" style={{flex:1}} onClick={()=>setAddModal(false)}>Cancelar</button>
        <button className="btn btn-p" style={{flex:1}} onClick={addRow}><Save size={14}/> Salvar Dia</button>
      </div>
    </Modal>
  </div>;
}

// ─── PLANOS ───────────────────────────────────────────────────────────────────
// References: YNAB (nYNAB), Mobills, Guiabolso, Organizze
function PlanosView() {
  const {user,upgradePlan} = useAuth();
  const [billing,setBilling] = useState('monthly'); // monthly | annual
  const [modal,setModal] = useState(null); // plan key to show payment modal

  const plans = [
    {
      key:'starter', name:'Starter', icon:<Package size={24} color="#64748B"/>,
      color:'#64748B', colorDim:'rgba(100,116,139,0.12)',
      descMonth:0, descAnnual:0, free:true,
      tagline:'Gratuito para sempre',
      features:['1 conta bancária','Lançamentos básicos','Até 5 categorias','Controle de saldo','Suporte por e-mail'],
      missing:['Relatórios e gráficos','Cartões de crédito','Agenda financeira','Aba de Corridas','Metas ilimitadas'],
    },
    {
      key:'plus', name:'Plus', icon:<Zap size={24} color="#22D3EE"/>,
      color:'#22D3EE', colorDim:'rgba(34,211,238,0.12)',
      descMonth:1990, descAnnual:19900, free:false,
      tagline:'Ideal para controle completo',
      featured:true,
      features:['Até 5 contas bancárias','Até 3 cartões de crédito','Categorias ilimitadas','Relatórios e gráficos','Orçamento mensal','Agenda financeira','Metas financeiras','Faturas detalhadas','Suporte prioritário'],
      missing:['Aba de Corridas (app)'],
    },
    {
      key:'pro', name:'Pro', icon:<Crown size={24} color="#A78BFA"/>,
      color:'#A78BFA', colorDim:'rgba(167,139,250,0.12)',
      descMonth:3990, descAnnual:39900, free:false,
      tagline:'Máximo poder, sem limites',
      features:['Contas ilimitadas','Cartões ilimitados','Todas as funcionalidades Plus','Aba de Corridas — motorista de app','Exportação de dados (CSV)','Histórico completo','Suporte VIP — WhatsApp','Acesso antecipado a novos recursos'],
      missing:[],
    },
  ];

  const fmtCurrency = v => `R$ ${(v/100).toFixed(2).replace('.',',')}`;

  return <div className="fi">
    <div style={{textAlign:'center',marginBottom:32}}>
      <div className="pg-title" style={{fontSize:28,marginBottom:8}}>Escolha seu Plano</div>
      <div style={{fontSize:15,color:'var(--text-3)',maxWidth:480,margin:'0 auto'}}>
        Comece gratuitamente. Faça upgrade quando quiser. Cancele a qualquer momento.
      </div>
    </div>

    {/* Billing toggle */}
    <div style={{display:'flex',justifyContent:'center',marginBottom:32}}>
      <div style={{display:'flex',background:'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:12,padding:4,gap:4}}>
        {[['monthly','Mensal'],['annual','Anual — 2 meses grátis 🎉']].map(([v,l])=>(
          <button key={v} className={`btn ${billing===v?'btn-p':'btn-g'}`} style={{border:'none',padding:'8px 20px',fontSize:13}} onClick={()=>setBilling(v)}>{l}</button>
        ))}
      </div>
    </div>

    <div className="g3" style={{maxWidth:900,margin:'0 auto',marginBottom:40}}>
      {plans.map(p=>(
        <div key={p.key} className={`plan-card${p.featured?' featured':''}`}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
            <div style={{width:44,height:44,borderRadius:12,background:p.colorDim,display:'flex',alignItems:'center',justifyContent:'center'}}>{p.icon}</div>
            <div>
              <div style={{fontFamily:'Syne',fontWeight:800,fontSize:18,color:'var(--text-1)'}}>{p.name}</div>
              <div style={{fontSize:11,color:'var(--text-3)'}}>{p.tagline}</div>
            </div>
          </div>

          <div style={{marginBottom:20}}>
            {p.free
              ? <div style={{fontFamily:'Syne',fontWeight:800,fontSize:32,color:'var(--text-1)'}}>Grátis</div>
              : <div>
                  <div style={{fontFamily:'Syne',fontWeight:800,fontSize:32,color:p.color}}>{fmtCurrency(billing==='annual'?Math.round(p.descAnnual/12):p.descMonth)}<span style={{fontSize:14,fontWeight:500,color:'var(--text-3)'}}>/mês</span></div>
                  {billing==='annual'&&<div style={{fontSize:12,color:'var(--success)'}}>Cobrança anual de {fmtCurrency(p.descAnnual)}</div>}
                </div>
            }
          </div>

          {/* CTA */}
          {user?.plan===p.key
            ? <div style={{width:'100%',padding:'10px',borderRadius:10,background:'var(--success-dim)',color:'var(--success)',fontWeight:600,fontSize:13,display:'flex',alignItems:'center',justifyContent:'center',gap:6,marginBottom:16}}><CheckCircle size={14}/> Plano Atual</div>
            : <button className="btn" style={{width:'100%',marginBottom:16,background:p.featured?p.color:'var(--bg-elevated)',color:p.featured?'#020B15':'var(--text-1)',border:`1px solid ${p.color}`,fontSize:13}} onClick={()=>p.free?upgradePlan('starter'):setModal(p)}>
                {p.free?'Começar Grátis':'Assinar '+p.name}
              </button>
          }

          <div style={{fontSize:12,color:'var(--text-2)'}}>
            {p.features.map(f=><div key={f} style={{display:'flex',alignItems:'center',gap:8,padding:'5px 0',borderBottom:'1px solid var(--border)'}}><Check size={13} color="var(--success)"/>{f}</div>)}
            {p.missing.map(f=><div key={f} style={{display:'flex',alignItems:'center',gap:8,padding:'5px 0',opacity:0.4}}><X size={13}/><s>{f}</s></div>)}
          </div>
        </div>
      ))}
    </div>

    {/* Payment info box */}
    <div style={{maxWidth:600,margin:'0 auto'}}>
      <div className="fos-card">
        <div style={{display:'flex',gap:12,alignItems:'flex-start'}}>
          <Shield size={20} color="var(--success)" style={{flexShrink:0,marginTop:2}}/>
          <div>
            <div style={{fontWeight:700,color:'var(--text-1)',marginBottom:4}}>Pagamento seguro via Mercado Pago</div>
            <div style={{fontSize:13,color:'var(--text-3)'}}>Aceitamos Pix, cartão de crédito (até 12x) e boleto bancário. Dados protegidos por criptografia SSL. Cancele quando quiser sem multa.</div>
          </div>
        </div>
        {user?.role==='admin'&&<div style={{marginTop:12,padding:'10px 14px',background:'var(--accent-glow)',borderRadius:10,border:'1px solid var(--border-accent)',fontSize:12,color:'var(--accent)'}}>
          👑 Você é administrador — acesso Pro completo sem cobrança.
        </div>}
      </div>
    </div>

    {/* Payment Modal */}
    <Modal open={!!modal} onClose={()=>setModal(null)} title={`Assinar plano ${modal?.name}`}>
      {modal&&<>
        <div style={{textAlign:'center',marginBottom:20}}>
          <div style={{fontSize:28,fontFamily:'Syne',fontWeight:800,color:modal.color,marginBottom:4}}>
            {fmtCurrency(billing==='annual'?Math.round(modal.descAnnual/12):modal.descMonth)}<span style={{fontSize:14,color:'var(--text-3)'}}>/mês</span>
          </div>
          {billing==='annual'&&<div style={{fontSize:12,color:'var(--success)'}}>Cobrado anualmente: {fmtCurrency(modal.descAnnual)}</div>}
        </div>

        <div className="info-box">
          <Info size={14}/> Integração com Mercado Pago em breve. Por enquanto, ative manualmente abaixo para demo.
        </div>

        {/* Demo: direct upgrade (em produção, seria redirect para Mercado Pago/Stripe) */}
        <div className="fos-card" style={{marginBottom:16,textAlign:'center'}}>
          <div style={{fontSize:22,marginBottom:8}}>📱</div>
          <div style={{fontWeight:700,color:'var(--text-1)',marginBottom:4}}>Pagamento via Pix ou Cartão</div>
          <div style={{fontSize:12,color:'var(--text-3)',marginBottom:12}}>Em produção: redirecionamento para Mercado Pago / Stripe Checkout</div>
          <div style={{display:'flex',gap:8,justifyContent:'center',flexWrap:'wrap'}}>
            {['Pix','Cartão de Crédito','Boleto'].map(m=>(
              <div key={m} style={{padding:'8px 14px',border:'1px solid var(--border)',borderRadius:8,fontSize:12,fontWeight:500,color:'var(--text-2)'}}>{m}</div>
            ))}
          </div>
        </div>

        <button className="btn btn-p" style={{width:'100%',marginBottom:8}} onClick={()=>{upgradePlan(modal.key);setModal(null);}}>
          <CheckCircle size={15}/> Ativar Plano {modal.name} (Demo)
        </button>
        <button className="btn btn-g" style={{width:'100%'}} onClick={()=>setModal(null)}>Cancelar</button>

        <div style={{fontSize:11,color:'var(--text-3)',textAlign:'center',marginTop:12}}>
          🔒 Pagamento seguro • Cancele a qualquer momento • Suporte via WhatsApp
        </div>
      </>}
    </Modal>
  </div>;
}

// ─── PERFIL ───────────────────────────────────────────────────────────────────
function PerfilView({theme,setTheme}) {
  const {user,logout,isAdmin} = useAuth();
  return <div className="fi">
    <div className="pg-title">Perfil & Configurações</div>
    <div className="pg-sub">Gerencie sua conta e preferências</div>
    <div className="g2">
      <div>
        <div className="fos-card" style={{marginBottom:16}}>
          <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:20}}>
            <div style={{width:52,height:52,borderRadius:14,background:'linear-gradient(135deg,var(--accent),#818CF8)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>
              {user?.name?.[0]?.toUpperCase()||'U'}
            </div>
            <div>
              <div style={{fontFamily:'Syne',fontWeight:800,fontSize:18,color:'var(--text-1)'}}>{user?.name}</div>
              <div style={{fontSize:12,color:'var(--text-3)'}}>{user?.email}</div>
              <span className={`badge ${isAdmin?'b-p':'b-b'}`} style={{marginTop:4}}>{isAdmin?'👑 Admin':'👤 Plano '+PLAN_LIMITS[user?.plan]?.label}</span>
            </div>
          </div>
          {['name','email'].map(f=><div key={f} className="fg"><label className="lbl">{f==='name'?'Nome':'E-mail'}</label><input className="inp" defaultValue={user?.[f]}/></div>)}
          <button className="btn btn-p"><Save size={14}/> Salvar Alterações</button>
        </div>
        <div className="fos-card">
          <div style={{fontFamily:'Syne',fontWeight:700,fontSize:14,marginBottom:14}}>Segurança</div>
          {['Senha atual','Nova senha','Confirmar'].map(l=><div key={l} className="fg"><label className="lbl">{l}</label><input type="password" className="inp" placeholder="••••••••"/></div>)}
          <button className="btn btn-g"><RefreshCw size={14}/> Alterar Senha</button>
        </div>
      </div>
      <div>
        <div className="fos-card" style={{marginBottom:16}}>
          <div style={{fontFamily:'Syne',fontWeight:700,fontSize:14,marginBottom:14}}>Aparência</div>
          <div style={{display:'flex',gap:10}}>
            {[['dark','🌙 Escuro'],['light','☀️ Claro']].map(([v,l])=>(
              <button key={v} className={`btn ${theme===v?'btn-p':'btn-g'}`} style={{flex:1}} onClick={()=>setTheme(v)}>{l}</button>
            ))}
          </div>
        </div>
        <div className="fos-card" style={{marginBottom:16}}>
          <div style={{fontFamily:'Syne',fontWeight:700,fontSize:14,marginBottom:14}}>Moeda & Região</div>
          <div className="fg"><label className="lbl">Moeda padrão</label><select className="inp"><option>BRL — Real Brasileiro</option><option>USD — Dólar</option><option>EUR — Euro</option></select></div>
        </div>
        <div className="fos-card">
          <div style={{fontFamily:'Syne',fontWeight:700,fontSize:14,marginBottom:14}}>Conta</div>
          <button className="btn btn-d" style={{width:'100%'}} onClick={logout}><LogOut size={14}/> Sair da Conta</button>
        </div>
      </div>
    </div>
  </div>;
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
const LOGO_WHITE_B64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAB4CAYAAAA5ZDbSAAABCGlDQ1BJQ0MgUHJvZmlsZQAAeJxjYGA8wQAELAYMDLl5JUVB7k4KEZFRCuwPGBiBEAwSk4sLGHADoKpv1yBqL+viUYcLcKakFicD6Q9ArFIEtBxopAiQLZIOYWuA2EkQtg2IXV5SUAJkB4DYRSFBzkB2CpCtkY7ETkJiJxcUgdT3ANk2uTmlyQh3M/Ck5oUGA2kOIJZhKGYIYnBncAL5H6IkfxEDg8VXBgbmCQixpJkMDNtbGRgkbiHEVBYwMPC3MDBsO48QQ4RJQWJRIliIBYiZ0tIYGD4tZ2DgjWRgEL7AwMAVDQsIHG5TALvNnSEfCNMZchhSgSKeDHkMyQx6QJYRgwGDIYMZAKbWPz9HbOBQAAAA==";

const NAV_GROUPS = [
  {section:'Principal', items:[
    {id:'dashboard',label:'Dashboard',icon:LayoutDashboard},
    {id:'contas',label:'Contas',icon:Wallet},
    {id:'lancamentos',label:'Lançamentos',icon:List},
    {id:'transferencias',label:'Transferências',icon:ArrowLeftRight},
  ]},
  {section:'Cartões', items:[
    {id:'cartoes',label:'Cartões',icon:CreditCard},
    {id:'faturas',label:'Faturas',icon:Receipt},
  ]},
  {section:'Planejamento', items:[
    {id:'categorias',label:'Categorias',icon:Tag},
    {id:'orcamento',label:'Orçamento',icon:BarChart3},
    {id:'metas',label:'Metas',icon:Target},
  ]},
  {section:'Análise', items:[
    {id:'relatorios',label:'Relatórios',icon:BarChart3},
    {id:'agenda',label:'Agenda',icon:Calendar},
  ]},
  {section:'Extras', items:[
    {id:'corridas',label:'Corridas 🚗',icon:Car},
    {id:'planos',label:'Planos',icon:Sparkles},
    {id:'perfil',label:'Perfil',icon:User},
  ]},
];
const VIEW_LABELS = {
  dashboard:'Dashboard',contas:'Contas',lancamentos:'Lançamentos',transferencias:'Transferências',
  cartoes:'Cartões',faturas:'Faturas',categorias:'Categorias',orcamento:'Orçamento',
  metas:'Metas',relatorios:'Relatórios',agenda:'Agenda',corridas:'Corridas',planos:'Planos',perfil:'Perfil'
};

function Sidebar({active,setActive,theme}) {
  const {user,logout} = useAuth();
  const logo = theme==='dark'?LOGO_WHITE_B64:LOGO_WHITE_B64; // Use same for now
  return <div className="fos-sidebar">
    <div className="fos-logo">
      <div style={{width:36,height:36,borderRadius:10,background:'linear-gradient(135deg,#22D3EE,#818CF8)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>💰</div>
      <div><div className="fos-logo-text">Masterlat</div><div className="fos-logo-sub">Finance</div></div>
    </div>
    <nav className="fos-nav">
      {NAV_GROUPS.map(g=>(
        <div key={g.section} style={{marginBottom:4}}>
          <div className="fos-nav-label">{g.section}</div>
          {g.items.map(item=>(
            <div key={item.id} className={`fos-nav-item${active===item.id?' active':''}`} onClick={()=>setActive(item.id)}>
              <item.icon size={16}/><span>{item.label}</span>
              {active===item.id?<span className="nav-dot"/>:null}
            </div>
          ))}
        </div>
      ))}
    </nav>
    <div className="fos-sidebar-footer">
      <div style={{display:'flex',alignItems:'center',gap:8,padding:'8px 10px',borderRadius:10,background:'var(--bg-elevated)',border:'1px solid var(--border)'}}>
        <div style={{width:30,height:30,borderRadius:8,background:'linear-gradient(135deg,var(--accent),#818CF8)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:700,fontSize:13,flexShrink:0}}>
          {user?.name?.[0]?.toUpperCase()||'U'}
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:12,fontWeight:600,color:'var(--text-1)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user?.name}</div>
          <div style={{fontSize:10,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:0.5}}>{PLAN_LIMITS[user?.plan]?.label}</div>
        </div>
        <button style={{background:'none',border:'none',cursor:'pointer',color:'var(--text-3)',display:'flex'}} title="Sair" onClick={logout}><LogOut size={14}/></button>
      </div>
    </div>
  </div>;
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
function AppInner() {
  const {user} = useAuth();
  const [theme,setTheme]       = useState('dark');
  const [activeView,setActiveView] = useState('dashboard');
  const [data,setData] = useState({
    accounts:    INIT_ACCOUNTS,
    transactions:INIT_TX,
    creditCards: INIT_CARDS,
    invoices:    INIT_INVOICES,
    categories:  INIT_CATS,
    budgets:     INIT_BUDGETS,
    goals:       INIT_GOALS,
    agenda:      INIT_AGENDA,
    corridas:    INIT_CORRIDAS,
  });

  if(!user) return <div className={`fos-app ${theme}`}><AuthScreen/></div>;

  const p = {data, setData, setActiveView};
  const views = {
    dashboard:    <DashboardView {...p}/>,
    contas:       <ContasView {...p}/>,
    lancamentos:  <LancamentosView {...p}/>,
    cartoes:      <CartoesView {...p}/>,
    faturas:      <FaturasView {...p}/>,
    categorias:   <CategoriasView {...p}/>,
    orcamento:    <OrcamentoView {...p}/>,
    metas:        <MetasView {...p}/>,
    relatorios:   <RelatoriosView {...p}/>,
    agenda:       <AgendaView {...p}/>,
    corridas:     <CorridasView {...p}/>,
    planos:       <PlanosView/>,
    perfil:       <PerfilView theme={theme} setTheme={setTheme}/>,
    transferencias: <LancamentosView {...p}/>,
  };

  return <div className={`fos-app ${theme}`}>
    <Sidebar active={activeView} setActive={setActiveView} theme={theme}/>
    <div className="fos-main">
      <div className="fos-header">
        <div style={{fontFamily:'Syne',fontWeight:700,fontSize:16,color:'var(--text-1)',flex:1}}>
          <span style={{color:'var(--text-3)',fontSize:13,fontFamily:'Outfit',fontWeight:400}}>Masterlat Finance / </span>
          {VIEW_LABELS[activeView]||'Início'}
        </div>
        <div className="search-box"><Search size={14} color="var(--text-3)"/><input placeholder="Buscar..."/></div>
        <button className="ib"><Bell size={15}/></button>
        <button className="ib" onClick={()=>setTheme(t=>t==='dark'?'light':'dark')}>{theme==='dark'?<Sun size={15}/>:<Moon size={15}/>}</button>
      </div>
      <div className="fos-content">{views[activeView]||views.dashboard}</div>
    </div>
  </div>;
}

export default function App() {
  return <AuthProvider>
    <style>{STYLES}</style>
    <AppInner/>
  </AuthProvider>;
}
