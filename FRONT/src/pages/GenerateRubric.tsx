import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { activityService } from '../services/activity.service';
import { ActivityType, ActivityVisibility, AIProvider } from '../types';

export const GenerateRubric: React.FC = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        visibility: ActivityVisibility.PRIVATE,
        provider: AIProvider.GEMINI,
        subject: '',
        grade: '',
        numCriteria: 4,
        numLevels: 4,
        maxScore: 100,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [generatedRubric, setGeneratedRubric] = useState<any>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Construir prompt para rúbrica
            const parts = [];
            parts.push(`Genera una rúbrica de evaluación`);
            if (formData.subject) parts.push(`para la materia de ${formData.subject}`);
            if (formData.grade) parts.push(`nivel ${formData.grade}`);
            parts.push(`con ${formData.numCriteria} criterios de evaluación`);
            parts.push(`y ${formData.numLevels} niveles de desempeño`);
            parts.push(`(puntaje máximo: ${formData.maxScore})`);
            if (formData.title) parts.push(`\nTítulo: ${formData.title}`);
            if (formData.description) parts.push(`\nDescripción: ${formData.description}`);

            const prompt = parts.join(' ');

            const payload = {
                title: formData.title || 'Rúbrica de Evaluación',
                description: formData.description,
                type: ActivityType.RUBRIC,
                visibility: formData.visibility,
                provider: formData.provider,
                prompt: prompt,
                subject: formData.subject,
                grade: formData.grade,
                additionalParams: {
                    numeroCriterios: formData.numCriteria,
                    numeroNiveles: formData.numLevels,
                    puntajeMaximo: formData.maxScore,
                },
            };

            console.log('📦 Payload enviado:', payload);
            const activity = await activityService.generateActivity(payload as any);

            console.log('✅ Rúbrica generada:', activity);
            console.log('📋 Contenido:', activity.content);
            console.log('📋 Criterios:', activity.content.criterios);
            setGeneratedRubric(activity);
        } catch (err: any) {
            console.error('❌ Error:', err);
            setError(err.response?.data?.error || 'Error al generar la rúbrica');
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
            [name]: name === 'numCriteria' || name === 'numLevels' || name === 'maxScore'
                ? parseInt(value) || 0
                : value,
        });
    };

    const convertRubricToHTML = (content: any, showScores: boolean = true): string => {
        // Si ya es string HTML, devolverlo
        if (typeof content === 'string' && content.trim().startsWith('<')) {
            return content;
        }

        // Si es un objeto JSON (estructura de rúbrica), convertirlo a HTML
        if (typeof content === 'object' && content !== null) {
            let html = '<div style="font-family: Arial, sans-serif; line-height: 1.6;">';

            // Título y metadata
            if (content.titulo || content.curso || content.materia) {
                html += '<div style="margin-bottom: 2rem; padding: 1rem; background-color: #f5f5f5; border-radius: 8px;">';
                if (content.titulo) html += `<h2 style="margin: 0.5rem 0; color: #1a1a2e;">${content.titulo}</h2>`;
                if (content.curso) html += `<p style="margin: 0.3rem 0;"><strong>Curso:</strong> ${content.curso}</p>`;
                if (content.materia) html += `<p style="margin: 0.3rem 0;"><strong>Materia:</strong> ${content.materia}</p>`;
                if (content.nivelEducativo) html += `<p style="margin: 0.3rem 0;"><strong>Nivel:</strong> ${content.nivelEducativo}</p>`;
                if (content.maximoPuntaje || content.puntajeMaximo) {
                    html += `<p style="margin: 0.3rem 0;"><strong>Puntaje Máximo:</strong> ${content.maximoPuntaje || content.puntajeMaximo}</p>`;
                }
                html += '</div>';
            }

            // Tabla de rúbrica
            if (content.criterios && Array.isArray(content.criterios) && content.criterios.length > 0) {
                html += '<table style="width: 100%; border-collapse: collapse; margin: 2rem 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">';

                // Obtener nombres de niveles del primer criterio
                const primeNiveles = content.criterios[0].niveles || [];

                // Header con niveles de desempeño
                html += '<thead><tr style="background-color: #1a1a2e; color: white;">';
                html += '<th style="padding: 1rem; text-align: left; border: 1px solid #ddd; min-width: 200px;">Criterio</th>';

                primeNiveles.forEach((nivel: any) => {
                    const nivelNombre = nivel.nivel || nivel.nombre || nivel;
                    html += `<th style="padding: 1rem; text-align: center; border: 1px solid #ddd;">${nivelNombre}</th>`;
                });
                html += '</tr></thead>';

                // Body con criterios
                html += '<tbody>';
                content.criterios.forEach((criterio: any, index: number) => {
                    html += `<tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f9f9f9'};">`;

                    // Nombre del criterio
                    const criterioNombre = criterio.nombre || criterio.criterio || `Criterio ${index + 1}`;
                    const criterioPeso = criterio.peso || criterio.puntaje || '';
                    html += `<td style="padding: 1rem; border: 1px solid #ddd; font-weight: bold; vertical-align: top;">
                        ${criterioNombre}
                        ${showScores && criterioPeso ? `<br><span style="font-size: 0.9em; color: #666;">(${criterioPeso} pts)</span>` : ''}
                    </td>`;

                    // Niveles para este criterio
                    if (criterio.niveles && Array.isArray(criterio.niveles)) {
                        criterio.niveles.forEach((nivel: any) => {
                            const descripcion = nivel.descripcion || nivel.descripción || nivel;
                            const puntaje = nivel.puntaje || nivel.puntos || '';
                            html += `<td style="padding: 1rem; border: 1px solid #ddd; text-align: left; vertical-align: top;">
                                ${typeof descripcion === 'string' ? descripcion : JSON.stringify(descripcion)}
                                ${showScores && puntaje ? `<br><strong style="color: #1a1a2e; font-size: 1.1em;">${puntaje} pts</strong>` : ''}
                            </td>`;
                        });
                    }

                    html += '</tr>';
                });
                html += '</tbody>';
                html += '</table>';
            }

            // Descripción o instrucciones si existen
            if (content.descripcion) {
                html += '<div style="margin-top: 2rem; padding: 1rem; background-color: #e3f2fd; border-left: 4px solid #2196f3; border-radius: 4px;">';
                html += `<h3 style="margin-top: 0; color: #1565c0;">Descripción</h3>`;
                html += `<p style="margin-bottom: 0;">${content.descripcion}</p>`;
                html += '</div>';
            }

            if (content.instrucciones) {
                html += '<div style="margin-top: 2rem; padding: 1rem; background-color: #e3f2fd; border-left: 4px solid #2196f3; border-radius: 4px;">';
                html += `<h3 style="margin-top: 0; color: #1565c0;">Instrucciones de Uso</h3>`;
                html += `<p style="margin-bottom: 0;">${content.instrucciones}</p>`;
                html += '</div>';
            }

            html += '</div>';
            return html;
        }

        // Si es texto plano, convertir a HTML básico
        const text = String(content);
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n\n/g, '</p><p style="margin: 1rem 0;">')
            .replace(/\n/g, '<br>')
            .replace(/^(.*)/, '<p style="margin: 1rem 0;">$1')
            .concat('</p>');
    };

    const exportToPDF = () => {
        if (!generatedRubric) return;

        const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto;">
        <h1 style="text-align: center; color: #1a1a2e;">${generatedRubric.title}</h1>
        ${convertRubricToHTML(generatedRubric.content, false)}
      </div>
    `;

        import('../services/export.service').then(({ exportService }) => {
            exportService.exportToPDF(htmlContent, generatedRubric.title);
        });
    };

    return (
        <>
            <Navbar />
            <div style={styles.container}>
                <h1>Generador de Rúbricas</h1>

                <form onSubmit={handleSubmit} style={styles.form}>
                    {error && <div style={styles.error}>{error}</div>}

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Título *</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            placeholder="Ej: Rúbrica para Proyecto de Ciencias"
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Descripción</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            style={styles.textarea}
                            rows={3}
                            placeholder="Describe qué se evaluará con esta rúbrica..."
                        />
                    </div>

                    <div style={styles.row}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Materia</label>
                            <input
                                type="text"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                style={styles.input}
                                placeholder="Ej: Ciencias Naturales"
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
                                placeholder="Ej: Secundaria"
                            />
                        </div>
                    </div>

                    <div style={styles.row}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Número de Criterios</label>
                            <input
                                type="number"
                                name="numCriteria"
                                value={formData.numCriteria}
                                onChange={handleChange}
                                min={2}
                                max={10}
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Niveles de Desempeño</label>
                            <input
                                type="number"
                                name="numLevels"
                                value={formData.numLevels}
                                onChange={handleChange}
                                min={3}
                                max={6}
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Puntaje Máximo</label>
                            <input
                                type="number"
                                name="maxScore"
                                value={formData.maxScore}
                                onChange={handleChange}
                                min={10}
                                max={1000}
                                style={styles.input}
                            />
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

                    <button type="submit" disabled={loading} style={styles.button}>
                        {loading ? 'Generando Rúbrica...' : 'Generar Rúbrica'}
                    </button>
                </form>

                {generatedRubric && (
                    <div style={styles.resultContainer}>
                        <div style={styles.resultHeader}>
                            <h2>Rúbrica Generada</h2>
                            <button onClick={exportToPDF} style={styles.exportButton}>
                                📄 Exportar a PDF
                            </button>
                        </div>
                        <div
                            style={styles.content}
                            dangerouslySetInnerHTML={{ __html: convertRubricToHTML(generatedRubric.content, true) }}
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
    },
};
