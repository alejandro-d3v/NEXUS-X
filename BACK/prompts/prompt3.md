# **💰 Módulo 3 — Sistema de Créditos**

### **Prompt**

> **Objetivo:** Crear un sistema de créditos que se descuenten solo cuando el usuario use OpenAI/Gemini (no Ollama).
>
> **Instrucciones:**
>
> * Crear tabla "credit_logs": acción, créditos_consumidos, modelo_usado, fecha.
> * Crear servicio global: `credit_service.consume(user_id, amount)`.
> * Verificación antes de ejecutar tareas con IA externa.
> * Endpoint: GET /credits/me (saldo + historial)
> * Lógica:
>
>   * OpenAI/Gemini = descuenta
>   * Ollama = gratuito
>
> **Resultado:**
> Sistema de créditos funcional, auditable y conectado al módulo de IA.
