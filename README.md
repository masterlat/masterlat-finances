# Masterlat Finance v3.0 — Guia de Deploy

## 🚀 Deploy na Vercel (5 passos)

### 1. Faça upload para o GitHub
```bash
cd masterlat-finance
git init
git add .
git commit -m "Masterlat Finance v3.0"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/masterlat-finance.git
git push -u origin main
```

### 2. Importe na Vercel
1. Acesse [vercel.com](https://vercel.com) → **New Project**
2. Importe o repositório `masterlat-finance`
3. Framework: **Vite** (detectado automaticamente)
4. Clique **Deploy**

### 3. Configure variáveis de ambiente na Vercel
Vercel Dashboard → seu projeto → **Settings → Environment Variables**

| Variável | Valor |
|----------|-------|
| `VITE_STRIPE_PK` | `pk_test_51TJZ8bRN198l519T...` |
| `STRIPE_SECRET_KEY` | `sk_test_51TJZ8bRN198l519T...` |
| `STRIPE_WEBHOOK_SECRET` | (pegar no passo 4) |
| `BASE_URL` | `https://masterlat-finance.vercel.app` |

### 4. Configure Webhook no Stripe
1. [Stripe Dashboard](https://dashboard.stripe.com) → Developers → Webhooks
2. **Add endpoint**: `https://seu-dominio.vercel.app/api/stripe-webhook`
3. Eventos: `checkout.session.completed`, `customer.subscription.deleted`
4. Copie o **Signing secret** (whsec_...) e cole em `STRIPE_WEBHOOK_SECRET`

### 5. Redesploy para aplicar variáveis
Vercel → seu projeto → **Deployments → Redeploy**

---

## 🔐 Credenciais Admin

| Campo | Valor |
|-------|-------|
| Login | `admin` |
| Senha | `Masterlat@13` |

**Admin tem acesso Pro completo sem cobrança.**

---

## 💰 Planos configurados

| Plano | Preço | Contas | Destaques |
|-------|-------|--------|-----------|
| **Starter** | R$ 19,90/mês (7 dias grátis) | 1 | Básico |
| **Plus** | R$ 39,90/mês | 3 | Relatórios, Cartões, Agenda |
| **Pro** | R$ 59,90/mês | Ilimitado | Corridas, VIP |

---

## 📂 Estrutura de Arquivos

```
masterlat-finance/
├── api/
│   ├── create-checkout-session.js   ← Stripe Checkout (serverless)
│   └── stripe-webhook.js            ← Webhook handler
├── src/
│   ├── App.jsx                      ← Toda a aplicação
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
├── vercel.json                      ← Rotas SPA + API
└── .env.example                     ← Variáveis de ambiente
```

---

## 🔧 Desenvolvimento local

```bash
npm install

# Criar .env.local com as chaves:
VITE_STRIPE_PK=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

npm run dev         # http://localhost:5173
npm run build       # Build produção
npm run preview     # Preview do build
```

---

## ✅ Fixes implementados nesta versão

1. ✅ **Landing page** antes do login com hero, features, planos e CTA
2. ✅ **Planos corrigidos**: Starter R$19,90 (7 dias grátis, 1 conta), Plus R$39,90 (3 contas), Pro R$59,90 (ilimitado)
3. ✅ **Auth completo** com localStorage, roles, trial de 7 dias
4. ✅ **Admin**: login=`admin` / senha=`Masterlat@13`
5. ✅ **Sem credenciais** expostas na tela de login/registro
6. ✅ **Badge "Mais Popular"** corrigida — cantos arredondados, texto legível
7. ✅ **Stripe integrado**: função serverless em `/api/create-checkout-session.js`
8. ✅ **Chaves Stripe** configuradas via variáveis de ambiente
9. ✅ **Datas em dd/mm/aaaa** em toda a aplicação (lançamentos, corridas, faturas)
10. ✅ **Valores em R$** com formatação automática ao digitar (sem vírgula manual)
11. ✅ **Modais fecham SOMENTE no botão X** — sem fechar ao clicar fora
12. ✅ **Logo oficial** da Masterlat no sidebar e landing page
13. ✅ **Projeto completo** pronto para GitHub → Vercel

---

## 📱 Versão Mobile (Android)

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "Masterlat Finance" "com.masterlat.finance"
npm run build
npx cap add android
npx cap open android   # Abre no Android Studio
```
