// Masterlat Finance v3.0
// Fixes: landing page, plans pricing, admin credentials, Stripe, date format,
//        currency auto-format, modal close only on X, logo, no outside-click dismiss
import { useState, useMemo, useCallback, useEffect, useRef, createContext, useContext } from "react";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { LayoutDashboard, Wallet, CreditCard, Receipt, Tag, Target, BarChart3, Calendar, Car, Plus, Search, Bell, Moon, Sun, ChevronRight, TrendingUp, TrendingDown, ArrowLeftRight, Edit3, Trash2, X, Check, ArrowUp, ArrowDown, Clock, Timer, ChevronLeft, Save, Info, Star, User, Eye, EyeOff, RefreshCw, Zap, Home, ShoppingCart, Heart, Book, Coffee, Music, Monitor, List, Route, GripVertical, Lock, Shield, Crown, Sparkles, LogOut, UserPlus, LogIn, Upload, CheckCircle, AlertTriangle, Package } from "lucide-react";

// ─── LOGO (base64 — branco com fundo preto, invertemos via CSS filter) ────────
const LOGO_B64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAABCGlDQ1BJQ0MgUHJvZmlsZQAAeJxjYGA8wQAELAYMDLl5JUVB7k4KEZFRCuwPGBiBEAwSk4sLGHADoKpv1yBqL+viUYcLcKakFicD6Q9ArFIEtBxopAiQLZIOYWuA2EkQtg2IXV5SUAJkB4DYRSFBzkB2CpCtkY7ETkJiJxcUgdT3ANk2uTmlyQh3M/Ck5oUGA2kOIJZhKGYIYnBncAL5H6IkfxEDg8VXBgbmCQixpJkMDNtbGRgkbiHEVBYwMPC3MDBsO48QQ4RJQWJRIliIBYiZ0tIYGD4tZ2DgjWRgEL7AwMAVDQsIHG5TALvNnSEfCNMZchhSgSKeDHkMyQx6QJYRgwGDIYMZAKbWPz9HbOBQAAAX6UlEQVR42tVde1BU1/3/3Lt3dwGBBUEXEFAEH8SfRkNIlPiO1tfEOlE0PhqMok01ExMfScaJOqWdJFbTamqaKsQ2DiYRUWuMIWo0ChpxUjtGfACiKCKB5bGsILDP7+8Pe0737t5dkIeaM3OHZXfvued8zvd9vue7AgBCFzZBECCKIgDAbrfLPouNjcXgwYMxZMgQDBw4EDExMdDr9QgKCoKPjw+0Wi0AwGKxoLm5GfX19aiqqsLNmzdx9epVXLx4EQUFBbh+/bqsX5VKBQBwOBwg6tLpQegqABlwzqCFhIRg5MiRmDhxIkaMGIH+/fvD39/fYx9s8oIgePxOY2MjiouLcfbsWRw7dgynT59GbW0t/1ySJNjt9i4FkjrzEgSBJEni/0uSRFOnTqXMzEwyGAzk2ux2O1mtVrJarWSz2chut5PdbieHwyG72Ps2m41/3263u/VnMBho9+7dNG3aNFKr1bJxCIJAnT3fTgVQpVLx18HBwbRixQoqKCiQTdBqtZLFYuFguQL1oBcD1WKxkNVqlT3r0qVL9Oabb1L37t0Vx/jYACiKIokiSADI39+f1qxZQ2VlZXwijGo6A7C2AMqombXy8nJ65513KDAw0G28jxxA5xWdO3cuFRcX84EzSmvrpC0WC78Ym7LL9bO2LAajTNZKSkroN7/5jYytHxmAgiBw8GJjY+mrr74SAedtgs6AORwOam9zOBxtAtRut8uA/Oabb6h///6cADoiG9ulhUVRBBGBiPDyyy9jy5YtCA4Ohs1mk5ktro1pZEmSZO9XVFSgpKQEJSUlKCsrQ1VVFerr62E2mwEAWq0WOp0Oer0evXv3RlxcHOLi4hARESHrx2azycwY18bMGkmSYDKZsHr1amRkZHBN315N3S6WVavV9Mknn8iUgycKcNWY9fX1dOjQIXr99dcpISGBAgICHnjlAwICKCEhgV5//XU6dOgQGY1GN83ubTysffrpp+Tj48O5qktZmIGn1+vp5MmTHDhP7OMKXF5eHi1dupQiIiIUFZEkSbJLpVKRSqVye19JAURERFBqaipnZNYpe3CL3hEVFUVHjx4loq6uCIauCq4Aoa+vovfF+5OFr2Aq9kKUPwO9eLWLdNSsHfpKkfL0m8p3KU3mH0BbsC+n96f2lYYPfHSYPSVpKSkNB3FN08qqaOkqwdgvkBqDQE8sCNQdPlBSmJ/kHq2+y3qLKpADhTTL3twAJuGbHhiNxLxNp4BKXbHq7FVeB6MkNQ3IQqGNBJNkyHAYkFBQhRPDuBwMbVbpv+Bh4WFqUqBFklKqJJzRGJ/nDuAAAA";

// ─── STRIPE PK (public key is safe in frontend) ───────────────────────────────
const STRIPE_PK = 'pk_test_51TJZ8bRN198l519TxfJTS0yW0VPl78zqyk6b9esoznU4OCtsBXakwTr4CcdDUCvdvRGL8v7irzoaXg5eXUKe5uZ300LRl0rx19';

// ─── AUTH ─────────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);
function useAuth(){ return useContext(AuthContext); }

// Admin credentials — change only here
const ADMIN_EMAIL = 'admin';
const ADMIN_PASS  = 'Masterlat@13';

function AuthProvider({children}){
  const [user,setUser] = useState(()=>{try{return JSON.parse(localStorage.getItem('mf_user'))||null;}catch{return null;}});

  const login=(email,password)=>{
    // Admin check
    if(email===ADMIN_EMAIL && password===ADMIN_PASS){
      const u={id:'admin',name:'Administrador',email:'admin',role:'admin',plan:'pro',createdAt:new Date().toISOString()};
      setUser(u); localStorage.setItem('mf_user',JSON.stringify(u)); return u;
    }
    const users=JSON.parse(localStorage.getItem('mf_users')||'[]');
    const found=users.find(u=>u.email===email&&u.password===password);
    if(!found) throw new Error('E-mail ou senha incorretos');
    const u={...found,password:undefined};
    setUser(u); localStorage.setItem('mf_user',JSON.stringify(u)); return u;
  };

  const register=(name,email,password)=>{
    if(email===ADMIN_EMAIL) throw new Error('E-mail não disponível');
    const users=JSON.parse(localStorage.getItem('mf_users')||'[]');
    if(users.find(u=>u.email===email)) throw new Error('E-mail já cadastrado');
    const trialEnd=new Date(); trialEnd.setDate(trialEnd.getDate()+7);
    const nu={id:Date.now().toString(),name,email,password,role:'customer',plan:'trial',trialEnd:trialEnd.toISOString(),createdAt:new Date().toISOString()};
    users.push(nu); localStorage.setItem('mf_users',JSON.stringify(users));
    const u={...nu,password:undefined};
    setUser(u); localStorage.setItem('mf_user',JSON.stringify(u)); return u;
  };

  const logout=()=>{setUser(null);localStorage.removeItem('mf_user');};

  const upgradePlan=(plan)=>{
    const u={...user,plan};
    setUser(u); localStorage.setItem('mf_user',JSON.stringify(u));
    const users=JSON.parse(localStorage.getItem('mf_users')||'[]');
    const idx=users.findIndex(x=>x.id===u.id);
    if(idx>=0){users[idx]={...users[idx],plan};localStorage.setItem('mf_users',JSON.stringify(users));}
  };

  return <AuthContext.Provider value={{user,login,register,logout,upgradePlan,isAdmin:user?.role==='admin'}}>
    {children}
  </AuthContext.Provider>;
}

// ─── PLAN CONFIG ──────────────────────────────────────────────────────────────
const PLAN_LIMITS={
  trial:   {accounts:1,cards:1,categories:5,reports:false,corridas:false,label:'Trial 7 dias'},
  starter: {accounts:1,cards:1,categories:5,reports:false,corridas:false,label:'Starter'},
  plus:    {accounts:3,cards:3,categories:20,reports:true, corridas:false,label:'Plus'},
  pro:     {accounts:99,cards:10,categories:99,reports:true, corridas:true, label:'Pro'},
};

// ─── STRIPE CHECKOUT ──────────────────────────────────────────────────────────
async function redirectToStripe(plan, billing, userEmail, userId){
  try {
    // Call Vercel serverless function
    const res = await fetch('/api/create-checkout-session', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({plan, billing, userEmail, userId}),
    });
    if(!res.ok) throw new Error('Falha ao criar sessão');
    const {url} = await res.json();
    window.location.href = url;
  } catch(e){
    // Fallback: open Stripe Checkout link (Payment Links from dashboard)
    alert('Redirecionando para pagamento via Stripe...\n\nEm produção: configure STRIPE_SECRET_KEY nas variáveis de ambiente da Vercel.');
  }
}

// ─── CURRENCY INPUT HELPER ────────────────────────────────────────────────────
// Fix #10: auto-format as R$ X.XXX,XX while typing digits only
function parseCurrencyInput(raw){
  // strip non-digits
  const digits = raw.replace(/\D/g,'');
  if(!digits) return '';
  const num = parseInt(digits,10)/100;
  return num.toFixed(2);
}
function CurrencyInput({value, onChange, placeholder='0,00', className='inp', style}){
  const displayVal = value
    ? Number(value).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})
    : '';
  return <input
    className={className} style={style}
    inputMode="numeric"
    placeholder={placeholder}
    value={displayVal}
    onChange={e=>{
      const raw = parseCurrencyInput(e.target.value);
      onChange(raw);
    }}
  />;
}

