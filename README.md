# 💰 Smart Expense Tracker Multi-Moneda

> Sistema financiero modular con soporte multi-moneda, análisis automático de gastos, conversión en tiempo real y una interfaz premium completa con ayuda contextual bilingüe.

![Stack](https://img.shields.io/badge/Node.js-Express-green?logo=nodedotjs)
![Stack](https://img.shields.io/badge/React-Vite-blue?logo=react)
![Stack](https://img.shields.io/badge/TypeScript-Monorepo-blue?logo=typescript)
![Stack](https://img.shields.io/badge/SQLite-Database-lightgrey?logo=sqlite)
![Stack](https://img.shields.io/badge/ExchangeRate--API-Live%20Rates-orange)
![Stack](https://img.shields.io/badge/i18n-ES%20%7C%20EN-blueviolet)

---

## 🏗️ Arquitectura

```
tareafinanciera/
├── shared/              # Tipos TypeScript compartidos (Currency, Transaction, etc.)
├── backend/             # API REST (Express + SQLite + Zod validation)
├── frontend/            # Dashboard UI (React + Vite + Tailwind CSS)
│   └── src/
│       ├── components/  # HelpModal, Sidebar, AnimatedBackground, Ticker
│       ├── pages/       # Dashboard, Transactions, Accounts, Analytics, Settings
│       ├── context/     # AppContext (tema, idioma, moneda base, sonidos)
│       └── i18n/        # Sistema de traducción ES/EN (translations.ts)
├── analytics-engine/    # Worker de análisis (conversión de divisas + clasificación)
├── .env.example         # Plantilla de variables de entorno
└── pnpm-workspace.yaml  # Configuración PNPM Workspaces
```

---

## ✨ Features

### 🏦 Módulo de Cuentas
- CRUD completo de cuentas bancarias y billeteras
- Soporte de divisa personalizada por cuenta (USD, EUR, ARS, PEN)
- **Balances reales**: cada transacción/transferencia actualiza el saldo en SQLite al instante
- **Transferencias** entre cuentas propias con lógica atómica en el backend
- **Vista de historial** por cuenta (click en cualquier tarjeta)
- **Privacidad Visual**: botón para ocultar/mostrar saldos con asteriscos (`****`)

### 💳 Módulo de Transacciones
- Registro de Ingresos, Gastos y Transferencias
- Selector de cuenta de origen obligatorio (actualiza balance automáticamente)
- Categorías predefinidas + creación de categorías personalizadas al vuelo
- **Modal de Recibo Detallado**: click en cualquier transacción para ver ID, cuenta, monto, hora
- Lista se refresca en vivo

### 📊 Motor de Estadísticas (Real Data)
- **Gráfico de Balance Diario** (últimos 30 días): barras duales Ingresos/Gastos con tooltips interactivos
- **Tendencia Mensual**: historial agrupado por mes con etiquetas Ahorro/Déficit
- **Categorización Real**: porcentajes calculados sobre transacciones reales
- **Normalización Multidivisa**: todas las cifras se convierten a la Moneda Base configurada antes de graficar

### 🌍 Internacionalización (i18n)
- Español e Inglés completos (incluye todo el contenido de ayuda)
- Cambio de idioma instantáneo sin recarga de página

### 🆘 Sistema de Ayuda Contextual
- Modal de ayuda `(?)` disponible en las 5 secciones de la app
- Contenido completamente bilingüe (ES/EN), reactivo al idioma activo
- Diseño premium con Glassmorphism, animaciones y botón "Entendido"

### 🎨 UI/UX Premium
- Modo Oscuro y Claro totales (incluyendo menús desplegables)
- Ticker de cotizaciones en tiempo real (ExchangeRate-API, refresco 1h)
- Efectos de sonido UI para interacciones clave
- Animaciones de entrada/salida en todos los modales
- Diseño Glassmorphism consistente

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

# Terminal 3 - Analytics Engine (opcional)
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
| `POST` | `/api/transactions` | Crear transacción (actualiza balance de cuenta) |
| `GET` | `/api/accounts` | Listar cuentas con sus saldos actuales |
| `POST` | `/api/accounts` | Crear nueva cuenta |
| `GET` | `/api/exchange-rates?base=USD` | Cotizaciones en tiempo real |
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

### Ejemplo Transferencia entre Cuentas

```json
{
  "accountId": "a1",
  "targetAccountId": "a2",
  "amount": 500,
  "type": "TRANSFER",
  "category": "Transferencia",
  "description": "Movimiento entre carteras",
  "currency": "USD"
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
| i18n | Sistema propio ES/EN en `translations.ts` |
| UI | Lucide-React, Glassmorphism, Animaciones CSS |

---

## 📅 Changelog

### v2.0.0 — Integración Transaccional Completa
- ✅ Backend actualiza saldos de cuentas en tiempo real tras cada transacción
- ✅ Transferencias entre cuentas con lógica atómica
- ✅ Modal de Recibo Detallado en Transacciones
- ✅ Vista de Historial por Cuenta en Cuentas
- ✅ Privacidad Visual (toggle ocultar/mostrar saldos)
- ✅ Motor de Estadísticas con datos reales (normalización multidivisa)
- ✅ Gráfico de Balance Diario (30 días) + Tendencia Mensual
- ✅ Sistema de Ayuda Contextual bilingüe en las 5 secciones
- ✅ Corrección de modo oscuro en todos los selectores (`<select>`)
- ✅ Internacionalización completa (40 claves de ayuda EN/ES)
