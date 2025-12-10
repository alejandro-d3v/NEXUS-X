import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { FaSpinner } from 'react-icons/fa';
import api from '../../services/api';

type AIProvider = 'OPENAI' | 'GEMINI' | 'OLLAMA';

export const CreateFlashcards: React.FC = () => {
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
        numberOfCards: 20,
        cardFormat: 'question-answer',
        includeImages: false,
        difficulty: 'Medio',
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
                title: formData.title || 'Tarjetas de Estudio',
                type: 'FLASHCARDS',
                subject: formData.subject,
                gradeLevel: formData.grade,
                visibility: formData.visibility,
                provider: formData.aiProvider,
                prompt: formData.prompt || `Genera ${formData.numberOfCards} tarjetas de estudio de ${formData.subject}`,
            };

            const response = await api.post('/activities/generate', payload);
            toast.success('¡Tarjetas de estudio generadas!');
            navigate(`/teacher/activities/${response.data.activity.id}`);
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Error al generar tarjetas');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Crear Tarjetas de Estudio</h1>
                <p style={{ color: '#666', marginTop: '0.5rem' }}>
                    Genera flashcards para memorización y repaso
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
                            placeholder="Ej: Vocabulario de Inglés - Unidad 3"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Materia *</label>
                            <input
                                type="text"
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                placeholder="Ej: Inglés, Historia"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Nivel Educativo</label>
                            <input
                                type="text"
                                value={formData.grade}
                                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                                placeholder="Ej: Primaria"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Tema de las Tarjetas</label>
                        <textarea
                            value={formData.prompt}
                            onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                            rows={3}
                            placeholder="Describe el tema o contenido..."
                        />
                    </div>
                </div>

                <div className="form-section">
                    <h3>Configuración de Tarjetas</h3>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Número de Tarjetas</label>
                            <input
                                type="number"
                                value={formData.numberOfCards}
                                onChange={(e) => setFormData({ ...formData, numberOfCards: Number(e.target.value) })}
                                min="5"
                                max="100"
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
                        <label>Formato de Tarjetas</label>
                        <select
                            value={formData.cardFormat}
                            onChange={(e) => setFormData({ ...formData, cardFormat: e.target.value })}
                        >
                            <option value="question-answer">Pregunta - Respuesta</option>
                            <option value="term-definition">Término - Definición</option>
                            <option value="concept-explanation">Concepto - Explicación</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="radio-option">
                            <input
                                type="checkbox"
                                checked={formData.includeImages}
                                onChange={(e) => setFormData({ ...formData, includeImages: e.target.checked })}
                            />
                            <span>Sugerir imágenes para las tarjetas</span>
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
                            'Generar Tarjetas'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};