// ─── DATE DISPLAY HELPERS ─────────────────────────────────────────────────────
// Fix #9: display dates as dd/mm/yyyy, store as yyyy-mm-dd internally
function fmtDate(iso){
  if(!iso) return '';
  const parts=iso.split('-');
  if(parts.length!==3) return iso;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const MONTHS_FULL=["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const MONTHS_SHORT=["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const fmt=v=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v||0);
const fmtN=(v,d=1)=>(v||0).toFixed(d).replace('.',',');
const today=new Date();

// ─── BANK SVG LOGOS ───────────────────────────────────────────────────────────
const BANK_SVGS={
  Nubank:    ({s=28})=><svg width={s} height={s} viewBox="0 0 28 28"><rect width="28" height="28" rx="8" fill="#820AD1"/><text x="14" y="19" textAnchor="middle" fill="white" fontSize="14" fontWeight="900" fontFamily="Arial">N</text></svg>,
  Inter:     ({s=28})=><svg width={s} height={s} viewBox="0 0 28 28"><rect width="28" height="28" rx="8" fill="#FF7A00"/><text x="14" y="19" textAnchor="middle" fill="white" fontSize="11" fontWeight="900" fontFamily="Arial">IT</text></svg>,
  'Itaú':   ({s=28})=><svg width={s} height={s} viewBox="0 0 28 28"><rect width="28" height="28" rx="8" fill="#003D84"/><text x="14" y="19" textAnchor="middle" fill="#F4A200" fontSize="10" fontWeight="900" fontFamily="Arial">itaú</text></svg>,
  Bradesco:  ({s=28})=><svg width={s} height={s} viewBox="0 0 28 28"><rect width="28" height="28" rx="8" fill="#CC092F"/><text x="14" y="19" textAnchor="middle" fill="white" fontSize="10" fontWeight="900" fontFamily="Arial">BRA</text></svg>,
  Caixa:     ({s=28})=><svg width={s} height={s} viewBox="0 0 28 28"><rect width="28" height="28" rx="8" fill="#005CA9"/><text x="14" y="19" textAnchor="middle" fill="#FF8C00" fontSize="10" fontWeight="900" fontFamily="Arial">CEF</text></svg>,
  Santander: ({s=28})=><svg width={s} height={s} viewBox="0 0 28 28"><rect width="28" height="28" rx="8" fill="#EC0000"/><text x="14" y="19" textAnchor="middle" fill="white" fontSize="9" fontWeight="900" fontFamily="Arial">SAN</text></svg>,
  BB:        ({s=28})=><svg width={s} height={s} viewBox="0 0 28 28"><rect width="28" height="28" rx="8" fill="#FFCC00"/><text x="14" y="19" textAnchor="middle" fill="#003087" fontSize="12" fontWeight="900" fontFamily="Arial">BB</text></svg>,
  BTG:       ({s=28})=><svg width={s} height={s} viewBox="0 0 28 28"><rect width="28" height="28" rx="8" fill="#1A1A2E"/><text x="14" y="19" textAnchor="middle" fill="#C49A1E" fontSize="10" fontWeight="900" fontFamily="Arial">BTG</text></svg>,
  XP:        ({s=28})=><svg width={s} height={s} viewBox="0 0 28 28"><rect width="28" height="28" rx="8" fill="#000"/><text x="14" y="19" textAnchor="middle" fill="white" fontSize="12" fontWeight="900" fontFamily="Arial">XP</text></svg>,
  'C6 Bank': ({s=28})=><svg width={s} height={s} viewBox="0 0 28 28"><rect width="28" height="28" rx="8" fill="#242424"/><text x="14" y="19" textAnchor="middle" fill="white" fontSize="10" fontWeight="900" fontFamily="Arial">C6</text></svg>,
  Picpay:    ({s=28})=><svg width={s} height={s} viewBox="0 0 28 28"><rect width="28" height="28" rx="8" fill="#21C25E"/><text x="14" y="19" textAnchor="middle" fill="white" fontSize="9" fontWeight="900" fontFamily="Arial">PIC</text></svg>,
  Carteira:  ({s=28})=><svg width={s} height={s} viewBox="0 0 28 28"><rect width="28" height="28" rx="8" fill="#16A34A"/><text x="14" y="19" textAnchor="middle" fill="white" fontSize="16">💵</text></svg>,
};
const BANK_LIST=Object.keys(BANK_SVGS);
function BankLogo({bank,size=28}){const C=BANK_SVGS[bank];return C?<C s={size}/>:<div style={{width:size,height:size,borderRadius:8,background:'var(--bg-elevated)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12}}>🏦</div>;}

// Card brands
const BrandVisa=()=><svg viewBox="0 0 48 16" width="38" height="13"><text x="0" y="13" fontFamily="Arial" fontWeight="900" fontSize="15" fill="white" letterSpacing="-0.5">VISA</text></svg>;
const BrandMC=()=><svg viewBox="0 0 38 24" width="38" height="24"><circle cx="14" cy="12" r="12" fill="#EB001B" opacity="0.9"/><circle cx="24" cy="12" r="12" fill="#F79E1B" opacity="0.9"/><path d="M19 5.5a12 12 0 0 1 0 13A12 12 0 0 1 19 5.5z" fill="#FF5F00" opacity="0.85"/></svg>;
const BrandElo=()=><svg viewBox="0 0 40 16" width="38" height="14"><text x="0" y="13" fontFamily="Arial" fontWeight="900" fontSize="14" fill="white">elo</text></svg>;
const BrandAmex=()=><svg viewBox="0 0 52 16" width="48" height="14"><text x="0" y="13" fontFamily="Arial" fontWeight="700" fontSize="12" fill="white" letterSpacing="0.3">AMEX</text></svg>;
const BRANDS={Visa:BrandVisa,Mastercard:BrandMC,Elo:BrandElo,Amex:BrandAmex};

// ─── EMOJI CATEGORIES ─────────────────────────────────────────────────────────
const EMOJIS=['🏠','🍔','🚗','💊','🎮','📚','✈️','🎵','☕','🛍️','💰','💡','📱','🏋️','🎬','🐶','🌿','🏖️','🎓','🔧','💻','🎯','🚿','🧴','🛒','🍕','🍣','🍷','🎂','🛵','🚌','⛽','💈','🏥','💉','📺','🎲','🏊','🎁','💐','🧹','🔑','📦','💳','🏧','📊','📈','🏦','💼','🎤','🎸','🖥️','⌚','👕','👟','👜','🌙','☀️','⭐','🌈','❤️','🔥','💫','✨','🎉','🤝'];

// ─── INITIAL DATA ─────────────────────────────────────────────────────────────
const IA=[
  {id:1,name:'Nubank',  type:'digital', balance:2450.80,initial:2000,bank:'Nubank',   hidden:false},
  {id:2,name:'Inter',   type:'poupança',balance:8200.00,initial:8000,bank:'Inter',    hidden:false},
  {id:3,name:'Itaú',    type:'corrente',balance:3100.50,initial:3000,bank:'Itaú',     hidden:false},
  {id:4,name:'Carteira',type:'carteira',balance:350.00, initial:350, bank:'Carteira', hidden:false},
];
const IC=[
  {id:1,name:'Nubank',    brand:'Mastercard',bank:'Nubank',limit:5000,used:1240.50,closing:5, due:12,color1:'#820AD1',color2:'#5C0A95'},
  {id:2,name:'Inter Gold',brand:'Visa',      bank:'Inter', limit:3000,used:680.00, closing:10,due:17,color1:'#FF7A00',color2:'#CC5500'},
];
const ICAT=[
  {id:1,name:'Moradia',     emoji:'🏠',color:'#3B82F6',type:'expense'},
  {id:2,name:'Alimentação', emoji:'🍔',color:'#F59E0B',type:'expense'},
  {id:3,name:'Transporte',  emoji:'🚗',color:'#8B5CF6',type:'expense'},
  {id:4,name:'Saúde',       emoji:'💊',color:'#EF4444',type:'expense'},
  {id:5,name:'Lazer',       emoji:'🎮',color:'#EC4899',type:'expense'},
  {id:6,name:'Assinaturas', emoji:'📱',color:'#06B6D4',type:'expense'},
  {id:7,name:'Compras',     emoji:'🛍️',color:'#F97316',type:'expense'},
  {id:8,name:'Salário',     emoji:'💰',color:'#10B981',type:'income'},
  {id:9,name:'Renda Extra', emoji:'⭐',color:'#84CC16',type:'income'},
  {id:10,name:'Investimentos',emoji:'📈',color:'#6366F1',type:'expense'},
  {id:11,name:'Outros',     emoji:'📦',color:'#64748B',type:'expense'},
];
const ITX=[
  {id:1, type:'income',  desc:'Salário Abril',    amount:6500,   date:'2026-04-05',accountId:3,catId:8, status:'done'},
  {id:2, type:'expense', desc:'Aluguel Abril',    amount:1800,   date:'2026-04-05',accountId:3,catId:1, status:'done'},
  {id:3, type:'expense', desc:'Supermercado',     amount:340.50, date:'2026-04-04',accountId:1,catId:2, status:'done'},
  {id:4, type:'expense', desc:'Spotify + Netflix',amount:89.90,  date:'2026-04-03',accountId:1,catId:6, status:'done'},
  {id:5, type:'expense', desc:'Farmácia',         amount:120.00, date:'2026-04-03',accountId:4,catId:4, status:'done'},
  {id:6, type:'expense', desc:'Gasolina',         amount:200.00, date:'2026-04-02',accountId:3,catId:3, status:'done'},
  {id:7, type:'income',  desc:'Freelance Design', amount:1200,   date:'2026-04-01',accountId:1,catId:9, status:'done'},
  {id:8, type:'expense', desc:'Academia',         amount:99.90,  date:'2026-04-01',accountId:1,catId:5, status:'done'},
  {id:9, type:'transfer',desc:'Reserva mensal',   amount:500,    date:'2026-04-01',fromAccountId:3,toAccountId:2,status:'done'},
  {id:10,type:'expense', desc:'Restaurante',      amount:87.50,  date:'2026-03-30',accountId:4,catId:2, status:'done'},
  {id:11,type:'income',  desc:'Salário Março',    amount:6500,   date:'2026-03-05',accountId:3,catId:8, status:'done'},
  {id:12,type:'expense', desc:'Aluguel Março',    amount:1800,   date:'2026-03-05',accountId:3,catId:1, status:'done'},
];
const IINV=[
  {id:1,cardId:1,month:4,year:2026,status:'open',  closingDate:'2026-04-05',dueDate:'2026-04-12',
   purchases:[{id:101,desc:'Amazon',amount:299.90,date:'2026-03-20',installments:1,catId:7},{id:102,desc:'Zara',amount:420.00,date:'2026-03-22',installments:3,catId:7},{id:103,desc:'iFood',amount:78.40,date:'2026-03-25',installments:1,catId:2}]},
  {id:2,cardId:1,month:3,year:2026,status:'paid',  closingDate:'2026-03-05',dueDate:'2026-03-12',
   purchases:[{id:201,desc:'Mercado Livre',amount:380.00,date:'2026-02-20',installments:1,catId:7},{id:202,desc:'Cinema',amount:95.00,date:'2026-03-01',installments:1,catId:5}]},
];
const IBUD=[
  {id:1,catId:1,name:'Moradia',    amount:2000,spent:1800, color:'#3B82F6'},
  {id:2,catId:2,name:'Alimentação',amount:1200,spent:427.9,color:'#F59E0B'},
  {id:3,catId:3,name:'Transporte', amount:400, spent:200,  color:'#8B5CF6'},
  {id:4,catId:4,name:'Saúde',      amount:300, spent:120,  color:'#EF4444'},
  {id:5,catId:5,name:'Lazer',      amount:500, spent:187.4,color:'#EC4899'},
];
const IGOALS=[
  {id:1,name:'Reserva de Emergência',target:30000,current:8200, deadline:'2027-12-31',color:'#10B981'},
  {id:2,name:'Viagem para Europa',   target:15000,current:3500, deadline:'2027-06-30',color:'#3B82F6'},
  {id:3,name:'Trocar de Notebook',   target:6000, current:2800, deadline:'2026-08-01',color:'#8B5CF6'},
];
const IAGENDA=[
  {id:1,desc:'Aluguel',    amount:1800,  day:5, type:'expense',catId:1,color:'#3B82F6',repeat:'monthly'},
  {id:2,desc:'Spotify',    amount:21.90, day:8, type:'expense',catId:6,color:'#1DB954',repeat:'monthly'},
  {id:3,desc:'Netflix',    amount:55.90, day:8, type:'expense',catId:6,color:'#E50914',repeat:'monthly'},
  {id:4,desc:'Academia',   amount:99.90, day:10,type:'expense',catId:5,color:'#F59E0B',repeat:'monthly'},
  {id:5,desc:'Internet',   amount:129.90,day:15,type:'expense',catId:6,color:'#06B6D4',repeat:'monthly'},
  {id:6,desc:'Salário',    amount:6500,  day:5, type:'income', catId:8,color:'#10B981',repeat:'monthly'},
];
const ICOR=[
  {id:1,date:'2026-04-01',trips:18,km:142,autonomia:12.5,hours:8.5, earnings:310.50,fuelPrice:6.39},
  {id:2,date:'2026-04-02',trips:22,km:168,autonomia:12.5,hours:10,  earnings:390.00,fuelPrice:6.39},
  {id:3,date:'2026-04-03',trips:15,km:110,autonomia:12.5,hours:7,   earnings:245.80,fuelPrice:6.39},
  {id:4,date:'2026-04-04',trips:20,km:155,autonomia:12.5,hours:9,   earnings:355.00,fuelPrice:6.39},
  {id:5,date:'2026-04-05',trips:12,km:95, autonomia:12.5,hours:6,   earnings:198.50,fuelPrice:6.39},
  {id:6,date:'2026-03-28',trips:24,km:190,autonomia:12.5,hours:11,  earnings:430.00,fuelPrice:6.29},
  {id:7,date:'2026-03-29',trips:16,km:125,autonomia:12.5,hours:8,   earnings:280.00,fuelPrice:6.29},
];

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
const STYLES=`
.app{font-family:'Outfit',sans-serif;min-height:100vh;display:flex;overflow:hidden;}
.app.dark{--bg:#060D1A;--bgc:#0C1929;--bge:#102035;--bgh:#142540;--br:rgba(99,179,237,0.08);--bra:rgba(34,211,238,0.2);--t1:#E8EEF8;--t2:#8FA8C8;--t3:#4A6080;--ac:#22D3EE;--acd:rgba(34,211,238,0.12);--acg:rgba(34,211,238,0.05);--ok:#34D399;--okd:rgba(52,211,153,0.12);--err:#F87171;--errd:rgba(248,113,113,0.12);--warn:#FBBF24;--warnd:rgba(251,191,36,0.12);--pur:#A78BFA;--purd:rgba(167,139,250,0.12);background:var(--bg);color:var(--t1);}
.app.light{--bg:#EEF2F8;--bgc:#FFFFFF;--bge:#F4F7FC;--bgh:#EBF1F9;--br:rgba(100,130,180,0.14);--bra:rgba(8,145,178,0.25);--t1:#0F1B2D;--t2:#4A6080;--t3:#94A3B8;--ac:#0891B2;--acd:rgba(8,145,178,0.1);--acg:rgba(8,145,178,0.04);--ok:#059669;--okd:rgba(5,150,105,0.1);--err:#DC2626;--errd:rgba(220,38,38,0.1);--warn:#D97706;--warnd:rgba(217,119,6,0.1);--pur:#7C3AED;--purd:rgba(124,58,237,0.1);background:var(--bg);color:var(--t1);}
/* SIDEBAR */
.sb{width:248px;min-height:100vh;background:var(--bgc);border-right:1px solid var(--br);display:flex;flex-direction:column;flex-shrink:0;overflow-y:auto;}
.logo-wrap{padding:18px 16px 14px;border-bottom:1px solid var(--br);display:flex;align-items:center;gap:10px;}
.logo-img{width:40px;height:40px;object-fit:contain;filter:invert(0);}
.app.light .logo-img{filter:invert(1);}
.logo-name{font-family:'Syne',sans-serif;font-weight:800;font-size:16px;color:var(--t1);line-height:1.1;}
.logo-sub{font-size:10px;color:var(--t3);letter-spacing:1px;text-transform:uppercase;}
.nav{padding:10px;flex:1;}
.nav-lbl{font-size:10px;font-weight:600;letter-spacing:1.2px;text-transform:uppercase;color:var(--t3);padding:8px 10px 4px;}
.nav-item{display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:10px;cursor:pointer;color:var(--t2);font-size:13.5px;font-weight:500;transition:all 0.15s;margin-bottom:2px;border:1px solid transparent;}
.nav-item:hover{background:var(--bgh);color:var(--t1);}
.nav-item.active{background:var(--acd);border-color:var(--bra);color:var(--ac);font-weight:600;}
.ndot{width:5px;height:5px;background:var(--ac);border-radius:50%;margin-left:auto;box-shadow:0 0 8px var(--ac);}
.sb-footer{padding:10px;border-top:1px solid var(--br);}
/* MAIN */
.main{flex:1;display:flex;flex-direction:column;overflow:hidden;}
.hdr{height:58px;background:var(--bgc);border-bottom:1px solid var(--br);display:flex;align-items:center;padding:0 24px;gap:10px;flex-shrink:0;}
.content{flex:1;overflow-y:auto;padding:24px;}
/* CARDS */
.card{background:var(--bgc);border:1px solid var(--br);border-radius:16px;padding:20px;transition:border-color 0.2s;}
.card:hover{border-color:var(--bra);}
.sc{background:var(--bgc);border:1px solid var(--br);border-radius:16px;padding:18px 20px;display:flex;flex-direction:column;gap:10px;transition:all 0.2s;position:relative;overflow:hidden;cursor:pointer;}
.sc:hover{transform:translateY(-2px);border-color:var(--bra);box-shadow:0 8px 24px rgba(0,0,0,.15);}
.sc::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;border-radius:2px;}
.sc.green::before{background:linear-gradient(90deg,var(--ok),transparent);}
.sc.red::before{background:linear-gradient(90deg,var(--err),transparent);}
.sc.blue::before{background:linear-gradient(90deg,var(--ac),transparent);}
.sc.yellow::before{background:linear-gradient(90deg,var(--warn),transparent);}
.sc.purple::before{background:linear-gradient(90deg,var(--pur),transparent);}
/* GRIDS */
.g4{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;}
.g3{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;}
.g2{display:grid;grid-template-columns:repeat(2,1fr);gap:16px;}
.g21{display:grid;grid-template-columns:2fr 1fr;gap:16px;}
/* BUTTONS */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:8px 16px;border-radius:10px;font-size:13.5px;font-weight:600;font-family:'Outfit',sans-serif;cursor:pointer;border:none;transition:all 0.15s;}
.btn-p{background:var(--ac);color:#020B15;}
.btn-p:hover{filter:brightness(1.1);transform:translateY(-1px);}
.btn-g{background:var(--bge);color:var(--t2);border:1px solid var(--br);}
.btn-g:hover{color:var(--t1);border-color:var(--bra);}
.btn-d{background:var(--errd);color:var(--err);border:1px solid var(--errd);}
.btn-d:hover{background:var(--err);color:white;}
.btn-s{background:var(--okd);color:var(--ok);border:1px solid var(--okd);}
.ib{width:34px;height:34px;border-radius:9px;border:1px solid var(--br);background:var(--bge);color:var(--t2);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.15s;}
.ib:hover{color:var(--t1);background:var(--bgh);}
/* INPUTS */
.inp{width:100%;background:var(--bge);border:1px solid var(--br);border-radius:10px;padding:10px 12px;font-size:14px;color:var(--t1);font-family:'Outfit',sans-serif;outline:none;transition:border-color 0.15s;}
.inp:focus{border-color:var(--ac);}
.inp::placeholder{color:var(--t3);}
select.inp option{background:#0C1929;}
.lbl{display:block;font-size:11px;font-weight:600;letter-spacing:.5px;text-transform:uppercase;color:var(--t3);margin-bottom:5px;}
.fg{margin-bottom:14px;}
/* TABLE */
.tbl{width:100%;border-collapse:collapse;}
.tbl th{text-align:left;font-size:11px;font-weight:600;letter-spacing:.8px;text-transform:uppercase;color:var(--t3);padding:10px 12px;border-bottom:1px solid var(--br);cursor:pointer;user-select:none;white-space:nowrap;}
.tbl th:hover{color:var(--ac);}
.tbl td{padding:11px 12px;font-size:13.5px;color:var(--t2);border-bottom:1px solid var(--br);white-space:nowrap;}
.tbl tr:last-child td{border-bottom:none;}
.tbl tbody tr:hover td{background:var(--bgh);color:var(--t1);}
/* BADGES */
.badge{display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:20px;font-size:11px;font-weight:600;}
.bg{background:var(--okd);color:var(--ok);}
.br2{background:var(--errd);color:var(--err);}
.bb{background:var(--acd);color:var(--ac);}
.by{background:var(--warnd);color:var(--warn);}
.bp{background:var(--purd);color:var(--pur);}
.bgray{background:var(--bge);color:var(--t2);}
/* MODAL — Fix #11: no outside-click dismiss */
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.72);z-index:100;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(5px);}
.modal{background:var(--bgc);border:1px solid var(--br);border-radius:20px;padding:28px;width:100%;max-width:520px;max-height:90vh;overflow-y:auto;}
.modal-lg{max-width:820px;}
.mtitle{font-family:'Syne',sans-serif;font-size:18px;font-weight:700;color:var(--t1);margin-bottom:20px;display:flex;align-items:center;justify-content:space-between;}
/* MISC */
.pgtitle{font-family:'Syne',sans-serif;font-size:22px;font-weight:800;color:var(--t1);margin-bottom:4px;}
.pgsub{font-size:13px;color:var(--t3);margin-bottom:22px;}
.sectitle{font-family:'Syne',sans-serif;font-size:14px;font-weight:700;color:var(--t1);margin-bottom:14px;display:flex;align-items:center;justify-content:space-between;}
.money{font-family:'Outfit',sans-serif;font-weight:700;}
.pos{color:var(--ok);font-weight:600;}
.neg{color:var(--err);font-weight:600;}
.pb-w{height:6px;background:var(--bge);border-radius:10px;overflow:hidden;}
.pb-f{height:100%;border-radius:10px;transition:width .5s ease;}
.sbox{display:flex;align-items:center;background:var(--bge);border:1px solid var(--br);border-radius:10px;padding:6px 12px;gap:8px;width:200px;}
.sbox input{background:transparent;border:none;outline:none;font-size:13px;color:var(--t1);font-family:'Outfit',sans-serif;width:100%;}
.sbox input::placeholder{color:var(--t3);}
.mnav{display:flex;align-items:center;gap:8px;background:var(--bgc);border:1px solid var(--br);border-radius:12px;padding:6px 10px;}
.mnav button{background:none;border:none;cursor:pointer;color:var(--t2);display:flex;padding:2px;border-radius:6px;transition:all .15s;}
.mnav button:hover{color:var(--ac);background:var(--acd);}
.mnav span{font-family:'Syne',sans-serif;font-weight:700;font-size:14px;color:var(--t1);min-width:130px;text-align:center;}
.ebox{display:grid;grid-template-columns:repeat(10,1fr);gap:4px;max-height:200px;overflow-y:auto;padding:4px;}
.ebt{background:none;border:1px solid transparent;border-radius:6px;cursor:pointer;font-size:18px;padding:4px;transition:all .1s;display:flex;align-items:center;justify-content:center;}
.ebt:hover{background:var(--acd);border-color:var(--bra);}
.ebt.sel{background:var(--acd);border-color:var(--ac);}
.infobox{background:var(--acg);border:1px solid var(--bra);border-radius:10px;padding:10px 14px;margin-bottom:16px;font-size:12px;color:var(--ac);display:flex;gap:8px;align-items:flex-start;}
/* PLANS */
.plan-card{background:var(--bgc);border:2px solid var(--br);border-radius:20px;padding:28px;transition:all .2s;position:relative;overflow:hidden;}
.plan-card:hover{transform:translateY(-4px);box-shadow:0 20px 40px rgba(0,0,0,.2);}
.plan-card.featured{border-color:var(--ac);}
.pop-badge{position:absolute;top:0;right:0;background:var(--ac);color:#020B15;font-size:11px;font-weight:800;padding:6px 16px;border-radius:0 20px 0 14px;letter-spacing:.5px;white-space:nowrap;}
/* AUTH */
.auth-bg{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px;background:var(--bg);}
.auth-box{background:var(--bgc);border:1px solid var(--br);border-radius:24px;padding:40px;width:100%;max-width:420px;}
/* LANDING */
.land{min-height:100vh;background:var(--bg);overflow-y:auto;}
.land-nav{display:flex;align-items:center;justify-content:space-between;padding:20px 40px;border-bottom:1px solid var(--br);background:var(--bgc);position:sticky;top:0;z-index:10;}
.land-hero{text-align:center;padding:80px 24px 60px;max-width:800px;margin:0 auto;}
.land-feat{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;padding:0 40px 60px;max-width:1100px;margin:0 auto;}
.land-feat-card{background:var(--bgc);border:1px solid var(--br);border-radius:16px;padding:24px;text-align:center;}
.land-plan{padding:0 40px 80px;max-width:1100px;margin:0 auto;}
/* DRAG */
.drag-item{transition:all .15s;user-select:none;}
.drag-item.dragging{opacity:.5;transform:scale(.98);}
.drag-item.dov{border-top:2px solid var(--ac);}
@keyframes fi{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
.fi{animation:fi .22s ease forwards;}
@media(max-width:900px){.g4{grid-template-columns:repeat(2,1fr);}.g3{grid-template-columns:1fr 1fr;}.g21{grid-template-columns:1fr;}}
`;

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function PBar({pct,color}){const c=Math.min(100,Math.max(0,pct));const col=pct>90?'var(--err)':pct>70?'var(--warn)':color||'var(--ac)';return<div className="pb-w"><div className="pb-f" style={{width:`${c}%`,background:col}}/></div>;}
function Tip({active,payload,label}){if(!active||!payload?.length)return null;return<div style={{background:'var(--bge)',border:'1px solid var(--br)',borderRadius:10,padding:'10px 14px'}}><p style={{fontSize:12,color:'var(--t3)',marginBottom:6}}>{label}</p>{payload.map((p,i)=><p key={i} style={{fontSize:13,fontWeight:600,color:p.color}}>{p.name}: {fmt(p.value)}</p>)}</div>;}

// Fix #11: Modal closes ONLY via X button — no click-outside
function Modal({open,onClose,title,children,lg}){
  if(!open) return null;
  return <div className="overlay">
    <div className={`modal fi${lg?' modal-lg':''}`}>
      <div className="mtitle">
        <span>{title}</span>
        <button className="ib" onClick={onClose}><X size={15}/></button>
      </div>
      {children}
    </div>
  </div>;
}

function MNav({month,year,onChange}){
  const prev=()=>{if(month===0)onChange(11,year-1);else onChange(month-1,year);};
  const next=()=>{if(month===11)onChange(0,year+1);else onChange(month+1,year);};
  return<div className="mnav"><button onClick={prev}><ChevronLeft size={16}/></button><span>{MONTHS_FULL[month]} {year}</span><button onClick={next}><ChevronRight size={16}/></button></div>;
}

// ─── LANDING PAGE (Fix #1) ────────────────────────────────────────────────────
function LandingPage({setView, theme, setTheme}){
  const features=[
    {icon:'💳',title:'Cartões & Faturas',desc:'Controle limite, parcelas, datas de fechamento e vencimento com precisão.'},
    {icon:'📊',title:'Relatórios Visuais',desc:'Gráficos de evolução mensal, categorias, entradas e saídas de forma clara.'},
    {icon:'🎯',title:'Metas Financeiras',desc:'Defina objetivos, registre aportes e acompanhe o progresso em tempo real.'},
    {icon:'🚗',title:'Controle de Corridas',desc:'Planilha exclusiva para motoristas de app com cálculos automáticos.'},
    {icon:'📅',title:'Agenda Financeira',desc:'Organize despesas fixas com arrastar e soltar. Nunca esqueça um vencimento.'},
    {icon:'🏦',title:'Múltiplas Contas',desc:'Nubank, Inter, Itaú, Bradesco e mais. Todos os saldos em um só lugar.'},
  ];
  const planPreview=[
    {name:'Starter',price:'R$ 19,90',sub:'/mês após 7 dias grátis',color:'#64748B',features:['1 conta bancária','Lançamentos básicos','5 categorias','Controle de saldo']},
    {name:'Plus',   price:'R$ 39,90',sub:'/mês',featured:true,color:'#22D3EE',features:['3 contas bancárias','Cartões de crédito','Relatórios e gráficos','Agenda financeira','Metas ilimitadas']},
    {name:'Pro',    price:'R$ 59,90',sub:'/mês',color:'#A78BFA',features:['Contas ilimitadas','Corridas (app motorista)','Exportação CSV','Suporte VIP WhatsApp','Todos os recursos']},
  ];
  return <div className={`app ${theme}`}>
    <style>{STYLES}</style>
    <div className="land">
      {/* NAV */}
      <nav className="land-nav">
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <img src={LOGO_B64} alt="Masterlat" style={{width:38,height:38,objectFit:'contain',filter:theme==='dark'?'none':'invert(1)'}}/>
          <div><div style={{fontFamily:'Syne',fontWeight:800,fontSize:17,color:'var(--t1)'}}>Masterlat</div><div style={{fontSize:10,color:'var(--t3)',letterSpacing:1,textTransform:'uppercase'}}>Finance</div></div>
        </div>
        <div style={{display:'flex',gap:12,alignItems:'center'}}>
          <button className="ib" onClick={()=>setTheme(t=>t==='dark'?'light':'dark')}>{theme==='dark'?<Sun size={15}/>:<Moon size={15}/>}</button>
          <button className="btn btn-g" onClick={()=>setView('login')}><LogIn size={14}/> Fazer login</button>
          <button className="btn btn-p" onClick={()=>setView('register')}><UserPlus size={14}/> Começar grátis</button>
        </div>
      </nav>

      {/* HERO */}
      <div className="land-hero">
        <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'var(--acd)',border:'1px solid var(--bra)',borderRadius:20,padding:'6px 16px',fontSize:12,color:'var(--ac)',marginBottom:24,fontWeight:600}}>
          ✨ 7 dias grátis — sem cartão de crédito
        </div>
        <h1 style={{fontFamily:'Syne',fontWeight:800,fontSize:'clamp(32px,5vw,56px)',color:'var(--t1)',lineHeight:1.15,marginBottom:20}}>
          Controle total das suas<br/><span style={{color:'var(--ac)'}}>finanças pessoais</span>
        </h1>
        <p style={{fontSize:18,color:'var(--t2)',maxWidth:560,margin:'0 auto 36px',lineHeight:1.6}}>
          Gerencie contas, cartões, orçamentos, metas financeiras e ganhos com corridas em uma plataforma moderna, segura e fácil de usar.
        </p>
        <div style={{display:'flex',gap:14,justifyContent:'center',flexWrap:'wrap'}}>
          <button className="btn btn-p" style={{fontSize:15,padding:'12px 28px'}} onClick={()=>setView('register')}>
            Começar agora <ChevronRight size={16}/>
          </button>
          <button className="btn btn-g" style={{fontSize:15,padding:'12px 28px'}} onClick={()=>setView('login')}>
            Fazer login
          </button>
        </div>
        {/* Stats */}
        <div style={{display:'flex',gap:40,justifyContent:'center',marginTop:48,flexWrap:'wrap'}}>
          {[['100%','Gratuito por 7 dias'],['Stripe','Pagamento seguro'],['R$ 0','Sem taxa de cancelamento']].map(([v,l])=>(
            <div key={l} style={{textAlign:'center'}}>
              <div style={{fontFamily:'Syne',fontWeight:800,fontSize:22,color:'var(--ac)'}}>{v}</div>
              <div style={{fontSize:12,color:'var(--t3)',marginTop:4}}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <div style={{padding:'0 40px 60px',maxWidth:1100,margin:'0 auto'}}>
        <h2 style={{fontFamily:'Syne',fontWeight:800,fontSize:28,color:'var(--t1)',textAlign:'center',marginBottom:36}}>Tudo que você precisa</h2>
        <div className="g3">
          {features.map(f=>(
            <div key={f.title} className="land-feat-card">
              <div style={{fontSize:36,marginBottom:12}}>{f.icon}</div>
              <div style={{fontFamily:'Syne',fontWeight:700,fontSize:16,color:'var(--t1)',marginBottom:8}}>{f.title}</div>
              <div style={{fontSize:13,color:'var(--t3)',lineHeight:1.5}}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* PLANS PREVIEW */}
      <div className="land-plan">
        <h2 style={{fontFamily:'Syne',fontWeight:800,fontSize:28,color:'var(--t1)',textAlign:'center',marginBottom:8}}>Planos simples e transparentes</h2>
        <p style={{textAlign:'center',color:'var(--t3)',marginBottom:36,fontSize:14}}>Comece grátis por 7 dias. Cancele quando quiser.</p>
        <div className="g3">
          {planPreview.map(p=>(
            <div key={p.name} className="plan-card" style={{borderColor:p.featured?'var(--ac)':'var(--br)',position:'relative'}}>
              {p.featured&&<div className="pop-badge">MAIS POPULAR</div>}
              <div style={{fontFamily:'Syne',fontWeight:800,fontSize:20,color:p.color,marginBottom:8}}>{p.name}</div>
              <div style={{marginBottom:20}}>
                <span style={{fontFamily:'Syne',fontWeight:800,fontSize:28,color:'var(--t1)'}}>{p.price}</span>
                <span style={{fontSize:12,color:'var(--t3)'}}>{p.sub}</span>
              </div>
              {p.features.map(f=><div key={f} style={{display:'flex',alignItems:'center',gap:8,padding:'5px 0',borderBottom:'1px solid var(--br)',fontSize:13,color:'var(--t2)'}}><Check size={13} color="var(--ok)"/>{f}</div>)}
              <button className="btn" style={{width:'100%',marginTop:16,background:p.featured?'var(--ac)':'var(--bge)',color:p.featured?'#020B15':'var(--t1)',border:`1px solid ${p.color}`,fontSize:13}} onClick={()=>setView('register')}>
                Começar agora
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* CTA FOOTER */}
      <div style={{background:'var(--bgc)',borderTop:'1px solid var(--br)',padding:'48px 40px',textAlign:'center'}}>
        <h2 style={{fontFamily:'Syne',fontWeight:800,fontSize:24,color:'var(--t1)',marginBottom:12}}>Pronto para assumir o controle?</h2>
        <p style={{color:'var(--t3)',marginBottom:24,fontSize:14}}>Cadastre-se agora e tenha 7 dias grátis sem precisar de cartão.</p>
        <button className="btn btn-p" style={{fontSize:15,padding:'12px 32px'}} onClick={()=>setView('register')}><UserPlus size={16}/> Criar conta grátis</button>
        <div style={{marginTop:20,fontSize:12,color:'var(--t3)'}}>
          🔒 Pagamento seguro via Stripe &nbsp;•&nbsp; ✅ Cancele a qualquer momento &nbsp;•&nbsp; 🇧🇷 Plataforma em português
        </div>
      </div>
    </div>
  </div>;
}

// ─── AUTH SCREEN (Fix #5: no demo credentials shown) ─────────────────────────
function AuthScreen({mode, setMode, theme, setTheme, onBack}){
  const {login,register} = useAuth();
  const [form,setForm] = useState({name:'',email:'',password:''});
  const [err,setErr]   = useState('');
  const [loading,setLoading] = useState(false);

  const submit=async()=>{
    setErr(''); setLoading(true);
    try{
      if(mode==='login') await login(form.email,form.password);
      else await register(form.name,form.email,form.password);
    }catch(e){setErr(e.message);}
    setLoading(false);
  };

  return <div className={`app ${theme}`}>
    <style>{STYLES}</style>
    <div className="auth-bg">
      <div className="auth-box fi">
        <button className="btn btn-g" style={{marginBottom:20,fontSize:12}} onClick={onBack}><ChevronLeft size={13}/> Voltar</button>
        <div style={{textAlign:'center',marginBottom:28}}>
          <img src={LOGO_B64} alt="Masterlat" style={{width:52,height:52,objectFit:'contain',filter:theme==='dark'?'none':'invert(1)',marginBottom:10}}/>
          <div style={{fontFamily:'Syne',fontWeight:800,fontSize:24,color:'var(--t1)'}}>Masterlat</div>
          <div style={{fontSize:12,color:'var(--t3)',letterSpacing:2,textTransform:'uppercase'}}>Finance</div>
        </div>
        <div style={{display:'flex',gap:8,marginBottom:22,background:'var(--bge)',borderRadius:12,padding:4}}>
          {[['login','Entrar'],['register','Criar conta']].map(([m,l])=>(
            <button key={m} className={`btn ${mode===m?'btn-p':'btn-g'}`} style={{flex:1,border:'none'}} onClick={()=>setMode(m)}>{l}</button>
          ))}
        </div>
        {mode==='register'&&<div className="fg"><label className="lbl">Nome completo</label><input className="inp" placeholder="Seu nome" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/></div>}
        <div className="fg"><label className="lbl">E-mail</label><input className="inp" type="email" placeholder="email@exemplo.com" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}/></div>
        <div className="fg"><label className="lbl">Senha</label><input className="inp" type="password" placeholder="••••••••" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} onKeyDown={e=>e.key==='Enter'&&submit()}/></div>
        {mode==='register'&&<div style={{background:'var(--acg)',border:'1px solid var(--bra)',borderRadius:10,padding:'10px 14px',fontSize:12,color:'var(--ac)',marginBottom:14}}>
          ✅ 7 dias grátis — sem cartão de crédito necessário
        </div>}
        {err&&<div style={{background:'var(--errd)',border:'1px solid var(--errd)',borderRadius:10,padding:'10px 14px',fontSize:13,color:'var(--err)',marginBottom:14}}>{err}</div>}
        <button className="btn btn-p" style={{width:'100%'}} onClick={submit} disabled={loading}>
          {loading?'Aguarde...':(mode==='login'?<><LogIn size={15}/> Entrar</>:<><UserPlus size={15}/> Criar conta grátis</>)}
        </button>
      </div>
    </div>
  </div>;
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function DashboardView({data,setActiveView}){
  const [month,setMonth]=useState(today.getMonth());
  const [year,setYear]=useState(today.getFullYear());
  const pfx=`${year}-${String(month+1).padStart(2,'0')}`;
  const txM=data.transactions.filter(t=>t.date.startsWith(pfx));
  const inc=txM.filter(t=>t.type==='income').reduce((a,c)=>a+c.amount,0);
  const exp=txM.filter(t=>t.type==='expense').reduce((a,c)=>a+c.amount,0);
  const net=inc-exp;
  const bal=data.accounts.filter(a=>!a.hidden).reduce((a,c)=>a+c.balance,0);
  const pie=data.categories.filter(c=>c.type==='expense').map(cat=>({name:cat.emoji+' '+cat.name,value:txM.filter(t=>t.type==='expense'&&t.catId===cat.id).reduce((a,c)=>a+c.amount,0),color:cat.color})).filter(d=>d.value>0).sort((a,b)=>b.value-a.value).slice(0,6);
  const chart=Array.from({length:6},(_,i)=>{const d=new Date(year,month-5+i,1);const m=d.getMonth();const y=d.getFullYear();const p=`${y}-${String(m+1).padStart(2,'0')}`;const txs=data.transactions.filter(t=>t.date.startsWith(p));return{name:MONTHS_SHORT[m],entradas:txs.filter(t=>t.type==='income').reduce((a,c)=>a+c.amount,0),saidas:txs.filter(t=>t.type==='expense').reduce((a,c)=>a+c.amount,0)};});
  const recent=[...data.transactions].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,7);
  const ss=[{l:'Saldo Total',v:bal,c:'blue',ac:'ac',to:'contas',I:Wallet},{l:'Entradas',v:inc,c:'green',ac:'ok',to:'lancamentos',I:TrendingUp},{l:'Saídas',v:exp,c:'red',ac:'err',to:'lancamentos',I:TrendingDown},{l:'Resultado',v:net,c:net>=0?'green':'red',ac:net>=0?'ok':'err',to:'relatorios',I:BarChart3}];
  return<div className="fi">
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:22}}>
      <div><div className="pgtitle">Dashboard</div><div className="pgsub" style={{marginBottom:0}}>Visão geral das suas finanças</div></div>
      <div style={{display:'flex',gap:10,alignItems:'center'}}>
        <MNav month={month} year={year} onChange={(m,y)=>{setMonth(m);setYear(y);}}/>
        <button className="btn btn-p" onClick={()=>setActiveView('lancamentos')}><Plus size={15}/> Lançamento</button>
      </div>
    </div>
    <div className="g4" style={{marginBottom:20}}>
      {ss.map(s=><div key={s.l} className={`sc ${s.c}`} onClick={()=>setActiveView(s.to)}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <span style={{fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:1,color:'var(--t3)'}}>{s.l}</span>
          <div style={{width:30,height:30,background:`var(--${s.ac}d)`,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center'}}><s.I size={14} color={`var(--${s.ac})`}/></div>
        </div>
        <div className="money" style={{fontSize:22,color:`var(--${s.ac})`}}>{fmt(s.v)}</div>
        <div style={{fontSize:11,color:'var(--t3)',display:'flex',gap:4}}><ChevronRight size={11}/> ver detalhes</div>
      </div>)}
    </div>
    <div className="g21" style={{marginBottom:20}}>
      <div className="card">
        <div className="sectitle">Evolução Mensal</div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chart}>
            <defs>
              <linearGradient id="gi" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--ok)" stopOpacity={0.3}/><stop offset="95%" stopColor="var(--ok)" stopOpacity={0}/></linearGradient>
              <linearGradient id="go" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--err)" stopOpacity={0.2}/><stop offset="95%" stopColor="var(--err)" stopOpacity={0}/></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--br)" vertical={false}/>
            <XAxis dataKey="name" tick={{fontSize:11,fill:'var(--t3)'}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fontSize:11,fill:'var(--t3)'}} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}k`}/>
            <Tooltip content={<Tip/>}/>
            <Area type="monotone" dataKey="entradas" name="Entradas" stroke="var(--ok)"  strokeWidth={2} fill="url(#gi)"/>
            <Area type="monotone" dataKey="saidas"   name="Saídas"   stroke="var(--err)" strokeWidth={2} fill="url(#go)"/>
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="card">
        <div className="sectitle">Por Categoria</div>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart><Pie data={pie} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3}>{pie.map((e,i)=><Cell key={i} fill={e.color}/>)}</Pie><Tooltip formatter={v=>fmt(v)} contentStyle={{background:'var(--bge)',border:'1px solid var(--br)',borderRadius:10}}/><Legend iconType="circle" iconSize={7} wrapperStyle={{fontSize:10}}/></PieChart>
        </ResponsiveContainer>
      </div>
    </div>
    <div className="g2" style={{marginBottom:20}}>
      <div className="card">
        <div className="sectitle"><span>Lançamentos Recentes</span><span style={{fontSize:12,color:'var(--ac)',cursor:'pointer'}} onClick={()=>setActiveView('lancamentos')}>Ver todos →</span></div>
        {recent.map(tx=>{const cat=data.categories.find(c=>c.id===tx.catId);return<div key={tx.id} style={{display:'flex',alignItems:'center',gap:12,padding:'8px 0',borderBottom:'1px solid var(--br)'}}>
          <div style={{width:34,height:34,borderRadius:9,background:cat?cat.color+'20':'var(--bge)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0}}>{cat?.emoji||'💰'}</div>
          <div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:600,color:'var(--t1)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{tx.desc}</div><div style={{fontSize:11,color:'var(--t3)'}}>{fmtDate(tx.date)} • {cat?.name||'—'}</div></div>
          <div className="money" style={{fontSize:13,color:tx.type==='income'?'var(--ok)':tx.type==='transfer'?'var(--ac)':'var(--err)',flexShrink:0}}>{tx.type==='income'?'+':tx.type==='transfer'?'↔':'−'}{fmt(tx.amount)}</div>
        </div>;})}
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:14}}>
        <div className="card">
          <div className="sectitle"><span>Orçamento</span><span style={{fontSize:12,color:'var(--ac)',cursor:'pointer'}} onClick={()=>setActiveView('orcamento')}>→</span></div>
          {data.budgets.slice(0,4).map(b=>{const p=b.amount>0?(b.spent/b.amount)*100:0;return<div key={b.id} style={{marginBottom:10}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}><span style={{fontSize:12,fontWeight:500,color:'var(--t2)'}}>{b.name}</span><span style={{fontSize:11,color:p>90?'var(--err)':p>70?'var(--warn)':'var(--t3)'}}>{p.toFixed(0)}%</span></div><PBar pct={p} color={b.color}/></div>;})}
        </div>
        <div className="card">
          <div className="sectitle"><span>Metas</span></div>
          {data.goals.slice(0,2).map(g=>{const p=g.target>0?(g.current/g.target)*100:0;return<div key={g.id} style={{marginBottom:10}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}><span style={{fontSize:12,fontWeight:600,color:'var(--t1)'}}>{g.name}</span><span style={{fontSize:12,color:'var(--ac)',fontWeight:600}}>{p.toFixed(0)}%</span></div><PBar pct={p} color={g.color}/><div style={{fontSize:11,color:'var(--t3)',marginTop:2}}>{fmt(g.current)} de {fmt(g.target)}</div></div>;})}
        </div>
      </div>
    </div>
    <div className="card"><div className="sectitle"><span>Contas</span><span style={{fontSize:12,color:'var(--ac)',cursor:'pointer'}} onClick={()=>setActiveView('contas')}>Gerenciar →</span></div>
      <div className="g4">{data.accounts.filter(a=>!a.hidden).map(acc=><div key={acc.id} style={{borderRadius:14,padding:14,border:'1px solid var(--br)',background:'var(--bge)',cursor:'pointer',transition:'all .2s'}} onClick={()=>setActiveView('contas')}><div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}><BankLogo bank={acc.bank}/><span style={{fontSize:13,fontWeight:600,color:'var(--t1)'}}>{acc.name}</span></div><div className="money" style={{fontSize:17,color:'var(--t1)'}}>{fmt(acc.balance)}</div><div style={{fontSize:11,color:'var(--t3)',textTransform:'capitalize',marginTop:2}}>{acc.type}</div></div>)}</div>
    </div>
  </div>;
}

// ─── CONTAS ────────────────────────────────────────────────────────────────────
function ContasView({data,setData}){
  const [modal,setModal]=useState(false);
  const [editM,setEditM]=useState(null);
  const [imgMap,setImgMap]=useState({});
  const fRefs=useRef({});
  const blank={name:'',type:'corrente',balance:'',bank:'Nubank'};
  const [form,setForm]=useState(blank);
  const vis=data.accounts.filter(a=>!a.hidden);
  const total=vis.reduce((a,c)=>a+c.balance,0);
  const toggleHide=id=>setData(d=>({...d,accounts:d.accounts.map(a=>a.id===id?{...a,hidden:!a.hidden}:a)}));
  const del=id=>setData(d=>({...d,accounts:d.accounts.filter(a=>a.id!==id)}));
  const save=()=>{setData(d=>({...d,accounts:[...d.accounts,{id:Date.now(),name:form.name,type:form.type,balance:+form.balance||0,initial:+form.balance||0,bank:form.bank,hidden:false}]}));setModal(false);setForm(blank);};
  const saveEdit=()=>{setData(d=>({...d,accounts:d.accounts.map(a=>a.id===editM.id?editM:a)}));setEditM(null);};
  const handleImg=(id,e)=>{const file=e.target.files[0];if(!file)return;const r=new FileReader();r.onload=ev=>setImgMap(m=>({...m,[id]:ev.target.result}));r.readAsDataURL(file);};
  return<div className="fi">
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:22}}><div><div className="pgtitle">Contas</div><div className="pgsub" style={{marginBottom:0}}>Gerencie suas contas bancárias</div></div><button className="btn btn-p" onClick={()=>setModal(true)}><Plus size={15}/> Nova Conta</button></div>
    <div className="card" style={{marginBottom:20}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><div><div style={{fontSize:11,color:'var(--t3)',fontWeight:600,textTransform:'uppercase',letterSpacing:1}}>Patrimônio Visível</div><div className="money" style={{fontSize:30,color:'var(--ac)',marginTop:4}}>{fmt(total)}</div>{data.accounts.some(a=>a.hidden)&&<div style={{fontSize:11,color:'var(--t3)',marginTop:2}}>+{fmt(data.accounts.filter(a=>a.hidden).reduce((a,c)=>a+c.balance,0))} ocultado</div>}</div><div style={{fontSize:12,color:'var(--t3)'}}>{data.accounts.length} contas</div></div></div>
    <div className="g2">{data.accounts.map(acc=><div key={acc.id} className="card" style={{opacity:acc.hidden?.55:1,transition:'opacity .2s'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>{imgMap[acc.id]?<img src={imgMap[acc.id]} style={{width:36,height:36,borderRadius:10,objectFit:'contain',background:'white',padding:2}} alt={acc.name}/>:<BankLogo bank={acc.bank} size={36}/>}<div><div style={{fontWeight:700,color:'var(--t1)',fontSize:15}}>{acc.name}</div><div style={{fontSize:11,color:'var(--t3)',textTransform:'capitalize'}}>{acc.type}{acc.hidden?' • Oculta':''}</div></div></div>
        <div style={{display:'flex',gap:4}}>
          <input ref={el=>fRefs.current[acc.id]=el} type="file" accept="image/*" style={{display:'none'}} onChange={e=>handleImg(acc.id,e)}/>
          <button className="ib" title="Upload logo" onClick={()=>fRefs.current[acc.id]?.click()}><Upload size={13}/></button>
          <button className="ib" title={acc.hidden?'Mostrar':'Ocultar'} onClick={()=>toggleHide(acc.id)}>{acc.hidden?<Eye size={13} color="var(--ac)"/>:<EyeOff size={13}/>}</button>
          <button className="ib" title="Editar" onClick={()=>setEditM({...acc})}><Edit3 size={13}/></button>
          <button className="ib" title="Excluir" onClick={()=>del(acc.id)}><Trash2 size={13} color="var(--err)"/></button>
        </div>
      </div>
      <div className="money" style={{fontSize:24,color:'var(--t1)',marginBottom:6}}>{fmt(acc.balance)}</div>
      <div style={{fontSize:12,color:'var(--t3)'}}>Saldo inicial: {fmt(acc.initial)}</div>
    </div>)}</div>
    <Modal open={modal} onClose={()=>setModal(false)} title="Nova Conta">
      <div className="fg"><label className="lbl">Nome</label><input className="inp" placeholder="Ex: Nubank" value={form.name} onChange={e=>setForm(x=>({...x,name:e.target.value}))}/></div>
      <div className="g2">
        <div className="fg"><label className="lbl">Tipo</label><select className="inp" value={form.type} onChange={e=>setForm(x=>({...x,type:e.target.value}))}>{['corrente','poupança','digital','carteira','caixa'].map(o=><option key={o} value={o}>{o.charAt(0).toUpperCase()+o.slice(1)}</option>)}</select></div>
        <div className="fg"><label className="lbl">Banco</label><select className="inp" value={form.bank} onChange={e=>setForm(x=>({...x,bank:e.target.value}))}>{BANK_LIST.map(b=><option key={b} value={b}>{b}</option>)}</select></div>
      </div>
      <div className="fg"><label className="lbl">Saldo Inicial (R$)</label><CurrencyInput value={form.balance} onChange={v=>setForm(x=>({...x,balance:v}))}/></div>
      <div style={{display:'flex',gap:10}}><button className="btn btn-g" style={{flex:1}} onClick={()=>setModal(false)}>Cancelar</button><button className="btn btn-p" style={{flex:1}} onClick={save}><Save size={14}/> Salvar</button></div>
    </Modal>
    <Modal open={!!editM} onClose={()=>setEditM(null)} title="Editar Conta">
      {editM&&<><div className="fg"><label className="lbl">Nome</label><input className="inp" value={editM.name} onChange={e=>setEditM(m=>({...m,name:e.target.value}))}/></div>
      <div className="g2">
        <div className="fg"><label className="lbl">Tipo</label><select className="inp" value={editM.type} onChange={e=>setEditM(m=>({...m,type:e.target.value}))}>{['corrente','poupança','digital','carteira','caixa'].map(o=><option key={o} value={o}>{o.charAt(0).toUpperCase()+o.slice(1)}</option>)}</select></div>
        <div className="fg"><label className="lbl">Banco</label><select className="inp" value={editM.bank} onChange={e=>setEditM(m=>({...m,bank:e.target.value}))}>{BANK_LIST.map(b=><option key={b} value={b}>{b}</option>)}</select></div>
      </div>
      <div className="fg"><label className="lbl">Saldo Atual</label><CurrencyInput value={String(editM.balance)} onChange={v=>setEditM(m=>({...m,balance:+v||0}))}/></div>
      <div style={{display:'flex',gap:10}}><button className="btn btn-g" style={{flex:1}} onClick={()=>setEditM(null)}>Cancelar</button><button className="btn btn-p" style={{flex:1}} onClick={saveEdit}><Save size={14}/> Salvar</button></div></>}
    </Modal>
  </div>;
}

// ─── LANÇAMENTOS ──────────────────────────────────────────────────────────────
function LancamentosView({data,setData}){
  const [modal,setModal]=useState(false);
  const [editM,setEditM]=useState(null);
  const [filter,setFilter]=useState('all');
  const [sort,setSort]=useState({col:'date',dir:'desc'});
  const blank={type:'expense',desc:'',amount:'',date:today.toISOString().split('T')[0],accountId:data.accounts[0]?.id||1,catId:2};
  const [form,setForm]=useState(blank);
  const hS=col=>setSort(s=>({col,dir:s.col===col&&s.dir==='asc'?'desc':'asc'}));
  const SI=({col})=>sort.col===col?(sort.dir==='asc'?<ArrowUp size={10} color="var(--ac)"/>:<ArrowDown size={10} color="var(--ac)"/>):<ArrowDown size={10} color="var(--t3)" opacity={0.3}/>;
  const filtered=useMemo(()=>[...data.transactions].filter(t=>filter==='all'||t.type===filter).sort((a,b)=>{let va=a[sort.col],vb=b[sort.col];if(sort.col==='amount'){va=+va;vb=+vb;}return sort.dir==='asc'?(va<vb?-1:va>vb?1:0):(va>vb?-1:va<vb?1:0);}),[data.transactions,filter,sort]);
  const save=()=>{const tx={...form,id:Date.now(),amount:+form.amount||0,accountId:+form.accountId,catId:+form.catId,status:'done'};setData(d=>({...d,transactions:[tx,...d.transactions]}));setModal(false);setForm(blank);};
  const saveEdit=()=>{setData(d=>({...d,transactions:d.transactions.map(t=>t.id===editM.id?{...editM,amount:+editM.amount}:t)}));setEditM(null);};
  const del=id=>setData(d=>({...d,transactions:d.transactions.filter(t=>t.id!==id)}));
  const TxForm=({state,setState,onSave,onClose})=><>
    <div style={{display:'flex',gap:8,marginBottom:14}}>
      {[['income','Entrada','ok'],['expense','Saída','err'],['transfer','Transferência','ac']].map(([v,l,c])=>(
        <button key={v} className="btn" onClick={()=>setState(f=>({...f,type:v}))}
          style={{flex:1,background:state.type===v?`var(--${c}d)`:'var(--bge)',color:`var(--${c})`,border:`1px solid var(--${c}d)`,fontSize:12}}>{l}</button>
      ))}
    </div>
    <div className="fg"><label className="lbl">Descrição</label><input className="inp" placeholder="Ex: Supermercado..." value={state.desc||''} onChange={e=>setState(f=>({...f,desc:e.target.value}))}/></div>
    <div className="g2">
      {/* Fix #10: currency auto-format */}
      <div className="fg"><label className="lbl">Valor (R$)</label><CurrencyInput value={String(state.amount||'')} onChange={v=>setState(f=>({...f,amount:v}))}/></div>
      <div className="fg"><label className="lbl">Data</label><input type="date" className="inp" value={state.date||''} onChange={e=>setState(f=>({...f,date:e.target.value}))}/></div>
    </div>
    <div className="g2">
      <div className="fg"><label className="lbl">Conta</label><select className="inp" value={state.accountId||''} onChange={e=>setState(f=>({...f,accountId:+e.target.value}))}>{data.accounts.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select></div>
      <div className="fg"><label className="lbl">Categoria</label><select className="inp" value={state.catId||''} onChange={e=>setState(f=>({...f,catId:+e.target.value}))}>{data.categories.map(c=><option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}</select></div>
    </div>
    <div style={{display:'flex',gap:10}}><button className="btn btn-g" style={{flex:1}} onClick={onClose}>Cancelar</button><button className="btn btn-p" style={{flex:1}} onClick={onSave}><Save size={14}/> Salvar</button></div>
  </>;
  return<div className="fi">
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:22}}><div><div className="pgtitle">Lançamentos</div><div className="pgsub" style={{marginBottom:0}}>Clique nos títulos para ordenar</div></div><button className="btn btn-p" onClick={()=>setModal(true)}><Plus size={15}/> Novo</button></div>
    <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>
      {[['all','Todos'],['income','Entradas'],['expense','Saídas'],['transfer','Transferências']].map(([v,l])=>(
        <button key={v} className={`btn ${filter===v?'btn-p':'btn-g'}`} style={{padding:'7px 14px',fontSize:13}} onClick={()=>setFilter(v)}>{l}</button>
      ))}
    </div>
    {filter==='transfer'&&<div className="infobox"><Info size={14}/> Transferências entre contas não afetam entradas/saídas — são movimentações internas.</div>}
    <div className="card">
      <table className="tbl">
        <thead><tr>{[['desc','Descrição'],['date','Data'],['catId','Categoria'],['accountId','Conta'],['type','Tipo'],['amount','Valor']].map(([c,l])=><th key={c} onClick={()=>hS(c)}><span style={{display:'inline-flex',alignItems:'center',gap:3}}>{l}<SI col={c}/></span></th>)}<th></th></tr></thead>
        <tbody>{filtered.map(tx=>{const cat=data.categories.find(c=>c.id===tx.catId);const acc=data.accounts.find(a=>a.id===tx.accountId);return<tr key={tx.id}>
          <td style={{color:'var(--t1)',fontWeight:500}}>{tx.desc}</td>
          {/* Fix #9: display as dd/mm/yyyy */}
          <td>{fmtDate(tx.date)}</td>
          <td>{cat&&<span className="badge bgray">{cat.emoji} {cat.name}</span>}</td>
          <td>{acc&&<div style={{display:'flex',alignItems:'center',gap:6}}><BankLogo bank={acc.bank} size={20}/><span>{acc.name}</span></div>}</td>
          <td><span className={`badge ${tx.type==='income'?'bg':tx.type==='transfer'?'bb':'br2'}`}>{tx.type==='income'?'Entrada':tx.type==='transfer'?'Transf.':'Saída'}</span></td>
          <td><span className={tx.type==='income'?'pos':tx.type==='transfer'?'money':'neg'}>{tx.type==='income'?'+':'−'}{fmt(tx.amount)}</span></td>
          <td><div style={{display:'flex',gap:4}}><button className="ib" onClick={()=>setEditM({...tx})}><Edit3 size={13}/></button><button className="ib" onClick={()=>del(tx.id)}><Trash2 size={13} color="var(--err)"/></button></div></td>
        </tr>;})}
        </tbody>
      </table>
    </div>
    <Modal open={modal} onClose={()=>setModal(false)} title="Novo Lançamento"><TxForm state={form} setState={setForm} onSave={save} onClose={()=>setModal(false)}/></Modal>
    <Modal open={!!editM} onClose={()=>setEditM(null)} title="Editar Lançamento">{editM&&<TxForm state={editM} setState={setEditM} onSave={saveEdit} onClose={()=>setEditM(null)}/>}</Modal>
  </div>;
}

// ─── CATEGORIAS ────────────────────────────────────────────────────────────────
function CategoriasView({data,setData}){
  const [modal,setModal]=useState(false);
  const [editM,setEditM]=useState(null);
  const [showE,setShowE]=useState(false);
  const [editE,setEditE]=useState(false);
  const blank={name:'',emoji:'📦',color:'#6366F1',type:'expense'};
  const [form,setForm]=useState(blank);
  const save=()=>{if(!form.name.trim()){alert('Informe o nome');return;}setData(d=>({...d,categories:[...d.categories,{id:Date.now(),name:form.name,emoji:form.emoji,color:form.color,type:form.type}]}));setModal(false);setForm(blank);setShowE(false);};
  const saveEdit=()=>{setData(d=>({...d,categories:d.categories.map(c=>c.id===editM.id?editM:c)}));setEditM(null);setEditE(false);};
  const del=id=>{if(!window.confirm('Excluir categoria?'))return;setData(d=>({...d,categories:d.categories.filter(c=>c.id!==id)}));};
  return<div className="fi">
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:22}}><div><div className="pgtitle">Categorias</div><div className="pgsub" style={{marginBottom:0}}>Organize seus lançamentos</div></div><button className="btn btn-p" onClick={()=>{setForm(blank);setShowE(false);setModal(true);}}><Plus size={15}/> Nova</button></div>
    <div className="g2">
      {['expense','income'].map(t=><div key={t}>
        <div style={{fontSize:12,fontWeight:600,color:'var(--t3)',textTransform:'uppercase',letterSpacing:1,marginBottom:10}}>{t==='expense'?'Despesas':'Receitas'}</div>
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {data.categories.filter(c=>c.type===t).map(cat=><div key={cat.id} className="card" style={{display:'flex',alignItems:'center',gap:12,padding:'13px 16px'}}>
            <div style={{width:40,height:40,borderRadius:12,background:cat.color+'25',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>{cat.emoji}</div>
            <div style={{flex:1}}><div style={{fontWeight:700,color:'var(--t1)',fontSize:14}}>{cat.name}</div><span className={`badge ${t==='income'?'bg':'br2'}`} style={{fontSize:10}}>{t==='income'?'Receita':'Despesa'}</span></div>
            <div style={{display:'flex',gap:4}}>
              <button className="ib" onClick={()=>{setEditM({...cat});setEditE(false);}}><Edit3 size={13}/></button>
              <button className="ib" onClick={()=>del(cat.id)}><Trash2 size={13} color="var(--err)"/></button>
            </div>
          </div>)}
        </div>
      </div>)}
    </div>
    <Modal open={modal} onClose={()=>setModal(false)} title="Nova Categoria">
      <div className="fg"><label className="lbl">Emoji</label><button className="btn btn-g" style={{fontSize:22,padding:'6px 14px',marginBottom:8}} onClick={()=>setShowE(v=>!v)}>{form.emoji} ▾</button>{showE&&<div className="ebox">{EMOJIS.map(e=><button key={e} className={`ebt${form.emoji===e?' sel':''}`} onClick={()=>{setForm(f=>({...f,emoji:e}));setShowE(false);}}>{e}</button>)}</div>}</div>
      <div className="fg"><label className="lbl">Nome</label><input className="inp" placeholder="Ex: Alimentação" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/></div>
      <div className="g2">
        <div className="fg"><label className="lbl">Tipo</label><select className="inp" value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}><option value="expense">Despesa</option><option value="income">Receita</option></select></div>
        <div className="fg"><label className="lbl">Cor</label><input type="color" className="inp" style={{height:42,cursor:'pointer'}} value={form.color} onChange={e=>setForm(f=>({...f,color:e.target.value}))}/></div>
      </div>
      <div style={{display:'flex',gap:10}}><button className="btn btn-g" style={{flex:1}} onClick={()=>setModal(false)}>Cancelar</button><button className="btn btn-p" style={{flex:1}} onClick={save}><Save size={14}/> Salvar</button></div>
    </Modal>
    <Modal open={!!editM} onClose={()=>setEditM(null)} title="Editar Categoria">
      {editM&&<><div className="fg"><label className="lbl">Emoji</label><button className="btn btn-g" style={{fontSize:22,padding:'6px 14px',marginBottom:8}} onClick={()=>setEditE(v=>!v)}>{editM.emoji} ▾</button>{editE&&<div className="ebox">{EMOJIS.map(e=><button key={e} className={`ebt${editM.emoji===e?' sel':''}`} onClick={()=>{setEditM(m=>({...m,emoji:e}));setEditE(false);}}>{e}</button>)}</div>}</div>
      <div className="fg"><label className="lbl">Nome</label><input className="inp" value={editM.name} onChange={e=>setEditM(m=>({...m,name:e.target.value}))}/></div>
      <div className="g2">
        <div className="fg"><label className="lbl">Tipo</label><select className="inp" value={editM.type} onChange={e=>setEditM(m=>({...m,type:e.target.value}))}><option value="expense">Despesa</option><option value="income">Receita</option></select></div>
        <div className="fg"><label className="lbl">Cor</label><input type="color" className="inp" style={{height:42}} value={editM.color} onChange={e=>setEditM(m=>({...m,color:e.target.value}))}/></div>
      </div>
      <div style={{display:'flex',gap:10}}><button className="btn btn-g" style={{flex:1}} onClick={()=>setEditM(null)}>Cancelar</button><button className="btn btn-p" style={{flex:1}} onClick={saveEdit}><Save size={14}/> Salvar</button></div></>}
    </Modal>
  </div>;
}

// ─── CARTÕES ──────────────────────────────────────────────────────────────────
function CartoesView({data,setData}){
  const [editM,setEditM]=useState(null);
  const [newM,setNewM]=useState(false);
  const blank={name:'',brand:'Mastercard',bank:'Nubank',limit:'',closing:'1',due:'5',color1:'#820AD1',color2:'#5C0A95'};
  const [form,setForm]=useState(blank);
  const saveEdit=()=>{setData(d=>({...d,creditCards:d.creditCards.map(c=>c.id===editM.id?editM:c)}));setEditM(null);};
  const del=id=>setData(d=>({...d,creditCards:d.creditCards.filter(c=>c.id!==id)}));
  const saveNew=()=>{setData(d=>({...d,creditCards:[...d.creditCards,{id:Date.now(),name:form.name,brand:form.brand,bank:form.bank,limit:+form.limit||0,used:0,closing:+form.closing||1,due:+form.due||5,color1:form.color1,color2:form.color2}]}));setNewM(false);setForm(blank);};
  const CF=({state,setState,onSave,onClose})=><>
    <div className="fg"><label className="lbl">Nome</label><input className="inp" placeholder="Ex: Nubank Black" value={state.name||''} onChange={e=>setState(s=>({...s,name:e.target.value}))}/></div>
    <div className="g2">
      <div className="fg"><label className="lbl">Banco</label><select className="inp" value={state.bank||''} onChange={e=>setState(s=>({...s,bank:e.target.value}))}>{BANK_LIST.map(b=><option key={b} value={b}>{b}</option>)}</select></div>
      <div className="fg"><label className="lbl">Bandeira</label><select className="inp" value={state.brand||''} onChange={e=>setState(s=>({...s,brand:e.target.value}))}>{['Visa','Mastercard','Elo','Amex'].map(b=><option key={b} value={b}>{b}</option>)}</select></div>
      <div className="fg"><label className="lbl">Limite (R$)</label><CurrencyInput value={String(state.limit||'')} onChange={v=>setState(s=>({...s,limit:+v||0}))}/></div>
      <div className="fg"><label className="lbl">Fatura Atual</label><CurrencyInput value={String(state.used||'')} onChange={v=>setState(s=>({...s,used:+v||0}))}/></div>
      <div className="fg"><label className="lbl">Dia Fechamento</label><input type="number" min="1" max="31" className="inp" value={state.closing||''} onChange={e=>setState(s=>({...s,closing:+e.target.value||1}))}/></div>
      <div className="fg"><label className="lbl">Dia Vencimento</label><input type="number" min="1" max="31" className="inp" value={state.due||''} onChange={e=>setState(s=>({...s,due:+e.target.value||1}))}/></div>
      <div className="fg"><label className="lbl">Cor 1</label><input type="color" className="inp" style={{height:42}} value={state.color1||'#820AD1'} onChange={e=>setState(s=>({...s,color1:e.target.value}))}/></div>
      <div className="fg"><label className="lbl">Cor 2</label><input type="color" className="inp" style={{height:42}} value={state.color2||'#5C0A95'} onChange={e=>setState(s=>({...s,color2:e.target.value}))}/></div>
    </div>
    <div style={{display:'flex',gap:10}}><button className="btn btn-g" style={{flex:1}} onClick={onClose}>Cancelar</button><button className="btn btn-p" style={{flex:1}} onClick={onSave}><Save size={14}/> Salvar</button></div>
  </>;
  return<div className="fi">
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:22}}><div><div className="pgtitle">Cartões de Crédito</div><div className="pgsub" style={{marginBottom:0}}>Gerencie seus cartões e limites</div></div><button className="btn btn-p" onClick={()=>setNewM(true)}><Plus size={15}/> Novo Cartão</button></div>
    <div style={{display:'flex',flexDirection:'column',gap:20}}>
      {data.creditCards.map(card=>{const pct=card.limit>0?(card.used/card.limit)*100:0;const BC=BRANDS[card.brand];return<div key={card.id}>
        <div style={{background:`linear-gradient(135deg,${card.color1},${card.color2})`,borderRadius:'16px 16px 0 0',padding:22,height:155,display:'flex',flexDirection:'column',justifyContent:'space-between',position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',top:-40,right:-40,width:140,height:140,borderRadius:'50%',background:'rgba(255,255,255,.06)'}}/>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',zIndex:1}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}><BankLogo bank={card.bank} size={36}/><div><div style={{fontSize:11,opacity:.7,color:'white'}}>CARTÃO</div><div style={{fontFamily:'Syne',fontSize:15,fontWeight:700,color:'white'}}>{card.name}</div></div></div>
            {BC&&<BC/>}
          </div>
          <div style={{zIndex:1}}><div style={{fontSize:11,opacity:.7,color:'white'}}>DISPONÍVEL</div><div className="money" style={{fontSize:20,color:'white'}}>{fmt(card.limit-card.used)}</div><div style={{fontSize:11,opacity:.7,color:'white'}}>de {fmt(card.limit)}</div></div>
        </div>
        <div className="card" style={{borderRadius:'0 0 16px 16px',borderTop:'none'}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:10,flexWrap:'wrap',gap:8}}>
            <div><div style={{fontSize:11,color:'var(--t3)'}}>Fatura</div><div className="money" style={{color:'var(--err)',fontSize:15}}>{fmt(card.used)}</div></div>
            <div style={{textAlign:'center'}}><div style={{fontSize:11,color:'var(--t3)'}}>Fecha</div><div style={{fontWeight:600}}>Dia {card.closing}</div></div>
            <div style={{textAlign:'center'}}><div style={{fontSize:11,color:'var(--t3)'}}>Vence</div><div style={{fontWeight:600}}>Dia {card.due}</div></div>
            <div style={{display:'flex',gap:6,alignItems:'center'}}><button className="btn btn-g" style={{fontSize:12}} onClick={()=>setEditM({...card})}><Edit3 size={13}/> Editar</button><button className="ib" onClick={()=>del(card.id)}><Trash2 size={13} color="var(--err)"/></button></div>
          </div>
          <PBar pct={pct} color={card.color1}/>
          <div style={{fontSize:11,color:pct>80?'var(--err)':'var(--t3)',marginTop:6}}>{pct.toFixed(0)}% utilizado</div>
        </div>
      </div>;})}
    </div>
    <Modal open={newM} onClose={()=>setNewM(false)} title="Novo Cartão"><CF state={form} setState={setForm} onSave={saveNew} onClose={()=>setNewM(false)}/></Modal>
    <Modal open={!!editM} onClose={()=>setEditM(null)} title="Editar Cartão">{editM&&<CF state={editM} setState={setEditM} onSave={saveEdit} onClose={()=>setEditM(null)}/>}</Modal>
  </div>;
}

// ─── FATURAS ──────────────────────────────────────────────────────────────────
function FaturasView({data,setData}){
  const [editInv,setEditInv]=useState(null);
  const [editP,setEditP]=useState(null);
  const [newP,setNewP]=useState(null);
  const [selCard,setSelCard]=useState(0);
  const filt=selCard===0?data.invoices:data.invoices.filter(i=>i.cardId===selCard);
  const SL={open:'Aberta',closed:'Fechada',paid:'Paga',overdue:'Atrasada'};
  const SC={open:'bb',closed:'by',paid:'bg',overdue:'br2'};
  const saveInv=()=>{setData(d=>({...d,invoices:d.invoices.map(i=>i.id===editInv.id?editInv:i)}));setEditInv(null);};
  const saveP=()=>{setData(d=>({...d,invoices:d.invoices.map(i=>i.id===editP.invId?{...i,purchases:i.purchases.map(p=>p.id===editP.id?editP:p)}:i)}));setEditP(null);};
  const delP=(iid,pid)=>setData(d=>({...d,invoices:d.invoices.map(i=>i.id===iid?{...i,purchases:i.purchases.filter(p=>p.id!==pid)}:i)}));
  const addP=()=>{const p={id:Date.now(),desc:newP.desc,amount:+newP.amount||0,date:newP.date,installments:+newP.installments||1,catId:7};setData(d=>({...d,invoices:d.invoices.map(i=>i.id===newP.invId?{...i,purchases:[...i.purchases,p]}:i)}));setNewP(null);};
  const PF=({state,setState,onSave,onClose})=>{if(!state)return null;return<>
    <div className="fg"><label className="lbl">Descrição</label><input className="inp" placeholder="Ex: Shopee..." value={state.desc||''} onChange={e=>setState(m=>({...m,desc:e.target.value}))}/></div>
    <div className="g2">
      <div className="fg"><label className="lbl">Valor (R$)</label><CurrencyInput value={String(state.amount||'')} onChange={v=>setState(m=>({...m,amount:v}))}/></div>
      <div className="fg"><label className="lbl">Data</label><input type="date" className="inp" value={state.date||''} onChange={e=>setState(m=>({...m,date:e.target.value}))}/></div>
    </div>
    <div className="fg"><label className="lbl">Parcelas</label><input type="number" min="1" className="inp" value={state.installments||''} onChange={e=>setState(m=>({...m,installments:e.target.value}))}/></div>
    <div style={{display:'flex',gap:10}}><button className="btn btn-g" style={{flex:1}} onClick={onClose}>Cancelar</button><button className="btn btn-p" style={{flex:1}} onClick={onSave}><Save size={14}/> Salvar</button></div>
  </>;};
  return<div className="fi">
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:22}}><div><div className="pgtitle">Faturas</div><div className="pgsub" style={{marginBottom:0}}>Compras e parcelamentos</div></div>
    <select className="inp" style={{width:'auto'}} value={selCard} onChange={e=>setSelCard(+e.target.value)}><option value={0}>Todos os cartões</option>{data.creditCards.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
    {filt.map(inv=>{const card=data.creditCards.find(c=>c.id===inv.cardId);const total=inv.purchases.reduce((a,p)=>a+p.amount,0);return<div key={inv.id} className="card" style={{marginBottom:14}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14,flexWrap:'wrap',gap:10}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}><BankLogo bank={card?.bank||'Carteira'} size={36}/><div><div style={{fontFamily:'Syne',fontWeight:700,fontSize:14,color:'var(--t1)'}}>{card?.name} — {MONTHS_FULL[(inv.month-1+12)%12]} {inv.year}</div><div style={{fontSize:12,color:'var(--t3)'}}>Fecha: {fmtDate(inv.closingDate)} • Vence: {fmtDate(inv.dueDate)}</div></div></div>
        <div style={{display:'flex',alignItems:'center',gap:10}}><div style={{textAlign:'right'}}><div className="money" style={{fontSize:17,color:inv.status==='paid'?'var(--ok)':'var(--err)'}}>{fmt(total)}</div><span className={`badge ${SC[inv.status]}`}>{SL[inv.status]}</span></div><button className="btn btn-g" style={{fontSize:12}} onClick={()=>setEditInv({...inv})}><Edit3 size={13}/> Editar Fatura</button>{inv.status==='open'&&<button className="btn btn-s" style={{fontSize:12}}><Check size={13}/> Pagar</button>}</div>
      </div>
      <table className="tbl"><thead><tr><th>Compra</th><th>Data</th><th>Parcelas</th><th>Valor</th><th>Ações</th></tr></thead>
        <tbody>{inv.purchases.map(p=><tr key={p.id}><td style={{color:'var(--t1)',fontWeight:500}}>{p.desc}</td><td>{fmtDate(p.date)}</td><td>{p.installments>1?`${p.installments}x`:'À vista'}</td><td><span className="neg">{fmt(p.amount)}</span></td><td><div style={{display:'flex',gap:4}}><button className="ib" onClick={()=>setEditP({...p,invId:inv.id})}><Edit3 size={13}/></button><button className="ib" onClick={()=>delP(inv.id,p.id)}><Trash2 size={13} color="var(--err)"/></button></div></td></tr>)}</tbody>
      </table>
      {inv.status==='open'&&<button className="btn btn-g" style={{marginTop:10,fontSize:12}} onClick={()=>setNewP({invId:inv.id,desc:'',amount:'',date:today.toISOString().split('T')[0],installments:'1'})}><Plus size={13}/> Adicionar Compra</button>}
    </div>;})}
    <Modal open={!!editInv} onClose={()=>setEditInv(null)} title="Editar Fatura">
      {editInv&&<><div className="infobox"><Info size={14}/> Altere datas de fechamento, vencimento e status.</div>
      <div className="g2"><div className="fg"><label className="lbl">Fechamento</label><input type="date" className="inp" value={editInv.closingDate} onChange={e=>setEditInv(m=>({...m,closingDate:e.target.value}))}/></div><div className="fg"><label className="lbl">Vencimento</label><input type="date" className="inp" value={editInv.dueDate} onChange={e=>setEditInv(m=>({...m,dueDate:e.target.value}))}/></div></div>
      <div className="fg"><label className="lbl">Status</label><select className="inp" value={editInv.status} onChange={e=>setEditInv(m=>({...m,status:e.target.value}))}><option value="open">Aberta</option><option value="closed">Fechada</option><option value="paid">Paga</option><option value="overdue">Atrasada</option></select></div>
      <div style={{display:'flex',gap:10}}><button className="btn btn-g" style={{flex:1}} onClick={()=>setEditInv(null)}>Cancelar</button><button className="btn btn-p" style={{flex:1}} onClick={saveInv}><Save size={14}/> Salvar</button></div></>}
    </Modal>
    <Modal open={!!editP} onClose={()=>setEditP(null)} title="Editar Compra"><PF state={editP} setState={setEditP} onSave={saveP} onClose={()=>setEditP(null)}/></Modal>
    <Modal open={!!newP} onClose={()=>setNewP(null)} title="Nova Compra"><PF state={newP} setState={setNewP} onSave={addP} onClose={()=>setNewP(null)}/></Modal>
  </div>;
}

// ─── ORÇAMENTO ────────────────────────────────────────────────────────────────
function OrcamentoView({data}){
  const total=data.budgets.reduce((a,b)=>a+b.amount,0);const spent=data.budgets.reduce((a,b)=>a+b.spent,0);
  return<div className="fi"><div className="pgtitle">Orçamento Mensal</div><div className="pgsub">Controle por categoria</div>
    <div className="g3" style={{marginBottom:20}}>{[[fmt(total),'Orçamento','ac'],[fmt(spent),'Gasto',spent/total>0.8?'err':'warn'],[fmt(total-spent),'Disponível','ok']].map(([v,l,c])=><div key={l} className={`sc ${c==='ac'?'blue':c==='err'?'red':c==='warn'?'yellow':'green'}`}><div style={{fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:1,color:'var(--t3)'}}>{l}</div><div className="money" style={{fontSize:20,color:`var(--${c})`}}>{v}</div></div>)}</div>
    <div className="card">{data.budgets.map(b=>{const p=b.amount>0?(b.spent/b.amount)*100:0;return<div key={b.id} style={{padding:'13px 0',borderBottom:'1px solid var(--br)'}}>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}><div style={{width:10,height:10,borderRadius:3,background:b.color,flexShrink:0}}/><span style={{fontWeight:600,color:'var(--t1)',flex:1}}>{b.name}</span><span style={{fontSize:12,color:p>90?'var(--err)':p>70?'var(--warn)':'var(--t3)'}}>{fmt(b.spent)} / {fmt(b.amount)}</span><span style={{fontSize:12,fontWeight:700,color:p>90?'var(--err)':p>70?'var(--warn)':'var(--t2)',minWidth:36,textAlign:'right'}}>{p.toFixed(0)}%</span></div>
      <PBar pct={p} color={b.color}/>{p>90&&<div style={{fontSize:11,color:'var(--err)',marginTop:4}}>⚠ Quase esgotado</div>}
    </div>;})}
    </div>
  </div>;
}

// ─── METAS ────────────────────────────────────────────────────────────────────
function MetasView({data,setData}){
  const [modal,setModal]=useState(false);const [aporte,setAporte]=useState(null);
  const [form,setForm]=useState({name:'',target:'',current:'',deadline:'',color:'#10B981'});
  const save=()=>{setData(d=>({...d,goals:[...d.goals,{id:Date.now(),name:form.name,target:+form.target||0,current:+form.current||0,deadline:form.deadline,color:form.color}]}));setModal(false);};
  const doA=()=>{const v=+aporte.value||0;setData(d=>({...d,goals:d.goals.map(g=>g.id===aporte.id?{...g,current:Math.min(g.target,g.current+v)}:g)}));setAporte(null);};
  const del=id=>setData(d=>({...d,goals:d.goals.filter(g=>g.id!==id)}));
  const EM={'Emergência':'🛡️','Viagem':'✈️','Notebook':'💻','Cartão':'💳','Carro':'🚗'};
  return<div className="fi">
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:22}}><div><div className="pgtitle">Metas Financeiras</div><div className="pgsub" style={{marginBottom:0}}>Acompanhe seus objetivos</div></div><button className="btn btn-p" onClick={()=>setModal(true)}><Plus size={15}/> Nova</button></div>
    <div className="g2">{data.goals.map(g=>{const pct=g.target>0?(g.current/g.target)*100:0;const done=pct>=100;const emoji=Object.entries(EM).find(([k])=>g.name.includes(k))?.[1]||'🎯';return<div key={g.id} className="card" style={{borderTop:`3px solid ${g.color}`}}>
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:12}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}><div style={{fontSize:24}}>{emoji}</div><div><div style={{fontFamily:'Syne',fontWeight:700,fontSize:14,color:'var(--t1)'}}>{g.name}</div>{g.deadline&&<div style={{fontSize:11,color:'var(--t3)'}}>Prazo: {fmtDate(g.deadline)}</div>}</div></div>
        <div style={{display:'flex',gap:4,alignItems:'center'}}>{done?<span className="badge bg"><Check size={10}/> Concluída</span>:<span className="money" style={{fontSize:17,color:g.color}}>{pct.toFixed(0)}%</span>}<button className="ib" onClick={()=>del(g.id)}><Trash2 size={12} color="var(--err)"/></button></div>
      </div>
      <PBar pct={pct} color={g.color}/>
      <div style={{display:'flex',justifyContent:'space-between',margin:'12px 0 14px'}}><div><div style={{fontSize:11,color:'var(--t3)'}}>Acumulado</div><div className="money pos">{fmt(g.current)}</div></div><div style={{textAlign:'center'}}><div style={{fontSize:11,color:'var(--t3)'}}>Faltam</div><div className="money neg">{fmt(g.target-g.current)}</div></div><div style={{textAlign:'right'}}><div style={{fontSize:11,color:'var(--t3)'}}>Objetivo</div><div className="money">{fmt(g.target)}</div></div></div>
      {!done&&<button className="btn btn-g" style={{width:'100%',fontSize:12}} onClick={()=>setAporte({id:g.id,name:g.name,value:''})}><Plus size={13}/> Registrar Aporte</button>}
    </div>;})}
    </div>
    <Modal open={modal} onClose={()=>setModal(false)} title="Nova Meta">
      {[['name','Objetivo','text'],['target','Valor Alvo','number'],['current','Valor Atual','number'],['deadline','Prazo','date']].map(([f,l,t])=><div key={f} className="fg"><label className="lbl">{l}</label><input type={t} className="inp" value={form[f]} onChange={e=>setForm(x=>({...x,[f]:e.target.value}))}/></div>)}
      <div className="fg"><label className="lbl">Cor</label><input type="color" className="inp" style={{height:42}} value={form.color} onChange={e=>setForm(x=>({...x,color:e.target.value}))}/></div>
      <div style={{display:'flex',gap:10}}><button className="btn btn-g" style={{flex:1}} onClick={()=>setModal(false)}>Cancelar</button><button className="btn btn-p" style={{flex:1}} onClick={save}><Save size={14}/> Salvar</button></div>
    </Modal>
    <Modal open={!!aporte} onClose={()=>setAporte(null)} title="Registrar Aporte">
      {aporte&&<><p style={{fontSize:14,color:'var(--t2)',marginBottom:14}}>Meta: <strong style={{color:'var(--t1)'}}>{aporte.name}</strong></p>
      <div className="fg"><label className="lbl">Valor (R$)</label><CurrencyInput value={aporte.value} onChange={v=>setAporte(m=>({...m,value:v}))}/></div>
      <div style={{display:'flex',gap:10}}><button className="btn btn-g" style={{flex:1}} onClick={()=>setAporte(null)}>Cancelar</button><button className="btn btn-p" style={{flex:1}} onClick={doA}><Save size={14}/> Confirmar</button></div></>}
    </Modal>
  </div>;
}

// ─── RELATÓRIOS ────────────────────────────────────────────────────────────────
function RelatoriosView({data}){
  const [month,setMonth]=useState(today.getMonth());const [year,setYear]=useState(today.getFullYear());
  const chart=Array.from({length:6},(_,i)=>{const d=new Date(year,month-5+i,1);const m=d.getMonth();const y=d.getFullYear();const p=`${y}-${String(m+1).padStart(2,'0')}`;const txs=data.transactions.filter(t=>t.date.startsWith(p));return{name:MONTHS_SHORT[m],entradas:txs.filter(t=>t.type==='income').reduce((a,c)=>a+c.amount,0),saidas:txs.filter(t=>t.type==='expense').reduce((a,c)=>a+c.amount,0)};});
  const pfx=`${year}-${String(month+1).padStart(2,'0')}`;
  const catD=data.categories.filter(c=>c.type==='expense').map(cat=>({name:cat.emoji+' '+cat.name,value:data.transactions.filter(t=>t.date.startsWith(pfx)&&t.type==='expense'&&t.catId===cat.id).reduce((a,c)=>a+c.amount,0),color:cat.color})).filter(d=>d.value>0).sort((a,b)=>b.value-a.value);
  return<div className="fi">
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:22}}><div><div className="pgtitle">Relatórios</div><div className="pgsub" style={{marginBottom:0}}>Análise por período</div></div><MNav month={month} year={year} onChange={(m,y)=>{setMonth(m);setYear(y);}}/></div>
    <div className="g2" style={{marginBottom:20}}>
      <div className="card"><div className="sectitle">Entradas × Saídas (6 meses)</div><ResponsiveContainer width="100%" height={220}><BarChart data={chart} barGap={4}><CartesianGrid strokeDasharray="3 3" stroke="var(--br)" vertical={false}/><XAxis dataKey="name" tick={{fontSize:11,fill:'var(--t3)'}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:11,fill:'var(--t3)'}} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}k`}/><Tooltip content={<Tip/>}/><Bar dataKey="entradas" name="Entradas" fill="var(--ok)" radius={[4,4,0,0]} opacity={0.85}/><Bar dataKey="saidas" name="Saídas" fill="var(--err)" radius={[4,4,0,0]} opacity={0.85}/></BarChart></ResponsiveContainer></div>
      <div className="card"><div className="sectitle">Gastos de {MONTHS_FULL[month]}</div>{catD.length===0?<div style={{textAlign:'center',padding:40,color:'var(--t3)'}}>Sem despesas</div>:<ResponsiveContainer width="100%" height={220}><PieChart><Pie data={catD} dataKey="value" cx="50%" cy="50%" outerRadius={88} paddingAngle={2} label={({name,percent})=>`${(percent*100).toFixed(0)}%`} labelLine={false}>{catD.map((e,i)=><Cell key={i} fill={e.color}/>)}</Pie><Tooltip formatter={v=>fmt(v)} contentStyle={{background:'var(--bge)',border:'1px solid var(--br)',borderRadius:10}}/></PieChart></ResponsiveContainer>}</div>
    </div>
    <div className="card"><div className="sectitle">Ranking</div>{catD.map((c,i)=><div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'9px 0',borderBottom:'1px solid var(--br)'}}><div style={{width:24,height:24,borderRadius:6,background:c.color,display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:11,fontWeight:700,flexShrink:0}}>{i+1}</div><span style={{fontSize:13,fontWeight:600,color:'var(--t1)',flex:1}}>{c.name}</span><div style={{flex:2,marginRight:16}}><div style={{height:5,background:'var(--bge)',borderRadius:10,overflow:'hidden'}}><div style={{width:`${(c.value/catD[0].value)*100}%`,height:'100%',background:c.color,borderRadius:10}}/></div></div><span className="money" style={{color:c.color,minWidth:90,textAlign:'right'}}>{fmt(c.value)}</span></div>)}</div>
  </div>;
}

