import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { activityService } from '../services/activity.service';
import { ActivityType, ActivityVisibility, AIProvider } from '../types';

export const GenerateSurvey: React.FC = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        visibility: ActivityVisibility.PRIVATE,
        provider: AIProvider.GEMINI,
        tipoEncuesta: 'Satisfacción',
        numeroPreguntas: 10,
        nivelEducativo: '',
        incluirEscalaLikert: true,
        incluirPreguntasAbiertas: true,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [generatedSurvey, setGeneratedSurvey] = useState<any>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const parts = [];
            parts.push(`Genera una encuesta de ${formData.tipoEncuesta.toLowerCase()}`);
            if (formData.title) parts.push(`sobre "${formData.title}"`);
            if (formData.nivelEducativo) parts.push(`para nivel ${formData.nivelEducativo}`);
            parts.push(`con ${formData.numeroPreguntas} preguntas`);
            if (formData.incluirEscalaLikert) parts.push(`incluyendo preguntas con escala Likert`);
            if (formData.incluirPreguntasAbiertas) parts.push(`y preguntas abiertas`);
            if (formData.description) parts.push(`\nContexto: ${formData.description}`);

            const prompt = parts.join(' ');

            const payload = {
                title: formData.title,
                description: formData.description,
                type: ActivityType.SURVEY,
                visibility: formData.visibility,
                provider: formData.provider,
                prompt: prompt,
                subject: formData.title,
                grade: formData.nivelEducativo,
                additionalParams: {
                    titulo: formData.title,
                    descripcion: formData.description,
                    tipoEncuesta: formData.tipoEncuesta,
                    numeroPreguntas: formData.numeroPreguntas,
                    nivelEducativo: formData.nivelEducativo,
                    incluirEscalaLikert: formData.incluirEscalaLikert,
                    incluirPreguntasAbiertas: formData.incluirPreguntasAbiertas,
                },
            };

            const activity = await activityService.generateActivity(payload as any);
            console.log('✅ Encuesta generada:', activity);
            setGeneratedSurvey(activity);
        } catch (err: any) {
            console.error('❌ Error:', err);
            setError(err.response?.data?.error || 'Error al generar la encuesta');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData({
                ...formData,
                [name]: checked,
            });
        } else {
            setFormData({
                ...formData,
                [name]: name === 'numeroPreguntas' ? Number(value) : value,
            });
        }
    };

    const convertSurveyToHTML = (content: any): string => {
        if (typeof content === 'string' && content.trim().startsWith('<')) {
            return content;
        }

        if (typeof content === 'object' && content !== null) {
            let html = '<div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">';

            // Encabezado
            if (content.titulo || generatedSurvey.title) {
                html += `<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; border-radius: 8px 8px 0 0; text-align: center;">`;
                html += `<h1 style="margin: 0; font-size: 2rem;">${content.titulo || generatedSurvey.title}</h1>`;
                if (content.descripcion || content.objetivo) {
                    html += `<p style="margin: 1rem 0 0 0; opacity: 0.9;">${content.descripcion || content.objetivo}</p>`;
                }
                html += '</div>';
            }

            // Info de la encuesta
            html += '<div style="background-color: #f8f9fa; padding: 1.5rem; border-left: 4px solid #667eea; margin-bottom: 2rem;">';
            html += '<h3 style="margin-top: 0; color: #667eea;">📋 Información de la Encuesta</h3>';
            if (content.tipo) html += `<p><strong>Tipo:</strong> ${content.tipo}</p>`;
            if (content.numeroPreguntas) html += `<p><strong>Número de preguntas:</strong> ${content.numeroPreguntas}</p>`;
            if (content.tiempoEstimado) html += `<p><strong>Tiempo estimado:</strong> ${content.tiempoEstimado}</p>`;
            html += '</div>';

            // Preguntas
            if (content.preguntas && Array.isArray(content.preguntas)) {
                content.preguntas.forEach((pregunta: any, index: number) => {
                    html += `<div style="background-color: white; padding: 1.5rem; margin-bottom: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">`;

                    // Número y pregunta
                    html += `<div style="display: flex; gap: 1rem; margin-bottom: 1rem;">`;
                    html += `<div style="background-color: #667eea; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0;">${index + 1}</div>`;
                    html += `<div style="flex: 1;"><strong style="font-size: 1.1rem; color: #333;">${pregunta.pregunta || pregunta.texto}</strong></div>`;
                    html += `</div>`;

                    // Tipo de pregunta
                    if (pregunta.tipo) {
                        const tipoColor = pregunta.tipo.includes('Likert') || pregunta.tipo.includes('escala') ? '#28a745' :
                            pregunta.tipo.includes('múltiple') ? '#ffc107' :
                                pregunta.tipo.includes('abierta') ? '#17a2b8' : '#6c757d';
                        html += `<span style="display: inline-block; background-color: ${tipoColor}; color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.85rem; margin-bottom: 1rem;">${pregunta.tipo}</span>`;
                    }

                    // Opciones de respuesta
                    if (pregunta.opciones && Array.isArray(pregunta.opciones)) {
                        html += '<div style="margin-left: 1rem; margin-top: 1rem;">';
                        pregunta.opciones.forEach((opcion: string) => {
                            html += `<div style="padding: 0.75rem; margin: 0.5rem 0; background-color: #f8f9fa; border-left: 3px solid #667eea; border-radius: 4px;">`;
                            html += `<input type="${pregunta.tipo?.includes('múltiple') ? 'checkbox' : 'radio'}" disabled style="margin-right: 0.5rem;">`;
                            html += `<label>${opcion}</label>`;
                            html += `</div>`;
                        });
                        html += '</div>';
                    }

                    // Escala Likert
                    if (pregunta.escala || pregunta.tipo?.toLowerCase().includes('likert')) {
                        html += '<div style="margin-top: 1rem; display: flex; justify-content: space-between; gap: 0.5rem;">';
                        const escalaValues = pregunta.escala || ['Muy en desacuerdo', 'En desacuerdo', 'Neutral', 'De acuerdo', 'Muy de acuerdo'];
                        escalaValues.forEach((valor: string, idx: number) => {
                            html += `<div style="flex: 1; text-align: center; padding: 0.75rem; background-color: #e3f2fd; border: 2px solid #2196F3; border-radius: 4px; font-size: 0.85rem;">`;
                            html += `<div>${idx + 1}</div>`;
                            html += `<div style="font-size: 0.75rem; margin-top: 0.25rem;">${valor}</div>`;
                            html += `</div>`;
                        });
                        html += '</div>';
                    }

                    // Campo de texto abierto
                    if (pregunta.tipo?.toLowerCase().includes('abierta')) {
                        html += '<textarea style="width: 100%; padding: 0.75rem; margin-top: 1rem; border: 2px solid #ddd; border-radius: 4px; min-height: 80px;" disabled placeholder="Espacio para respuesta..."></textarea>';
                    }

                    html += '</div>';
                });
            }

            // Agradecimiento final
            html += '<div style="background-color: #d4edda; color: #155724; padding: 1.5rem; border-radius: 8px; text-align: center; margin-top: 2rem;">';
            html += '<h3 style="margin: 0;">✓ Gracias por tu participación</h3>';
            html += '<p style="margin: 0.5rem 0 0 0;">Tus respuestas son muy importantes para nosotros</p>';
            html += '</div>';

            html += '</div>';
            return html;
        }

        const text = String(content);
        return `<div style="font-family: Arial, sans-serif; white-space: pre-wrap;">${text}</div>`;
    };

    const exportToPDF = () => {
        if (!generatedSurvey) return;

        const htmlContent = convertSurveyToHTML(generatedSurvey.content);

        import('../services/export.service').then(({ exportService }) => {
            exportService.exportToPDF(htmlContent, generatedSurvey.title || 'Encuesta');
        });
    };

    return (
        <>
            <Navbar />
            <div style={styles.container}>
                <h1>📊 Generador de Encuestas</h1>
                <p style={styles.subtitle}>
                    Crea encuestas profesionales con IA en segundos
                </p>

                <form onSubmit={handleSubmit} style={styles.form}>
                    {error && <div style={styles.error}>{error}</div>}

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Título de la Encuesta *</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            style={styles.input}
                            placeholder="Ej: Encuesta de Satisfacción del Curso"
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Descripción / Objetivo (Opcional)</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            style={styles.textarea}
                            rows={3}
                            placeholder="Describe el propósito de la encuesta..."
                        />
                    </div>

                    <div style={styles.row}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Tipo de Encuesta *</label>
                            <select
                                name="tipoEncuesta"
                                value={formData.tipoEncuesta}
                                onChange={handleChange}
                                style={styles.input}
                            >
                                <option value="Satisfacción">Satisfacción</option>
                                <option value="Evaluación de Curso">Evaluación de Curso</option>
                                <option value="Retroalimentación">Retroalimentación</option>
                                <option value="Diagnóstico">Diagnóstico</option>
                                <option value="Opinión">Opinión</option>
                                <option value="Investigación">Investigación</option>
                            </select>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Número de Preguntas *</label>
                            <input
                                type="number"
                                name="numeroPreguntas"
                                value={formData.numeroPreguntas}
                                onChange={handleChange}
                                min="3"
                                max="30"
                                required
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Nivel Educativo</label>
                            <select
                                name="nivelEducativo"
                                value={formData.nivelEducativo}
                                onChange={handleChange}
                                style={styles.input}
                            >
                                <option value="">General</option>
                                <option value="Primaria">Primaria</option>
                                <option value="Secundaria">Secundaria</option>
                                <option value="Preparatoria">Preparatoria</option>
                                <option value="Universidad">Universidad</option>
                            </select>
                        </div>
                    </div>

                    <div style={styles.checkboxGroup}>
                        <label style={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                name="incluirEscalaLikert"
                                checked={formData.incluirEscalaLikert}
                                onChange={handleChange}
                                style={styles.checkbox}
                            />
                            <span>Incluir preguntas con escala Likert (1-5)</span>
                        </label>

                        <label style={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                name="incluirPreguntasAbiertas"
                                checked={formData.incluirPreguntasAbiertas}
                                onChange={handleChange}
                                style={styles.checkbox}
                            />
                            <span>Incluir preguntas abiertas</span>
                        </label>
                    </div>

                    <div style={styles.row}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Proveedor de IA *</label>
                            <select
                                name="provider"
                                value={formData.provider}
                                onChange={handleChange}
                                style={styles.input}
                            >
                                <option value={AIProvider.GEMINI}>Gemini</option>
                                <option value={AIProvider.OPENAI}>OpenAI</option>
                                <option value={AIProvider.OLLAMA}>Ollama</option>
                            </select>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Visibilidad *</label>
                            <select
                                name="visibility"
                                value={formData.visibility}
                                onChange={handleChange}
                                style={styles.input}
                            >
                                <option value={ActivityVisibility.PRIVATE}>Privada</option>
                                <option value={ActivityVisibility.PUBLIC}>Pública</option>
                            </select>
                        </div>
                    </div>

                    <button type="submit" disabled={loading} style={styles.button}>
                        {loading ? 'Generando Encuesta...' : '✨ Generar Encuesta'}
                    </button>
                </form>

                {generatedSurvey && (
                    <div style={styles.resultContainer}>
                        <div style={styles.resultHeader}>
                            <h2>Encuesta Generada</h2>
                            <button onClick={exportToPDF} style={styles.exportButton}>
                                📄 Exportar a PDF
                            </button>
                        </div>
                        <div
                            style={styles.surveyContent}
                            dangerouslySetInnerHTML={{ __html: convertSurveyToHTML(generatedSurvey.content) }}
                        />
                    </div>
                )}
            </div>
        </>
    );
};

const styles = {
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem',
    },
    subtitle: {
        textAlign: 'center' as const,
        color: '#666',
        marginBottom: '2rem',
        fontSize: '1.1rem',
    },
    form: {
        backgroundColor: '#fff',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '2rem',
    },
    formGroup: {
        marginBottom: '1.5rem',
        flex: 1,
    },
    row: {
        display: 'flex',
        gap: '1rem',
    },
    label: {
        display: 'block',
        marginBottom: '0.5rem',
        fontWeight: 'bold' as const,
        color: '#333',
    },
    input: {
        width: '100%',
        padding: '0.75rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '1rem',
    },
    textarea: {
        width: '100%',
        padding: '0.75rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '1rem',
        fontFamily: 'inherit',
        resize: 'vertical' as const,
    },
    checkboxGroup: {
        marginBottom: '1.5rem',
        padding: '1rem',
        backgroundColor: '#f8f9fa',
        borderRadius: '4px',
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '0.75rem',
    },
    checkboxLabel: {
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        fontSize: '0.95rem',
    },
    checkbox: {
        marginRight: '0.5rem',
        width: '18px',
        height: '18px',
        cursor: 'pointer',
    },
    button: {
        width: '100%',
        padding: '1rem',
        backgroundColor: '#667eea',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        fontSize: '1rem',
        cursor: 'pointer',
        fontWeight: 'bold' as const,
        marginTop: '1rem',
    },
    error: {
        backgroundColor: '#ffebee',
        color: '#c62828',
        padding: '0.75rem',
        borderRadius: '4px',
        marginBottom: '1rem',
    },
    resultContainer: {
        backgroundColor: '#fff',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    resultHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '2px solid #667eea',
    },
    exportButton: {
        padding: '0.75rem 1.5rem',
        backgroundColor: '#4caf50',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        fontSize: '1rem',
        cursor: 'pointer',
    },
    surveyContent: {
        lineHeight: '1.6',
    },
};
