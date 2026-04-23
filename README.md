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

Para una visión detallada de los principios técnicos, modelos de datos y flujo del sistema, consulta el [Documento de Diseño](DESIGN.md).

```
tareafinanciera/
├── shared/              # Tipos TypeScript compartidos (Currency, Transaction, etc.)
├── backend/             # API REST (Express + SQLite + Zod validation + Cache Pre-warm)
├── frontend/            # Dashboard UI (React + Vite + Tailwind CSS)
│   └── src/
│       ├── components/  # Sidebar, Ticker, Calculator, Forms
│       ├── pages/       # Dashboard, Transactions, Accounts, Analytics, Budgets, Calculator
│       ├── context/     # AppContext (tema, idioma, moneda base, cotizaciones)
│       └── i18n/        # Sistema de traducción ES/EN
├── analytics-engine/    # Motor de auditoría y análisis proactivo
├── .env.example         # Plantilla de variables de entorno
└── pnpm-workspace.yaml  # Configuración PNPM Workspaces
```

---

## ✨ Features Premium

### 🏦 Módulo de Cuentas & Presupuestos
- **Saldos Reales**: Cada transacción actualiza el saldo en SQLite de forma atómica.
- **Doble Divisa**: Visualización simultánea del monto nativo y su equivalente en la divisa de preferencia.
- **Presupuestos**: Control de gastos por categoría con gráficos de progreso interactivos.

### 💳 Transacciones Inteligentes
- Registro multidivisa con conversión automática a moneda base para reportes.
- Historial detallado con modales de recibo.
- **Transferencias**: Movimientos entre cuentas propias con integridad garantizada.

### 📊 Análisis & Analytics
- **Visualización Proactiva**: Gráficos de balance diario, tendencia mensual y distribución por categoría.
- **Normalización**: Todas las cifras se convierten a la moneda base del usuario para comparaciones coherentes.

### 🧮 Calculadora Financiera
- **Conversión Real-time**: Intercambio rápido de divisas.
- **Compra/Venta**: Cálculo de spread y resultados netos para operaciones de cambio.
- **Comparador**: Vista de un monto en todas las monedas soportadas de un vistazo.

---

## 🚀 Instalación & Uso

### Prerrequisitos
- Node.js 18+
- PNPM (`npm install -g pnpm`)

### 1. Preparación
```bash
git clone https://github.com/tecnoworktecnico-ship-it/tareafinanciera.git
cd tareafinanciera
pnpm install
cp .env.example .env
```
*Edita `.env` y coloca tu API Key de ExchangeRate-API.*

### 2. Ejecución (Monorepo Mode)
```bash
pnpm dev
```
*Este comando levantará el Backend, el Frontend y el Analytics Engine simultáneamente.*

- **Dashboard:** http://localhost:5173
- **API Docs:** http://localhost:3001/docs

---

## 📅 Changelog Reciente

### v3.1.0 — Performance & Architecture Sync
- ⚡ **Local Font Hosting**: Migrado a Fontsource para eliminar CLS y dependencia de Google Fonts.
- ⚡ **Lazy Loading**: Implementado code splitting por ruta para mejorar el LCP.
- ⚡ **Centralización de Datos**: Sincronización global de transacciones y cotizaciones vía `AppContext`.
- ⚡ **Ticker Optimizado**: Eliminado polling redundante en el frontend.

### v3.0.0 — SmartPro Edition
- ✅ **Calculadora Financiera**: Integrada con 3 modos de operación.
- ✅ **Visualización Dual**: Monto nativo + equivalente en divisa de visualización.
- ✅ **Backend Pre-warm**: Carga de cotizaciones al inicio para evitar datos stale.
- ✅ **Control de Presupuestos**: Implementación de límites por categoría y mes.
- ✅ **Optimización de Startup**: Unificado el arranque con `pnpm dev` en el root.
- ✅ **Persistencia Refinada**: Mejoras en la persistencia de tema, idioma y divisas en el frontend.

---

## 🛡️ Seguridad & Diseño
- Diseño **Glassmorphism** moderno con soporte para Modo Oscuro.
- Validación estricta con **Zod** en todos los puntos de entrada de datos.
- Arquitectura desacoplada y orientada a servicios.
