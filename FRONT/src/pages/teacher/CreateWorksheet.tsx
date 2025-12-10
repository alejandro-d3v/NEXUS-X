import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { FaSpinner } from 'react-icons/fa';
import api from '../../services/api';

type AIProvider = 'OPENAI' | 'GEMINI' | 'OLLAMA';

export const CreateWorksheet: React.FC = () => {
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
        exerciseType: 'mixto',
        numberOfExercises: 15,
        difficulty: 'Medio',
        includeAnswerKey: true,
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
                title: formData.title || 'Hoja de Trabajo',
                type: 'WORKSHEET',
                subject: formData.subject,
                gradeLevel: formData.grade,
                visibility: formData.visibility,
                provider: formData.aiProvider,
                prompt: formData.prompt || `Genera una hoja de trabajo con ${formData.numberOfExercises} ejercicios de ${formData.subject}`,
            };
            const response = await api.post('/activities/generate', payload);
            toast.success('¡Hoja de trabajo generada!');
            navigate(`/teacher/activities/${response.data.activity.id}`);
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Error al generar hoja de trabajo');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Crear Hoja de Trabajo</h1>
                <p style={{ color: '#666', marginTop: '0.5rem' }}>Genera ejercicios y actividades prácticas</p>
            </div>
            <form onSubmit={handleSubmit} className="summary-form">
                <div className="form-section">
                    <h3>Información Básica</h3>
                    <div className="form-group">
                        <label>Título</label>
                        <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Ej: Ejercicios de Álgebra" />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Materia *</label>
                            <input type="text" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} placeholder="Ej: Matemáticas" required />
                        </div>
                        <div className="form-group">
                            <label>Nivel Educativo</label>
                            <input type="text" value={formData.grade} onChange={(e) => setFormData({ ...formData, grade: e.target.value })} placeholder="Ej: Primaria" />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Tema / Contenido</label>
                        <textarea value={formData.prompt} onChange={(e) => setFormData({ ...formData, prompt: e.target.value })} rows={3} placeholder="Describe el tema..." />
                    </div>
                </div>
                <div className="form-section">
                    <h3>Configuración de la Hoja</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Tipo de Ejercicios</label>
                            <select value={formData.exerciseType} onChange={(e) => setFormData({ ...formData, exerciseType: e.target.value })}>
                                <option value="mixto">Mixto</option>
                                <option value="problemas">Problemas</option>
                                <option value="preguntas-abiertas">Preguntas Abiertas</option>
                                <option value="completar-espacios">Completar Espacios</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Número de Ejercicios</label>
                            <input type="number" value={formData.numberOfExercises} onChange={(e) => setFormData({ ...formData, numberOfExercises: Number(e.target.value) })} min="5" max="50" />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Dificultad</label>
                        <select value={formData.difficulty} onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}>
                            <option value="Fácil">Fácil</option>
                            <option value="Medio">Medio</option>
                            <option value="Difícil">Difícil</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="radio-option">
                            <input type="checkbox" checked={formData.includeAnswerKey} onChange={(e) => setFormData({ ...formData, includeAnswerKey: e.target.checked })} />
                            <span>Incluir hoja de respuestas</span>
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
                        {loading ? (<><FaSpinner className="spinner" /> Generando...</>) : ('Generar Hoja')}
                    </button>
                </div>
            </form>
        </div>
    );
};
