import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { FaSpinner } from 'react-icons/fa';
import api from '../../services/api';

type AIProvider = 'OPENAI' | 'GEMINI' | 'OLLAMA';

export const CreateLessonPlan: React.FC = () => {
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
        duration: '45',
        numberOfActivities: 3,
        includeResources: true,
        includeAssessment: true,
        objectives: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.subject.trim()) {
            toast.error('Por favor ingrese la materia');
            return;
        }

        setLoading(true);

        try {
            const payload = {
                title: formData.title || 'Plan de Lección',
                type: 'LESSON_PLAN',
                subject: formData.subject,
                gradeLevel: formData.grade,
                visibility: formData.visibility,
                provider: formData.aiProvider,
                prompt: formData.prompt || `Genera un plan de lección de ${formData.duration} minutos sobre ${formData.subject}`,
            };

            const response = await api.post('/activities/generate', payload);
            toast.success('¡Plan de lección generado!');
            navigate(`/teacher/activities/${response.data.activity.id}`);
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Error al generar plan');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Crear Plan de Lección</h1>
                <p style={{ color: '#666', marginTop: '0.5rem' }}>
                    Genera planes de lección estructurados
                </p>
            </div>

            <form onSubmit={handleSubmit} className="summary-form">
                <div className="form-section">
                    <h3>Información Básica</h3>

                    <div className="form-group">
                        <label>Título</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Ej: Introducción a la Fotosíntesis"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Materia *</label>
                            <input
                                type="text"
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                placeholder="Ej: Biología"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Nivel Educativo</label>
                            <input
                                type="text"
                                value={formData.grade}
                                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                                placeholder="Ej: Secundaria"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Objetivos de Aprendizaje</label>
                        <textarea
                            value={formData.objectives}
                            onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                            rows={3}
                            placeholder="Describe los objetivos de la lección..."
                        />
                    </div>

                    <div className="form-group">
                        <label>Tema / Contenido</label>
                        <textarea
                            value={formData.prompt}
                            onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                            rows={3}
                            placeholder="Describe el tema de la lección..."
                        />
                    </div>
                </div>

                <div className="form-section">
                    <h3>Configuración del Plan</h3>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Duración (minutos)</label>
                            <input
                                type="number"
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                min="15"
                                max="240"
                            />
                        </div>

                        <div className="form-group">
                            <label>Número de Actividades</label>
                            <input
                                type="number"
                                value={formData.numberOfActivities}
                                onChange={(e) => setFormData({ ...formData, numberOfActivities: Number(e.target.value) })}
                                min="1"
                                max="10"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="radio-option">
                            <input
                                type="checkbox"
                                checked={formData.includeResources}
                                onChange={(e) => setFormData({ ...formData, includeResources: e.target.checked })}
                            />
                            <span>Incluir lista de recursos necesarios</span>
                        </label>
                    </div>

                    <div className="form-group">
                        <label className="radio-option">
                            <input
                                type="checkbox"
                                checked={formData.includeAssessment}
                                onChange={(e) => setFormData({ ...formData, includeAssessment: e.target.checked })}
                            />
                            <span>Incluir evaluación</span>
                        </label>
                    </div>
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
                            'Generar Plan'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};
