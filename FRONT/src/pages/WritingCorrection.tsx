import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { activityService } from '../services/activity.service';
import { ActivityType, ActivityVisibility, AIProvider } from '../types';

export const WritingCorrection: React.FC = () => {
    const [formData, setFormData] = useState({
        title: '',
        visibility: ActivityVisibility.PRIVATE,
        provider: AIProvider.GEMINI,
        originalText: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [correctedResult, setCorrectedResult] = useState<any>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.originalText.trim()) {
            setError('Por favor ingresa el texto a corregir');
            return;
        }

        setError('');
        setLoading(true);

        try {
            const prompt = `Analiza y corrige el siguiente texto. Corrige errores de ortografía, gramática, puntuación, sintaxis y estilo. Proporciona el texto corregido y explica los cambios realizados.

Texto original:
${formData.originalText}`;

            const payload = {
                title: formData.title || 'Corrección de Escritura',
                description: 'Corrección automática de texto',
                type: ActivityType.WRITING_CORRECTION,
                visibility: formData.visibility,
                provider: formData.provider,
                prompt: prompt,
                subject: 'Corrección de Escritura',
                grade: '',
                additionalParams: {
                    textoOriginal: formData.originalText,
                },
            };

            const activity = await activityService.generateActivity(payload as any);
            console.log('✅ Corrección generada:', activity);
            setCorrectedResult(activity);
        } catch (err: any) {
            console.error('❌ Error:', err);
            setError(err.response?.data?.error || 'Error al corregir el texto');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const convertToHTML = (content: any): string => {
        // Si ya es HTML
        if (typeof content === 'string' && content.trim().startsWith('<')) {
            return content;
        }

        // Si es un objeto con estructura de corrección
        if (typeof content === 'object' && content !== null) {
            let html = '<div style="font-family: Arial, sans-serif; line-height: 1.8;">';

            // Texto original
            if (content.textoOriginal || formData.originalText) {
                html += '<div style="margin-bottom: 2rem; padding: 1.5rem; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">';
                html += '<h3 style="margin-top: 0; color: #856404;">📝 Texto Original</h3>';
                html += `<p style="white-space: pre-wrap; color: #666;">${content.textoOriginal || formData.originalText}</p>`;
                html += '</div>';
            }

            // Texto corregido
            if (content.textoCorregido || content.texto_corregido) {
                html += '<div style="margin-bottom: 2rem; padding: 1.5rem; background-color: #d4edda; border-left: 4px solid #28a745; border-radius: 4px;">';
                html += '<h3 style="margin-top: 0; color: #155724;">✅ Texto Corregido</h3>';
                html += `<p style="white-space: pre-wrap;">${content.textoCorregido || content.texto_corregido}</p>`;
                html += '</div>';
            }

            // Correcciones / Cambios realizados
            if (content.correcciones || content.cambios) {
                const correcciones = content.correcciones || content.cambios;
                html += '<div style="margin-bottom: 2rem; padding: 1.5rem; background-color: #d1ecf1; border-left: 4px solid #17a2b8; border-radius: 4px;">';
                html += '<h3 style="margin-top: 0; color: #0c5460;">📋 Correcciones Realizadas</h3>';

                if (Array.isArray(correcciones)) {
                    html += '<ul style="margin: 0; padding-left: 1.5rem;">';
                    correcciones.forEach((corr: any) => {
                        if (typeof corr === 'string') {
                            html += `<li style="margin: 0.5rem 0;">${corr}</li>`;
                        } else if (corr.tipo && corr.descripcion) {
                            html += `<li style="margin: 0.5rem 0;"><strong>${corr.tipo}:</strong> ${corr.descripcion}</li>`;
                        }
                    });
                    html += '</ul>';
                } else if (typeof correcciones === 'string') {
                    html += `<p style="white-space: pre-wrap;">${correcciones}</p>`;
                }

                html += '</div>';
            }

            // Recomendaciones
            if (content.recomendaciones || content.sugerencias) {
                const recomendaciones = content.recomendaciones || content.sugerencias;
                html += '<div style="margin-bottom: 2rem; padding: 1.5rem; background-color: #e7f3ff; border-left: 4px solid #2196F3; border-radius: 4px;">';
                html += '<h3 style="margin-top: 0; color: #0d47a1;">💡 Recomendaciones</h3>';

                if (Array.isArray(recomendaciones)) {
                    html += '<ul style="margin: 0; padding-left: 1.5rem;">';
                    recomendaciones.forEach((rec: string) => {
                        html += `<li style="margin: 0.5rem 0;">${rec}</li>`;
                    });
                    html += '</ul>';
                } else if (typeof recomendaciones === 'string') {
                    html += `<p style="white-space: pre-wrap;">${recomendaciones}</p>`;
                }

                html += '</div>';
            }

            html += '</div>';
            return html;
        }

        // Si es texto plano, mostrarlo
        const text = String(content);
        return `<div style="font-family: Arial, sans-serif; line-height: 1.8; white-space: pre-wrap;">${text}</div>`;
    };

    const exportToPDF = () => {
        if (!correctedResult) return;

        const htmlContent = convertToHTML(correctedResult.content);

        import('../services/export.service').then(({ exportService }) => {
            exportService.exportToPDF(htmlContent, correctedResult.title || 'Corrección de Escritura');
        });
    };

    const resetForm = () => {
        setFormData({
            title: '',
            visibility: ActivityVisibility.PRIVATE,
            provider: AIProvider.GEMINI,
            originalText: '',
        });
        setCorrectedResult(null);
        setError('');
    };

    return (
        <>
            <Navbar />
            <div style={styles.container}>
                <h1>📝 Corrección de Escritura con IA</h1>
                <p style={styles.subtitle}>
                    Sube o pega tu texto y la IA lo corregirá automáticamente
                </p>

                <form onSubmit={handleSubmit} style={styles.form}>
                    {error && <div style={styles.error}>{error}</div>}

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Título (Opcional)</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            style={styles.input}
                            placeholder="Ej: Ensayo sobre el Medio Ambiente"
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Texto a Corregir *</label>
                        <textarea
                            name="originalText"
                            value={formData.originalText}
                            onChange={handleChange}
                            required
                            style={styles.textarea}
                            rows={12}
                            placeholder="Pega o escribe aquí el texto que deseas corregir..."
                        />
                        <small style={{ color: '#666', fontSize: '0.85rem' }}>
                            {formData.originalText.length} caracteres
                        </small>
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

                    <div style={styles.buttonGroup}>
                        <button type="submit" disabled={loading} style={styles.button}>
                            {loading ? 'Corrigiendo...' : '✨ Corregir Texto'}
                        </button>
                        {correctedResult && (
                            <button
                                type="button"
                                onClick={resetForm}
                                style={styles.resetButton}
                            >
                                🔄 Nueva Corrección
                            </button>
                        )}
                    </div>
                </form>

                {correctedResult && (
                    <div style={styles.resultContainer}>
                        <div style={styles.resultHeader}>
                            <h2>Resultado de la Corrección</h2>
                            <button onClick={exportToPDF} style={styles.exportButton}>
                                📄 Exportar a PDF
                            </button>
                        </div>
                        <div
                            style={styles.resultContent}
                            dangerouslySetInnerHTML={{ __html: convertToHTML(correctedResult.content) }}
                        />
                    </div>
                )}
            </div>
        </>
    );
};

const styles = {
    container: {
        maxWidth: '1000px',
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
    buttonGroup: {
        display: 'flex',
        gap: '1rem',
        marginTop: '1rem',
    },
    button: {
        flex: 1,
        padding: '1rem',
        backgroundColor: '#1a1a2e',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        fontSize: '1rem',
        cursor: 'pointer',
        fontWeight: 'bold' as const,
    },
    resetButton: {
        flex: 1,
        padding: '1rem',
        backgroundColor: '#6c757d',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        fontSize: '1rem',
        cursor: 'pointer',
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
        borderBottom: '2px solid #1a1a2e',
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
    resultContent: {
        lineHeight: '1.8',
        color: '#333',
    },
};
