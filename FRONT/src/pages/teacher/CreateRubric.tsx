import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { FaSpinner } from 'react-icons/fa';
import api from '../../services/api';

type AIProvider = 'OPENAI' | 'GEMINI' | 'OLLAMA';

export const CreateRubric: React.FC = () => {
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
        rubricType: 'analítica',
        numberOfCriteria: 4,
        performanceLevels: 4,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.subject.trim()) {
            toast.error('Por favor ingrese la actividad a evaluar');
            return;
        }
        setLoading(true);
        try {
            const payload = {
                title: formData.title || 'Rúbrica',
                type: 'RUBRIC',
                subject: formData.subject,
                gradeLevel: formData.grade,
                visibility: formData.visibility,
                provider: formData.aiProvider,
                prompt: formData.prompt || `Genera una rúbrica ${formData.rubricType} con ${formData.numberOfCriteria} criterios para evaluar ${formData.subject}`,
            };
            const response = await api.post('/activities/generate', payload);
            toast.success('¡Rúbrica generada!');
            navigate(`/teacher/activities/${response.data.activity.id}`);
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Error al generar rúbrica');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Crear Rúbrica</h1>
                <p style={{ color: '#666', marginTop: '0.5rem' }}>Genera rúbricas de evaluación detalladas</p>
            </div>
            <form onSubmit={handleSubmit} className="summary-form">
                <div className="form-section">
                    <h3>Información Básica</h3>
                    <div className="form-group">
                        <label>Título de la Rúbrica</label>
                        <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Ej: Rúbrica para Ensayo Argumentativo" />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Actividad a Evaluar *</label>
                            <input type="text" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} placeholder="Ej: Ensayo, Presentación" required />
                        </div>
                        <div className="form-group">
                            <label>Nivel Educativo</label>
                            <input type="text" value={formData.grade} onChange={(e) => setFormData({ ...formData, grade: e.target.value })} placeholder="Ej: Universidad" />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Descripción / Aspectos a Evaluar</label>
                        <textarea value={formData.prompt} onChange={(e) => setFormData({ ...formData, prompt: e.target.value })} rows={3} placeholder="Describe qué aspectos evaluar..." />
                    </div>
                </div>
                <div className="form-section">
                    <h3>Configuración de la Rúbrica</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Tipo de Rúbrica</label>
                            <select value={formData.rubricType} onChange={(e) => setFormData({ ...formData, rubricType: e.target.value })}>
                                <option value="analítica">Analítica (por criterios)</option>
                                <option value="holística">Holística (global)</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Número de Criterios</label>
                            <input type="number" value={formData.numberOfCriteria} onChange={(e) => setFormData({ ...formData, numberOfCriteria: Number(e.target.value) })} min="1" max="15" />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Niveles de Desempeño</label>
                        <select value={formData.performanceLevels} onChange={(e) => setFormData({ ...formData, performanceLevels: Number(e.target.value) })}>
                            <option value="3">3 niveles (Básico, Competente, Avanzado)</option>
                            <option value="4">4 niveles (Insuficiente, Básico, Competente, Avanzado)</option>
                            <option value="5">5 niveles (Muy detallado)</option>
                        </select>
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
                        {loading ? (<><FaSpinner className="spinner" /> Generando...</>) : ('Generar Rúbrica')}
                    </button>
                </div>
            </form>
        </div>
    );
};
