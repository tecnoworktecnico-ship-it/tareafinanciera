# 💰 Smart Expense Tracker Multi-Moneda

> Sistema financiero modular con soporte multi-moneda, análisis automático de gastos y conversión en tiempo real.

![Stack](https://img.shields.io/badge/Node.js-Express-green?logo=nodedotjs)
![Stack](https://img.shields.io/badge/React-Vite-blue?logo=react)
![Stack](https://img.shields.io/badge/TypeScript-Monorepo-blue?logo=typescript)
![Stack](https://img.shields.io/badge/SQLite-Database-lightgrey?logo=sqlite)
![Stack](https://img.shields.io/badge/ExchangeRate--API-Live%20Rates-orange)

---

## 🏗️ Arquitectura

```
tareafinanciera/
├── shared/              # Tipos TypeScript compartidos (Currency, Transaction, etc.)
├── backend/             # API REST (Express + SQLite + Zod validation)
├── frontend/            # Dashboard UI (React + Vite + Tailwind + Material Design)
├── analytics-engine/    # Worker de análisis (conversión de divisas + clasificación)
├── .env.example         # Plantilla de variables de entorno
└── pnpm-workspace.yaml  # Configuración PNPM Workspaces
```

## ✨ Features

- 📊 **Dashboard** con resumen de balance, ingresos y gastos
- 💱 **Multi-moneda**: USD, EUR, ARS, PEN con conversión real vía ExchangeRate-API
- 🧠 **Clasificación automática** de gastos por categoría (Alimentación, Transporte, etc.)
- ✅ **Validación full-stack** con Zod (backend) y validación inline (frontend)
- 📄 **API Contract** auto-generado con Swagger/OpenAPI en `/docs`

---

## 🚀 Instalación

### Prerrequisitos
- Node.js 18+
- PNPM (`npm install -g pnpm`)

### 1. Clonar e instalar dependencias

```bash
git clone https://github.com/tecnoworktecnico-ship-it/tareafinanciera.git
cd tareafinanciera
pnpm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita `.env` y completa los valores:

```env
EXCHANGE_RATE_API_KEY=tu_api_key_aqui   # https://exchangerate-api.com (free)
BACKEND_PORT=3001
DEFAULT_BASE_CURRENCY=USD
```

### 3. Levantar los servicios (3 terminales)

```bash
# Terminal 1 - Backend API
cd backend && pnpm run dev

# Terminal 2 - Frontend Dashboard
cd frontend && pnpm run dev

# Terminal 3 - Analytics Engine
cd analytics-engine && pnpm run dev
```

El dashboard estará disponible en **http://localhost:5173**  
La API REST en **http://localhost:3001**  
Documentación Swagger en **http://localhost:3001/docs**

---

## 🔌 API Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/transactions` | Listar transacciones |
| `POST` | `/api/transactions` | Crear transacción (validado) |
| `GET` | `/api/accounts` | Listar cuentas |
| `POST` | `/api/accounts` | Crear cuenta |
| `GET` | `/api/config` | Configuración del sistema |

### Ejemplo POST `/api/transactions`

```json
{
  "accountId": "a1",
  "amount": 150.50,
  "type": "EXPENSE",
  "category": "Alimentación",
  "description": "Supermercado",
  "currency": "ARS"
}
```

**Errores 400** cuando el payload es inválido:
```json
{
  "error": "Datos inválidos",
  "details": [{ "message": "Moneda no soportada. Use USD, EUR, ARS o PEN." }]
}
```

---

## 🧪 Testear la API de divisas

```bash
cd analytics-engine
npx tsx src/test-api.ts
```

Output esperado:
```
✅ Conexión exitosa. El Analytics Engine lee la cotización real.
💵 1 USD = 0.8477 EUR
💵 1 USD = 1358.52 ARS
💵 1 USD = 3.3798 PEN
```

---

## 🛡️ Seguridad

- El archivo `.env` está excluido del repositorio via `.gitignore`
- **Nunca** subas tu API key a GitHub
- Usa `.env.example` como referencia para nuevos colaboradores

---

## 📌 Tecnologías

| Capa | Stack |
|------|-------|
| Backend | Node.js, Express, SQLite, Zod, Swagger |
| Frontend | React 18, Vite, Tailwind CSS, TypeScript |
| Analytics | Node.js, TypeScript, ExchangeRate-API |
| Shared | TypeScript types, PNPM Workspaces |
