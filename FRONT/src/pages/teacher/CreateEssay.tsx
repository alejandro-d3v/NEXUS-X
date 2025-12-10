import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { FaSpinner } from 'react-icons/fa';
import api from '../../services/api';

type AIProvider = 'OPENAI' | 'GEMINI' | 'OLLAMA';

export const CreateEssay: React.FC = () => {
  useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    grade: '',
    prompt: '',
    visibility: 'PRIVATE',
    aiProvider: 'GEMINI' as AIProvider,
    essayType: 'argumentativo',
    wordCount: '500',
    includeSources: true,
    numberOfSources: 3,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.subject.trim()) {
      toast.error('Por favor ingrese el tema');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        title: formData.title || 'Ensayo',
        type: 'ESSAY',
        subject: formData.subject,
        gradeLevel: formData.grade,
        visibility: formData.visibility,
        provider: formData.aiProvider,
        prompt: formData.prompt || `Genera un ensayo ${formData.essayType} sobre ${formData.subject}`,
      };

      const response = await api.post('/activities/generate', payload);
      toast.success('¡Ensayo generado!');
      navigate(`/teacher/activities/${response.data.activity.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al generar ensayo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Crear Ensayo</h1>
        <p style={{ color: '#666', marginTop: '0.5rem' }}>
          Genera ensayos estructurados y bien argumentados
        </p>
      </div>

      <form onSubmit={handleSubmit} className="summary-form">
        <div className="form-section">
          <h3>Información Básica</h3>

          <div className="form-group">
            <label>Título del Ensayo</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ej: El Cambio Climático"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Tema *</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Tema del ensayo"
                required
              />
            </div>

            <div className="form-group">
              <label>Nivel Educativo</label>
              <input
                type="text"
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                placeholder="Ej: Universidad"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Descripción / Enfoque</label>
            <textarea
              value={formData.prompt}
              onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
              rows={3}
              placeholder="Describe el enfoque del ensayo..."
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Configuración del Ensayo</h3>

          <div className="form-row">
            <div className="form-group">
              <label>Tipo de Ensayo</label>
              <select
                value={formData.essayType}
                onChange={(e) => setFormData({ ...formData, essayType: e.target.value })}
              >
                <option value="argumentativo">Argumentativo</option>
                <option value="expositivo">Expositivo</option>
                <option value="narrativo">Narrativo</option>
                <option value="descriptivo">Descriptivo</option>
              </select>
            </div>

            <div className="form-group">
              <label>Longitud (palabras)</label>
              <input
                type="number"
                value={formData.wordCount}
                onChange={(e) => setFormData({ ...formData, wordCount: e.target.value })}
                min="100"
                max="5000"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="radio-option">
              <input
                type="checkbox"
                checked={formData.includeSources}
                onChange={(e) => setFormData({ ...formData, includeSources: e.target.checked })}
              />
              <span>Incluir fuentes bibliográficas</span>
            </label>
          </div>

          {formData.includeSources && (
            <div className="form-group">
              <label>Número de Fuentes</label>
              <input
                type="number"
                value={formData.numberOfSources}
                onChange={(e) => setFormData({ ...formData, numberOfSources: Number(e.target.value) })}
                min="1"
                max="20"
              />
            </div>
          )}
        </div>

        <div className="form-section">
          <h3>Configuración</h3>

          <div className="form-row">
            <div className="form-group">
              <label>Visibilidad</label>
              <select
                value={formData.visibility}
                onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
              >
                <option value="PRIVATE">Privado</option>
                <option value="PUBLIC">Público</option>
              </select>
            </div>

            <div className="form-group">
              <label>Proveedor de IA</label>
              <select
                value={formData.aiProvider}
                onChange={(e) => setFormData({ ...formData, aiProvider: e.target.value as AIProvider })}
              >
                <option value="GEMINI">Gemini</option>
                <option value="OPENAI">OpenAI</option>
                <option value="OLLAMA">Ollama</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/teacher/activities')}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <>
                <FaSpinner className="spinner" /> Generando...
              </>
            ) : (
              'Generar Ensayo'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
