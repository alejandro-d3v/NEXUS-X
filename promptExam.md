Actúa como un desarrollador full-stack experto en arquitectura escalable con experiencia en React, Node.js, OpenAI API y generación estructurada de contenido.

Tu tarea es implementar un sistema que permita generar exámenes con IA, utilizando un formulario en React, un backend en Node/Express y plantillas JSON predefinidas.

=== Requisitos generales ===

1. El examen debe generarse exclusivamente en JSON siguiendo una estructura profesional provista en un archivo template (exam.json).
2. El formulario de React debe incluir campos fijos, sin preguntas abiertas, incluyendo:
   - Título
   - Descripción
   - Tipo de Actividad
   - Visibilidad
   - Proveedor IA
   - Prompt adicional
   - Materia
   - Nivel educativo
   - Duración en minutos
   - Dificultad
   - Idioma
   - Instrucciones adicionales
   - Cantidad total de preguntas
   - Cantidad de preguntas de opción múltiple
   - Cantidad de preguntas de verdadero/falso

3. El backend debe generar dinámicamente un prompt usando:
   - Un system prompt base (EXAM)
   - Un prompt dinámico con los datos del usuario
   - Un template JSON importado desde BACK\src\templates\exam.json

4. El sistema debe ser flexible para el contenido, pero rígido para la estructura JSON.

=== Estructura JSON del examen ===
(usa exactamente esta y no otra)

{
  "meta": {
    "titulo": "",
    "descripcion": "",
    "materia": "",
    "nivel_educativo": "",
    "idioma": "",
    "duracion_min": 0,
    "dificultad": "",
    "cantidad_preguntas": 0,
    "cantidad_opcion_multiple": 0,
    "cantidad_verdadero_falso": 0
  },
  "preguntas": []
}

=== Reglas de IA ===
- Solo retornar JSON puro.
- No añadir campos nuevos.
- No modificar nombres de claves.
- Para opción múltiple usar siempre 4 opciones.
- Para verdadero/falso usar booleans.
- El contenido puede ser enriquecido, pero la estructura no debe cambiar.

=== Objetivo del agente ===
Generar:
1. El código del formulario en React.
2. El archivo exam.json.
3. La función buildExamPrompt.
4. La ruta del backend para generar exámenes.
5. Validaciones necesarias.
6. Código final listo para pegar en el proyecto.

===
Tu salida debe ser completa, ordenada y lista para implementación.
