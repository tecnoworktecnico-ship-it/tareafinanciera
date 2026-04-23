# Arquitectura y Desarrollo Multi-Agente

Este documento profundiza en el enfoque de agentes utilizado tanto en la arquitectura técnica del software como en el proceso de desarrollo asistido por IA.

---

## 1. El Sistema como Ecosistema de Agentes (Runtime)

En lugar de una arquitectura monolítica tradicional, el **Smart Expense Tracker** opera como un conjunto de servicios especializados que actúan como "agentes" con responsabilidades claras y autonomía operativa.

### A. El Agente de Persistencia y Orquestación (Backend API)
*   **Rol:** Guardián de la "Verdad Única" (Single Source of Truth).
*   **Comportamiento:**
    *   Gestiona el estado global del sistema (SQLite).
    *   Orquestra transacciones atómicas.
    *   **Pre-warm Logic:** Al despertar, consulta proactivamente a agentes externos (ExchangeRate-API) para sincronizar el estado global.

### B. El Agente de Auditoría Proactiva (Analytics Engine)
*   **Rol:** Monitoreo y detección de anomalías.
*   **Comportamiento:**
    *   **Detección de Alto Valor:** Identifica transacciones que superan umbrales críticos y genera alertas de auditoría.
    *   **Normalización Asíncrona:** Mantiene una base de datos analítica coherente sin bloquear la interfaz de usuario.

### C. El Agente de Soporte y Herramientas (Frontend React)
*   **Rol:** Interfaz predictiva y asistencia financiera.
*   **Comportamiento:**
    *   **Doble Visualización:** Agente de presentación que traduce montos nativos a valores visuales equivalentes.
    *   **Calculadora Especializada:** Provee herramientas de decisión (Compra/Venta, Comparador) basadas en el estado global.

---

## 2. El Proceso de Desarrollo Multi-Agente (Development)

La creación de este monorepo fue el resultado de una colaboración entre múltiples capacidades de IA (Agentes):

### 🛠️ Agente Arquitecto
Diseñó la estructura del monorepo y la jerarquía de dependencias. Implementó el sistema de **SmartPro Visualization** para manejar múltiples divisas sin ensuciar la base de datos.

### 🎨 Agente de Diseño y UX
Encargado de la estética "Premium" y la integración de herramientas como la **Calculadora Financiera**, asegurando consistencia visual en cada nueva funcionalidad.

### ⚙️ Agente de Ejecución y QA
Encargado de la robustez del sistema. Solucionó problemas de colisión de puertos, dependencias faltantes y aseguró que el flujo de datos entre el `Shared` y los servicios fuera impecable.

---

## 3. Protocolos de Comunicación
Para que estos agentes trabajen en armonía, se utilizan **protocolos compartidos**:
1.  **Shared Types:** El paquete `@finan/shared` es el lenguaje común.
2.  **API Contract:** Swagger define el contrato de servicios.
3.  **Unified Dev Protocol:** El comando `pnpm dev` en el root actúa como orquestador de arranque para todos los agentes del monorepo.

---

## 4. El Futuro: Agentes Autónomos Reales
El sistema está preparado para evolucionar hacia:
*   **Auto-Categorización por LLM:** Entender el contexto semántico de los gastos.
*   **Agente de Ahorro:** Sugerencias proactivas basadas en patrones detectados por el Analytics Engine.
