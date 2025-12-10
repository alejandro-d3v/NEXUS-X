import React, { useState, useEffect } from 'react';
import { FaCheck, FaTrophy } from 'react-icons/fa';

interface Position {
    fila: number;
    columna: number;
}

interface Solucion {
    palabra: string;
    direccion: string;
    posiciones: Position[];
}

interface WordSearchContent {
    meta?: {
        titulo?: string;
        descripcion?: string;
        materia?: string;
        nivel_educativo?: string;
        tema?: string;
        dificultad?: string;
        cantidad_palabras?: number;
        grid_size?: number;
    };
    palabras: string[];
    grid: string[][];
    soluciones: Solucion[];
}

interface PlayWordSearchProps {
    content: any; // Accept any to allow for parsing
}

export const PlayWordSearch: React.FC<PlayWordSearchProps> = ({ content }) => {
    const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
    const [selectedCells, setSelectedCells] = useState<Position[]>([]);
    const [isSelecting, setIsSelecting] = useState(false);
    const [highlightedCells, setHighlightedCells] = useState<Set<string>>(new Set());

    // Parse content if it's a string
    let parsedContent: WordSearchContent;
    try {
        parsedContent = typeof content === 'string' ? JSON.parse(content) : content;
    } catch (e) {
        return (
            <div style={styles.container}>
                <div style={styles.errorMessage}>
                    <h2>Error: No se pudo parsear el contenido</h2>
                    <p>El formato del contenido de la sopa de letras no es válido.</p>
                </div>
            </div>
        );
    }

    // Validate required fields (soluciones is optional, we can generate them)
    if (!parsedContent || !parsedContent.grid || !parsedContent.palabras) {
        return (
            <div style={styles.container}>
                <div style={styles.errorMessage}>
                    <h2>Error: Datos incompletos</h2>
                    <p>Faltan datos necesarios para mostrar la sopa de letras.</p>
                    <p>Se requiere: grid (cuadrícula) y palabras</p>
                    <details>
                        <summary>Ver contenido recibido</summary>
                        <pre style={{ fontSize: '0.8rem', textAlign: 'left', maxHeight: '300px', overflow: 'auto' }}>
                            {JSON.stringify(parsedContent, null, 2)}
                        </pre>
                    </details>
                </div>
            </div>
        );
    }

    const { grid: rawGrid, palabras, soluciones: rawSoluciones, meta } = parsedContent;

    // Convert grid if it's an array of strings to 2D array
    let grid: string[][];
    if (rawGrid && rawGrid.length > 0 && typeof rawGrid[0] === 'string') {
        // Grid is array of strings, convert to 2D array
        grid = (rawGrid as unknown as string[]).map(row => row.split(''));
    } else {
        // Grid is already 2D array
        grid = rawGrid as string[][];
    }

    // If soluciones don't exist, create basic ones (just for display)
    let soluciones: Solucion[];
    if (!rawSoluciones || rawSoluciones.length === 0) {
        // Create basic solutions by searching for each word horizontally
        soluciones = palabras.map(palabra => {
            // Search for the word in the grid
            for (let fila = 0; fila < grid.length; fila++) {
                const rowString = grid[fila].join('');
                const index = rowString.indexOf(palabra);
                if (index !== -1) {
                    // Found the word, create positions
                    const posiciones: Position[] = [];
                    for (let i = 0; i < palabra.length; i++) {
                        posiciones.push({ fila, columna: index + i });
                    }
                    return {
                        palabra,
                        direccion: 'horizontal',
                        posiciones
                    };
                }
            }
            // If not found, return empty solution
            return {
                palabra,
                direccion: 'horizontal',
                posiciones: []
            };
        });
    } else {
        soluciones = rawSoluciones;
    }

    const positionKey = (pos: Position) => `${pos.fila}-${pos.columna}`;

    const checkIfWordFound = (selected: Position[]) => {
        if (selected.length < 2) return;

        const selectedKeys = selected.map(positionKey).join(',');

        for (const solucion of soluciones) {
            const solutionKeys = solucion.posiciones.map(positionKey).join(',');
            const reverseSolutionKeys = solucion.posiciones
                .slice()
                .reverse()
                .map(positionKey)
                .join(',');

            if (selectedKeys === solutionKeys || selectedKeys === reverseSolutionKeys) {
                setFoundWords((prev) => new Set([...prev, solucion.palabra]));

                setHighlightedCells((prev) => {
                    const newSet = new Set(prev);
                    solucion.posiciones.forEach((pos) => newSet.add(positionKey(pos)));
                    return newSet;
                });

                return true;
            }
        }
        return false;
    };

    const handleMouseDown = (fila: number, columna: number) => {
        setIsSelecting(true);
        setSelectedCells([{ fila, columna }]);
    };

    const handleMouseEnter = (fila: number, columna: number) => {
        if (!isSelecting) return;

        const lastCell = selectedCells[selectedCells.length - 1];
        if (!lastCell) return;

        const rowDiff = fila - selectedCells[0].fila;
        const colDiff = columna - selectedCells[0].columna;

        if (selectedCells.length === 1) {
            setSelectedCells([...selectedCells, { fila, columna }]);
        } else {
            if (
                Math.abs(rowDiff) === Math.abs(colDiff) ||
                rowDiff === 0 ||
                colDiff === 0
            ) {
                if (
                    !selectedCells.some((cell) => cell.fila === fila && cell.columna === columna)
                ) {
                    setSelectedCells([...selectedCells, { fila, columna }]);
                }
            }
        }
    };

    const handleMouseUp = () => {
        if (isSelecting) {
            checkIfWordFound(selectedCells);
            setSelectedCells([]);
            setIsSelecting(false);
        }
    };

    const isCellSelected = (fila: number, columna: number): boolean => {
        return selectedCells.some((cell) => cell.fila === fila && cell.columna === columna);
    };

    const isCellHighlighted = (fila: number, columna: number): boolean => {
        return highlightedCells.has(positionKey({ fila, columna }));
    };

    const progress = (foundWords.size / palabras.length) * 100;
    const isComplete = foundWords.size === palabras.length;

    useEffect(() => {
        const handleGlobalMouseUp = () => {
            if (isSelecting) {
                checkIfWordFound(selectedCells);
                setSelectedCells([]);
                setIsSelecting(false);
            }
        };

        document.addEventListener('mouseup', handleGlobalMouseUp);
        return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
    }, [isSelecting, selectedCells]);

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>{meta?.titulo || 'Sopa de Letras'}</h2>
                {meta?.descripcion && <p style={styles.description}>{meta.descripcion}</p>}
                <div style={styles.metadata}>
                    {meta?.materia && <span style={styles.badge}>{meta.materia}</span>}
                    {meta?.nivel_educativo && <span style={styles.badge}>{meta.nivel_educativo}</span>}
                    {meta?.dificultad && <span style={styles.badge}>Dificultad: {meta.dificultad}</span>}
                </div>
            </div>

            <div style={styles.progressContainer}>
                <div style={styles.progressBar}>
                    <div style={{ ...styles.progressFill, width: `${progress}%` }} />
                </div>
                <p style={styles.progressText}>
                    {foundWords.size} / {palabras.length} palabras encontradas
                </p>
            </div>

            {isComplete && (
                <div style={styles.congratulations}>
                    <FaTrophy size={40} color="#ffd700" />
                    <h3>¡Felicitaciones! Has completado la sopa de letras</h3>
                </div>
            )}

            <div style={styles.gameContainer}>
                <div style={styles.gridContainer}>
                    <table style={styles.grid} onMouseLeave={handleMouseUp}>
                        <tbody>
                            {grid.map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                    {row.map((letter, colIndex) => {
                                        const isSelected = isCellSelected(rowIndex, colIndex);
                                        const isHighlighted = isCellHighlighted(rowIndex, colIndex);

                                        return (
                                            <td
                                                key={colIndex}
                                                style={{
                                                    ...styles.cell,
                                                    ...(isSelected ? styles.cellSelected : {}),
                                                    ...(isHighlighted ? styles.cellHighlighted : {}),
                                                }}
                                                onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                                                onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                                            >
                                                {letter}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div style={styles.wordList}>
                    <h3 style={styles.wordListTitle}>Palabras a encontrar:</h3>
                    <ul style={styles.words}>
                        {palabras.map((word, index) => (
                            <li
                                key={index}
                                style={{
                                    ...styles.word,
                                    ...(foundWords.has(word) ? styles.wordFound : {}),
                                }}
                            >
                                {foundWords.has(word) && <FaCheck style={styles.checkIcon} />}
                                {word}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div style={styles.instructions}>
                <h4>Instrucciones:</h4>
                <p>Haz clic y arrastra sobre las letras para seleccionar una palabra. Las palabras pueden estar en cualquier dirección: horizontal, vertical o diagonal.</p>
            </div>
        </div>
    );
};

const styles = {
    container: {
        padding: '2rem',
        maxWidth: '1400px',
        margin: '0 auto',
    },
    header: {
        marginBottom: '2rem',
        textAlign: 'center' as const,
    },
    title: {
        fontSize: '2rem',
        fontWeight: 'bold',
        color: '#1a1a2e',
        marginBottom: '0.5rem',
    },
    description: {
        color: '#666',
        fontSize: '1.1rem',
        marginBottom: '1rem',
    },
    metadata: {
        display: 'flex',
        gap: '0.5rem',
        justifyContent: 'center',
        flexWrap: 'wrap' as const,
    },
    badge: {
        backgroundColor: '#e8f4fd',
        color: '#1a73e8',
        padding: '0.25rem 0.75rem',
        borderRadius: '12px',
        fontSize: '0.875rem',
        fontWeight: '500',
    },
    progressContainer: {
        marginBottom: '2rem',
    },
    progressBar: {
        width: '100%',
        height: '24px',
        backgroundColor: '#e0e0e0',
        borderRadius: '12px',
        overflow: 'hidden',
        marginBottom: '0.5rem',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#4caf50',
        transition: 'width 0.3s ease',
    },
    progressText: {
        textAlign: 'center' as const,
        fontSize: '1rem',
        fontWeight: '500',
        color: '#333',
    },
    congratulations: {
        backgroundColor: '#fff9e6',
        border: '2px solid #ffd700',
        borderRadius: '8px',
        padding: '1.5rem',
        textAlign: 'center' as const,
        marginBottom: '2rem',
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        gap: '1rem',
    },
    gameContainer: {
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: '2rem',
        marginBottom: '2rem',
    },
    gridContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    grid: {
        borderCollapse: 'collapse' as const,
        userSelect: 'none' as const,
        backgroundColor: '#fff',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        borderRadius: '8px',
    },
    cell: {
        width: '40px',
        height: '40px',
        border: '1px solid #ddd',
        textAlign: 'center' as const,
        fontWeight: 'bold',
        fontSize: '1.2rem',
        cursor: 'pointer',
        transition: 'all 0.2s',
        backgroundColor: '#fff',
    },
    cellSelected: {
        backgroundColor: '#bbdefb',
        color: '#1976d2',
    },
    cellHighlighted: {
        backgroundColor: '#c8e6c9',
        color: '#2e7d32',
    },
    wordList: {
        minWidth: '250px',
        backgroundColor: '#f9f9f9',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    wordListTitle: {
        fontSize: '1.2rem',
        fontWeight: 'bold',
        marginBottom: '1rem',
        color: '#1a1a2e',
    },
    words: {
        listStyle: 'none',
        padding: 0,
        margin: 0,
    },
    word: {
        padding: '0.75rem',
        marginBottom: '0.5rem',
        backgroundColor: '#fff',
        borderRadius: '4px',
        fontSize: '1rem',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        transition: 'all 0.3s',
    },
    wordFound: {
        backgroundColor: '#e8f5e9',
        color: '#2e7d32',
        textDecoration: 'line-through',
    },
    checkIcon: {
        color: '#4caf50',
    },
    instructions: {
        backgroundColor: '#f0f0f0',
        padding: '1rem',
        borderRadius: '8px',
        fontSize: '0.9rem',
        color: '#666',
    },
    errorMessage: {
        backgroundColor: '#ffebee',
        border: '2px solid #f44336',
        borderRadius: '8px',
        padding: '2rem',
        textAlign: 'center' as const,
        color: '#c62828',
    },
};
