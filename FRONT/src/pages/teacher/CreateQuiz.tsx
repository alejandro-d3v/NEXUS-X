import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { FaSpinner } from 'react-icons/fa';
import api from '../../services/api';

type AIProvider = 'OPENAI' | 'GEMINI' | 'OLLAMA';

export const CreateQuiz: React.FC = () => {
    useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: '', description: '',
        subject: '',
        grade: '',
        prompt: '',
        visibility: 'PRIVATE',
        aiProvider: 'GEMINI' as AIProvider,
        numberOfQuestions: 10,
        timeLimit: '15',
        questionType: 'mixed',
        difficulty: 'Medio',
        showFeedback: true,
        randomizeQuestions: true,
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
                title: formData.title || 'Quiz',
                description: formData.description,
                type: 'QUIZ',
                subject: formData.subject,
                gradeLevel: formData.grade,
                visibility: formData.visibility,
                provider: formData.aiProvider,
                prompt: formData.prompt || `Genera un quiz de ${formData.subject} con ${formData.numberOfQuestions} preguntas`,
            };

            const response = await api.post('/activities/generate', payload);
            toast.success('¡Quiz generado exitosamente!');
            navigate(`/teacher/activities/${response.data.activity.id}`);
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Error al generar quiz');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Crear Quiz</h1>
                    <p style={{ color: '#666', marginTop: '0.5rem' }}>
                        Genera cuestionarios interactivos rápidos
                    </p>
                </div>
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
                            placeholder="Ej: Quiz de Biología - Célula"
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
                        <label>Tema del Quiz</label>
                        <textarea
                            value={formData.prompt}
                            onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                            rows={3}
                            placeholder="Describe el tema..."
                        />
                    </div>
                </div>

                <div className="form-section">
                    <h3>Configuración del Quiz</h3>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Número de Preguntas</label>
                            <input
                                type="number"
                                value={formData.numberOfQuestions}
                                onChange={(e) => setFormData({ ...formData, numberOfQuestions: Number(e.target.value) })}
                                min="1"
                                max="50"
                            />
                        </div>

                        <div className="form-group">
                            <label>Tiempo Límite (minutos)</label>
                            <input
                                type="number"
                                value={formData.timeLimit}
                                onChange={(e) => setFormData({ ...formData, timeLimit: e.target.value })}
                                min="5"
                                max="120"
                            />
                        </div>

                        <div className="form-group">
                            <label>Dificultad</label>
                            <select
                                value={formData.difficulty}
                                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                            >
                                <option value="Fácil">Fácil</option>
                                <option value="Medio">Medio</option>
                                <option value="Difícil">Difícil</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Tipo de Preguntas</label>
                        <select
                            value={formData.questionType}
                            onChange={(e) => setFormData({ ...formData, questionType: e.target.value })}
                        >
                            <option value="mixed">Mixto (Opción Múltiple + V/F)</option>
                            <option value="multiple-choice">Solo Opción Múltiple</option>
                            <option value="true-false">Solo Verdadero/Falso</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="radio-option">
                            <input
                                type="checkbox"
                                checked={formData.showFeedback}
                                onChange={(e) => setFormData({ ...formData, showFeedback: e.target.checked })}
                            />
                            <span>Mostrar retroalimentación inmediata</span>
                        </label>
                    </div>

                    <div className="form-group">
                        <label className="radio-option">
                            <input
                                type="checkbox"
                                checked={formData.randomizeQuestions}
                                onChange={(e) => setFormData({ ...formData, randomizeQuestions: e.target.checked })}
                            />
                            <span>Aleatorizar orden de preguntas</span>
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
                            'Generar Quiz'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};
