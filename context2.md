## 📚 Resumen de contexto para el proyecto

**Nombre clave del proyecto**: *Project NexusX*

**Visión general**
Estamos desarrollando una **plataforma web educativa potenciada por IA**, orientada a docentes, estudiantes y administradores. El objetivo es ofrecer una solución integral con herramientas inteligentes para la creación, gestión y distribución de actividades pedagógicas, aprovechando modelos de lenguaje (LLM) como los de OpenAI, Gemini o incluso sistemas locales (por ejemplo Ollama).

**Inspiración / referencia**
Nuestra plataforma se inspira en dos plataformas existentes:

* **EdutekaLab (edtk.co):** Una suite de herramientas educativas enriquecidas con IA que permite a los docentes generar planes de clase, diseñar cursos, crear rúbricas de evaluación, gamificar, contar con asistentes pedagógicos especializados y más. Según su sitio, todas las herramientas son gratuitas y están pensadas para ahorrar tiempo, personalizar la enseñanza y facilitar la planificación pedagógica. ([https://edtk.co/][1])
* **MagicSchool.ai:** Una plataforma generativa de IA diseñada por y para educadores, con decenas de herramientas especializadas (planes de clases, rúbricas, evaluaciones, IEPs, mensajes, feedback a estudiantes, etc.). Está orientada a reducir la carga laboral docente y aumentar la eficiencia pedagógica, manteniendo estándares de seguridad y privacidad. ([https://app.magicschool.ai/][2])

**Cómo nuestra plataforma se diferencia o amplía estas referencias**
Basándonos en las funcionalidades que planeas (exámenes, resúmenes, actividades, chatbot, juegos, etc.), nuestro proyecto va más allá, integrando:

* **Un sistema de créditos**: cada docente o estudiante tiene un “saldo” de créditos (500 de base) que se debita cuando usa modelos externos (API). Así, fomentamos un uso responsable de recursos.
* **Histórico compartido de actividades**: cada actividad generada queda registrada, de modo que otros docentes de la misma área puedan reutilizar, adaptar o inspirarse en ella.
* **Control de visibilidad**: el docente decide si publicar su actividad de forma pública (para otros docentes) o mantenerla privada.
* **Exportación de contenido**: todas las actividades deben poder exportarse a Word o Excel según el tipo (cuestionarios, exámenes, rúbricas, reportes, etc.).
* **Variedad de herramientas pedagógicas**: incluye generación de exámenes (F/V, selección múltiple, respuesta corta), resúmenes de textos largos, creación de presentaciones, corrección de escritura, generación de correos, encuestas, chatbots por materia, y una sección lúdica con juegos (cuentos personalizados, crucigramas, sopa de letras).

**Arquitectura técnica (visión)**

* **Base de datos**: Utilizamos MySQL o PostgreSQL para manejar usuarios (roles: docente, estudiante, admin), sus créditos, y el historial de actividades generadas.
* **Integración de IA**: Soporte para múltiples backends:

  1. **Ollama** (modelo local, para versiones self-hosted)
  2. **API de OpenAI / Gemini** (para quienes usen servicios en la nube)
* **Frontend / Backend**: Web app donde los usuarios inician sesión, generan contenido, visualizan el historial, y exportan sus actividades.
* **Seguridad y permisos**: sistema de roles robusto para definir qué ve cada tipo de usuario.
* **Exportación**: librerías para convertir los contenidos generados a formatos Word (.docx) y Excel (.xlsx).

**Beneficios esperados**

* Ahorro significativo de tiempo para los docentes.
* Reutilización y colaboración de recursos pedagógicos entre docentes.
* Aprendizaje más personalizado para estudiantes, con herramientas IA potentes pero accesibles.
* Promoción de la innovación docente (gamificación, chatbots, actividades creativas).
* Control de uso de recursos de IA con sistema de créditos.

**Métricas de éxito inicial**

* Número de docentes registrados y activos.
* Cantidad de actividades generadas por mes.
* Uso de créditos (cuántos se consumen por docente / mes).
* Número de exportaciones a Word / Excel.
* Feedback de usuarios sobre utilidad, usabilidad y fiabilidad.

[1]: https://edtk.co/ "edtk"
[2]: https://app.magicschool.ai/ "MagicSchool.ai"
