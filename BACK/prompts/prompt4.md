# **🤖 Módulo 4 — Módulo de IA (Ollama + OpenAI + Gemini)**

### **Prompt**

> **Objetivo:** Crear un servicio unificado para manejar modelos de IA locales (Ollama) y externos (OpenAI/Gemini).
>
> **Instrucciones:**
>
> * Crear clase abstracta IAProvider.
> * Implementar los providers:
>
>   * OllamaProvider
>   * OpenAIProvider
>   * GeminiProvider
> * Endpoint: POST /ai/generate
>
>   * Campos: modelo, prompt, temperatura
> * Descontar créditos solo si el provider ≠ ollama.
> * Hacer que todos los demás módulos usen este servicio.
>
> **Resultado:**
> Sistema unificado de IA reutilizable en todas las herramientas del proyecto.
