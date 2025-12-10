import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { activityService } from '../../services/activity.service';
import { ActivityType, ActivityVisibility, AIProvider } from '../../types';
import toast from 'react-hot-toast';
import { FaSpinner } from 'react-icons/fa';

export const GenerateActivity: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: (searchParams.get('type') as ActivityType) || ActivityType.EXAM,
    visibility: ActivityVisibility.PRIVATE,
    provider: AIProvider.GEMINI,
    prompt: '',
    subject: '',
    gradeLevel: '',
    // Campos específicos para exámenes
    duration: '',
    difficulty: '',
    language: 'Español',
    additionalInstructions: '',
    cantidadPreguntas: 10,
    cantidadOM: 5,
    cantidadVF: 5,
    // Campos específicos para EMAIL
    emailPurpose: 'formal',
    emailTone: 'profesional',
    emailRecipient: '',
    emailContext: '',
    // Campos específicos para SURVEY
    surveyType: 'opinion',
    numberOfQuestions: 5,
    includeOpenQuestions: true,
    includeMultipleChoice: true,
    includeScale: false,
    // Campos específicos para WRITING_CORRECTION
    textToCorrect: '',
    correctionType: 'all',
    // Campos específicos para CHATBOT
    chatbotTopic: '',
    chatbotPersonality: 'profesional',
    chatbotKnowledgeLevel: 'experto',
    chatbotLanguage: 'Español',
    chatbotInstructions: '',
  });

  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Validación para exámenes: OM + VF = Total
  const validateExamQuestions = () => {
    if (formData.type === ActivityType.EXAM) {
      const total = Number(formData.cantidadPreguntas);
      const om = Number(formData.cantidadOM);
      const vf = Number(formData.cantidadVF);

      if (om + vf !== total) {
        setValidationError(`La suma de preguntas OM (${om}) y VF (${vf}) debe ser igual al total (${total})`);
        return false;
      }
      setValidationError('');
      return true;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar preguntas de examen antes de enviar
    if (!validateExamQuestions()) {
      return;
    }

    setLoading(true);

    try {
      // Generar prompt automáticamente si está vacío
      let generatedPrompt = formData.prompt.trim();

      if (!generatedPrompt) {
        const parts = [];

        if (formData.type === ActivityType.EXAM) {
          parts.push(`Genera un examen de ${formData.cantidadPreguntas} preguntas`);
          if (formData.subject) parts.push(`sobre ${formData.subject}`);
          if (formData.gradeLevel) parts.push(`para nivel ${formData.gradeLevel}`);
          if (formData.difficulty) parts.push(`con dificultad ${formData.difficulty}`);
          parts.push(`\\n- ${formData.cantidadOM} preguntas de opción múltiple`);
          parts.push(`\\n- ${formData.cantidadVF} preguntas de verdadero/falso`);
          if (formData.title) parts.push(`\\nTítulo: ${formData.title}`);
          if (formData.description) parts.push(`\\nDescripción: ${formData.description}`);
          if (formData.additionalInstructions) parts.push(`\\nInstrucciones adicionales: ${formData.additionalInstructions}`);
        } else if (formData.type === ActivityType.EMAIL) {
          parts.push(`Genera un correo electrónico ${formData.emailPurpose} con tono ${formData.emailTone}`);
          if (formData.emailRecipient) parts.push(`\\nDestinatario: ${formData.emailRecipient}`);
          if (formData.subject) parts.push(`\\nTema: ${formData.subject}`);
          if (formData.emailContext) parts.push(`\\nContexto: ${formData.emailContext}`);
          parts.push('\\nIncluye: asunto apropiado, saludo, cuerpo del mensaje y despedida formal');
          if (formData.description) parts.push(`\\nDetalles adicionales: ${formData.description}`);
        } else if (formData.type === ActivityType.SURVEY) {
          parts.push(`Genera una encuesta de ${formData.surveyType} con ${formData.numberOfQuestions} preguntas`);
          if (formData.subject) parts.push(`sobre ${formData.subject}`);
          if (formData.gradeLevel) parts.push(`para nivel ${formData.gradeLevel}`);
          parts.push('\\nIncluir tipos de pregunta:');
          if (formData.includeMultipleChoice) parts.push('- Opción múltiple');
          if (formData.includeOpenQuestions) parts.push('- Preguntas abiertas');
          if (formData.includeScale) parts.push('- Escalas de valoración (1-5)');
          if (formData.description) parts.push(`\\nDescripción: ${formData.description}`);
        } else if (formData.type === ActivityType.WRITING_CORRECTION) {
          parts.push('Corrige el siguiente texto');
          if (formData.correctionType === 'all') {
            parts.push('enfocándose en: ortografía, gramática, puntuación y estilo');
          } else if (formData.correctionType === 'grammar') {
            parts.push('enfocándose únicamente en gramática');
          } else if (formData.correctionType === 'spelling') {
            parts.push('enfocándose únicamente en ortografía');
          } else if (formData.correctionType === 'style') {
            parts.push('enfocándose únicamente en estilo');
          }
          parts.push(`\\nTexto a corregir:\\n${formData.textToCorrect}`);
          parts.push('\\n\\nResponde SOLO en formato JSON con esta estructura exacta:');
          parts.push('{');
          parts.push('  "texto_original": "el texto original completo",');
          parts.push('  "texto_corregido": "el texto corregido completo",');
          parts.push('  "errores": [{"descripcion": "palabra/frase errónea", "correccion": "corrección", "explicacion": "explicación del error"}],');
          parts.push('  "sugerencias_de_mejora": ["sugerencia 1", "sugerencia 2"]');
          parts.push('}');
        } else if (formData.type === ActivityType.CHATBOT) {
          // Build chatbot system prompt with topic validation
          const systemParts = [];
          systemParts.push(`Eres un chatbot experto en ${formData.chatbotTopic}.`);
          systemParts.push(`Tu función es ayudar a estudiantes y profesores respondiendo SOLO preguntas relacionadas con ${formData.chatbotTopic}.`);
          systemParts.push('');
          systemParts.push('**IMPORTANTE - VALIDACIÓN DE CONTEXTO:**');
          systemParts.push(`Si alguien te pregunta sobre temas NO relacionados con ${formData.chatbotTopic}, debes RECHAZAR educadamente la pregunta.`);
          systemParts.push('');
          systemParts.push('**Ejemplos de rechazo:**');
          systemParts.push(`- "Lo siento, soy un experto en ${formData.chatbotTopic}. Solo puedo ayudarte con preguntas sobre este tema específico."`);
          systemParts.push(`- "Esa pregunta no está relacionada con ${formData.chatbotTopic}. ¿Tienes alguna pregunta sobre ${formData.chatbotTopic}?"`);
          systemParts.push('');
          systemParts.push(`**Personalidad:** ${formData.chatbotPersonality}`);
          systemParts.push(`**Nivel de conocimiento:** ${formData.chatbotKnowledgeLevel}`);
          systemParts.push(`**Idioma:** ${formData.chatbotLanguage}`);
          
          if (formData.chatbotInstructions) {
            systemParts.push('');
            systemParts.push('**Instrucciones especiales:**');
            systemParts.push(formData.chatbotInstructions);
          }

          const systemPrompt = systemParts.join('\\n');
          const welcomeMessage = `¡Hola! Soy tu asistente experto en ${formData.chatbotTopic}. ¿En qué puedo ayudarte hoy?`;

          // Generate JSON structure for chatbot config
          parts.push('Genera la configuración del chatbot en formato JSON:');
          parts.push(JSON.stringify({
            topic: formData.chatbotTopic,
            personality: formData.chatbotPersonality,
            knowledgeLevel: formData.chatbotKnowledgeLevel,
            language: formData.chatbotLanguage,
            systemPrompt: systemPrompt,
            welcomeMessage: welcomeMessage
          }, null, 2));
        } else {
          parts.push(`Genera un(a) ${formData.type.toLowerCase()}`);
          if (formData.subject) parts.push(`sobre ${formData.subject}`);
          if (formData.gradeLevel) parts.push(`para nivel ${formData.gradeLevel}`);
          if (formData.title) parts.push(`\\nTítulo: ${formData.title}`);
          if (formData.description) parts.push(`\\nDescripción: ${formData.description}`);
        }

        generatedPrompt = parts.join(' ');
      }

      const payload: any = {
        title: formData.title,
        type: formData.type,
        visibility: formData.visibility,
        provider: formData.provider,
        prompt: generatedPrompt,
      };

      // Only add description if it has value
      if (formData.description) {
        payload.description = formData.description;
      }

      // Only add subject if relevant for this activity type and has value
      if (shouldShowSubject() && formData.subject) {
        payload.subject = formData.subject;
      }

      // Only add gradeLevel if relevant for this activity type and has value
      if (shouldShowGradeLevel() && formData.gradeLevel) {
        payload.gradeLevel = formData.gradeLevel;
      }

      // Agregar parámetros adicionales para exámenes
      if (formData.type === ActivityType.EXAM) {
        payload.additionalParams = {
          titulo: formData.title,
          descripcion: formData.description,
          materia: formData.subject,
          nivelEducativo: formData.gradeLevel,
          idioma: formData.language,
          duracion: Number(formData.duration) || 60,
          dificultad: formData.difficulty,
          cantidadPreguntas: Number(formData.cantidadPreguntas),
          cantidadOM: Number(formData.cantidadOM),
          cantidadVF: Number(formData.cantidadVF),
          instruccionesAdicionales: formData.additionalInstructions,
        };
      }

      const activity = await activityService.generateActivity(payload as any);

      toast.success('Actividad generada exitosamente');
      navigate(`/teacher/activities/${activity.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Error al generar la actividad');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    // Validar en tiempo real si es campo de examen
    if (formData.type === ActivityType.EXAM &&
      ['cantidadPreguntas', 'cantidadOM', 'cantidadVF'].includes(e.target.name)) {
      setTimeout(validateExamQuestions, 100);
    }
  };

  // Helper functions to determine which fields to show
  const shouldShowSubject = () => {
    // No mostrar subject para EMAIL y WRITING_CORRECTION
    return ![ActivityType.EMAIL, ActivityType.WRITING_CORRECTION].includes(formData.type);
  };

  const shouldShowGradeLevel = () => {
    // Solo mostrar para actividades educativas
    return [
      ActivityType.EXAM,
      ActivityType.QUIZ,
      ActivityType.SUMMARY,
      ActivityType.LESSON_PLAN,
      ActivityType.FLASHCARDS,
      ActivityType.ESSAY,
      ActivityType.PRESENTATION,
      ActivityType.WORKSHEET,
      ActivityType.PROJECT,
      ActivityType.RUBRIC,
      ActivityType.SURVEY
    ].includes(formData.type);
  };

  const shouldShowDuration = () => {
    // Solo para exámenes, quizzes y presentaciones
    return [ActivityType.EXAM, ActivityType.QUIZ, ActivityType.PRESENTATION].includes(formData.type);
  };

  const shouldShowDifficulty = () => {
    // Para actividades académicas
    return [
      ActivityType.EXAM,
      ActivityType.QUIZ,
      ActivityType.ESSAY,
      ActivityType.WORKSHEET,
      ActivityType.PROJECT
    ].includes(formData.type);
  };

  const shouldShowLanguage = () => {
    // Para actividades que requieren especificar idioma
    return [
      ActivityType.EXAM,
      ActivityType.SUMMARY,
      ActivityType.EMAIL,
      ActivityType.ESSAY,
      ActivityType.WRITING_CORRECTION
    ].includes(formData.type);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Generar Actividad con IA</h1>
        <p style={{ color: '#666', marginTop: '0.5rem' }}>
          Crea actividades educativas personalizadas utilizando inteligencia artificial
        </p>
      </div>

      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-group">
          <label className="form-label">Título *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Descripción</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="form-textarea"
            rows={3}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Tipo de Actividad *</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="form-select"
            >
              <option value={ActivityType.EXAM}>Examen</option>
              <option value={ActivityType.SUMMARY}>Resumen</option>
              <option value={ActivityType.LESSON_PLAN}>Plan de Lección</option>
              <option value={ActivityType.QUIZ}>Quiz</option>
              <option value={ActivityType.FLASHCARDS}>Tarjetas de Estudio</option>
              <option value={ActivityType.ESSAY}>Ensayo</option>
              <option value={ActivityType.PRESENTATION}>Presentación</option>
              <option value={ActivityType.WORKSHEET}>Hoja de Trabajo</option>
              <option value={ActivityType.PROJECT}>Proyecto</option>
              <option value={ActivityType.RUBRIC}>Rúbrica</option>
              <option value={ActivityType.EMAIL}>Correo Electrónico</option>
              <option value={ActivityType.SURVEY}>Encuesta</option>
              <option value={ActivityType.WRITING_CORRECTION}>Corrección de Escritura</option>
              <option value={ActivityType.CHATBOT}>Chatbot Experto</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Visibilidad *</label>
            <select
              name="visibility"
              value={formData.visibility}
              onChange={handleChange}
              className="form-select"
            >
              <option value={ActivityVisibility.PRIVATE}>Privada</option>
              <option value={ActivityVisibility.PUBLIC}>Pública</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Proveedor de IA *</label>
            <select
              name="provider"
              value={formData.provider}
              onChange={handleChange}
              className="form-select"
            >
              <option value={AIProvider.GEMINI}>Gemini</option>
              <option value={AIProvider.OPENAI}>OpenAI</option>
              <option value={AIProvider.OLLAMA}>Ollama</option>
            </select>
          </div>
        </div>

        {/* Campos contextuales - Mostrar según tipo de actividad */}
        <div className="form-row">
          {shouldShowSubject() && (
            <div className="form-group">
              <label className="form-label">Materia {[ActivityType.EXAM, ActivityType.QUIZ, ActivityType.SURVEY].includes(formData.type) ? '*' : ''}</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="form-input"
                placeholder="Ej: Matemáticas"
                required={[ActivityType.EXAM, ActivityType.QUIZ, ActivityType.SURVEY].includes(formData.type)}
              />
            </div>
          )}

          {shouldShowGradeLevel() && (
            <div className="form-group">
              <label className="form-label">Nivel Educativo</label>
              <input
                type="text"
                name="gradeLevel"
                value={formData.gradeLevel}
                onChange={handleChange}
                className="form-input"
                placeholder="Ej: Secundaria"
              />
            </div>
          )}

          {shouldShowDuration() && (
            <div className="form-group">
              <label className="form-label">Duración (minutos)</label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="form-input"
                placeholder="Ej: 60"
              />
            </div>
          )}
        </div>

        {(shouldShowDifficulty() || shouldShowLanguage()) && (
          <div className="form-row">
            {shouldShowDifficulty() && (
              <div className="form-group">
                <label className="form-label">Dificultad</label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="">Seleccionar...</option>
                  <option value="Fácil">Fácil</option>
                  <option value="Medio">Medio</option>
                  <option value="Difícil">Difícil</option>
                </select>
              </div>
            )}

            {shouldShowLanguage() && (
              <div className="form-group">
                <label className="form-label">Idioma</label>
                <input
                  type="text"
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            )}
          </div>
        )}

        {/* Campos específicos para EXÁMENES */}
        {formData.type === ActivityType.EXAM && (
          <>
            <div style={{ marginTop: '1.5rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #1a1a2e' }}>
              <h3>Configuración de Preguntas</h3>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Total de Preguntas *</label>
                <input
                  type="number"
                  name="cantidadPreguntas"
                  value={formData.cantidadPreguntas}
                  onChange={handleChange}
                  min="1"
                  max="100"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Preguntas de Opción Múltiple *</label>
                <input
                  type="number"
                  name="cantidadOM"
                  value={formData.cantidadOM}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Preguntas de Verdadero/Falso *</label>
                <input
                  type="number"
                  name="cantidadVF"
                  value={formData.cantidadVF}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  required
                  className="form-input"
                />
              </div>
            </div>

            {validationError && (
              <div className="alert alert-warning">
                ⚠️ {validationError}
              </div>
            )}
          </>
        )}

        {/* Campos específicos para EMAIL */}
        {formData.type === ActivityType.EMAIL && (
          <>
            <div style={{ marginTop: '1.5rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #1a1a2e' }}>
              <h3>Configuración del Correo Electr ónico</h3>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Propósito del Correo *</label>
                <select
                  name="emailPurpose"
                  value={formData.emailPurpose}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="formal">Formal</option>
                  <option value="informal">Informal</option>
                  <option value="comercial">Comercial</option>
                  <option value="academico">Académico</option>
                  <option value="agradecimiento">Agradecimiento</option>
                  <option value="solicitud">Solicitud</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Tono *</label>
                <select
                  name="emailTone"
                  value={formData.emailTone}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="profesional">Profesional</option>
                  <option value="amigable">Amigable</option>
                  <option value="formal">Formal</option>
                  <option value="casual">Casual</option>
                  <option value="persuasivo">Persuasivo</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Destinatario</label>
                <input
                  type="text"
                  name="emailRecipient"
                  value={formData.emailRecipient}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Ej: Cliente, Profesor, Equipo"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Contexto del Correo</label>
              <textarea
                name="emailContext"
                value={formData.emailContext}
                onChange={handleChange}
                className="form-textarea"
                rows={3}
                placeholder="Describe el contexto o situación del correo..."
              />
            </div>
          </>
        )}

        {/* Campos específicos para SURVEY */}
        {formData.type === ActivityType.SURVEY && (
          <>
            <div style={{ marginTop: '1.5rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #1a1a2e' }}>
              <h3>Configuración de la Encuesta</h3>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Tipo de Encuesta *</label>
                <select
                  name="surveyType"
                  value={formData.surveyType}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="satisfaccion">Satisfacción</option>
                  <option value="opinion">Opinión</option>
                  <option value="evaluacion">Evaluación</option>
                  <option value="investigacion">Investigación</option>
                  <option value="feedback">Feedback</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Número de Preguntas *</label>
                <input
                  type="number"
                  name="numberOfQuestions"
                  value={formData.numberOfQuestions}
                  onChange={handleChange}
                  min="1"
                  max="50"
                  required
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Tipos de Preguntas a Incluir</label>
              <div style={{ marginTop: '0.75rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="includeMultipleChoice"
                    checked={formData.includeMultipleChoice}
                    onChange={(e) => setFormData({ ...formData, includeMultipleChoice: e.target.checked })}
                    style={{ marginRight: '0.5rem' }}
                  />
                  Opción Múltiple
                </label>
                <label style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="includeOpenQuestions"
                    checked={formData.includeOpenQuestions}
                    onChange={(e) => setFormData({ ...formData, includeOpenQuestions: e.target.checked })}
                    style={{ marginRight: '0.5rem' }}
                  />
                  Preguntas Abiertas
                </label>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="includeScale"
                    checked={formData.includeScale}
                    onChange={(e) => setFormData({ ...formData, includeScale: e.target.checked })}
                    style={{ marginRight: '0.5rem' }}
                  />
                  Escalas de Valoración (1-5)
                </label>
              </div>
            </div>
          </>
        )}

        {/* Campos específicos para WRITING_CORRECTION */}
        {formData.type === ActivityType.WRITING_CORRECTION && (
          <>
            <div style={{ marginTop: '1.5rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #1a1a2e' }}>
              <h3>Configuración de Corrección de Escritura</h3>
            </div>

            <div className="form-group">
              <label className="form-label">Tipo de Corrección *</label>
              <select
                name="correctionType"
                value={formData.correctionType}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="all">Corrección Completa (Ortografía, Gramática, Estilo)</option>
                <option value="spelling">Solo Ortografía</option>
                <option value="grammar">Solo Gramática</option>
                <option value="style">Solo Estilo y Redacción</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Texto a Corregir *</label>
              <textarea
                name="textToCorrect"
                value={formData.textToCorrect}
                onChange={handleChange}
                className="form-textarea"
                rows={8}
                required
                placeholder="Pega aquí el texto que deseas corregir..."
                style={{ fontFamily: 'monospace', fontSize: '0.95rem' }}
              />
              <small style={{ color: '#666', marginTop: '0.5rem', display: 'block' }}>
                {formData.textToCorrect.length} caracteres
              </small>
            </div>
          </>
        )}

        {/* Campos específicos para CHATBOT */}
        {formData.type === ActivityType.CHATBOT && (
          <>
            <div style={{ marginTop: '1.5rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #1a1a2e' }}>
              <h3>🤖 Configuración del Chatbot Experto</h3>
            </div>

            <div className="form-group">
              <label className="form-label">Tema de Especialización * </label>
              <input
                type="text"
                name="chatbotTopic"
                value={formData.chatbotTopic}
                onChange={handleChange}
                className="form-input"
                required
                placeholder="Ej: Programación en Python, Historia de México, Biología Celular..."
              />
              <small style={{ color: '#666', marginTop: '0.5rem', display: 'block' }}>
                El chatbot solo responderá preguntas sobre este tema específico.
              </small>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Personalidad *</label>
                <select
                  name="chatbotPersonality"
                  value={formData.chatbotPersonality}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="profesional">Profesional</option>
                  <option value="amigable">Amigable y Cercano</option>
                  <option value="estricto">Estricto y Académico</option>
                  <option value="motivador">Motivador</option>
                  <option value="humoristico">Con Humor</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Nivel de Conocimiento *</label>
                <select
                  name="chatbotKnowledgeLevel"
                  value={formData.chatbotKnowledgeLevel}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="basico">Básico - Para principiantes</option>
                  <option value="intermedio">Intermedio</option>
                  <option value="experto">Experto - Nivel avanzado</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Idioma del Chatbot *</label>
                <select
                  name="chatbotLanguage"
                  value={formData.chatbotLanguage}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="Español">Español</option>
                  <option value="English">English</option>
                  <option value="Français">Français</option>
                  <option value="Deutsch">Deutsch</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Instrucciones Especiales (Opcional)</label>
              <textarea
                name="chatbotInstructions"
                value={formData.chatbotInstructions}
                onChange={handleChange}
                className="form-textarea"
                rows={4}
                placeholder="Añade instrucciones especiales sobre cómo debe comportarse el chatbot, qué enfoque debe tener, etc."
              />
            </div>
          </>
        )}

        <div className="form-group">
          <label className="form-label">Instrucciones Adicionales</label>
          <textarea
            name="additionalInstructions"
            value={formData.additionalInstructions}
            onChange={handleChange}
            className="form-textarea"
            rows={3}
          />
        </div>

        <button type="submit" disabled={loading || !!validationError} className="btn btn-primary btn-lg">
          {loading ? (
            <>
              <FaSpinner className="spinner" /> Generando...
            </>
          ) : (
            'Generar Actividad'
          )}
        </button>
      </form>
    </div>
  );
};
