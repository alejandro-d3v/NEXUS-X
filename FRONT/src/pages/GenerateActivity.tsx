import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { activityService } from '../services/activity.service';
import { ActivityType, ActivityVisibility, AIProvider } from '../types';

export const GenerateActivity: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: (searchParams.get('type') as ActivityType) || ActivityType.EXAM,
    visibility: ActivityVisibility.PRIVATE,
    provider: AIProvider.GEMINI,              // 🔧 Renombrado
    prompt: '',
    subject: '',
    grade: '',                                // 🔧 Renombrado
    // Campos opcionales NO enviados al backend
    duration: '',
    difficulty: '',
    language: 'Español',
    additionalInstructions: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 🔧 Preparamos SOLO el payload permitido por el backend
      const payload = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        visibility: formData.visibility,
        provider: formData.provider,       // ✔️ nombre correcto
        prompt: formData.prompt,
        subject: formData.subject,
        grade: formData.grade,             // ✔️ nombre correcto
      };

      const activity = await activityService.generateActivity(payload as any);
      navigate(`/activity/${activity.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al generar la actividad');
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
  };

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <h1>Generar Actividad con IA</h1>
        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.formGroup}>
            <label style={styles.label}>Título *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Descripción</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              style={styles.textarea}
              rows={3}
            />
          </div>

          <div style={styles.row}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Tipo de Actividad *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                style={styles.input}
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

            <div style={styles.formGroup}>
              <label style={styles.label}>Visibilidad *</label>
              <select
                name="visibility"
                value={formData.visibility}
                onChange={handleChange}
                style={styles.input}
              >
                <option value={ActivityVisibility.PRIVATE}>Privada</option>
                <option value={ActivityVisibility.PUBLIC}>Pública</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Proveedor de IA *</label>
              <select
                name="provider"
                value={formData.provider}
                onChange={handleChange}
                style={styles.input}
              >
                <option value={AIProvider.GEMINI}>Gemini</option>
                <option value={AIProvider.OPENAI}>OpenAI</option>
                <option value={AIProvider.OLLAMA}>Ollama</option>
              </select>
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Prompt / Instrucciones *</label>
            <textarea
              name="prompt"
              value={formData.prompt}
              onChange={handleChange}
              required
              style={styles.textarea}
              rows={5}
              placeholder="Describe lo que quieres generar..."
            />
          </div>

          <div style={styles.row}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Materia</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                style={styles.input}
                placeholder="Ej: Matemáticas"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Nivel Educativo</label>
              <input
                type="text"
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                style={styles.input}
                placeholder="Ej: Secundaria"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Duración</label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                style={styles.input}
                placeholder="Ej: 60 minutos"
              />
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Dificultad</label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="">Seleccionar...</option>
                <option value="Fácil">Fácil</option>
                <option value="Medio">Medio</option>
                <option value="Difícil">Difícil</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Idioma</label>
              <input
                type="text"
                name="language"
                value={formData.language}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Instrucciones Adicionales</label>
            <textarea
              name="additionalInstructions"
              value={formData.additionalInstructions}
              onChange={handleChange}
              style={styles.textarea}
              rows={3}
            />
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Generando...' : 'Generar Actividad'}
          </button>
        </form>
      </div>
    </>
  );
};


const styles = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '2rem',
  },
  form: {
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  formGroup: {
    marginBottom: '1.5rem',
    flex: 1,
  },
  row: {
    display: 'flex',
    gap: '1rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
  },
  textarea: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    fontFamily: 'inherit',
  },
  button: {
    width: '100%',
    padding: '1rem',
    backgroundColor: '#1a1a2e',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
    marginTop: '1rem',
  },
  error: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: '0.75rem',
    borderRadius: '4px',
    marginBottom: '1rem',
  },
};