// ─── AGENDA ───────────────────────────────────────────────────────────────────
function AgendaView({data,setData}){
  const [modal,setModal]=useState(false);const [editM,setEditM]=useState(null);
  const [dragId,setDragId]=useState(null);const [ovIdx,setOvIdx]=useState(null);
  const blank={desc:'',amount:'',day:'1',type:'expense',catId:1,color:'#3B82F6',repeat:'monthly'};
  const [form,setForm]=useState(blank);
  const onDS=(e,id)=>{setDragId(id);e.dataTransfer.effectAllowed='move';};
  const onDO=(e,i)=>{e.preventDefault();setOvIdx(i);};
  const onDrop=(e,i)=>{e.preventDefault();const fi=data.agenda.findIndex(a=>a.id===dragId);if(fi===i||fi<0){setDragId(null);setOvIdx(null);return;}const arr=[...data.agenda];const[item]=arr.splice(fi,1);arr.splice(i,0,item);setData(d=>({...d,agenda:arr}));setDragId(null);setOvIdx(null);};
  const save=()=>{setData(d=>({...d,agenda:[...d.agenda,{id:Date.now(),desc:form.desc,amount:+form.amount||0,day:+form.day||1,type:form.type,catId:+form.catId,color:form.color,repeat:form.repeat}]}));setModal(false);setForm(blank);};
  const saveEdit=()=>{setData(d=>({...d,agenda:d.agenda.map(a=>a.id===editM.id?editM:a)}));setEditM(null);};
  const del=id=>setData(d=>({...d,agenda:d.agenda.filter(a=>a.id!==id)}));
  const totExp=data.agenda.filter(a=>a.type==='expense').reduce((acc,a)=>acc+a.amount,0);
  const totInc=data.agenda.filter(a=>a.type==='income').reduce((acc,a)=>acc+a.amount,0);
  const AF=({state,setState,onSave,onClose})=><>
    <div className="fg"><label className="lbl">Descrição</label><input className="inp" placeholder="Ex: Aluguel, Netflix..." value={state.desc||''} onChange={e=>setState(s=>({...s,desc:e.target.value}))}/></div>
    <div className="g2">
      <div className="fg"><label className="lbl">Valor (R$)</label><CurrencyInput value={String(state.amount||'')} onChange={v=>setState(s=>({...s,amount:v}))}/></div>
      <div className="fg"><label className="lbl">Dia do mês</label><input type="number" min="1" max="31" className="inp" value={state.day||''} onChange={e=>setState(s=>({...s,day:e.target.value}))}/></div>
      <div className="fg"><label className="lbl">Tipo</label><select className="inp" value={state.type||''} onChange={e=>setState(s=>({...s,type:e.target.value}))}><option value="expense">Despesa</option><option value="income">Receita</option></select></div>
      <div className="fg"><label className="lbl">Categoria</label><select className="inp" value={state.catId||''} onChange={e=>setState(s=>({...s,catId:+e.target.value}))}>{data.categories.map(c=><option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}</select></div>
      <div className="fg"><label className="lbl">Recorrência</label><select className="inp" value={state.repeat||''} onChange={e=>setState(s=>({...s,repeat:e.target.value}))}><option value="monthly">Mensal</option><option value="weekly">Semanal</option><option value="yearly">Anual</option><option value="once">Única</option></select></div>
      <div className="fg"><label className="lbl">Cor</label><input type="color" className="inp" style={{height:42}} value={state.color||'#3B82F6'} onChange={e=>setState(s=>({...s,color:e.target.value}))}/></div>
    </div>
    <div style={{display:'flex',gap:10}}><button className="btn btn-g" style={{flex:1}} onClick={onClose}>Cancelar</button><button className="btn btn-p" style={{flex:1}} onClick={onSave}><Save size={14}/> Salvar</button></div>
  </>;
  return<div className="fi">
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:22}}><div><div className="pgtitle">Agenda Financeira</div><div className="pgsub" style={{marginBottom:0}}>Arraste para reordenar — {data.agenda.length} eventos</div></div><button className="btn btn-p" onClick={()=>{setForm(blank);setModal(true);}}><Plus size={15}/> Novo Evento</button></div>
    <div className="g2" style={{marginBottom:18}}>{[[fmt(totInc),'Total de Receitas','green','ok'],[fmt(totExp),'Total de Despesas','red','err']].map(([v,l,c,ac])=><div key={l} className={`sc ${c}`}><div style={{fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:1,color:'var(--t3)'}}>{l}</div><div className="money" style={{fontSize:18,color:`var(--${ac})`}}>{v}</div></div>)}</div>
    {data.agenda.map((ev,idx)=>{const cat=data.categories.find(c=>c.id===ev.catId);const isD=dragId===ev.id;const isO=ovIdx===idx&&dragId!==ev.id;
    return<div key={ev.id} className={`drag-item${isD?' dragging':''}${isO?' dov':''}`} draggable onDragStart={e=>onDS(e,ev.id)} onDragOver={e=>onDO(e,idx)} onDrop={e=>onDrop(e,idx)} onDragEnd={()=>{setDragId(null);setOvIdx(null);}}>
      <div className="card" style={{marginBottom:8,display:'flex',alignItems:'center',gap:14,padding:'13px 16px',borderLeft:`3px solid ${ev.color}`,cursor:'grab'}}>
        <GripVertical size={16} color="var(--t3)" style={{flexShrink:0,cursor:'grab'}}/>
        <div style={{width:32,height:32,borderRadius:8,background:ev.color+'25',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0}}>{cat?.emoji||'💰'}</div>
        <div style={{flex:1,minWidth:0}}><div style={{fontWeight:700,color:'var(--t1)',fontSize:14}}>{ev.desc}</div><div style={{fontSize:11,color:'var(--t3)'}}>Dia {ev.day} • {ev.repeat==='monthly'?'Mensal':ev.repeat==='weekly'?'Semanal':ev.repeat==='yearly'?'Anual':'Único'}</div></div>
        <div className={`money ${ev.type==='income'?'pos':'neg'}`} style={{fontSize:14,flexShrink:0}}>{ev.type==='income'?'+':'−'}{fmt(ev.amount)}</div>
        <span className={`badge ${ev.type==='income'?'bg':'br2'}`} style={{flexShrink:0}}>{ev.type==='income'?'Receita':'Despesa'}</span>
        <div style={{display:'flex',gap:4,flexShrink:0}}><button className="ib" onClick={()=>setEditM({...ev})}><Edit3 size={13}/></button><button className="ib" onClick={()=>del(ev.id)}><Trash2 size={13} color="var(--err)"/></button></div>
      </div>
    </div>;})}
    {data.agenda.length===0&&<div className="card" style={{textAlign:'center',padding:40,color:'var(--t3)'}}>Nenhum evento. Clique em "Novo Evento" para começar.</div>}
    <Modal open={modal} onClose={()=>setModal(false)} title="Novo Evento"><AF state={form} setState={setForm} onSave={save} onClose={()=>setModal(false)}/></Modal>
    <Modal open={!!editM} onClose={()=>setEditM(null)} title="Editar Evento">{editM&&<AF state={editM} setState={setEditM} onSave={saveEdit} onClose={()=>setEditM(null)}/>}</Modal>
  </div>;
}

