import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { FaSpinner } from 'react-icons/fa';
import api from '../../services/api';

type AIProvider = 'OPENAI' | 'GEMINI' | 'OLLAMA';

export const CreateProject: React.FC = () => {
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
        projectType: 'investigación',
        duration: '2 semanas',
        numberOfPhases: 4,
        includeDeliverables: true,
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
                title: formData.title || 'Proyecto',
                type: 'PROJECT',
                subject: formData.subject,
                gradeLevel: formData.grade,
                visibility: formData.visibility,
                provider: formData.aiProvider,
                prompt: formData.prompt || `Genera un proyecto ${formData.projectType} sobre ${formData.subject}`,
            };
            const response = await api.post('/activities/generate', payload);
            toast.success('¡Proyecto generado!');
            navigate(`/teacher/activities/${response.data.activity.id}`);
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Error al generar proyecto');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Crear Proyecto</h1>
                <p style={{ color: '#666', marginTop: '0.5rem' }}>Planifica proyectos educativos estructurados</p>
            </div>
            <form onSubmit={handleSubmit} className="summary-form">
                <div className="form-section">
                    <h3>Información Básica</h3>
                    <div className="form-group">
                        <label>Título del Proyecto</label>
                        <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Ej: Sistema Solar" />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Tema *</label>
                            <input type="text" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} placeholder="Tema del proyecto" required />
                        </div>
                        <div className="form-group">
                            <label>Nivel Educativo</label>
                            <input type="text" value={formData.grade} onChange={(e) => setFormData({ ...formData, grade: e.target.value })} placeholder="Ej: Secundaria" />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Descrip ción / Alcance</label>
                        <textarea value={formData.prompt} onChange={(e) => setFormData({ ...formData, prompt: e.target.value })} rows={3} placeholder="Describe el proyecto..." />
                    </div>
                </div>
                <div className="form-section">
                    <h3>Configuración del Proyecto</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Tipo de Proyecto</label>
                            <select value={formData.projectType} onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}>
                                <option value="investigación">Investigación</option>
                                <option value="práctico">Práctico</option>
                                <option value="creativo">Creativo</option>
                                <option value="comunitario">Comunitario</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Duración Estimada</label>
                            <select value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })}>
                                <option value="1 semana">1 semana</option>
                                <option value="2 semanas">2 semanas</option>
                                <option value="1 mes">1 mes</option>
                                <option value="2 meses">2 meses</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Número de Fases</label>
                        <input type="number" value={formData.numberOfPhases} onChange={(e) => setFormData({ ...formData, numberOfPhases: Number(e.target.value) })} min="1" max="10" />
                    </div>
                    <div className="form-group">
                        <label className="radio-option">
                            <input type="checkbox" checked={formData.includeDeliverables} onChange={(e) => setFormData({ ...formData, includeDeliverables: e.target.checked })} />
                            <span>Incluir lista de entregables</span>
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
                    <button type="submit" className=" btn btn-primary" disabled={loading}>
                        {loading ? (<><FaSpinner className="spinner" /> Generando...</>) : ('Generar Proyecto')}
                    </button>
                </div>
            </form>
        </div>
    );
};
