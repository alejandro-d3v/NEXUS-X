import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { activityService } from '../services/activity.service';
import { ActivityType, ActivityVisibility, AIProvider } from '../types';

export const GenerateExam: React.FC = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        visibility: ActivityVisibility.PRIVATE,
        provider: AIProvider.GEMINI,
        subject: '',
        grade: '',
        duration: 60,
        difficulty: 'Medio',
        language: 'Español',
        cantidadPreguntas: 10,
        cantidadOM: 5,
        cantidadVF: 5,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [validationError, setValidationError] = useState('');
    const [generatedExam, setGeneratedExam] = useState<any>(null);

    // Validación: OM + VF = Total
    const validateQuestions = () => {
        const total = Number(formData.cantidadPreguntas);
        const om = Number(formData.cantidadOM);
        const vf = Number(formData.cantidadVF);

        if (om + vf !== total) {
            setValidationError(`La suma de OM (${om}) y VF (${vf}) debe ser igual al total (${total})`);
            return false;
        }
        setValidationError('');
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!validateQuestions()) {
            return;
        }

        setLoading(true);

        try {
            // Generar prompt automáticamente
            const parts = [];
            parts.push(`Genera un examen de ${formData.cantidadPreguntas} preguntas`);
            if (formData.subject) parts.push(`sobre ${formData.subject}`);
            if (formData.grade) parts.push(`para nivel ${formData.grade}`);
            if (formData.difficulty) parts.push(`con dificultad ${formData.difficulty}`);
            parts.push(`\n- ${formData.cantidadOM} preguntas de opción múltiple`);
            parts.push(`\n- ${formData.cantidadVF} preguntas de verdadero/falso`);
            if (formData.title) parts.push(`\nTítulo: ${formData.title}`);
            if (formData.description) parts.push(`\nDescripción: ${formData.description}`);

            const prompt = parts.join(' ');

            const payload = {
                title: formData.title,
                description: formData.description,
                type: ActivityType.EXAM,
                visibility: formData.visibility,
                provider: formData.provider,
                prompt: prompt,
                subject: formData.subject,
                grade: formData.grade,
                additionalParams: {
                    titulo: formData.title,
                    descripcion: formData.description,
                    materia: formData.subject,
                    nivelEducativo: formData.grade,
                    idioma: formData.language,
                    duracion: formData.duration,
                    dificultad: formData.difficulty,
                    cantidadPreguntas: formData.cantidadPreguntas,
                    cantidadOM: formData.cantidadOM,
                    cantidadVF: formData.cantidadVF,
                },
            };

            const activity = await activityService.generateActivity(payload as any);
            console.log('✅ Examen generado:', activity);
            console.log('📄 Contenido:', activity.content);
            setGeneratedExam(activity);
        } catch (err: any) {
            console.error('❌ Error:', err);
            setError(err.response?.data?.error || 'Error al generar el examen');
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
            [name]: name === 'duration' || name === 'cantidadPreguntas' || name === 'cantidadOM' || name === 'cantidadVF'
                ? Number(value)
                : value,
        });

        // Validar en tiempo real
        if (['cantidadPreguntas', 'cantidadOM', 'cantidadVF'].includes(name)) {
            setTimeout(validateQuestions, 100);
        }
    };

    // Convertir JSON del examen a HTML
    const convertExamToHTML = (examData: any, showAnswers: boolean = true): string => {
        // Si ya es string (HTML), devolverlo tal cual
        if (typeof examData === 'string') {
            return examData;
        }

        // Si es objeto JSON, convertirlo a HTML
        const meta = examData.meta || {};
        const preguntas = examData.preguntas || [];

        let html = `
            <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
                <h1 style="text-align: center; color: #1a1a2e;">${meta.titulo || 'Examen'}</h1>
                ${meta.descripcion ? `<p style="text-align: center; color: #666;"><em>${meta.descripcion}</em></p>` : ''}
                
                <div style="margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-radius: 8px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        ${meta.materia ? `<p><strong>Materia:</strong> ${meta.materia}</p>` : ''}
                        ${meta.nivelEducativo ? `<p><strong>Nivel:</strong> ${meta.nivelEducativo}</p>` : ''}
                        ${meta.dificultad ? `<p><strong>Dificultad:</strong> ${meta.dificultad}</p>` : ''}
                        ${meta.duracion ? `<p><strong>Duración:</strong> ${meta.duracion} minutos</p>` : ''}
                    </div>
                </div>

                <div style="margin-top: 30px;">
        `;

        preguntas.forEach((pregunta: any, index: number) => {
            // Intentar obtener el texto de la pregunta de varios campos posibles
            const textoPregunta = pregunta.pregunta || pregunta.question || pregunta.enunciado || 'Pregunta sin texto';

            html += `
                <div style="margin-bottom: 30px; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #fff;">
                    <h3 style="color: #1a1a2e; margin-bottom: 15px;">${index + 1}. ${textoPregunta}</h3>
            `;

            if (pregunta.tipo === 'opcion_multiple' && pregunta.opciones) {
                html += '<div style="margin-left: 20px;">';
                pregunta.opciones.forEach((opcion: string, i: number) => {
                    const letra = String.fromCharCode(65 + i); // A, B, C, D
                    html += `<p style="margin: 8px 0;">
                        <span style="font-weight: bold; margin-right: 8px;">${letra})</span> ${opcion}
                    </p>`;
                });
                html += '</div>';

                if (showAnswers && pregunta.respuesta_correcta) {
                    html += `<p style="margin-top: 15px; padding: 10px; background-color: #e8f5e9; border-left: 4px solid #4caf50; color: #2e7d32;">
                        <strong>Respuesta correcta:</strong> ${pregunta.respuesta_correcta}
                    </p>`;
                }
            } else if (pregunta.tipo === 'verdadero_falso') {
                html += `
                    <div style="margin-left: 20px;">
                        <p style="margin: 8px 0;">___ Verdadero</p>
                        <p style="margin: 8px 0;">___ Falso</p>
                    </div>
                `;

                if (showAnswers && pregunta.respuesta_correcta !== undefined) {
                    html += `<p style="margin-top: 15px; padding: 10px; background-color: #e8f5e9; border-left: 4px solid #4caf50; color: #2e7d32;">
                        <strong>Respuesta correcta:</strong> ${pregunta.respuesta_correcta ? 'Verdadero' : 'Falso'}
                    </p>`;
                }
            }

            if (showAnswers && pregunta.explicacion) {
                html += `<p style="margin-top: 10px; padding: 10px; background-color: #f5f5f5; border-left: 4px solid #2196f3; color: #555;">
                    <strong>Explicación:</strong> ${pregunta.explicacion}
                </p>`;
            }

            html += '</div>';
        });

        html += `
                </div>
            </div>
        `;

        return html;
    };

    const exportToPDF = () => {
        if (!generatedExam) return;

        // Convertir a HTML sin respuestas para el estudiante
        const htmlContent = convertExamToHTML(generatedExam.content, false);

        // Usar el servicio de exportación
        import('../services/export.service').then(({ exportService }) => {
            exportService.exportToPDF(htmlContent, generatedExam.title);
        });
    };

    return (
        <>
            <Navbar />
            <div style={styles.container}>
                <h1>Generar Examen</h1>

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
                        />
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

                    <div style={styles.row}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Materia *</label>
                            <input
                                type="text"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                required
                                style={styles.input}
                                placeholder="Ej: Matemáticas"
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Nivel Educativo *</label>
                            <input
                                type="text"
                                name="grade"
                                value={formData.grade}
                                onChange={handleChange}
                                required
                                style={styles.input}
                                placeholder="Ej: Secundaria"
                            />
                        </div>
                    </div>

                    <div style={styles.row}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Duración (minutos)</label>
                            <input
                                type="number"
                                name="duration"
                                value={formData.duration}
                                onChange={handleChange}
                                style={styles.input}
                                min="1"
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Dificultad</label>
                            <select
                                name="difficulty"
                                value={formData.difficulty}
                                onChange={handleChange}
                                style={styles.input}
                            >
                                <option value="Fácil">Fácil</option>
                                <option value="Medio">Medio</option>
                                <option value="Difícil">Difícil</option>
                            </select>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Idioma</label>
                            <input
                                type="text"
                                name="language"
                                value={formData.language}
                                onChange={handleChange}
                                style={styles.input}
                            />
                        </div>
                    </div>

                    <div style={styles.examHeader}>
                        <h3>Configuración de Preguntas</h3>
                    </div>

                    <div style={styles.row}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Total de Preguntas *</label>
                            <input
                                type="number"
                                name="cantidadPreguntas"
                                value={formData.cantidadPreguntas}
                                onChange={handleChange}
                                min="1"
                                max="100"
                                required
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Preguntas de Opción Múltiple *</label>
                            <input
                                type="number"
                                name="cantidadOM"
                                value={formData.cantidadOM}
                                onChange={handleChange}
                                min="0"
                                max="100"
                                required
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Preguntas de Verdadero/Falso *</label>
                            <input
                                type="number"
                                name="cantidadVF"
                                value={formData.cantidadVF}
                                onChange={handleChange}
                                min="0"
                                max="100"
                                required
                                style={styles.input}
                            />
                        </div>
                    </div>

                    {validationError && (
                        <div style={styles.validationError}>
                            ⚠️ {validationError}
                        </div>
                    )}

                    <button type="submit" disabled={loading || !!validationError} style={styles.button}>
                        {loading ? 'Generando...' : 'Generar Examen'}
                    </button>
                </form>

                {/* Mostrar examen generado */}
                {generatedExam && (
                    <div style={styles.examResult}>
                        <div style={styles.examResultHeader}>
                            <h2>Examen Generado</h2>
                            <button onClick={exportToPDF} style={styles.exportButton}>
                                📄 Exportar a PDF
                            </button>
                        </div>
                        <div
                            style={styles.examContent}
                            dangerouslySetInnerHTML={{ __html: convertExamToHTML(generatedExam.content, true) }}
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
    examHeader: {
        marginTop: '1.5rem',
        marginBottom: '1rem',
        paddingBottom: '0.5rem',
        borderBottom: '2px solid #1a1a2e',
    },
    validationError: {
        backgroundColor: '#fff3cd',
        color: '#856404',
        padding: '0.75rem',
        borderRadius: '4px',
        marginTop: '0.5rem',
        border: '1px solid #ffc107',
    },
    examResult: {
        backgroundColor: '#fff',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    examResultHeader: {
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
    examContent: {
        lineHeight: '1.6',
        color: '#333',
    },
};
