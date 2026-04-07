# Masterlat Finance v2.0

Plataforma completa de controle financeiro pessoal — React + Vite + Vercel.

## 🚀 Deploy rápido (Vercel)

### 1. Clone / Upload
```bash
# Se tiver Git:
git init && git add . && git commit -m "Masterlat Finance v2"
# Faça push para GitHub, GitLab ou Bitbucket
```

### 2. Deploy na Vercel
1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em **"New Project"**
3. Importe o repositório do GitHub
4. Configurações (Vercel detecta automaticamente):
   - Framework: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Clique **Deploy** ✅

### 3. Instalar localmente
```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # Gerar build de produção
npm run preview      # Pré-visualizar build
```

---

## 🔐 Autenticação

| Tipo       | Acesso                              |
|------------|-------------------------------------|
| **Admin**  | Email: `admin@masterlat.com` / Senha: qualquer (primeiro cadastro) |
| **Customer** | Qualquer outro email              |

- **Admin**: acesso total, não é cobrado, vê badge `👑 Admin`
- **Starter**: 1 conta, sem relatórios/corridas
- **Plus**: R$19,90/mês — 5 contas, relatórios, agenda
- **Pro**: R$39,90/mês — ilimitado + corridas

> Auth atual usa `localStorage`. Para produção, substitua por Supabase Auth ou Auth0.

---

## 💳 Integração de Pagamentos (Próximo passo)

### Mercado Pago (recomendado para Brasil)
```bash
npm install @mercadopago/sdk-react
```

No componente `PlanosView`, substitua o botão demo por:
```jsx
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';

initMercadoPago('SUA_PUBLIC_KEY');

// No render:
<Wallet initialization={{ preferenceId: '<PREFERENCE_ID>' }}/>
```

Crie preferências no seu backend:
```js
// backend/createPreference.js
const mp = new MercadoPago({ accessToken: process.env.MP_ACCESS_TOKEN });
const preference = await mp.preferences.create({
  items: [{ title: 'Masterlat Plus', quantity: 1, unit_price: 19.90 }],
  back_urls: { success: '/planos?status=success' },
  auto_return: 'approved',
});
```

### Stripe (alternativa internacional)
```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

---

## 📁 Estrutura do Projeto

```
masterlat-finance/
├── public/
│   └── favicon.svg
├── src/
│   ├── App.jsx          ← Aplicação completa (monolítica)
│   ├── main.jsx         ← Entry point
│   └── index.css        ← Reset e scrollbar
├── index.html
├── package.json
├── vite.config.js
├── vercel.json          ← Config SPA routing
└── README.md
```

---

## 🧩 Módulos implementados

- ✅ Dashboard com seletor de mês
- ✅ Contas (hide/edit/delete + upload de logo)
- ✅ Lançamentos (colunas ordenáveis, edit/delete)
- ✅ Cartões de crédito com logos SVG
- ✅ Faturas (edit data fechamento/vencimento/compras)
- ✅ Categorias com emoji picker (CRUD completo)
- ✅ Orçamento mensal
- ✅ Metas financeiras
- ✅ Relatórios com seletor de mês
- ✅ Agenda (CRUD + drag-and-drop para reordenar)
- ✅ Corridas (planilha de motorista, cálculos automáticos)
- ✅ Planos (Starter/Plus/Pro com sistema de pagamento)
- ✅ Auth (login/registro/roles admin/customer)
- ✅ Dark/Light mode

---

## 🔧 Variáveis de Ambiente (produção)

Crie `.env` na raiz:
```
VITE_MP_PUBLIC_KEY=seu_public_key_mercado_pago
VITE_STRIPE_PK=sua_public_key_stripe
VITE_API_URL=https://seu-backend.com
```

---

## 📱 Android / Mobile

Para versão Android nativa, use **Capacitor**:
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "Masterlat Finance" "com.masterlat.finance"
npm run build && npx cap add android && npx cap open android
```

---

## 💡 Próximos passos recomendados

1. **Backend** — Supabase (grátis, PostgreSQL) ou Firebase
2. **Auth real** — Supabase Auth / Auth0
3. **Pagamentos** — Mercado Pago Checkout Pro
4. **Push notifications** — Firebase Cloud Messaging
5. **Exportação CSV** — biblioteca `papaparse`
6. **Open Finance** — Belvo API ou Pluggy

---

Feito com ❤️ — Masterlat Finance v2.0
"# masterlat-finances" 
"# masterlat-finances" 
