# Arquitectura y Desarrollo Multi-Agente

Este documento profundiza en el enfoque de agentes utilizado tanto en la arquitectura técnica del software como en el proceso de desarrollo asistido por IA.

---

## 1. El Sistema como Ecosistema de Agentes (Runtime)

En lugar de una arquitectura monolítica tradicional, el **Smart Expense Tracker** opera como un conjunto de servicios especializados que actúan como "agentes" con responsabilidades claras y autonomía operativa.

### A. El Agente de Persistencia y Orquestación (Backend API)
*   **Rol:** Guardián de la "Verdad Única" (Single Source of Truth).
*   **Comportamiento:**
    *   Gestiona el estado global del sistema (SQLite).
    *   Orquestra transacciones atómicas (ej: asegurar que el balance baje en una cuenta y suba en otra simultáneamente).
    *   Valida protocolos de comunicación (Zod) para asegurar que otros agentes envíen datos íntegros.

### B. El Agente de Inteligencia y Análisis (Analytics Engine)
*   **Rol:** Procesamiento asíncrono y enriquecimiento de datos.
*   **Comportamiento:**
    *   **Autonomía:** Se ejecuta como un proceso independiente (Worker).
    *   **Clasificador Semántico:** Analiza descripciones de texto (ej: "Netflix") e infiere categorías (ej: "Suscripciones") sin intervención humana.
    *   **Normalizador de Divisas:** Consulta APIs externas (ExchangeRate-API) de forma independiente para mantener una visión coherente del patrimonio global en la moneda base.

### C. El Agente de Interacción y Ayuda (Frontend React)
*   **Rol:** Interfaz predictiva y soporte contextual.
*   **Comportamiento:**
    *   **Reactividad:** Traduce instantáneamente todo el entorno (ES/EN).
    *   **Asistencia:** Provee un sistema de ayuda contextual bilingüe que "entiende" en qué sección se encuentra el usuario.

---

## 2. El Proceso de Desarrollo Multi-Agente (Development)

La creación de este monorepo fue el resultado de una colaboración entre múltiples capacidades de IA (Agentes), cada uno enfocado en una etapa del ciclo de vida del software:

### 🛠️ Agente Arquitecto
Diseñó la estructura del monorepo, los Workspaces de PNPM y la separación de preocupaciones (`shared`, `backend`, `frontend`, `analytics`). Su objetivo fue la escalabilidad y la limpieza del código.

### 🎨 Agente de Diseño y UX
Encargado de la estética "Premium". Implementó el sistema visual de Glassmorphism, las micro-animaciones CSS y aseguró que el modo oscuro fuera consistente en todos los componentes.

### ⚙️ Agente de Ejecución y Lógica
Implementó los endpoints del backend, la lógica de base de datos y el motor de estadísticas. Se centró en la robustez y en que los balances reales se actualizaran correctamente.

### 📚 Agente de Documentación y QA
Sincronizó los cambios, creó el README profesional, el Documento de Diseño y este sistema de documentación de agentes. Realizó pruebas de integridad para asegurar que el sistema fuera fácil de instalar y entender.

---

## 3. Protocolos de Comunicación
Para que estos agentes (tanto de software como de IA) trabajen en armonía, se utilizan **protocolos compartidos**:
1.  **Shared Types:** El paquete `@finan/shared` es el lenguaje común.
2.  **API Contract:** El archivo `api_contract.json` (Swagger) define el contrato de servicios.
3.  **Environment Sync:** El archivo `.env.example` asegura que todos los agentes conozcan su configuración necesaria (API Keys, Puertos).

---

## 4. El Futuro: Agentes Autónomos Reales
El sistema está preparado para evolucionar hacia:
*   **Auto-Categorización por LLM:** Reemplazar el clasificador simple por un agente que use modelos de lenguaje para entender gastos complejos.
*   **Alertas Predictivas:** Un agente que aprenda patrones de gasto y notifique desviaciones del presupuesto de forma proactiva.
