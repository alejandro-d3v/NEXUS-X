# **📦 Módulo 1 — Arquitectura Base del Backend (FastAPI)**

### **Prompt para el agente**

> **Objetivo:** Construir la arquitectura base del backend con FastAPI usando buenas prácticas, modularidad, Clean Architecture y escalabilidad futura.
>
> **Instrucciones:**
>
> * Crear un proyecto FastAPI con estructura limpia y modular:
>
> ```
> app/
>   core/
>     config.py
>     security.py
>   api/
>     v1/
>       routers/
>       controllers/
>       schemas/
>       services/
>       repositories/
>   models/
>   db/
>     session.py
>     base.py
>   utils/
> ```
>
> * Incluir configuración para PostgreSQL usando SQLAlchemy 2.0.
> * Preparar el proyecto para agregar módulos sin romper la arquitectura.
> * Configurar CORS y variables de entorno usando python-dotenv.
> * Preparar sistema de logs estandarizado.
> * Agregar documentación automática de la API.
>
> **Resultado esperado:**
> Carpeta base del backend completamente estructurada y lista para conectar módulos adicionales.
