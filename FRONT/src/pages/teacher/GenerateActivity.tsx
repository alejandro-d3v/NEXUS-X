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
        description: formData.description,
        type: formData.type,
        visibility: formData.visibility,
        provider: formData.provider,
        prompt: generatedPrompt,
        subject: formData.subject,
        gradeLevel: formData.gradeLevel,
      };

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

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Materia</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="form-input"
              placeholder="Ej: Matemáticas"
            />
          </div>

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
        </div>

        <div className="form-row">
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
        </div>

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
