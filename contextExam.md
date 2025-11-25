# ✅ **1. TEMPLATE JSON PROFESIONAL (SALIDA DE LA IA)**

Este será el archivo base para **examen.json** en el backend.

**`BACK\src\templates\exam.json`**

```json
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
  "preguntas": [
    {
      "id": 1,
      "tipo": "opcion_multiple",
      "enunciado": "",
      "opciones": ["", "", "", ""],
      "respuesta_correcta": 0
    },
    {
      "id": 2,
      "tipo": "verdadero_falso",
      "enunciado": "",
      "respuesta_correcta": true
    }
  ]
}
```

✔ **Escalable**
✔ **Compatible con LMS o motores de exámenes**
✔ **Estructura estricta pero contenido flexible**

---

# ✅ **2. FORMULARIO REACT (VERSIÓN SIMPLE PERO COMPLETO)**

Aquí añado solo lo necesario sin dar campos abiertos al usuario.

**Nuevos campos agregados:**

* cantidad total de preguntas
* cantidad de preguntas OM
* cantidad de preguntas VF

**Opcionalmente validaciones:**

* OM + VF = total

---

### **Código sugerido (React / Typescript)**

```tsx
const ExamForm = () => {
  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    tipoActividad: "EXAM",
    visibilidad: "privada",
    proveedorIA: "openai",
    promptAdicional: "",
    materia: "",
    nivelEducativo: "",
    duracion: 0,
    dificultad: "",
    idioma: "",
    instruccionesAdicionales: "",
    cantidadPreguntas: 10,
    cantidadOM: 5,
    cantidadVF: 5
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <form>
      {/* Campos existentes… */}

      <label>Total de Preguntas</label>
      <input
        type="number"
        name="cantidadPreguntas"
        value={form.cantidadPreguntas}
        onChange={handleChange}
      />

      <label>Preguntas de Opción Múltiple</label>
      <input
        type="number"
        name="cantidadOM"
        value={form.cantidadOM}
        onChange={handleChange}
      />

      <label>Preguntas de Verdadero/Falso</label>
      <input
        type="number"
        name="cantidadVF"
        value={form.cantidadVF}
        onChange={handleChange}
      />

      {/* Botón de enviar */}
    </form>
  );
};
```

---

# ✅ **3. GENERACIÓN DE PROMPT EN BACKEND (SIMPLE + AUTOMÁTICO)**

Tu `getSystemPrompt('EXAM')` queda igual.
Solo agregamos un generador dinámico basado en todos los campos.

---

### **A. Prompt base del sistema (ya lo tienes):**

```
Eres un asistente educativo experto en crear exámenes. 
Genera contenido en formato JSON con preguntas, opciones y respuestas correctas.
Sigue estrictamente la estructura JSON proporcionada. 
Responde únicamente con JSON válido y nada más.
```

---

### **B. Prompt dinámico generado por el backend**

Se genera combinando:

* Campos del usuario
* Template JSON del examen
* Reglas de IA

**Ejemplo de función para Node/Express:**

```ts
private buildExamPrompt(data: AIGenerationRequest) {
  return `
Genera un examen en formato JSON utilizando la siguiente estructura fija:

${JSON.stringify(examTemplate, null, 2)}

Rellena todos los campos con contenido original y educativo.

### Parámetros del examen:

Título: ${data.titulo}
Descripción: ${data.descripcion}
Materia: ${data.materia}
Nivel educativo: ${data.nivelEducativo}
Idioma: ${data.idioma}
Duración: ${data.duracion} minutos
Dificultad: ${data.dificultad}

Cantidad total de preguntas: ${data.cantidadPreguntas}
Cantidad de opción múltiple: ${data.cantidadOM}
Cantidad de verdadero/falso: ${data.cantidadVF}

### Reglas:

- Usa exclusivamente la estructura JSON proporcionada.
- No cambies nombres de claves.
- No añadas campos nuevos.
- Las preguntas pueden ser creativas pero deben ser apropiadas al nivel educativo.
- Para opción múltiple, incluye exactamente 4 opciones.
- Para VF, la respuesta_correcta debe ser true o false (boolean).
- Todas las preguntas deben estar numeradas correctamente.
- No escribas explicación, solo JSON puro.
- Puedes enriquecer enunciados de manera flexible, pero sin romper el formato.

${data.instruccionesAdicionales ?? ""}
  `;
}
```

---

# ✅ **4. FLUJO COMPLETO EN BACKEND**

### 1. El front manda:

```json
{
  "type": "EXAM",
  "titulo": "Examen de Biología",
  "descripcion": "Evaluación sobre células",
  "materia": "Biología",
  "nivelEducativo": "Secundaria",
  "idioma": "Español",
  "duracion": 45,
  "dificultad": "media",
  "cantidadPreguntas": 10,
  "cantidadOM": 6,
  "cantidadVF": 4
}
```

### 2. Backend crea el prompt dinámico + system prompt

### 3. Backend envía a OpenAI

### 4. IA responde:

* JSON válido
* Basado en template
* Sin texto adicional

### 5. Backend valida JSON y entrega respuesta al front