// ─── CORRIDAS ─────────────────────────────────────────────────────────────────
function CorridasView({data,setData}){
  const [month,setMonth]=useState(today.getMonth());const [year,setYear]=useState(today.getFullYear());
  const [editing,setEditing]=useState(null);const [addM,setAddM]=useState(false);
  const blank={date:'',trips:'',km:'',autonomia:'12.5',hours:'',earnings:'',fuelPrice:'6.39'};
  const [nr,setNr]=useState(blank);
  const filt=useMemo(()=>data.corridas.filter(c=>{const d=new Date(c.date);return d.getMonth()===month&&d.getFullYear()===year;}).sort((a,b)=>new Date(b.date)-new Date(a.date)),[data.corridas,month,year]);
  const calc=useCallback(c=>{const km=+c.km||0,auto=+c.autonomia||1,earn=+c.earnings||0,trips=+c.trips||0,hours=+c.hours||0,fuel=+c.fuelPrice||0;const fc=km>0?(km/auto)*fuel:0;return{ganhoH:hours>0?earn/hours:0,ganhoKm:km>0?earn/km:0,ticket:trips>0?earn/trips:0,custoComb:fc,custoKm:km>0?fc/km:0,lucro:earn-fc};},[]);
  const totals=useMemo(()=>filt.reduce((acc,c)=>{const cl=calc(c);return{trips:acc.trips+(+c.trips||0),km:acc.km+(+c.km||0),earn:acc.earn+(+c.earnings||0),hours:acc.hours+(+c.hours||0),fuel:acc.fuel+cl.custoComb,lucro:acc.lucro+cl.lucro,days:acc.days+1};},({}={trips:0,km:0,earn:0,hours:0,fuel:0,lucro:0,days:0})),[filt,calc]);
  const avgH=totals.hours>0?totals.earn/totals.hours:0;const avgKm=totals.km>0?totals.earn/totals.km:0;const avgT=totals.trips>0?totals.earn/totals.trips:0;
  const addRow=()=>{setData(d=>({...d,corridas:[...d.corridas,{id:Date.now(),date:nr.date,trips:+nr.trips||0,km:+nr.km||0,autonomia:+nr.autonomia||12,hours:+nr.hours||0,earnings:+nr.earnings||0,fuelPrice:+nr.fuelPrice||0}]}));setAddM(false);setNr(blank);};
  const upd=(id,f,v)=>setData(d=>({...d,corridas:d.corridas.map(c=>c.id===id?{...c,[f]:+v||v}:c)}));
  const del=id=>setData(d=>({...d,corridas:d.corridas.filter(c=>c.id!==id)}));
  const EC=({id,field,val})=>editing===id?<input style={{background:'var(--acd)',borderRadius:4,padding:'0 4px',color:'var(--t1)',width:'65px',border:'1px solid var(--bra)',outline:'none',fontFamily:'Outfit',fontSize:13}} defaultValue={val} onBlur={e=>upd(id,field,e.target.value)}/>:<span>{val}</span>;
  const preview=useMemo(()=>{if(!nr.km||!nr.earnings)return null;return calc({...nr});},[nr,calc]);
  return<div className="fi">
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:22}}><div><div className="pgtitle">🚗 Corridas</div><div className="pgsub" style={{marginBottom:0}}>Performance — não integrado ao dashboard financeiro</div></div>
    <div style={{display:'flex',gap:10,alignItems:'center'}}><MNav month={month} year={year} onChange={(m,y)=>{setMonth(m);setYear(y);}}/><button className="btn btn-p" onClick={()=>setAddM(true)}><Plus size={15}/> Novo Dia</button></div></div>
    <div className="g4" style={{marginBottom:16}}>{[[fmt(totals.earn),'Ganho Bruto',`${totals.days} dias`,'ok'],[fmt(totals.lucro),'Lucro Líquido','Após combustível','ac'],[fmt(totals.fuel),'Combustível','Total','warn'],[`${(totals.km||0).toLocaleString('pt-BR')} km`,'KM',`${totals.trips} corridas`,'pur']].map(([v,l,s,c])=><div key={l} className={`sc ${c==='ok'?'green':c==='ac'?'blue':c==='warn'?'yellow':'purple'}`}><div style={{fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:1,color:'var(--t3)'}}>{l}</div><div className="money" style={{fontSize:18,color:`var(--${c})`}}>{v}</div><div style={{fontSize:11,color:'var(--t3)'}}>{s}</div></div>)}</div>
    <div className="g4" style={{marginBottom:18}}>{[[fmt(avgH),'Ganho/Hora',Timer],[`R$ ${fmtN(avgKm,2)}`,'Ganho/KM',Route],[fmt(avgT),'Ticket Médio',Car],[`${fmtN(totals.hours,1)}h`,'Horas Online',Clock]].map(([v,l,I])=><div key={l} className="card" style={{textAlign:'center',padding:14}}><I size={15} color="var(--ac)" style={{margin:'0 auto 8px',display:'block'}}/><div className="money" style={{fontSize:15,color:'var(--ac)'}}>{v}</div><div style={{fontSize:11,color:'var(--t3)',marginTop:3}}>{l}</div></div>)}</div>
    <div className="card" style={{overflowX:'auto'}}>
      <div style={{marginBottom:12,display:'flex',alignItems:'center',gap:8}}><div style={{width:8,height:8,background:'var(--ac)',borderRadius:2}}/><span style={{fontFamily:'Syne',fontWeight:700,fontSize:14,color:'var(--t1)'}}>Planilha — {MONTHS_FULL[month]} {year}</span><span style={{fontSize:11,color:'var(--t3)',background:'var(--acg)',padding:'2px 8px',borderRadius:20,border:'1px solid var(--bra)'}}>⚡ Colunas azuis = automáticas</span></div>
      <table className="tbl" style={{minWidth:900}}>
        <thead><tr>
          {/* Fix #9: date shown as dd/mm/yyyy */}
          <th>Data</th><th>Viagens</th><th>KM</th><th>Autonomia</th><th>H. Online</th><th>Ganhos</th><th>R$/L</th>
          <th style={{color:'var(--ac)',background:'var(--acg)'}}>Ganho/h</th><th style={{color:'var(--ac)',background:'var(--acg)'}}>Ganho/km</th><th style={{color:'var(--ac)',background:'var(--acg)'}}>Ticket</th>
          <th style={{color:'var(--warn)',background:'var(--warnd)'}}>Comb.</th><th style={{color:'var(--warn)',background:'var(--warnd)'}}>Custo/km</th><th></th>
        </tr></thead>
        <tbody>{filt.length===0&&<tr><td colSpan={13} style={{textAlign:'center',padding:28,color:'var(--t3)'}}>Nenhum registro para {MONTHS_FULL[month]} {year}.</td></tr>}
        {filt.map(c=>{const cl=calc(c);const isE=editing===c.id;return<tr key={c.id}>
          <td style={{color:'var(--t1)',fontWeight:600}}>{isE?<input type="date" defaultValue={c.date} className="inp" style={{padding:'2px 6px',fontSize:12,width:130}} onBlur={e=>upd(c.id,'date',e.target.value)}/>:fmtDate(c.date)}</td>
          <td><EC id={c.id} field="trips" val={c.trips}/></td><td><EC id={c.id} field="km" val={c.km}/></td><td><EC id={c.id} field="autonomia" val={c.autonomia}/></td><td><EC id={c.id} field="hours" val={c.hours}/></td>
          <td style={{color:'var(--ok)',fontWeight:600}}>
            {/* Fix #10: currency format for earnings cell */}
            {isE?<CurrencyInput value={String(c.earnings)} onChange={v=>upd(c.id,'earnings',v)} style={{background:'var(--okd)',borderRadius:4,padding:'0 4px',color:'var(--ok)',width:90,border:'none',outline:'none',fontFamily:'Outfit',fontSize:13}} className=""/>:fmt(c.earnings)}
          </td>
          <td><EC id={c.id} field="fuelPrice" val={c.fuelPrice}/></td>
          <td style={{color:'var(--ac)',fontWeight:500}}>{fmt(cl.ganhoH)}</td><td style={{color:'var(--ac)',fontWeight:500}}>R$ {fmtN(cl.ganhoKm,2)}</td><td style={{color:'var(--ac)',fontWeight:500}}>{fmt(cl.ticket)}</td>
          <td style={{color:'var(--warn)',fontWeight:500}}>{fmt(cl.custoComb)}</td><td style={{color:'var(--warn)',fontWeight:500}}>R$ {fmtN(cl.custoKm,3)}</td>
          <td><div style={{display:'flex',gap:4}}><button className="ib" onClick={()=>setEditing(isE?null:c.id)}>{isE?<Check size={13} color="var(--ok)"/>:<Edit3 size={13}/>}</button><button className="ib" onClick={()=>del(c.id)}><Trash2 size={13} color="var(--err)"/></button></div></td>
        </tr>;})}
        </tbody>
        {filt.length>0&&<tfoot><tr style={{background:'var(--bge)'}}><td style={{fontWeight:700,color:'var(--t1)'}}>TOTAIS</td><td style={{fontWeight:700}}>{totals.trips}</td><td style={{fontWeight:700}}>{fmtN(totals.km,0)}</td><td>—</td><td style={{fontWeight:700}}>{fmtN(totals.hours,1)}h</td><td style={{fontWeight:700,color:'var(--ok)'}}>{fmt(totals.earn)}</td><td>—</td><td style={{color:'var(--ac)',fontWeight:700}}>{fmt(avgH)}</td><td style={{color:'var(--ac)',fontWeight:700}}>R$ {fmtN(avgKm,2)}</td><td style={{color:'var(--ac)',fontWeight:700}}>{fmt(avgT)}</td><td style={{color:'var(--warn)',fontWeight:700}}>{fmt(totals.fuel)}</td><td>—</td><td></td></tr></tfoot>}
      </table>
    </div>
    <Modal open={addM} onClose={()=>setAddM(false)} title="Registrar Novo Dia">
      <div className="infobox"><Info size={14}/> Preencha os dados. Os cálculos são automáticos.</div>
      <div className="g2">
        {[['date','Data','date',''],['trips','Nº de Viagens','number','Ex: 18'],['km','KM Percorrido','number','Ex: 142'],['autonomia','Autonomia (km/L)','number','Ex: 12.5'],['hours','Horas Online','number','Ex: 8.5'],['fuelPrice','R$/Litro','number','Ex: 6.39']].map(([f,l,t,p])=><div key={f} className="fg"><label className="lbl">{l}</label><input type={t} className="inp" placeholder={p} value={nr[f]} onChange={e=>setNr(r=>({...r,[f]:e.target.value}))}/></div>)}
        {/* Fix #10: currency for earnings */}
        <div className="fg"><label className="lbl">Ganhos do Dia (R$)</label><CurrencyInput value={nr.earnings} onChange={v=>setNr(r=>({...r,earnings:v}))}/></div>
      </div>
      {preview&&<div style={{background:'var(--bge)',border:'1px solid var(--br)',borderRadius:12,padding:'12px 14px',marginBottom:14}}>
        <div style={{fontSize:11,fontWeight:600,color:'var(--ac)',marginBottom:8,textTransform:'uppercase',letterSpacing:1}}>📊 Pré-visualização</div>
        <div className="g2">{[['Ganho/hora',fmt(preview.ganhoH)],['Ganho/km',`R$ ${fmtN(preview.ganhoKm,2)}`],['Ticket Médio',fmt(preview.ticket)],['Custo Comb.',fmt(preview.custoComb)],['Custo/km',`R$ ${fmtN(preview.custoKm,3)}`],['Lucro Líq.',fmt(preview.lucro)]].map(([l,v])=><div key={l} style={{display:'flex',justifyContent:'space-between',padding:'3px 0'}}><span style={{fontSize:12,color:'var(--t3)'}}>{l}</span><span style={{fontSize:12,fontWeight:700,color:'var(--ac)'}}>{v}</span></div>)}</div>
      </div>}
      <div style={{display:'flex',gap:10}}><button className="btn btn-g" style={{flex:1}} onClick={()=>setAddM(false)}>Cancelar</button><button className="btn btn-p" style={{flex:1}} onClick={addRow}><Save size={14}/> Salvar Dia</button></div>
    </Modal>
  </div>;
}

