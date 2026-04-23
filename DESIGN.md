# Documento de Diseño: Smart Expense Tracker Multi-Moneda

## 1. Visión General
El **Smart Expense Tracker** es un sistema financiero personal modular diseñado para gestionar múltiples cuentas, transacciones multidivisa y ofrecer análisis en tiempo real. El sistema prioriza una experiencia de usuario "Premium" con una interfaz fluida, soporte bilingüe (ES/EN) y una arquitectura técnica robusta basada en monorepo.

---

## 2. Arquitectura del Sistema
El proyecto utiliza un enfoque de **Monorepo** para facilitar la gestión de tipos compartidos y la comunicación entre servicios.

### Componentes Principales:
1.  **Shared (Compartido):** Definiciones de tipos TypeScript (`Currency`, `Transaction`, `Account`) compartidas entre frontend y backend.
2.  **Backend (API):** API REST construida con **Express** y **SQLite**. Maneja la persistencia, validaciones con **Zod** y caché de divisas.
3.  **Frontend (Dashboard):** Aplicación **React 18** (Vite) con **Tailwind CSS**. Implementa un diseño "Glassmorphism".
4.  **Analytics Engine:** Motor independiente para monitoreo de base de datos y auditoría de transacciones de alto valor.

---

## 3. Modelo de Datos (Esquema SQLite)

El backend utiliza SQLite para una persistencia ligera y eficiente.

### Tablas:
*   **Users:** `id (PK)`, `name`, `baseCurrency`, `email`.
*   **Accounts:** `id (PK)`, `userId (FK)`, `name`, `currency` (USD, EUR, ARS, PEN), `balance`.
*   **Transactions:** `id (PK)`, `accountId (FK)`, `amount`, `type` (INCOME, EXPENSE, TRANSFER), `category`, `timestamp`, `description`, `targetAccountId (FK)`, `currency`.
*   **Budgets:** `id (PK)`, `category`, `limitAmount`, `currency`, `month`.

---

## 4. Lógica de Negocio y Conversión

### Visualización Inteligente (SmartPro Visualization)
Para mejorar la claridad financiera sin alterar la integridad de los datos:
1.  **Monto Principal:** Se muestra en la divisa nativa de la cuenta o transacción.
2.  **Monto Secundario:** Se muestra el equivalente en la `displayCurrency` del usuario utilizando un cálculo de doble paso: `visualConvert(convert(amount, native), target)`.
3.  **Lógica Condicional:** El equivalente secundario solo se muestra si la divisa nativa es diferente a la de visualización.

### Gestión de Tasas de Cambio
*   **API Real:** Integración con **ExchangeRate-API**.
*   **Caché de Servidor:** Las cotizaciones se cachean por 1 hora en memoria.
*   **Pre-warm Startup:** El servidor realiza un "calentamiento" del caché al arrancar para asegurar datos reales desde el primer segundo.

---

## 5. Herramientas Especializadas

### Calculadora Financiera
Una herramienta integral con tres modos de operación:
1.  **Conversión Simple:** Swap de divisas con tasas en tiempo real.
2.  **Compra/Venta con Spread:** Cálculo de diferencia entre puntas de mercado (spread %) y resultados netos de operación.
3.  **Comparador Multi-moneda:** Vista simultánea de un monto en todas las divisas soportadas.

### Control de Presupuestos
*   Visualización de progreso mediante gráficos de donut.
*   Alertas visuales cuando se alcanza el límite configurado por categoría.

---

## 6. Diseño UX/UI "Premium"

### Estética Visual:
*   **Glassmorphism:** Fondos semi-transparentes con desenfoque (`backdrop-blur`) en modales y tarjetas.
*   **Modo Oscuro/Claro:** Persistencia mediante localStorage y Context API.
*   **Micro-animaciones:** Transiciones suaves utilizando clases de Tailwind y Lucide Icons.

---

## 7. Optimizaciones de Rendimiento (Performance)

El sistema implementa estrategias avanzadas para garantizar una carga instantánea y una experiencia fluida:
1.  **Fuentes Locales (Self-hosting):** Eliminación de dependencia de Google Fonts mediante **Fontsource**. Esto reduce el CLS (*Cumulative Layout Shift*) y elimina peticiones DNS externas.
2.  **Code Splitting & Lazy Loading:** Las páginas se cargan bajo demanda utilizando `React.lazy` y `Suspense`, reduciendo el tamaño del bundle inicial y mejorando el LCP (*Largest Contentful Paint*).
3.  **Centralización de Datos:** Reducción de latencia de red al mover los fetches de transacciones y cotizaciones al `AppContext`, eliminando llamadas redundantes en cascada.
4.  **Carga No Bloqueante:** Estrategias de pre-conexión y carga asíncrona de activos críticos.

---

## 8. Filosofía Multi-Agente
El sistema ha sido desarrollado bajo un paradigma de **Multi-Agentes**. Consulta el documento específico para más detalles:
👉 **[Arquitectura y Desarrollo Multi-Agente](MULTI_AGENT_SYSTEM.md)**

---

## 9. Stack Tecnológico

| Capa | Tecnologías |
| :--- | :--- |
| **Infraestructura** | pnpm Workspaces, TypeScript |
| **Backend** | Node.js, Express, SQLite, Zod, Swagger, Dotenv |
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons, Recharts, Fontsource |
| **APIs Externas** | ExchangeRate-API |

---

## 10. Roadmap Actualizado
*   Integración de exportación de reportes a PDF/CSV.
*   Implementación de autenticación de usuarios (JWT).
*   Visualización avanzada de "Net Worth" histórico.
*   Soporte para transacciones recurrentes.
