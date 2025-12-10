import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { activityService } from '../../services/activity.service';
import { ActivityType, ActivityVisibility, AIProvider } from '../../types';
import toast from 'react-hot-toast';
import { FaSpinner, FaArrowLeft } from 'react-icons/fa';

export const GenerateWordSearch: React.FC = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        subject: '',
        gradeLevel: '',
        tema: '',
        cantidadPalabras: 10,
        gridSize: 15,
        difficulty: 'Medio',
        visibility: ActivityVisibility.PRIVATE,
        provider: AIProvider.GEMINI,
    });

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                title: formData.title,
                description: formData.description,
                type: ActivityType.WORD_SEARCH,
                visibility: formData.visibility,
                provider: formData.provider,
                prompt: `Generar una sopa de letras sobre el tema: ${formData.tema}`,
                subject: formData.subject,
                gradeLevel: formData.gradeLevel,
                additionalParams: {
                    tema: formData.tema,
                    materia: formData.subject,
                    nivelEducativo: formData.gradeLevel,
                    cantidadPalabras: formData.cantidadPalabras,
                    gridSize: formData.gridSize,
                    dificultad: formData.difficulty,
                    titulo: formData.title,
                    descripcion: formData.description,
                },
            };

            const activity = await activityService.generateActivity(payload as any);
            toast.success('Sopa de letras generada exitosamente');
            navigate(`/teacher/activities/${activity.id}`);
        } catch (err: any) {
            console.error('Error generating word search:', err);
            toast.error(err.response?.data?.message || 'Error al generar la sopa de letras');
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
            [name]: name === 'cantidadPalabras' || name === 'gridSize' ? Number(value) : value,
        });
    };

    return (
        <div style={styles.container}>
            <button onClick={() => navigate(-1)} style={styles.backButton}>
                <FaArrowLeft /> Volver
            </button>

            <div style={styles.header}>
                <h1 style={styles.title}>🔤 Generar Sopa de Letras</h1>
                <p style={styles.subtitle}>
                    Crea una sopa de letras educativa personalizada con inteligencia artificial
                </p>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>Información General</h3>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Título *</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            style={styles.input}
                            placeholder="Ej: Animales de la selva"
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
                            placeholder="Descripción opcional de la actividad"
                        />
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
                                placeholder="Ej: Ciencias Naturales"
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Nivel Educativo *</label>
                            <input
                                type="text"
                                name="gradeLevel"
                                value={formData.gradeLevel}
                                onChange={handleChange}
                                required
                                style={styles.input}
                                placeholder="Ej: Primaria, Secundaria"
                            />
                        </div>
                    </div>
                </div>

                <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>Configuración de la Sopa de Letras</h3>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Tema *</label>
                        <input
                            type="text"
                            name="tema"
                            value={formData.tema}
                            onChange={handleChange}
                            required
                            style={styles.input}
                            placeholder="Ej: Animales de la selva, Verbos en inglés, Elementos químicos"
                        />
                        <small style={styles.hint}>
                            El tema sobre el cual se generarán las palabras de la sopa de letras
                        </small>
                    </div>

                    <div style={styles.row}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Cantidad de Palabras *</label>
                            <input
                                type="number"
                                name="cantidadPalabras"
                                value={formData.cantidadPalabras}
                                onChange={handleChange}
                                min="5"
                                max="20"
                                required
                                style={styles.input}
                            />
                            <small style={styles.hint}>Entre 5 y 20 palabras</small>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Tamaño del Grid</label>
                            <select
                                name="gridSize"
                                value={formData.gridSize}
                                onChange={handleChange}
                                style={styles.input}
                            >
                                <option value="10">10 × 10</option>
                                <option value="15">15 × 15</option>
                                <option value="20">20 × 20</option>
                            </select>
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
                    </div>

                    <div style={styles.difficultyInfo}>
                        <strong>Niveles de dificultad:</strong>
                        <ul style={styles.difficultyList}>
                            <li><strong>Fácil:</strong> Solo palabras horizontales y verticales</li>
                            <li><strong>Medio:</strong> Incluye diagonales y algunas palabras invertidas</li>
                            <li><strong>Difícil:</strong> Todas las direcciones posibles con mayor solapamiento</li>
                        </ul>
                    </div>
                </div>

                <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>Opciones Avanzadas</h3>

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
                            <small style={styles.hint}>
                                Las actividades públicas pueden ser vistas por otros docentes
                            </small>
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
                                <option value={AIProvider.OLLAMA}>Ollama (Gratis)</option>
                            </select>
                        </div>
                    </div>
                </div>

                <button type="submit" disabled={loading} style={styles.submitButton}>
                    {loading ? (
                        <>
                            <FaSpinner style={styles.spinner} />
                            Generando sopa de letras...
                        </>
                    ) : (
                        '✨ Generar Sopa de Letras'
                    )}
                </button>
            </form>
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '900px',
        margin: '0 auto',
        padding: '2rem',
    },
    backButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 1rem',
        backgroundColor: '#f5f5f5',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        marginBottom: '1rem',
        fontSize: '0.9rem',
        color: '#333',
    },
    header: {
        textAlign: 'center' as const,
        marginBottom: '2rem',
    },
    title: {
        fontSize: '2rem',
        fontWeight: 'bold',
        color: '#1a1a2e',
        marginBottom: '0.5rem',
    },
    subtitle: {
        fontSize: '1.1rem',
        color: '#666',
    },
    form: {
        backgroundColor: '#fff',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    section: {
        marginBottom: '2rem',
        paddingBottom: '2rem',
        borderBottom: '1px solid #e0e0e0',
    },
    sectionTitle: {
        fontSize: '1.3rem',
        fontWeight: 'bold',
        color: '#1a1a2e',
        marginBottom: '1rem',
    },
    formGroup: {
        marginBottom: '1.5rem',
        flex: 1,
    },
    row: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
    },
    label: {
        display: 'block',
        marginBottom: '0.5rem',
        fontWeight: '600',
        color: '#333',
        fontSize: '0.95rem',
    },
    input: {
        width: '100%',
        padding: '0.75rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '1rem',
        transition: 'border-color 0.2s',
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
    hint: {
        display: 'block',
        marginTop: '0.25rem',
        fontSize: '0.85rem',
        color: '#999',
    },
    difficultyInfo: {
        backgroundColor: '#f8f9fa',
        padding: '1rem',
        borderRadius: '4px',
        marginTop: '1rem',
        fontSize: '0.9rem',
        color: '#555',
    },
    difficultyList: {
        marginTop: '0.5rem',
        paddingLeft: '1.5rem',
        lineHeight: '1.8',
    },
    submitButton: {
        width: '100%',
        padding: '1rem',
        backgroundColor: '#1a1a2e',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        fontSize: '1.1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        transition: 'background-color 0.2s',
    },
    spinner: {
        animation: 'spin 1s linear infinite',
    },
};
