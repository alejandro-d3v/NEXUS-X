import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { FaSpinner } from 'react-icons/fa';
import api from '../../services/api';

type AIProvider = 'OPENAI' | 'GEMINI' | 'OLLAMA';

export const CreatePresentation: React.FC = () => {
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
    numberOfSlides: 10,
    visualStyle: 'profesional',
    includeImages: true,
    includeNotes: true,
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
        title: formData.title || 'Presentación',
        type: 'PRESENTATION',
        subject: formData.subject,
        gradeLevel: formData.grade,
        visibility: formData.visibility,
        provider: formData.aiProvider,
        prompt: formData.prompt || `Genera una presentación de ${formData.numberOfSlides} diapositivas sobre ${formData.subject}`,
      };
      const response = await api.post('/activities/generate', payload);
      toast.success('¡Presentación generada!');
      navigate(`/teacher/activities/${response.data.activity.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al generar presentación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Crear Presentación</h1>
        <p style={{ color: '#666', marginTop: '0.5rem' }}>
          Genera presentaciones estructuradas
        </p>
      </div>
      <form onSubmit={handleSubmit} className="summary-form">
        <div className="form-section">
          <h3>Información Básica</h3>
          <div className="form-group">
            <label>Título</label>
            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Ej: La Revolución Industrial" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Tema *</label>
              <input type="text" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} placeholder="Tema de la presentación" required />
            </div>
            <div className="form-group">
              <label>Nivel Educativo</label>
              <input type="text" value={formData.grade} onChange={(e) => setFormData({ ...formData, grade: e.target.value })} placeholder="Ej: Secundaria" />
            </div>
          </div>
          <div className="form-group">
            <label>Descripción / Enfoque</label>
            <textarea value={formData.prompt} onChange={(e) => setFormData({ ...formData, prompt: e.target.value })} rows={3} placeholder="Describe el contenido..." />
          </div>
        </div>
        <div className="form-section">
          <h3>Configuración de la Presentación</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Número de Diapositivas</label>
              <input type="number" value={formData.numberOfSlides} onChange={(e) => setFormData({ ...formData, numberOfSlides: Number(e.target.value) })} min="3" max="50" />
            </div>
            <div className="form-group">
              <label>Estilo Visual</label>
              <select value={formData.visualStyle} onChange={(e) => setFormData({ ...formData, visualStyle: e.target.value })}>
                <option value="profesional">Profesional</option>
                <option value="educativo">Educativo</option>
                <option value="creativo">Creativo</option>
                <option value="minimalista">Minimalista</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="radio-option">
              <input type="checkbox" checked={formData.includeImages} onChange={(e) => setFormData({ ...formData, includeImages: e.target.checked })} />
              <span>Sugerir imágenes/gráficos</span>
            </label>
          </div>
          <div className="form-group">
            <label className="radio-option">
              <input type="checkbox" checked={formData.includeNotes} onChange={(e) => setFormData({ ...formData, includeNotes: e.target.checked })} />
              <span>Incluir notas del presentador</span>
            </label>
          </div>
        </div>
        <div className="form-section">
          <h3>Configuración</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Visibilidad</label>
              <select value={formData.visibility} onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}>
                <option value="PRIVATE">Privado</option>
                <option value="PUBLIC">Público</option>
              </select>
            </div>
            <div className="form-group">
              <label>Proveedor de IA</label>
              <select value={formData.aiProvider} onChange={(e) => setFormData({ ...formData, aiProvider: e.target.value as AIProvider })}>
                <option value="GEMINI">Gemini</option>
                <option value="OPENAI">OpenAI</option>
                <option value="OLLAMA">Ollama</option>
              </select>
            </div>
          </div>
        </div>
        <div className="form-actions">
          <button type="button" onClick={() => navigate('/teacher/activities')} className="btn btn-secondary" disabled={loading}>Cancelar</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (<><FaSpinner className="spinner" /> Generando...</>) : ('Generar Presentación')}
          </button>
        </div>
      </form>
    </div>
  );
};
