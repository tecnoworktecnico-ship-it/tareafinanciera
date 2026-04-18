# Documento de Diseño: Smart Expense Tracker Multi-Moneda

## 1. Visión General
El **Smart Expense Tracker** es un sistema financiero personal modular diseñado para gestionar múltiples cuentas, transacciones multidivisa y ofrecer análisis en tiempo real. El sistema prioriza una experiencia de usuario "Premium" con una interfaz fluida, soporte bilingüe (ES/EN) y una arquitectura técnica robusta basada en monorepo.

---

## 2. Arquitectura del Sistema
El proyecto utiliza un enfoque de **Monorepo** para facilitar la gestión de tipos compartidos y la comunicación entre servicios.

### Componentes Principales:
1.  **Shared (Compartido):** Contiene las definiciones de tipos TypeScript (`Currency`, `Transaction`, `Account`) utilizadas por el frontend y el backend para garantizar la integridad de los datos en todo el sistema.
2.  **Backend (API):** Una API REST construida con **Express** y **SQLite**. Maneja la persistencia de datos, validaciones con **Zod** y la lógica atómica para transferencias entre cuentas.
3.  **Frontend (Dashboard):** Una aplicación **React** moderna (Vite) con **Tailwind CSS**. Implementa un diseño "Glassmorphism" con animaciones fluidas y un sistema de ayuda contextual bilingüe.
4.  **Analytics Engine:** Un motor independiente encargado de la normalización de divisas y la clasificación automática de gastos utilizando datos de **ExchangeRate-API**.

---

## 3. Modelo de Datos (Esquema SQLite)

El backend utiliza SQLite para una persistencia ligera y eficiente.

### Tablas:
*   **Users:** `id (PK)`, `name`, `baseCurrency`, `email`.
*   **Accounts:** `id (PK)`, `userId (FK)`, `name`, `currency` (USD, EUR, ARS, PEN), `balance`.
*   **Transactions:** `id (PK)`, `accountId (FK)`, `amount`, `type` (INCOME, EXPENSE, TRANSFER), `category`, `timestamp`, `description`, `targetAccountId (FK)`, `currency`.

---

## 4. Flujos Clave

### Registro de Transacciones y Actualización de Balance
Cuando se registra una transacción:
1.  Se valida el payload con **Zod** en el backend.
2.  Se inserta el registro en la tabla `Transactions`.
3.  **Lógica Atómica:** Se actualiza el `balance` de la cuenta origen (y destino si es transferencia) dentro de la misma transacción de base de datos para evitar inconsistencias.

### Normalización Multidivisa en Estadísticas
Para mostrar gráficos coherentes:
1.  El sistema obtiene las tasas de cambio actuales vía `/api/exchange-rates`.
2.  Todas las transacciones históricas se convierten temporalmente a la **Moneda Base** configurada por el usuario antes de ser agregadas en los gráficos de "Balance Diario" o "Tendencia Mensual".

---

## 5. Diseño UX/UI "Premium"

### Estética Visual:
*   **Glassmorphism:** Uso de fondos semi-transparentes con desenfoque (`backdrop-blur`) en modales y tarjetas.
*   **Modo Oscuro/Claro:** Implementado a nivel de Context API de React, afectando incluso a elementos nativos como selectores.
*   **Micro-animaciones:** Transiciones suaves de entrada/salida para modales y efectos hover reactivos.

### Accesibilidad y Ayuda:
*   **Sistema i18n:** Soporte completo para Español e Inglés sin recarga de página.
*   **Ayuda Contextual:** Modales de ayuda específicos en cada sección (Cuentas, Transacciones, Estadísticas) para guiar al usuario.

---

## 6. Filosofía Multi-Agente
El sistema ha sido concebido y desarrollado bajo un paradigma de **Multi-Agentes**. Esto aplica tanto a la arquitectura del software (servicios autónomos) como al proceso de creación asistido por IA.

Para una exploración profunda de cómo interactúan estos agentes, consulta el documento:
👉 **[Arquitectura y Desarrollo Multi-Agente](MULTI_AGENT_SYSTEM.md)**

---

## 7. Stack Tecnológico

| Capa | Tecnologías |
| :--- | :--- |
| **Infraestructura** | pnpm Workspaces, TypeScript |
| **Backend** | Node.js, Express, SQLite, Zod, Swagger |
| **Frontend** | React 18, Vite, Tailwind CSS, Context API |
| **Iconografía** | Lucide-React |
| **Validación** | Zod (Backend/Shared) |
| **APIs Externas** | ExchangeRate-API |

---

## 7. Próximos Pasos (Roadmap)
*   Integración de exportación de reportes a PDF/CSV.
*   Soporte para presupuestos mensuales por categoría.
*   Implementación de autenticación de usuarios (JWT).
*   Visualización avanzada de "Net Worth" histórico.
