import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { FaFileAlt, FaUpload, FaSpinner } from 'react-icons/fa';
import api from '../../services/api';

type InputMethod = 'text' | 'file';
type SummaryLength = 'short' | 'medium' | 'long';
type SummaryStyle = 'bullet-points' | 'paragraph' | 'detailed';
type AIProvider = 'OPENAI' | 'GEMINI' | 'OLLAMA';

export const CreateSummary: React.FC = () => {
    useAuth();
    const navigate = useNavigate();

    const [inputMethod, setInputMethod] = useState<InputMethod>('text');
    const [loading, setLoading] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        text: '',
        subject: '',
        visibility: 'PRIVATE',
        aiProvider: 'OPENAI' as AIProvider,
    });

    const [summaryOptions, setSummaryOptions] = useState({
        summaryLength: 'medium' as SummaryLength,
        summaryStyle: 'paragraph' as SummaryStyle,
    });

    const [file, setFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileChange(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (selectedFile: File) => {
        const allowedTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/msword',
            'image/png',
            'image/jpeg',
            'image/jpg',
        ];

        if (!allowedTypes.includes(selectedFile.type)) {
            toast.error('Tipo de archivo no soportado. Use PDF, DOCX, PNG o JPG');
            return;
        }

        if (selectedFile.size > 10 * 1024 * 1024) {
            toast.error('El archivo excede el límite de 10MB');
            return;
        }

        setFile(selectedFile);
        toast.success(`Archivo "${selectedFile.name}" seleccionado`);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (inputMethod === 'text' && !formData.text.trim()) {
            toast.error('Por favor ingrese el texto a resumir');
            return;
        }

        if (inputMethod === 'file' && !file) {
            toast.error('Por favor seleccione un archivo');
            return;
        }

        if (!formData.subject.trim()) {
            toast.error('Por favor ingrese la materia');
            return;
        }

        setLoading(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title || 'Resumen');
            formDataToSend.append('description', formData.description);
            formDataToSend.append('subject', formData.subject);
            formDataToSend.append('visibility', formData.visibility);
            formDataToSend.append('aiProvider', formData.aiProvider);
            formDataToSend.append('summaryLength', summaryOptions.summaryLength);
            formDataToSend.append('summaryStyle', summaryOptions.summaryStyle);

            if (inputMethod === 'text') {
                formDataToSend.append('text', formData.text);
            } else if (file) {
                formDataToSend.append('file', file);
            }

            const response = await api.post('/activities/summary', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            toast.success('¡Resumen generado exitosamente!');
            navigate(`/teacher/activities/${response.data.activity.id}`);
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Error al generar resumen');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Crear Resumen</h1>
                    <p style={{ color: '#666', marginTop: '0.5rem' }}>
                        Genera resúmenes automáticos con IA desde texto o documentos
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
                            placeholder="Ej: Resumen de Capítulo 5"
                        />
                    </div>

                    <div className="form-group">
                        <label>Descripción (opcional)</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={2}
                            placeholder="Descripción breve del resumen"
                        />
                    </div>

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
                </div>

                {/* Input Method Tabs */}
                <div className="form-section">
                    <h3>Método de Entrada</h3>

                    <div className="input-method-tabs">
                        <button
                            type="button"
                            className={`tab ${inputMethod === 'text' ? 'active' : ''}`}
                            onClick={() => setInputMethod('text')}
                        >
                            <FaFileAlt /> Texto
                        </button>
                        <button
                            type="button"
                            className={`tab ${inputMethod === 'file' ? 'active' : ''}`}
                            onClick={() => setInputMethod('file')}
                        >
                            <FaUpload /> Subir Archivo
                        </button>
                    </div>

                    {inputMethod === 'text' ? (
                        <div className="form-group">
                            <label>Texto a Resumir *</label>
                            <textarea
                                value={formData.text}
                                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                                rows={10}
                                placeholder="Pegue o escriba el texto que desea resumir..."
                                className="text-input-large"
                                required={inputMethod === 'text'}
                            />
                            <small style={{ color: '#666' }}>
                                {formData.text.length} caracteres
                            </small>
                        </div>
                    ) : (
                        <div className="form-group">
                            <label>Subir Documento</label>
                            <div
                                className={`file-upload-zone ${dragActive ? 'drag-active' : ''} ${file ? 'has-file' : ''}`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                onClick={() => document.getElementById('file-input')?.click()}
                            >
                                <input
                                    id="file-input"
                                    type="file"
                                    accept=".pdf,.docx,.doc,.png,.jpg,.jpeg"
                                    onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
                                    style={{ display: 'none' }}
                                />

                                {file ? (
                                    <div className="file-selected">
                                        <FaFileAlt size={48} />
                                        <p><strong>{file.name}</strong></p>
                                        <p>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setFile(null);
                                            }}
                                            className="btn btn-sm btn-secondary"
                                            style={{ marginTop: '1rem' }}
                                        >
                                            Remover Archivo
                                        </button>
                                    </div>
                                ) : (
                                    <div className="file-upload-prompt">
                                        <FaUpload size={48} />
                                        <p><strong>Arrastra y suelta tu archivo aquí</strong></p>
                                        <p>o haz clic para seleccionar</p>
                                        <small style={{ marginTop: '1rem', display: 'block' }}>
                                            Formatos soportados: PDF, DOCX, PNG, JPG (Máx. 10MB)
                                        </small>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Summary Options */}
                <div className="form-section">
                    <h3>Opciones de Resumen</h3>

                    <div className="form-group">
                        <label>Longitud del Resumen</label>
                        <select
                            value={summaryOptions.summaryLength}
                            onChange={(e) => setSummaryOptions({ ...summaryOptions, summaryLength: e.target.value as SummaryLength })}
                        >
                            <option value="short">Corto (1-2 párrafos)</option>
                            <option value="medium">Medio (3-5 párrafos)</option>
                            <option value="long">Largo (6+ párrafos, detallado)</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Estilo del Resumen</label>
                        <div className="radio-group">
                            <label className="radio-option">
                                <input
                                    type="radio"
                                    name="summaryStyle"
                                    value="bullet-points"
                                    checked={summaryOptions.summaryStyle === 'bullet-points'}
                                    onChange={(e) => setSummaryOptions({ ...summaryOptions, summaryStyle: e.target.value as SummaryStyle })}
                                />
                                <span>Viñetas (Bullet Points)</span>
                            </label>
                            <label className="radio-option">
                                <input
                                    type="radio"
                                    name="summaryStyle"
                                    value="paragraph"
                                    checked={summaryOptions.summaryStyle === 'paragraph'}
                                    onChange={(e) => setSummaryOptions({ ...summaryOptions, summaryStyle: e.target.value as SummaryStyle })}
                                />
                                <span>Párrafos</span>
                            </label>
                            <label className="radio-option">
                                <input
                                    type="radio"
                                    name="summaryStyle"
                                    value="detailed"
                                    checked={summaryOptions.summaryStyle === 'detailed'}
                                    onChange={(e) => setSummaryOptions({ ...summaryOptions, summaryStyle: e.target.value as SummaryStyle })}
                                />
                                <span>Análisis Detallado</span>
                            </label>
                        </div>
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
                                <option value="OPENAI">OpenAI (GPT)</option>
                                <option value="GEMINI">Gemini</option>
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
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <FaSpinner className="spinner" /> Generando Resumen...
                            </>
                        ) : (
                            'Generar Resumen'
                        )}
                    </button>
                </div>

                {loading && (
                    <div className="loading-message">
                        <p>⏳ Esto puede tomar unos segundos dependiendo de la longitud del texto...</p>
                    </div>
                )}
            </form>
        </div>
    );
};
