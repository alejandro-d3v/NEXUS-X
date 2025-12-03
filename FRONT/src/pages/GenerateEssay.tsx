import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { activityService } from '../services/activity.service';
import { ActivityType, ActivityVisibility, AIProvider } from '../types';

export const GenerateEssay: React.FC = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        visibility: ActivityVisibility.PRIVATE,
        provider: AIProvider.GEMINI,
        nivelEducativo: '',
        tema: '',
        numeroPaginas: 3,
        tipoEnsayo: 'Argumentativo',
        estilo: 'Académico',
        formatoCitas: 'APA',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [generatedEssay, setGeneratedEssay] = useState<any>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Generar prompt automáticamente
            const parts = [];
            parts.push(`Genera un ensayo ${formData.tipoEnsayo.toLowerCase()}`);
            if (formData.tema) parts.push(`sobre ${formData.tema}`);
            if (formData.nivelEducativo) parts.push(`para nivel ${formData.nivelEducativo}`);
            parts.push(`de aproximadamente ${formData.numeroPaginas} páginas`);
            parts.push(`con estilo ${formData.estilo.toLowerCase()}`);
            parts.push(`y formato de citas ${formData.formatoCitas}`);
            if (formData.title) parts.push(`\nTítulo: ${formData.title}`);
            if (formData.description) parts.push(`\nDescripción/Contexto: ${formData.description}`);

            const prompt = parts.join(' ');

            const payload = {
                title: formData.title,
                description: formData.description,
                type: ActivityType.ESSAY,
                visibility: formData.visibility,
                provider: formData.provider,
                prompt: prompt,
                subject: formData.tema,
                grade: formData.nivelEducativo,
                additionalParams: {
                    titulo: formData.title,
                    descripcion: formData.description,
                    nivelEducativo: formData.nivelEducativo,
                    tema: formData.tema,
                    numeroPaginas: formData.numeroPaginas,
                    tipoEnsayo: formData.tipoEnsayo,
                    estilo: formData.estilo,
                    formatoCitas: formData.formatoCitas,
                },
            };

            const activity = await activityService.generateActivity(payload as any);
            console.log('✅ Ensayo generado:', activity);
            console.log('📄 Contenido:', activity.content);
            setGeneratedEssay(activity);
        } catch (err: any) {
            console.error('❌ Error:', err);
            setError(err.response?.data?.error || 'Error al generar el ensayo');
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
            [name]: name === 'numeroPaginas' ? Number(value) : value,
        });
    };

    const convertEssayToHTML = (content: any): string => {
        // Si ya es string HTML, devolverlo
        if (typeof content === 'string' && content.trim().startsWith('<')) {
            return content;
        }

        // Si es un objeto JSON (estructura del ensayo), convertirlo a HTML
        if (typeof content === 'object' && content !== null) {
            let html = '<div style="font-family: Georgia, serif; line-height: 1.8; max-width: 800px; margin: 0 auto;">';

            // Título
            if (content.titulo) {
                html += `<h1 style="text-align: center; margin-bottom: 1rem; color: #1a1a2e;">${content.titulo}</h1>`;
            }

            // Información del ensayo
            if (content.autor || content.fecha || content.institucion) {
                html += '<div style="text-align: center; margin-bottom: 2rem; color: #666;">';
                if (content.autor) html += `<p style="margin: 0.25rem 0;">${content.autor}</p>`;
                if (content.institucion) html += `<p style="margin: 0.25rem 0;">${content.institucion}</p>`;
                if (content.fecha) html += `<p style="margin: 0.25rem 0;">${content.fecha}</p>`;
                html += '</div>';
            }

            // Resumen/Abstract
            if (content.resumen || content.abstract) {
                html += '<div style="margin: 2rem 0; padding: 1rem; background-color: #f9f9f9; border-left: 4px solid #1a1a2e;">';
                html += '<h3 style="margin-top: 0;">Resumen</h3>';
                html += `<p style="text-align: justify;">${content.resumen || content.abstract}</p>`;
                html += '</div>';
            }

            // Introducción
            if (content.introduccion) {
                html += '<div style="margin: 2rem 0;">';
                html += '<h2 style="color: #1a1a2e; border-bottom: 2px solid #1a1a2e; padding-bottom: 0.5rem;">Introducción</h2>';
                html += `<p style="text-align: justify; text-indent: 2rem;">${content.introduccion.replace(/\n/g, '</p><p style="text-align: justify; text-indent: 2rem;">')}</p>`;
                html += '</div>';
            }

            // Desarrollo/Cuerpo
            if (content.desarrollo || content.cuerpo) {
                const desarrollo = content.desarrollo || content.cuerpo;

                if (Array.isArray(desarrollo)) {
                    // Si el desarrollo es un array de secciones
                    desarrollo.forEach((seccion: any, index: number) => {
                        html += '<div style="margin: 2rem 0;">';
                        if (seccion.titulo) {
                            html += `<h2 style="color: #1a1a2e; border-bottom: 2px solid #1a1a2e; padding-bottom: 0.5rem;">${seccion.titulo}</h2>`;
                        } else {
                            html += `<h2 style="color: #1a1a2e; border-bottom: 2px solid #1a1a2e; padding-bottom: 0.5rem;">Sección ${index + 1}</h2>`;
                        }
                        html += `<p style="text-align: justify; text-indent: 2rem;">${seccion.contenido.replace(/\n/g, '</p><p style="text-align: justify; text-indent: 2rem;">')}</p>`;
                        html += '</div>';
                    });
                } else if (typeof desarrollo === 'string') {
                    html += '<div style="margin: 2rem 0;">';
                    html += '<h2 style="color: #1a1a2e; border-bottom: 2px solid #1a1a2e; padding-bottom: 0.5rem;">Desarrollo</h2>';
                    html += `<p style="text-align: justify; text-indent: 2rem;">${desarrollo.replace(/\n/g, '</p><p style="text-align: justify; text-indent: 2rem;">')}</p>`;
                    html += '</div>';
                }
            }

            // Conclusión
            if (content.conclusion) {
                html += '<div style="margin: 2rem 0;">';
                html += '<h2 style="color: #1a1a2e; border-bottom: 2px solid #1a1a2e; padding-bottom: 0.5rem;">Conclusión</h2>';
                html += `<p style="text-align: justify; text-indent: 2rem;">${content.conclusion.replace(/\n/g, '</p><p style="text-align: justify; text-indent: 2rem;">')}</p>`;
                html += '</div>';
            }

            // Bibliografía/Referencias
            if (content.bibliografia || content.referencias) {
                const referencias = content.bibliografia || content.referencias;
                html += '<div style="margin: 2rem 0;">';
                html += '<h2 style="color: #1a1a2e; border-bottom: 2px solid #1a1a2e; padding-bottom: 0.5rem;">Referencias</h2>';
                html += '<ul style="list-style-type: none; padding-left: 2rem;">';
                if (Array.isArray(referencias)) {
                    referencias.forEach((ref: string) => {
                        html += `<li style="margin: 0.5rem 0; text-indent: -2rem; padding-left: 2rem;">${ref}</li>`;
                    });
                } else {
                    html += `<li style="margin: 0.5rem 0;">${referencias}</li>`;
                }
                html += '</ul></div>';
            }

            html += '</div>';
            return html;
        }

        // Si es texto plano, convertir a HTML básico
        const text = String(content);
        return `<div style="font-family: Georgia, serif; line-height: 1.8; white-space: pre-wrap;">${text}</div>`;
    };

    const exportToPDF = () => {
        if (!generatedEssay) return;

        const htmlContent = convertEssayToHTML(generatedEssay.content);

        import('../services/export.service').then(({ exportService }) => {
            exportService.exportToPDF(htmlContent, generatedEssay.title);
        });
    };

    return (
        <>
            <Navbar />
            <div style={styles.container}>
                <h1>✍️ Generador de Ensayos</h1>

                <form onSubmit={handleSubmit} style={styles.form}>
                    {error && <div style={styles.error}>{error}</div>}

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Título del Ensayo *</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            style={styles.input}
                            placeholder="Ej: El Impacto del Cambio Climático"
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Tema / Pregunta de Investigación *</label>
                        <input
                            type="text"
                            name="tema"
                            value={formData.tema}
                            onChange={handleChange}
                            required
                            style={styles.input}
                            placeholder="Ej: Cambio Climático, Inteligencia Artificial"
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Descripción / Contexto</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            style={styles.textarea}
                            rows={3}
                            placeholder="Proporciona contexto adicional, instrucciones específicas, o puntos clave a incluir..."
                        />
                    </div>

                    <div style={styles.row}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Nivel Educativo *</label>
                            <select
                                name="nivelEducativo"
                                value={formData.nivelEducativo}
                                onChange={handleChange}
                                required
                                style={styles.input}
                            >
                                <option value="">Seleccionar nivel</option>
                                <option value="Primaria">Primaria</option>
                                <option value="Secundaria">Secundaria</option>
                                <option value="Preparatoria">Preparatoria</option>
                                <option value="Universidad">Universidad</option>
                                <option value="Posgrado">Posgrado</option>
                            </select>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Número de Páginas *</label>
                            <input
                                type="number"
                                name="numeroPaginas"
                                value={formData.numeroPaginas}
                                onChange={handleChange}
                                min="1"
                                max="20"
                                required
                                style={styles.input}
                            />
                        </div>
                    </div>

                    <div style={styles.row}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Tipo de Ensayo *</label>
                            <select
                                name="tipoEnsayo"
                                value={formData.tipoEnsayo}
                                onChange={handleChange}
                                style={styles.input}
                            >
                                <option value="Argumentativo">Argumentativo</option>
                                <option value="Expositivo">Expositivo</option>
                                <option value="Narrativo">Narrativo</option>
                                <option value="Descriptivo">Descriptivo</option>
                                <option value="Analítico">Analítico</option>
                                <option value="Comparativo">Comparativo</option>
                            </select>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Estilo de Escritura *</label>
                            <select
                                name="estilo"
                                value={formData.estilo}
                                onChange={handleChange}
                                style={styles.input}
                            >
                                <option value="Académico">Académico</option>
                                <option value="Formal">Formal</option>
                                <option value="Informal">Informal</option>
                                <option value="Científico">Científico</option>
                                <option value="Periodístico">Periodístico</option>
                            </select>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Formato de Citas *</label>
                            <select
                                name="formatoCitas"
                                value={formData.formatoCitas}
                                onChange={handleChange}
                                style={styles.input}
                            >
                                <option value="APA">APA</option>
                                <option value="MLA">MLA</option>
                                <option value="Chicago">Chicago</option>
                                <option value="Harvard">Harvard</option>
                                <option value="IEEE">IEEE</option>
                            </select>
                        </div>
                    </div>

                    <div style={styles.row}>
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
                    </div>

                    <button type="submit" disabled={loading} style={styles.button}>
                        {loading ? 'Generando Ensayo...' : '✨ Generar Ensayo'}
                    </button>
                </form>

                {/* Mostrar ensayo generado */}
                {generatedEssay && (
                    <div style={styles.resultContainer}>
                        <div style={styles.resultHeader}>
                            <h2>Ensayo Generado</h2>
                            <button onClick={exportToPDF} style={styles.exportButton}>
                                📄 Exportar a PDF
                            </button>
                        </div>
                        <div
                            style={styles.essayContent}
                            dangerouslySetInnerHTML={{ __html: convertEssayToHTML(generatedEssay.content) }}
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
        fontWeight: 'bold',
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
    },
    button: {
        width: '100%',
        padding: '1rem',
        backgroundColor: '#1a1a2e',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        fontSize: '1rem',
        cursor: 'pointer',
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
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    essayContent: {
        lineHeight: '1.8',
        color: '#333',
        fontSize: '1.1rem',
    },
};
