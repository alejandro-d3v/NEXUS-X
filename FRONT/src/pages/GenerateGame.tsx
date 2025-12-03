import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { activityService } from '../services/activity.service';
import { ActivityType, ActivityVisibility, AIProvider } from '../types';

export const GenerateGame: React.FC = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        visibility: ActivityVisibility.PRIVATE,
        provider: AIProvider.GEMINI,
        nivelEducativo: '',
        tipoJuego: 'Sopa de Letras',
        numeroPalabras: 10,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [generatedGame, setGeneratedGame] = useState<any>(null);
    const [foundWords, setFoundWords] = useState<Set<string>>(new Set());

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const parts = [];
            parts.push(`Genera un ${formData.tipoJuego.toLowerCase()}`);
            if (formData.title) parts.push(`sobre el tema "${formData.title}"`);
            if (formData.nivelEducativo) parts.push(`para nivel ${formData.nivelEducativo}`);
            parts.push(`con ${formData.numeroPalabras} palabras`);

            if (formData.description) {
                parts.push(`\nPalabras específicas a incluir: ${formData.description}`);
            } else {
                parts.push(`\nGenera palabras automáticamente relacionadas con el tema`);
            }

            const prompt = parts.join(' ');

            const payload = {
                title: formData.title,
                description: formData.description,
                type: ActivityType.GAME,
                visibility: formData.visibility,
                provider: formData.provider,
                prompt: prompt,
                subject: formData.title,
                grade: formData.nivelEducativo,
                additionalParams: {
                    titulo: formData.title,
                    descripcion: formData.description,
                    nivelEducativo: formData.nivelEducativo,
                    tipoJuego: formData.tipoJuego,
                    numeroPalabras: formData.numeroPalabras,
                },
            };

            const activity = await activityService.generateActivity(payload as any);
            console.log('✅ Juego generado:', activity);
            setGeneratedGame(activity);
            setFoundWords(new Set());
        } catch (err: any) {
            console.error('❌ Error:', err);
            setError(err.response?.data?.error || 'Error al generar el juego');
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
            [name]: name === 'numeroPalabras' ? Number(value) : value,
        });
    };

    const renderWordSearch = (gameData: any) => {
        const grid = gameData.grid || [];
        const words = gameData.palabras || [];

        return (
            <div style={styles.gameContainer}>
                <div style={styles.wordSearchGrid}>
                    {grid.map((row: string[], rowIndex: number) => (
                        <div key={rowIndex} style={styles.gridRow}>
                            {row.map((letter: string, colIndex: number) => (
                                <div
                                    key={`${rowIndex}-${colIndex}`}
                                    style={styles.gridCell}
                                >
                                    {letter}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>

                <div style={styles.wordList}>
                    <h3>Palabras a Buscar:</h3>
                    <div style={styles.wordsGrid}>
                        {words.map((word: string, index: number) => (
                            <div
                                key={index}
                                style={{
                                    ...styles.wordItem,
                                    ...(foundWords.has(word.toUpperCase()) ? styles.wordFound : {})
                                }}
                                onClick={() => {
                                    const newFound = new Set(foundWords);
                                    if (foundWords.has(word.toUpperCase())) {
                                        newFound.delete(word.toUpperCase());
                                    } else {
                                        newFound.add(word.toUpperCase());
                                    }
                                    setFoundWords(newFound);
                                }}
                            >
                                {word}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderCrossword = (gameData: any) => {
        const grid = gameData.grid || [];
        const pistas = gameData.pistas || { horizontal: [], vertical: [] };

        return (
            <div style={styles.gameContainer}>
                <div style={styles.crosswordGrid}>
                    {grid.map((row: any[], rowIndex: number) => (
                        <div key={rowIndex} style={styles.gridRow}>
                            {row.map((cell: any, colIndex: number) => (
                                <div
                                    key={`${rowIndex}-${colIndex}`}
                                    style={{
                                        ...styles.crosswordCell,
                                        ...(cell.blocked ? styles.blockedCell : {}),
                                    }}
                                >
                                    {cell.number && (
                                        <span style={styles.cellNumber}>{cell.number}</span>
                                    )}
                                    <span style={styles.cellLetter}>
                                        {!cell.blocked ? (cell.letter || '') : ''}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>

                <div style={styles.cluesContainer}>
                    <div style={styles.cluesSection}>
                        <h3>Horizontales</h3>
                        {pistas.horizontal?.map((pista: any, index: number) => (
                            <div key={index} style={styles.clueItem}>
                                <strong>{pista.numero}.</strong> {pista.pista}
                            </div>
                        ))}
                    </div>
                    <div style={styles.cluesSection}>
                        <h3>Verticales</h3>
                        {pistas.vertical?.map((pista: any, index: number) => (
                            <div key={index} style={styles.clueItem}>
                                <strong>{pista.numero}.</strong> {pista.pista}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const exportToPDF = () => {
        if (!generatedGame) return;

        const content = generatedGame.content;
        const isCrossword = content.tipo === 'crucigrama' || formData.tipoJuego === 'Crucigrama';

        let htmlContent = `
            <style>
                @page {
                    size: A4;
                    margin: 1.5cm;
                }
                body {
                    font-family: Arial, sans-serif;
                }
                h1 {
                    text-align: center;
                    margin-bottom: 20px;
                }
                .game-info {
                    text-align: center;
                    margin-bottom: 20px;
                    color: #666;
                }
                .grid {
                    display: inline-grid;
                    gap: 0;
                    margin: 20px auto;
                    border: 2px solid #000;
                }
                .grid-row {
                    display: flex;
                }
                .cell {
                    width: 30px;
                    height: 30px;
                    border: 1px solid #333;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    font-weight: bold;
                    position: relative;
                }
                .blocked {
                    background-color: #000;
                }
                .cell-number {
                    position: absolute;
                    top: 2px;
                    left: 2px;
                    font-size: 8px;
                }
                .words-section {
                    margin-top: 30px;
                    page-break-inside: avoid;
                }
                .words-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 10px;
                    margin-top: 10px;
                }
                .word-item {
                    padding: 8px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    font-weight: bold;
                }
                .clues {
                    margin-top: 20px;
                }
                .clue-section {
                    margin-bottom: 20px;
                }
                .clue {
                    margin: 5px 0;
                    padding-left: 20px;
                }
            </style>
            <h1>${generatedGame.title}</h1>
            <div class="game-info">
                Tipo: ${formData.tipoJuego} | Nivel: ${formData.nivelEducativo}
            </div>
        `;

        if (isCrossword) {
            // Crucigrama
            const grid = content.grid || [];
            const pistas = content.pistas || { horizontal: [], vertical: [] };

            htmlContent += '<div style="text-align: center;"><div class="grid" style="grid-template-columns: repeat(' + grid[0]?.length + ', 30px);">';
            grid.forEach((row: any[]) => {
                htmlContent += '<div class="grid-row">';
                row.forEach((cell: any) => {
                    const cellClass = cell.blocked ? 'cell blocked' : 'cell';
                    htmlContent += `<div class="${cellClass}">`;
                    if (cell.number) {
                        htmlContent += `<span class="cell-number">${cell.number}</span>`;
                    }
                    htmlContent += '</div>';
                });
                htmlContent += '</div>';
            });
            htmlContent += '</div></div>';

            htmlContent += '<div class="clues">';
            htmlContent += '<div class="clue-section"><h3>Horizontales</h3>';
            pistas.horizontal?.forEach((pista: any) => {
                htmlContent += `<div class="clue"><strong>${pista.numero}.</strong> ${pista.pista}</div>`;
            });
            htmlContent += '</div>';

            htmlContent += '<div class="clue-section"><h3>Verticales</h3>';
            pistas.vertical?.forEach((pista: any) => {
                htmlContent += `<div class="clue"><strong>${pista.numero}.</strong> ${pista.pista}</div>`;
            });
            htmlContent += '</div></div>';

        } else {
            // Sopa de letras
            const grid = content.grid || [];
            const words = content.palabras || [];

            htmlContent += '<div style="text-align: center;"><div class="grid" style="grid-template-columns: repeat(' + grid[0]?.length + ', 30px);">';
            grid.forEach((row: string[]) => {
                htmlContent += '<div class="grid-row">';
                row.forEach((letter: string) => {
                    htmlContent += `<div class="cell">${letter}</div>`;
                });
                htmlContent += '</div>';
            });
            htmlContent += '</div></div>';

            htmlContent += '<div class="words-section">';
            htmlContent += '<h3>Palabras a Buscar:</h3>';
            htmlContent += '<div class="words-grid">';
            words.forEach((word: string) => {
                htmlContent += `<div class="word-item">${word}</div>`;
            });
            htmlContent += '</div></div>';
        }

        import('../services/export.service').then(({ exportService }) => {
            exportService.exportToPDF(htmlContent, generatedGame.title);
        });
    };

    return (
        <>
            <Navbar />
            <div style={styles.container}>
                <h1>🎮 Generador de Juegos Educativos</h1>

                <form onSubmit={handleSubmit} style={styles.form}>
                    {error && <div style={styles.error}>{error}</div>}

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Título / Tema del Juego *</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            style={styles.input}
                            placeholder="Ej: Animales de la Selva, Países de Europa"
                        />
                    </div>

                    <div style={styles.row}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Tipo de Juego *</label>
                            <select
                                name="tipoJuego"
                                value={formData.tipoJuego}
                                onChange={handleChange}
                                style={styles.input}
                            >
                                <option value="Sopa de Letras">Sopa de Letras</option>
                                <option value="Crucigrama">Crucigrama</option>
                            </select>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Número de Palabras *</label>
                            <input
                                type="number"
                                name="numeroPalabras"
                                value={formData.numeroPalabras}
                                onChange={handleChange}
                                min="5"
                                max="20"
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
                                <option value="">Seleccionar</option>
                                <option value="Primaria">Primaria</option>
                                <option value="Secundaria">Secundaria</option>
                                <option value="Preparatoria">Preparatoria</option>
                            </select>
                        </div>
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>
                            Palabras Específicas (Opcional)
                            <small style={{ display: 'block', fontWeight: 'normal', color: '#666', marginTop: '0.25rem' }}>
                                Deja en blanco para generar automáticamente, o escribe las palabras separadas por comas
                            </small>
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            style={styles.textarea}
                            rows={3}
                            placeholder="Ejemplo: león, tigre, elefante, jirafa..."
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

                    <button type="submit" disabled={loading} style={styles.button}>
                        {loading ? 'Generando Juego...' : '✨ Generar Juego'}
                    </button>
                </form>

                {generatedGame && (
                    <div style={styles.resultContainer}>
                        <div style={styles.resultHeader}>
                            <h2>Juego Generado</h2>
                            <button onClick={exportToPDF} style={styles.exportButton}>
                                📄 Exportar a PDF
                            </button>
                        </div>

                        {formData.tipoJuego === 'Sopa de Letras' && renderWordSearch(generatedGame.content)}
                        {formData.tipoJuego === 'Crucigrama' && renderCrossword(generatedGame.content)}
                    </div>
                )}
            </div>
        </>
    );
};

const styles = {
    container: {
        maxWidth: '1400px',
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
    },
    gameContainer: {
        display: 'flex',
        gap: '2rem',
        flexWrap: 'wrap' as const,
    },
    wordSearchGrid: {
        display: 'inline-block',
        border: '2px solid #333',
        padding: '10px',
        backgroundColor: '#fff',
    },
    crosswordGrid: {
        display: 'inline-block',
        border: '2px solid #333',
        backgroundColor: '#fff',
    },
    gridRow: {
        display: 'flex',
    },
    gridCell: {
        width: '40px',
        height: '40px',
        border: '1px solid #999',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
        fontWeight: 'bold' as const,
        backgroundColor: '#fff',
    },
    crosswordCell: {
        width: '40px',
        height: '40px',
        border: '1px solid #999',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
        fontWeight: 'bold' as const,
        backgroundColor: '#fff',
        position: 'relative' as const,
    },
    blockedCell: {
        backgroundColor: '#000',
    },
    cellNumber: {
        position: 'absolute' as const,
        top: '2px',
        left: '3px',
        fontSize: '10px',
        fontWeight: 'normal' as const,
    },
    cellLetter: {
        fontSize: '16px',
    },
    wordList: {
        flex: 1,
        minWidth: '250px',
    },
    wordsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: '0.5rem',
        marginTop: '1rem',
    },
    wordItem: {
        padding: '0.5rem',
        border: '2px solid #ddd',
        borderRadius: '4px',
        textAlign: 'center' as const,
        cursor: 'pointer',
        transition: 'all 0.2s',
        fontWeight: 'bold' as const,
    },
    wordFound: {
        backgroundColor: '#4caf50',
        color: '#fff',
        borderColor: '#4caf50',
        textDecoration: 'line-through',
    },
    cluesContainer: {
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '2rem',
    },
    cluesSection: {
        minWidth: '250px',
    },
    clueItem: {
        padding: '0.5rem',
        marginBottom: '0.5rem',
        borderLeft: '3px solid #1a1a2e',
        paddingLeft: '1rem',
    },
};
