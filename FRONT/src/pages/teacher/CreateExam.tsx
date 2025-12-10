import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { FaSpinner, FaFileUpload } from 'react-icons/fa';
import api from '../../services/api';

type AIProvider = 'OPENAI' | 'GEMINI' | 'OLLAMA';

export const CreateExam: React.FC = () => {
    useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [validationError, setValidationError] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        subject: '',
        grade: '',
        prompt: '',
        visibility: 'PRIVATE',
        aiProvider: 'GEMINI' as AIProvider,
        duration: '60',
        difficulty: 'Medio',
        language: 'Español',
        cantidadPreguntas: 10,
        cantidadOM: 5,
        cantidadVF: 5,
        additionalInstructions: '',
    });

    // Validate questions
    const validateQuestions = () => {
        const total = Number(formData.cantidadPreguntas);
        const om = Number(formData.cantidadOM);
        const vf = Number(formData.cantidadVF);

        if (om + vf !== total) {
            setValidationError(`La suma de preguntas OM (${om}) y VF (${vf}) debe ser igual al total (${total})`);
            return false;
        }
        setValidationError('');
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateQuestions()) {
            return;
        }

        if (!formData.subject.trim()) {
            toast.error('Por favor ingrese la materia');
            return;
        }

        setLoading(true);

        try {
            const payload = {
                title: formData.title || 'Examen',
                description: formData.description,
                type: 'EXAM',
                subject: formData.subject,
                gradeLevel: formData.grade,
                visibility: formData.visibility,
                provider: formData.aiProvider,
                prompt: formData.prompt || `Genera un examen de ${formData.subject}`,
                additionalParams: {
                    titulo: formData.title,
                    descripcion: formData.description,
                    materia: formData.subject,
                    nivelEducativo: formData.grade,
                    idioma: formData.language,
                    duracion: Number(formData.duration),
                    dificultad: formData.difficulty,
                    cantidadPreguntas: Number(formData.cantidadPreguntas),
                    cantidadOM: Number(formData.cantidadOM),
                    cantidadVF: Number(formData.cantidadVF),
                    instruccionesAdicionales: formData.additionalInstructions,
                },
            };

            const response = await api.post('/activities/generate', payload);
            toast.success('¡Examen generado exitosamente!');
            navigate(`/teacher/activities/${response.data.activity.id}`);
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Error al generar examen');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Crear Examen</h1>
                    <p style={{ color: '#666', marginTop: '0.5rem' }}>
                        Genera exámenes personalizados con IA
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="summary-form">
                {/* Basic Info */}
                <div className="form-section">
                    <h3>Información Básica</h3>

                    <div className="form-group">
                        <label>Título</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Ej: Examen de Matemáticas - Capítulo 5"
                        />
                    </div>

                    <div className="form-group">
                        <label>Descripción (opcional)</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={2}
                            placeholder="Descripción breve del examen"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Materia *</label>
                            <input
                                type="text"
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                placeholder="Ej: Matemáticas, Historia, etc."
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Nivel Educativo</label>
                            <input
                                type="text"
                                value={formData.grade}
                                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                                placeholder="Ej: Secundaria, Universidad"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Instrucciones / Tema del Examen</label>
                        <textarea
                            value={formData.prompt}
                            onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                            rows={4}
                            placeholder="Describe el tema o contenido del examen..."
                        />
                    </div>
                </div>

                {/* Exam Configuration */}
                <div className="form-section">
                    <h3>Configuración del Examen</h3>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Duración (minutos)</label>
                            <input
                                type="number"
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                min="5"
                                max="300"
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

                        <div className="form-group">
                            <label>Idioma</label>
                            <select
                                value={formData.language}
                                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                            >
                                <option value="Español">Español</option>
                                <option value="English">English</option>
                                <option value="Français">Français</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Questions Configuration */}
                <div className="form-section">
                    <h3>Configuración de Preguntas</h3>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Total de Preguntas *</label>
                            <input
                                type="number"
                                value={formData.cantidadPreguntas}
                                onChange={(e) => {
                                    setFormData({ ...formData, cantidadPreguntas: Number(e.target.value) });
                                    setTimeout(validateQuestions, 100);
                                }}
                                min="1"
                                max="100"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Preguntas de Opción Múltiple *</label>
                            <input
                                type="number"
                                value={formData.cantidadOM}
                                onChange={(e) => {
                                    setFormData({ ...formData, cantidadOM: Number(e.target.value) });
                                    setTimeout(validateQuestions, 100);
                                }}
                                min="0"
                                max="100"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Preguntas de Verdadero/Falso *</label>
                            <input
                                type="number"
                                value={formData.cantidadVF}
                                onChange={(e) => {
                                    setFormData({ ...formData, cantidadVF: Number(e.target.value) });
                                    setTimeout(validateQuestions, 100);
                                }}
                                min="0"
                                max="100"
                                required
                            />
                        </div>
                    </div>

                    {validationError && (
                        <div className="alert alert-warning" style={{ marginTop: '1rem' }}>
                            ⚠️ {validationError}
                        </div>
                    )}

                    <div className="form-group">
                        <label>Instrucciones Adicionales</label>
                        <textarea
                            value={formData.additionalInstructions}
                            onChange={(e) => setFormData({ ...formData, additionalInstructions: e.target.value })}
                            rows={3}
                            placeholder="Ej: Incluir preguntas sobre el capítulo 3, enfocarse en..."
                        />
                    </div>
                </div>

                {/* Settings */}
                <div className="form-section">
                    <h3>Configuración</h3>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Visibilidad</label>
                            <select
                                value={formData.visibility}
                                onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                            >
                                <option value="PRIVATE">Privado (solo yo)</option>
                                <option value="PUBLIC">Público (todos los profesores)</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Proveedor de IA</label>
                            <select
                                value={formData.aiProvider}
                                onChange={(e) => setFormData({ ...formData, aiProvider: e.target.value as AIProvider })}
                            >
                                <option value="GEMINI">Gemini</option>
                                <option value="OPENAI">OpenAI (GPT)</option>
                                <option value="OLLAMA">Ollama (Local)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="form-actions">
                    <button
                        type="button"
                        onClick={() => navigate('/teacher/activities')}
                        className="btn btn-secondary"
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading || !!validationError}
                    >
                        {loading ? (
                            <>
                                <FaSpinner className="spinner" /> Generando Examen...
                            </>
                        ) : (
                            'Generar Examen'
                        )}
                    </button>
                </div>

                {loading && (
                    <div className="loading-message">
                        <p>⏳ Esto puede tomar unos segundos dependiendo de la complejidad...</p>
                    </div>
                )}
            </form>
        </div>
    );
};