// ─── PLANOS (Fix #2, #6, #7) ─────────────────────────────────────────────────
function PlanosView(){
  const {user,upgradePlan} = useAuth();
  const [billing,setBilling]=useState('monthly');
  const [payModal,setPayModal]=useState(null);
  const [loading,setLoading]=useState(false);

  // Fix #2: corrected pricing
  const plans=[
    {key:'starter',name:'Starter',icon:<Package size={22} color="#64748B"/>,color:'#64748B',priceM:1990,priceA:19900,free7:true,
     features:['1 conta bancária','Lançamentos ilimitados','5 categorias','Controle de saldo','Suporte por e-mail'],missing:['Cartões de crédito','Relatórios e gráficos','Agenda financeira','Aba Corridas']},
    {key:'plus',name:'Plus',icon:<Zap size={22} color="#22D3EE"/>,color:'#22D3EE',priceM:3990,priceA:39900,featured:true,
     features:['Até 3 contas bancárias','Até 3 cartões de crédito','Categorias ilimitadas','Relatórios e gráficos','Orçamento mensal','Agenda financeira','Metas ilimitadas','Faturas detalhadas'],missing:['Aba Corridas (motorista app)']},
    {key:'pro',name:'Pro',icon:<Crown size={22} color="#A78BFA"/>,color:'#A78BFA',priceM:5990,priceA:59900,
     features:['Contas ilimitadas','Cartões ilimitados','Tudo do plano Plus','Aba Corridas — motorista app','Exportação CSV','Histórico completo','Suporte VIP WhatsApp','Acesso antecipado'],missing:[]},
  ];
  const fC=v=>`R$ ${(v/100).toFixed(2).replace('.',',')}`;

  const handleCheckout=async(plan)=>{
    if(plan.key==='starter'){upgradePlan('starter');return;}
    setLoading(true);
    try{await redirectToStripe(plan.key,billing,user?.email||'',user?.id||'');}
    catch(e){setPayModal(plan);}
    setLoading(false);
  };

  return<div className="fi">
    <div style={{textAlign:'center',marginBottom:32}}>
      <div className="pgtitle" style={{fontSize:28,marginBottom:8}}>Escolha seu Plano</div>
      <div style={{fontSize:14,color:'var(--t3)',maxWidth:480,margin:'0 auto'}}>Comece gratuitamente por 7 dias. Cancele quando quiser.</div>
    </div>
    <div style={{display:'flex',justifyContent:'center',marginBottom:30}}>
      <div style={{display:'flex',background:'var(--bge)',border:'1px solid var(--br)',borderRadius:12,padding:4,gap:4}}>
        {[['monthly','Mensal'],['annual','Anual — 2 meses grátis 🎉']].map(([v,l])=>(
          <button key={v} className={`btn ${billing===v?'btn-p':'btn-g'}`} style={{border:'none',padding:'8px 18px',fontSize:13}} onClick={()=>setBilling(v)}>{l}</button>
        ))}
      </div>
    </div>
    <div className="g3" style={{maxWidth:920,margin:'0 auto 40px'}}>
      {plans.map(p=>(
        <div key={p.key} className="plan-card" style={{borderColor:p.featured?'var(--ac)':'var(--br)'}}>
          {/* Fix #6: proper badge not clipping */}
          {p.featured&&<div className="pop-badge">MAIS POPULAR</div>}
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14,paddingTop:p.featured?0:0}}>
            <div style={{width:42,height:42,borderRadius:12,background:p.color+'20',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{p.icon}</div>
            <div><div style={{fontFamily:'Syne',fontWeight:800,fontSize:18,color:'var(--t1)'}}>{p.name}</div></div>
          </div>
          {p.free7&&<div style={{fontSize:11,color:'var(--ok)',fontWeight:600,marginBottom:8}}>✅ 7 dias grátis, depois:</div>}
          <div style={{marginBottom:18}}>
            <span style={{fontFamily:'Syne',fontWeight:800,fontSize:28,color:p.color}}>{fC(billing==='annual'?Math.round(p.priceA/12):p.priceM)}</span>
            <span style={{fontSize:12,color:'var(--t3)'}}>/mês</span>
            {billing==='annual'&&<div style={{fontSize:11,color:'var(--ok)'}}>Anual: {fC(p.priceA)}</div>}
          </div>
          {user?.plan===p.key
            ?<div style={{width:'100%',padding:'10px',borderRadius:10,background:'var(--okd)',color:'var(--ok)',fontWeight:600,fontSize:13,display:'flex',alignItems:'center',justifyContent:'center',gap:6,marginBottom:14}}><CheckCircle size={14}/> Plano Atual</div>
            :<button className="btn" style={{width:'100%',marginBottom:14,background:p.featured?p.color:'var(--bge)',color:p.featured?'#020B15':'var(--t1)',border:`1px solid ${p.color}`,fontSize:13}} onClick={()=>handleCheckout(p)} disabled={loading}>{loading?'Aguarde...':'Assinar '+p.name}</button>
          }
          <div style={{fontSize:12,color:'var(--t2)'}}>
            {p.features.map(f=><div key={f} style={{display:'flex',alignItems:'center',gap:8,padding:'5px 0',borderBottom:'1px solid var(--br)'}}><Check size={12} color="var(--ok)"/>{f}</div>)}
            {p.missing.map(f=><div key={f} style={{display:'flex',alignItems:'center',gap:8,padding:'5px 0',opacity:.4}}><X size={12}/><s>{f}</s></div>)}
          </div>
        </div>
      ))}
    </div>
    <div style={{maxWidth:600,margin:'0 auto'}}>
      <div className="card"><div style={{display:'flex',gap:12,alignItems:'flex-start'}}>
        <Shield size={20} color="var(--ok)" style={{flexShrink:0,marginTop:2}}/>
        <div><div style={{fontWeight:700,color:'var(--t1)',marginBottom:4}}>Pagamento seguro via Stripe</div><div style={{fontSize:13,color:'var(--t3)'}}>Aceitamos cartão de crédito (até 12x), Pix e boleto. Dados protegidos por SSL. Cancele a qualquer momento sem multa.</div></div>
      </div>
      {user?.role==='admin'&&<div style={{marginTop:12,padding:'10px 14px',background:'var(--acg)',borderRadius:10,border:'1px solid var(--bra)',fontSize:12,color:'var(--ac)'}}>👑 Admin — acesso Pro completo e gratuito.</div>}
      </div>
    </div>
    {/* Fallback payment modal */}
    <Modal open={!!payModal} onClose={()=>setPayModal(null)} title={`Assinar ${payModal?.name}`}>
      {payModal&&<><div className="infobox"><Info size={14}/> Configure STRIPE_SECRET_KEY nas variáveis de ambiente da Vercel para pagamentos reais. Em modo demo, ativação direta.</div>
      <div style={{background:'var(--bge)',border:'1px solid var(--br)',borderRadius:12,padding:'16px',marginBottom:16,textAlign:'center'}}>
        <div style={{fontSize:22,marginBottom:8}}>💳 Stripe Checkout</div>
        <div style={{fontFamily:'Syne',fontWeight:800,fontSize:24,color:payModal.color,marginBottom:4}}>{fC(billing==='annual'?Math.round(payModal.priceA/12):payModal.priceM)}<span style={{fontSize:13,color:'var(--t3)'}}>/mês</span></div>
        <div style={{fontSize:12,color:'var(--t3)',marginBottom:12}}>Em produção: redireciona para Stripe Checkout Page</div>
        <div style={{display:'flex',gap:8,justifyContent:'center',flexWrap:'wrap'}}>{['Cartão de Crédito','Pix','Boleto'].map(m=><div key={m} style={{padding:'6px 14px',border:'1px solid var(--br)',borderRadius:8,fontSize:12,color:'var(--t2)'}}>{m}</div>)}</div>
      </div>
      <button className="btn btn-p" style={{width:'100%',marginBottom:8}} onClick={()=>{upgradePlan(payModal.key);setPayModal(null);}}>
        <CheckCircle size={14}/> Ativar {payModal.name} (Demo)
      </button>
      <button className="btn btn-g" style={{width:'100%'}} onClick={()=>setPayModal(null)}>Cancelar</button>
      <div style={{fontSize:11,color:'var(--t3)',textAlign:'center',marginTop:10}}>🔒 Stripe • Cancele a qualquer momento</div></>}
    </Modal>
  </div>;
}

