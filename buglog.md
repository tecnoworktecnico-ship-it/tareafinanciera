# 🐛 BugLog - Smart Expense Tracker

Este documento registra los errores encontrados durante la transición a la versión "Pro" y su estado de resolución.

| ID | Descripción | Estado | Resolución |
|----|-------------|--------|------------|
| 001 | Error de sintaxis en `analytics-engine` debido a Enums de TS en modo native Node. | ✅ Resuelto | Se añadió un `tsconfig.json` dedicado para forzar el tipado correcto de TS-Node. |
| 002 | VITE cambió el puerto predeterminado a 5174 porque el 5173 estaba ocupado. | 💡 Informativo | No requiere acción, pero se actualizó la comunicación al usuario. |
| 003 | Error Circular en CSS: `@apply font-manrope` fallaba. | ✅ Resuelto | Se cambió a CSS puro `font-family` para evitar conflicto con la utilidad de Tailwind. |
| 004 | Falta de símbolos monetarios ($) en algunas vistas Pro. | ✅ Resuelto | Implementado en el rediseño Pro de todos los componentes. |
| 005 | El `analytics-engine` no monitorizaba datos reales. | ✅ Resuelto | Se rediseñó como un agente que lee el esquema de la base de datos (Backend Sync). |
| 008 | Dashboard/Analytics/Budgets | ✅ Resuelto | `visualConvert is not defined`: Se corrigió la desestructuración de `useAppContext` en todas las páginas. |
| 009 | General | ✅ Resuelto | Etiqueta duplicada "ARS ARS": `formatMoney` concatenaba manualmente el código de moneda. Se corrigió usando `Intl.NumberFormat`. |
| 010 | Conversion | ✅ Resuelto | Lógica invertida en cambio de base: El pivot no estaba anclado a ARS. Implementado Pivot ARS Fijo. |
| 011 | Dashboard | ✅ Resuelto | `react-router-dom` missing: El proyecto usa navegación interna por estados (`setTab`). Se eliminó la dependencia incorrecta. |
| 012 | Backend | ✅ Resuelto | `dotenv` no cargado: La API Key no llegaba a `process.env`. Se integró `dotenv` al inicio de `index.ts`. |
| 013 | Backend Cache | ✅ Resuelto | Valores fallback persistentes por 1 hora. Se implementó un "Pre-warm" inicial al arrancar el servidor. |
| 014 | Browser Security | ✅ Resuelto | Error `chrome-error://chromewebdata/` por colisión de procesos. Se mataron procesos huérfanos y se reinició con `pnpm dev`. |
| 015 | Analytics | ✅ Resuelto | `ReferenceError: t is not defined` en `ActivityStats`. Se añadió `useAppContext` al sub-componente. |
| 016 | Transactions | ✅ Resuelto | El botón de ayuda no hacía nada. Se añadió el componente `<HelpModal>` al JSX que faltaba. |

