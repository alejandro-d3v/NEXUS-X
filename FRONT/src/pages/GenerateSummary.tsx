import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { activityService } from '../services/activity.service';
import { ActivityType, ActivityVisibility, AIProvider } from '../types';

export const GenerateSummary: React.FC = () => {
    const [mode, setMode] = useState<'TOPIC' | 'PDF'>('TOPIC');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        visibility: ActivityVisibility.PRIVATE,
        provider: AIProvider.GEMINI,
        subject: '',
        grade: '',
        length: 'Medio', // Corto, Medio, Largo
        focus: 'General', // Puntos clave, Resumen ejecutivo, Análisis detallado
    });
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [generatedSummary, setGeneratedSummary] = useState<any>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let activity;

            if (mode === 'PDF') {
                if (!pdfFile) {
                    setError('Por favor selecciona un archivo PDF');
                    setLoading(false);
                    return;
                }

                const formDataToSend = new FormData();
                formDataToSend.append('pdfFile', pdfFile);
                formDataToSend.append('title', formData.title || pdfFile.name.replace('.pdf', ''));
                formDataToSend.append('type', ActivityType.SUMMARY);
                formDataToSend.append('visibility', formData.visibility);
                formDataToSend.append('provider', formData.provider);
                formDataToSend.append('subject', formData.subject || 'General');
                formDataToSend.append('grade', formData.grade || 'General');

                // Construir prompt para PDF
                const prompt = `Genera un resumen ${formData.length.toLowerCase()} con enfoque en ${formData.focus.toLowerCase()} del documento PDF proporcionado.`;
                formDataToSend.append('prompt', prompt);

                const additionalParams = {
                    longitud: formData.length,
                    enfoque: formData.focus,
                };
                formDataToSend.append('additionalParams', JSON.stringify(additionalParams));

                activity = await activityService.generateActivityWithPDF(formDataToSend);
            } else {
                // Modo TEMA
                const parts = [];
                parts.push(`Genera un resumen ${formData.length.toLowerCase()}`);
                if (formData.subject) parts.push(`sobre ${formData.subject}`);
                if (formData.grade) parts.push(`para nivel ${formData.grade}`);
                parts.push(`con enfoque en ${formData.focus.toLowerCase()}`);
                if (formData.title) parts.push(`\nTítulo: ${formData.title}`);
                if (formData.description) parts.push(`\nDescripción: ${formData.description}`);

                const prompt = parts.join(' ');

                const payload = {
                    title: formData.title,
                    description: formData.description,
                    type: ActivityType.SUMMARY,
                    visibility: formData.visibility,
                    provider: formData.provider,
                    prompt: prompt,
                    subject: formData.subject,
                    grade: formData.grade,
                    additionalParams: {
                        longitud: formData.length,
                        enfoque: formData.focus,
                    },
                };

                activity = await activityService.generateActivity(payload as any);
            }

            console.log('✅ Resumen generado:', activity);
            setGeneratedSummary(activity);
        } catch (err: any) {
            console.error('❌ Error:', err);
            setError(err.response?.data?.error || 'Error al generar el resumen');
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.type === 'application/pdf') {
                setPdfFile(file);
                // Auto-fill title if empty
                if (!formData.title) {
                    setFormData(prev => ({ ...prev, title: file.name.replace('.pdf', '') }));
                }
            } else {
                setError('Solo se permiten archivos PDF');
            }
        }
    };

    const convertSummaryToHTML = (content: string): string => {
        // Si el contenido ya parece HTML, devolverlo
        if (content.trim().startsWith('<')) return content;

        // Convertir markdown básico a HTML
        return content
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
            .replace(/\n/gim, '<br>');
    };

    const exportToPDF = () => {
        if (!generatedSummary) return;

        const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
        <h1 style="text-align: center; color: #1a1a2e;">${generatedSummary.title}</h1>
        <div style="margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-radius: 8px;">
           <p><strong>Tipo:</strong> Resumen (${formData.length})</p>
           <p><strong>Enfoque:</strong> ${formData.focus}</p>
        </div>
        <div style="line-height: 1.6; text-align: justify;">
          ${convertSummaryToHTML(generatedSummary.content)}
        </div>
      </div>
    `;

        import('../services/export.service').then(({ exportService }) => {
            exportService.exportToPDF(htmlContent, generatedSummary.title);
        });
    };

    return (
        <>
            <Navbar />
            <div style={styles.container}>
                <h1>Generador de Resúmenes</h1>

                <div style={styles.tabs}>
                    <button
                        style={{ ...styles.tab, ...(mode === 'TOPIC' ? styles.activeTab : {}) }}
                        onClick={() => setMode('TOPIC')}
                    >
                        Por Tema
                    </button>
                    <button
                        style={{ ...styles.tab, ...(mode === 'PDF' ? styles.activeTab : {}) }}
                        onClick={() => setMode('PDF')}
                    >
                        Subir PDF
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                    {error && <div style={styles.error}>{error}</div>}

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Título {mode === 'TOPIC' && '*'}</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required={mode === 'TOPIC'}
                            placeholder={mode === 'PDF' ? "Opcional (se usará el nombre del archivo)" : "Ej: La Revolución Industrial"}
                            style={styles.input}
                        />
                    </div>

                    {mode === 'TOPIC' && (
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Descripción / Texto a Resumir</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                style={styles.textarea}
                                rows={4}
                                placeholder="Pega aquí el texto o describe qué quieres resumir..."
                            />
                        </div>
                    )}

                    {mode === 'PDF' && (
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Archivo PDF *</label>
                            <div style={styles.fileInputContainer}>
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleFileChange}
                                    style={styles.fileInput}
                                    id="pdf-upload"
                                />
                                <label htmlFor="pdf-upload" style={styles.fileLabel}>
                                    {pdfFile ? `📄 ${pdfFile.name}` : '📂 Seleccionar PDF'}
                                </label>
                            </div>
                        </div>
                    )}

                    <div style={styles.row}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Longitud</label>
                            <select
                                name="length"
                                value={formData.length}
                                onChange={handleChange}
                                style={styles.input}
                            >
                                <option value="Corto">Corto (Puntos clave)</option>
                                <option value="Medio">Medio (1-2 páginas)</option>
                                <option value="Largo">Largo (Detallado)</option>
                            </select>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Enfoque</label>
                            <select
                                name="focus"
                                value={formData.focus}
                                onChange={handleChange}
                                style={styles.input}
                            >
                                <option value="General">General</option>
                                <option value="Ejecutivo">Resumen Ejecutivo</option>
                                <option value="Académico">Académico</option>
                                <option value="Creativo">Creativo</option>
                            </select>
                        </div>
                    </div>

                    <div style={styles.row}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Visibilidad</label>
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
                            <label style={styles.label}>Proveedor de IA</label>
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

                    {mode === 'TOPIC' && (
                        <div style={styles.row}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Materia</label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    style={styles.input}
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Nivel</label>
                                <input
                                    type="text"
                                    name="grade"
                                    value={formData.grade}
                                    onChange={handleChange}
                                    style={styles.input}
                                />
                            </div>
                        </div>
                    )}

                    <button type="submit" disabled={loading} style={styles.button}>
                        {loading ? 'Generando Resumen...' : 'Generar Resumen'}
                    </button>
                </form>

                {generatedSummary && (
                    <div style={styles.resultContainer}>
                        <div style={styles.resultHeader}>
                            <h2>Resumen Generado</h2>
                            <button onClick={exportToPDF} style={styles.exportButton}>
                                📄 Exportar a PDF
                            </button>
                        </div>
                        <div
                            style={styles.content}
                            dangerouslySetInnerHTML={{ __html: convertSummaryToHTML(generatedSummary.content) }}
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
    tabs: {
        display: 'flex',
        marginBottom: '2rem',
        borderBottom: '2px solid #eee',
    },
    tab: {
        padding: '1rem 2rem',
        border: 'none',
        background: 'none',
        fontSize: '1.1rem',
        cursor: 'pointer',
        color: '#666',
        borderBottom: '2px solid transparent',
        marginBottom: '-2px',
    },
    activeTab: {
        color: '#1a1a2e',
        borderBottom: '2px solid #1a1a2e',
        fontWeight: 'bold',
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
    fileInputContainer: {
        border: '2px dashed #ddd',
        padding: '2rem',
        textAlign: 'center' as const,
        borderRadius: '8px',
        cursor: 'pointer',
    },
    fileInput: {
        display: 'none',
    },
    fileLabel: {
        cursor: 'pointer',
        fontSize: '1.1rem',
        color: '#666',
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
        marginBottom: '1.5rem',
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
    content: {
        lineHeight: '1.8',
        color: '#333',
        fontSize: '1.1rem',
    },
};
