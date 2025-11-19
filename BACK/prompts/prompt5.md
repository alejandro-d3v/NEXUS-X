# **📚 Módulo 5 — Actividades Educativas (CRUD + Historial + Visibilidad)**

### **Prompt**

> **Objetivo:** Implementar almacenamiento de actividades generadas por los docentes.
>
> **Instrucciones:**
>
> * Modelo Activity:
>
>   * id, creador_id, titulo, tipo, contenido, es_publica, fecha
> * Endpoints:
>
>   * POST /activities
>   * GET /activities/mine
>   * GET /activities/public
>   * GET /activities/{id}
>   * DELETE /activities/{id}
> * Un docente puede marcar su actividad como pública o privada.
> * Se debe registrar todo en historial.
>
> **Resultado:**
> Base de almacenamiento de actividades lista para integrar IA y exportaciones.