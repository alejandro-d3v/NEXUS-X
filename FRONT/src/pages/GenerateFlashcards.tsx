import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { activityService } from '../services/activity.service';
import { ActivityType, ActivityVisibility, AIProvider } from '../types';

interface Flashcard {
    id: number;
    frente: string;
    reverso: string;
    categoria?: string;
}

export const GenerateFlashcards: React.FC = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        visibility: ActivityVisibility.PRIVATE,
        provider: AIProvider.GEMINI,
        nivelEducativo: '',
        cantidadTarjetas: 10,
        tipo: 'Definiciones',
        estilo: 'Conciso',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [generatedFlashcards, setGeneratedFlashcards] = useState<any>(null);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Generar prompt automáticamente
            const parts = [];
            parts.push(`Genera ${formData.cantidadTarjetas} tarjetas de estudio`);
            parts.push(`de tipo ${formData.tipo}`);
            if (formData.nivelEducativo) parts.push(`para nivel ${formData.nivelEducativo}`);
            parts.push(`con estilo ${formData.estilo.toLowerCase()}`);
            if (formData.title) parts.push(`\nTema: ${formData.title}`);
            if (formData.description) parts.push(`\nDescripción: ${formData.description}`);

            const prompt = parts.join(' ');

            const payload = {
                title: formData.title,
                description: formData.description,
                type: ActivityType.FLASHCARDS,
                visibility: formData.visibility,
                provider: formData.provider,
                prompt: prompt,
                subject: formData.title,
                grade: formData.nivelEducativo,
                additionalParams: {
                    titulo: formData.title,
                    descripcion: formData.description,
                    nivelEducativo: formData.nivelEducativo,
                    cantidadTarjetas: formData.cantidadTarjetas,
                    tipo: formData.tipo,
                    estilo: formData.estilo,
                },
            };

            const activity = await activityService.generateActivity(payload as any);
            console.log('✅ Flashcards generadas:', activity);
            console.log('📄 Contenido:', activity.content);
            setGeneratedFlashcards(activity);
            setCurrentCardIndex(0);
            setFlippedCards(new Set());
        } catch (err: any) {
            console.error('❌ Error:', err);
            setError(err.response?.data?.error || 'Error al generar las tarjetas');
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
            [name]: name === 'cantidadTarjetas' ? Number(value) : value,
        });
    };

    const toggleCardFlip = (index: number) => {
        const newFlipped = new Set(flippedCards);
        if (newFlipped.has(index)) {
            newFlipped.delete(index);
        } else {
            newFlipped.add(index);
        }
        setFlippedCards(newFlipped);
    };

    const getFlashcardsArray = (): Flashcard[] => {
        if (!generatedFlashcards) return [];

        const content = generatedFlashcards.content;

        // Si es objeto JSON con estructura de tarjetas
        if (typeof content === 'object' && content.tarjetas) {
            return content.tarjetas;
        }

        return [];
    };

    const exportToPDF = () => {
        if (!generatedFlashcards) return;

        const flashcards = getFlashcardsArray();

        // Crear HTML para PDF con diseño de matriz recortable
        let htmlContent = `
            <style>
                @page {
                    size: A4;
                    margin: 1cm;
                }
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                }
                .page {
                    page-break-after: always;
                    position: relative;
                }
                .grid-container {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    grid-template-rows: repeat(4, 1fr);
                    gap: 0;
                    width: 100%;
                    height: 297mm;
                }
                .flashcard {
                    border: 2px dashed #999;
                    padding: 15px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    text-align: center;
                    box-sizing: border-box;
                    height: 100%;
                }
                .flashcard-content {
                    font-size: 14px;
                    line-height: 1.4;
                    word-wrap: break-word;
                    max-width: 95%;
                }
                .flashcard-label {
                    position: absolute;
                    top: 5px;
                    right: 5px;
                    font-size: 10px;
                    color: #666;
                    font-weight: bold;
                }
                h1 {
                    text-align: center;
                    margin-bottom: 20px;
                    font-size: 18px;
                }
            </style>
        `;

        // Páginas de frentes
        htmlContent += `<div class="page">
            <h1>${generatedFlashcards.title} - Frente</h1>
            <div class="grid-container">`;

        for (let i = 0; i < 8 && i < flashcards.length; i++) {
            htmlContent += `
                <div class="flashcard">
                    <span class="flashcard-label">#${i + 1}</span>
                    <div class="flashcard-content">
                        ${flashcards[i].frente}
                    </div>
                </div>`;
        }

        htmlContent += `</div></div>`;

        // Páginas de reversos
        htmlContent += `<div class="page">
            <h1>${generatedFlashcards.title} - Reverso</h1>
            <div class="grid-container">`;

        for (let i = 0; i < 8 && i < flashcards.length; i++) {
            htmlContent += `
                <div class="flashcard">
                    <span class="flashcard-label">#${i + 1}</span>
                    <div class="flashcard-content">
                        ${flashcards[i].reverso}
                    </div>
                </div>`;
        }

        htmlContent += `</div></div>`;

        // Si hay más de 8 tarjetas, crear páginas adicionales
        if (flashcards.length > 8) {
            for (let page = 1; page < Math.ceil(flashcards.length / 8); page++) {
                // Frentes
                htmlContent += `<div class="page">
                    <h1>${generatedFlashcards.title} - Frente (Página ${page + 1})</h1>
                    <div class="grid-container">`;

                for (let i = page * 8; i < (page + 1) * 8 && i < flashcards.length; i++) {
                    htmlContent += `
                        <div class="flashcard">
                            <span class="flashcard-label">#${i + 1}</span>
                            <div class="flashcard-content">
                                ${flashcards[i].frente}
                            </div>
                        </div>`;
                }

                htmlContent += `</div></div>`;

                // Reversos
                htmlContent += `<div class="page">
                    <h1>${generatedFlashcards.title} - Reverso (Página ${page + 1})</h1>
                    <div class="grid-container">`;

                for (let i = page * 8; i < (page + 1) * 8 && i < flashcards.length; i++) {
                    htmlContent += `
                        <div class="flashcard">
                            <span class="flashcard-label">#${i + 1}</span>
                            <div class="flashcard-content">
                                ${flashcards[i].reverso}
                            </div>
                        </div>`;
                }

                htmlContent += `</div></div>`;
            }
        }

        import('../services/export.service').then(({ exportService }) => {
            exportService.exportToPDF(htmlContent, `${generatedFlashcards.title} - Flashcards`);
        });
    };

    const flashcards = getFlashcardsArray();

    return (
        <>
            <Navbar />
            <div style={styles.container}>
                <h1>🎴 Generador de Tarjetas de Estudio</h1>

                <form onSubmit={handleSubmit} style={styles.form}>
                    {error && <div style={styles.error}>{error}</div>}

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Título / Tema *</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            style={styles.input}
                            placeholder="Ej: Vocabulario de Inglés Nivel Intermedio"
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
                            placeholder="Describe el contenido de las tarjetas..."
                        />
                    </div>

                    <div style={styles.row}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Nivel Educativo *</label>
                            <input
                                type="text"
                                name="nivelEducativo"
                                value={formData.nivelEducativo}
                                onChange={handleChange}
                                required
                                style={styles.input}
                                placeholder="Ej: Secundaria, Universidad"
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Número de Tarjetas *</label>
                            <input
                                type="number"
                                name="cantidadTarjetas"
                                value={formData.cantidadTarjetas}
                                onChange={handleChange}
                                min="5"
                                max="50"
                                required
                                style={styles.input}
                            />
                        </div>
                    </div>

                    <div style={styles.row}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Tipo de Tarjetas *</label>
                            <select
                                name="tipo"
                                value={formData.tipo}
                                onChange={handleChange}
                                style={styles.input}
                            >
                                <option value="Definiciones">Definiciones</option>
                                <option value="Preguntas y Respuestas">Preguntas y Respuestas</option>
                                <option value="Vocabulario">Vocabulario</option>
                                <option value="Conceptos">Conceptos</option>
                                <option value="Fórmulas">Fórmulas</option>
                            </select>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Estilo de Contenido *</label>
                            <select
                                name="estilo"
                                value={formData.estilo}
                                onChange={handleChange}
                                style={styles.input}
                            >
                                <option value="Conciso">Conciso</option>
                                <option value="Detallado">Detallado</option>
                                <option value="Visual">Visual (con descripciones)</option>
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
                        {loading ? 'Generando Tarjetas...' : '✨ Generar Tarjetas de Estudio'}
                    </button>
                </form>

                {/* Mostrar tarjetas generadas */}
                {generatedFlashcards && flashcards.length > 0 && (
                    <div style={styles.resultContainer}>
                        <div style={styles.resultHeader}>
                            <h2>Tarjetas Generadas ({flashcards.length})</h2>
                            <button onClick={exportToPDF} style={styles.exportButton}>
                                📄 Exportar a PDF (Recortable)
                            </button>
                        </div>

                        {/* Navegador de tarjetas */}
                        <div style={styles.cardNavigator}>
                            <button
                                onClick={() => setCurrentCardIndex(Math.max(0, currentCardIndex - 1))}
                                disabled={currentCardIndex === 0}
                                style={styles.navButton}
                            >
                                ← Anterior
                            </button>
                            <span style={styles.cardCounter}>
                                Tarjeta {currentCardIndex + 1} de {flashcards.length}
                            </span>
                            <button
                                onClick={() => setCurrentCardIndex(Math.min(flashcards.length - 1, currentCardIndex + 1))}
                                disabled={currentCardIndex === flashcards.length - 1}
                                style={styles.navButton}
                            >
                                Siguiente →
                            </button>
                        </div>

                        {/* Tarjeta actual con efecto de volteo */}
                        <div
                            style={styles.flashcardContainer}
                            onClick={() => toggleCardFlip(currentCardIndex)}
                        >
                            <div
                                style={{
                                    ...styles.flashcard,
                                    ...(flippedCards.has(currentCardIndex) ? styles.flashcardFlipped : {})
                                }}
                            >
                                <div style={styles.flashcardSide}>
                                    <div style={styles.flashcardLabel}>
                                        {flippedCards.has(currentCardIndex) ? 'REVERSO' : 'FRENTE'}
                                    </div>
                                    <div style={styles.flashcardContent}>
                                        {flippedCards.has(currentCardIndex)
                                            ? flashcards[currentCardIndex].reverso
                                            : flashcards[currentCardIndex].frente
                                        }
                                    </div>
                                    <div style={styles.flashcardHint}>
                                        👆 Click para voltear
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Grid de todas las tarjetas */}
                        <div style={styles.allCardsSection}>
                            <h3 style={styles.sectionTitle}>Todas las Tarjetas</h3>
                            <div style={styles.cardsGrid}>
                                {flashcards.map((card, index) => (
                                    <div
                                        key={card.id || index}
                                        style={styles.miniCard}
                                        onClick={() => {
                                            setCurrentCardIndex(index);
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                    >
                                        <div style={styles.miniCardNumber}>#{index + 1}</div>
                                        <div style={styles.miniCardContent}>
                                            <strong>Frente:</strong> {card.frente.substring(0, 50)}...
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
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
    cardNavigator: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '2rem',
        marginBottom: '2rem',
        padding: '1rem',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
    },
    navButton: {
        padding: '0.5rem 1.5rem',
        backgroundColor: '#1a1a2e',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.9rem',
    },
    cardCounter: {
        fontSize: '1.1rem',
        fontWeight: 'bold',
        color: '#1a1a2e',
    },
    flashcardContainer: {
        perspective: '1000px',
        marginBottom: '3rem',
        display: 'flex',
        justifyContent: 'center',
        cursor: 'pointer',
    },
    flashcard: {
        width: '600px',
        height: '400px',
        backgroundColor: '#fff',
        borderRadius: '12px',
        boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
        transition: 'transform 0.3s, box-shadow 0.3s',
        position: 'relative' as const,
    },
    flashcardFlipped: {
        backgroundColor: '#e3f2fd',
        boxShadow: '0 12px 24px rgba(0,0,0,0.3)',
    },
    flashcardSide: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column' as const,
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem',
        boxSizing: 'border-box' as const,
    },
    flashcardLabel: {
        position: 'absolute' as const,
        top: '1rem',
        right: '1rem',
        fontSize: '0.8rem',
        fontWeight: 'bold',
        color: '#666',
        backgroundColor: '#f0f0f0',
        padding: '0.25rem 0.75rem',
        borderRadius: '12px',
    },
    flashcardContent: {
        fontSize: '1.5rem',
        textAlign: 'center' as const,
        lineHeight: '1.6',
        color: '#1a1a2e',
        maxWidth: '90%',
    },
    flashcardHint: {
        position: 'absolute' as const,
        bottom: '1rem',
        fontSize: '0.9rem',
        color: '#999',
    },
    allCardsSection: {
        marginTop: '3rem',
        paddingTop: '2rem',
        borderTop: '2px solid #eee',
    },
    sectionTitle: {
        marginBottom: '1.5rem',
        color: '#1a1a2e',
    },
    cardsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '1rem',
    },
    miniCard: {
        backgroundColor: '#f9f9f9',
        padding: '1rem',
        borderRadius: '6px',
        border: '1px solid #ddd',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    miniCardNumber: {
        fontSize: '0.85rem',
        fontWeight: 'bold',
        color: '#666',
        marginBottom: '0.5rem',
    },
    miniCardContent: {
        fontSize: '0.9rem',
        color: '#333',
        lineHeight: '1.4',
    },
};
