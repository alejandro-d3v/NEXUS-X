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

---

# **🔐 Módulo 2 — Autenticación, Roles y Gestión de Usuarios**

### **Prompt**

> **Objetivo:** Implementar autenticación JWT, roles (Admin, Docente, Estudiante) y CRUD de usuarios.
>
> **Instrucciones:**
>
> * Crear modelo User con campos:
>
>   * id, nombre, email, hash_password, rol, créditos (por defecto 500), created_at
> * Implementar Hash de contraseñas con passlib.
> * Implementar login (JWT) y refresh token.
> * Implementar endpoints:
>
>   * POST /register
>   * POST /login
>   * GET /me
>   * GET /users (solo Admin)
> * Middleware para proteger rutas según rol.
> * Validar emails duplicados.
>
> **Resultado:**
> Sistema completo de autenticación + control de roles + esquema de créditos iniciales.

---

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

---

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

---

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

---

# **📝 Módulo 6 — Generación de Exámenes (F/V, Selección, Respuesta corta)**

### **Prompt**

> **Objetivo:** Crear endpoint que genere exámenes educativos con IA.
>
> **Instrucciones:**
>
> * Endpoint: POST /exams/generate
> * Input: tema, nivel_académico, tipo_preguntas (FV, SM, RC), cantidad
> * Usar módulo de IA para generar el contenido.
> * Guardar el examen como Activity.
>
> **Resultado:**
> Generación completa de exámenes con IA.

---

# **📄 Módulo 7 — Resumen de Texto / Documentos**

### **Prompt**

> **Objetivo:** Crear resúmenes usando IA a partir de texto o archivo.
>
> **Instrucciones:**
>
> * Endpoint: POST /summaries
> * Input: texto o archivo PDF/DOCX
> * Extraer texto si es archivo.
> * Crear resumen con IA.
> * Guardar como Activity.
>
> **Resultado:**
> Servicio funcional de resúmenes.

---

# **📘 Módulo 8 — Rúbricas de Evaluación**

### **Prompt**

> **Objetivo:** Generar rúbricas por materia, semestre, competencias.
>
> **Instrucciones:**
>
> * Endpoint: POST /rubrics/generate
> * Input: carrera, semestre, tema, criterios
> * Generar matriz con niveles, descriptores y puntajes.
> * Guardar como Activity.
>
> **Resultado:**
> Generación automática de rúbricas educativas.

---

# **✍️ Módulo 9 — Corrección de Escritura**

### **Prompt**

> **Objetivo:** Analizar textos y corregirlos.
>
> **Instrucciones:**
>
> * Endpoint: POST /writing/correct
> * Input: texto
> * Usar IA para ortografía, gramática, estilo.
> * Devolver texto corregido + explicación opcional.
>
> **Resultado:**
> Corrector de escritura funcional.

---

# **📊 Módulo 10 — Exportación a Word y Excel**

### **Prompt**

> **Objetivo:** Implementar exportación a DOCX/XLSX.
>
> **Instrucciones:**
>
> * Endpoint: POST /export/word
> * Endpoint: POST /export/excel
> * Usar `python-docx` para Word.
> * Usar `openpyxl` para Excel.
> * Exportar contenido de actividades guardadas.
>
> **Resultado:**
> Sistema completo de exportación.

---

# **🎮 Módulo 11 — Juegos Educativos (Cuentos, Crucigramas, Sopas de Letras)**

### **Prompt**

> **Objetivo:** Crear endpoints que generen contenido lúdico educativo.
>
> **Instrucciones:**
>
> * Crear endpoints:
>
>   * POST /games/story
>   * POST /games/crossword
>   * POST /games/wordsearch
> * Generar usando IA.
> * Guardar como Activity.
>
> **Resultado:**
> Módulos de juegos listos para UI simple.

---

# **🤖 Módulo 12 — Chatbots por Área (Persistentes)**

### **Prompt**

> **Objetivo:** Crear chatbots personalizados según área o asignatura.
>
> **Instrucciones:**
>
> * Modelo ChatBot: área, instrucciones_iniciales, usuario_id
> * Endpoint para crear chatbots
> * Endpoint para conversar: /chatbots/{id}/message
> * Historial por chatbot
>
> **Resultado:**
> Sistema listo para chatbots temáticos.