// ─── PERFIL ───────────────────────────────────────────────────────────────────
function PerfilView({theme,setTheme}){
  const {user,logout,isAdmin}=useAuth();
  return<div className="fi">
    <div className="pgtitle">Perfil & Configurações</div><div className="pgsub">Gerencie sua conta</div>
    <div className="g2">
      <div><div className="card" style={{marginBottom:14}}>
        <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:18}}><div style={{width:50,height:50,borderRadius:14,background:'linear-gradient(135deg,var(--ac),#818CF8)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,color:'white',fontWeight:700}}>{user?.name?.[0]?.toUpperCase()||'U'}</div><div><div style={{fontFamily:'Syne',fontWeight:800,fontSize:17,color:'var(--t1)'}}>{user?.name}</div><div style={{fontSize:12,color:'var(--t3)'}}>{user?.email}</div><span className={`badge ${isAdmin?'bp':'bb'}`} style={{marginTop:4}}>{isAdmin?'👑 Admin':'👤 '+PLAN_LIMITS[user?.plan]?.label}</span></div></div>
        {['name','email'].map(f=><div key={f} className="fg"><label className="lbl">{f==='name'?'Nome':'E-mail'}</label><input className="inp" defaultValue={user?.[f]}/></div>)}
        <button className="btn btn-p"><Save size={14}/> Salvar</button>
      </div></div>
      <div><div className="card" style={{marginBottom:14}}>
        <div style={{fontFamily:'Syne',fontWeight:700,fontSize:14,marginBottom:14}}>Aparência</div>
        <div style={{display:'flex',gap:10}}>{[['dark','🌙 Escuro'],['light','☀️ Claro']].map(([v,l])=><button key={v} className={`btn ${theme===v?'btn-p':'btn-g'}`} style={{flex:1}} onClick={()=>setTheme(v)}>{l}</button>)}</div>
      </div>
      <div className="card"><div style={{fontFamily:'Syne',fontWeight:700,fontSize:14,marginBottom:14}}>Conta</div><button className="btn btn-d" style={{width:'100%'}} onClick={logout}><LogOut size={14}/> Sair</button></div></div>
    </div>
  </div>;
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
const NAV=[
  {s:'Principal',items:[{id:'dashboard',label:'Dashboard',icon:LayoutDashboard},{id:'contas',label:'Contas',icon:Wallet},{id:'lancamentos',label:'Lançamentos',icon:List},{id:'transferencias',label:'Transferências',icon:ArrowLeftRight}]},
  {s:'Cartões',items:[{id:'cartoes',label:'Cartões',icon:CreditCard},{id:'faturas',label:'Faturas',icon:Receipt}]},
  {s:'Planejamento',items:[{id:'categorias',label:'Categorias',icon:Tag},{id:'orcamento',label:'Orçamento',icon:BarChart3},{id:'metas',label:'Metas',icon:Target}]},
  {s:'Análise',items:[{id:'relatorios',label:'Relatórios',icon:BarChart3},{id:'agenda',label:'Agenda',icon:Calendar}]},
  {s:'Extras',items:[{id:'corridas',label:'Corridas 🚗',icon:Car},{id:'planos',label:'Planos',icon:Sparkles},{id:'perfil',label:'Perfil',icon:User}]},
];
const VLABELS={dashboard:'Dashboard',contas:'Contas',lancamentos:'Lançamentos',transferencias:'Transferências',cartoes:'Cartões',faturas:'Faturas',categorias:'Categorias',orcamento:'Orçamento',metas:'Metas',relatorios:'Relatórios',agenda:'Agenda',corridas:'Corridas',planos:'Planos',perfil:'Perfil'};

function Sidebar({active,setActive,theme}){
  const {user,logout}=useAuth();
  return<div className="sb">
    <div className="logo-wrap">
      <img src={LOGO_B64} alt="Masterlat" className="logo-img"/>
      <div><div className="logo-name">Masterlat</div><div className="logo-sub">Finance</div></div>
    </div>
    <nav className="nav">
      {NAV.map(g=><div key={g.s} style={{marginBottom:4}}>
        <div className="nav-lbl">{g.s}</div>
        {g.items.map(it=><div key={it.id} className={`nav-item${active===it.id?' active':''}`} onClick={()=>setActive(it.id)}>
          <it.icon size={16}/><span>{it.label}</span>{active===it.id?<span className="ndot"/>:null}
        </div>)}
      </div>)}
    </nav>
    <div className="sb-footer">
      <div style={{display:'flex',alignItems:'center',gap:8,padding:'8px 10px',borderRadius:10,background:'var(--bge)',border:'1px solid var(--br)'}}>
        <div style={{width:30,height:30,borderRadius:8,background:'linear-gradient(135deg,var(--ac),#818CF8)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:700,fontSize:13,flexShrink:0}}>{user?.name?.[0]?.toUpperCase()||'U'}</div>
        <div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontWeight:600,color:'var(--t1)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user?.name}</div><div style={{fontSize:10,color:'var(--t3)',textTransform:'uppercase',letterSpacing:.5}}>{PLAN_LIMITS[user?.plan]?.label}</div></div>
        <button style={{background:'none',border:'none',cursor:'pointer',color:'var(--t3)',display:'flex'}} onClick={logout}><LogOut size={14}/></button>
      </div>
    </div>
  </div>;
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
function AppInner(){
  const {user}=useAuth();
  const [theme,setTheme]=useState('dark');
  const [view,setView]=useState('landing'); // landing | login | register
  const [activeView,setActiveView]=useState('dashboard');
  const [data,setData]=useState({accounts:IA,transactions:ITX,creditCards:IC,invoices:IINV,categories:ICAT,budgets:IBUD,goals:IGOALS,agenda:IAGENDA,corridas:ICOR});

  // Check for stripe success redirect
  useEffect(()=>{
    const params=new URLSearchParams(window.location.search);
    if(params.get('status')==='success'){
      const plan=params.get('plan');
      if(plan&&user){import('./utils/plans').catch(()=>{/* ignore */});/* upgradePlan called after redirect */}
      window.history.replaceState({},'',window.location.pathname);
    }
  },[]);

  if(!user){
    if(view==='login'||view==='register'){
      return<AuthScreen mode={view} setMode={setView} theme={theme} setTheme={setTheme} onBack={()=>setView('landing')}/>;
    }
    return<LandingPage setView={setView} theme={theme} setTheme={setTheme}/>;
  }

  const p={data,setData,setActiveView};
  const views={
    dashboard:<DashboardView {...p}/>,contas:<ContasView {...p}/>,lancamentos:<LancamentosView {...p}/>,
    cartoes:<CartoesView {...p}/>,faturas:<FaturasView {...p}/>,categorias:<CategoriasView {...p}/>,
    orcamento:<OrcamentoView {...p}/>,metas:<MetasView {...p}/>,relatorios:<RelatoriosView {...p}/>,
    agenda:<AgendaView {...p}/>,corridas:<CorridasView {...p}/>,planos:<PlanosView/>,
    perfil:<PerfilView theme={theme} setTheme={setTheme}/>,transferencias:<LancamentosView {...p}/>,
  };

  return<div className={`app ${theme}`}>
    <style>{STYLES}</style>
    <Sidebar active={activeView} setActive={setActiveView} theme={theme}/>
    <div className="main">
      <div className="hdr">
        <div style={{fontFamily:'Syne',fontWeight:700,fontSize:15,color:'var(--t1)',flex:1}}><span style={{color:'var(--t3)',fontSize:13,fontFamily:'Outfit',fontWeight:400}}>Masterlat / </span>{VLABELS[activeView]||'Dashboard'}</div>
        <div className="sbox"><Search size={14} color="var(--t3)"/><input placeholder="Buscar..."/></div>
        <button className="ib"><Bell size={15}/></button>
        <button className="ib" onClick={()=>setTheme(t=>t==='dark'?'light':'dark')}>{theme==='dark'?<Sun size={15}/>:<Moon size={15}/>}</button>
      </div>
      <div className="content">{views[activeView]||views.dashboard}</div>
    </div>
  </div>;
}

export default function App(){
  return<AuthProvider><AppInner/></AuthProvider>;
}
