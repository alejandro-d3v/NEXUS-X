import React from 'react';

interface WritingCorrectionViewerProps {
    content: any;
    title: string;
}

export const WritingCorrectionViewer: React.FC<WritingCorrectionViewerProps> = ({ content }) => {
    // Parse content if it's a string
    let correctionData = content;
    while (typeof correctionData === 'string') {
        try {
            correctionData = JSON.parse(correctionData);
        } catch (e) {
            break;
        }
    }

    const originalText = correctionData.originalText || 
                         correctionData.textoOriginal || 
                         correctionData.texto_original || 
                         correctionData.original_text ||
                         '(Texto original no disponible)';
    const correctedText = correctionData.correctedText || 
                          correctionData.textoCorregido || 
                          correctionData.texto_corregido || 
                          correctionData.corrected_text ||
                          '';
    const errors = correctionData.errors || 
                   correctionData.errores || 
                   correctionData.errores_encontrados ||
                   [];
    const suggestions = correctionData.suggestions || 
                        correctionData.sugerencias || 
                        correctionData.sugerencias_de_mejora ||
                        correctionData.sugerencias_mejora ||
                        [];
    const statistics = correctionData.statistics || 
                       correctionData.estadisticas || 
                       {};

    const getErrorTypeIcon = (type: string | undefined) => {
        if (!type) return '📌';
        switch (type.toLowerCase()) {
            case 'spelling':
            case 'ortografia':
            case 'ortografía':
            case 'ortografía y acentuación':
                return '✏️';
            case 'grammar':
            case 'gramatica':
            case 'gramática':
                return '📝';
            case 'style':
            case 'estilo':
                return '🎨';
            case 'punctuation':
            case 'puntuacion':
            case 'puntuación':
                return '❗';
            default:
                return '📌';
        }
    };

    const getErrorTypeName = (type: string | undefined) => {
        if (!type) return 'Error';
        const types: { [key: string]: string } = {
            'spelling': 'Ortografía',
            'ortografia': 'Ortografía',
            'ortografía': 'Ortografía',
            'ortografía y acentuación': 'Ortografía y Acentuación',
            'grammar': 'Gramática',
            'gramatica': 'Gramática',
            'gramática': 'Gramática',
            'style': 'Estilo',
            'estilo': 'Estilo',
            'punctuation': 'Puntuación',
            'puntuacion': 'Puntuación',
            'puntuación': 'Puntuación'
        };
        return types[type.toLowerCase()] || type;
    };

    return (
        <div className="correction-viewer">
            {/* Statistics Summary */}
            {statistics && Object.keys(statistics).length > 0 && (
                <div className="correction-stats">
                    <h3>📊 Estadísticas de Corrección</h3>
                    <div className="stats-grid">
                        {statistics.totalErrors !== undefined && (
                            <div className="stat-card">
                                <div className="stat-value">{statistics.totalErrors}</div>
                                <div className="stat-label">Errores Totales</div>
                            </div>
                        )}
                        {statistics.spellingErrors !== undefined && (
                            <div className="stat-card">
                                <div className="stat-value">{statistics.spellingErrors}</div>
                                <div className="stat-label">Ortografía</div>
                            </div>
                        )}
                        {statistics.grammarErrors !== undefined && (
                            <div className="stat-card">
                                <div className="stat-value">{statistics.grammarErrors}</div>
                                <div className="stat-label">Gramática</div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Side-by-side comparison */}
            <div className="correction-comparison">
                <div className="comparison-column original">
                    <h3>📄 Texto Original</h3>
                    <div className="text-content">
                        {originalText.split('\n').map((paragraph: string, idx: number) => (
                            <p key={idx}>{paragraph}</p>
                        ))}
                    </div>
                </div>

                <div className="comparison-column corrected">
                    <h3>✅ Texto Corregido</h3>
                    <div className="text-content">
                        {correctedText.split('\n').map((paragraph: string, idx: number) => (
                            <p key={idx}>{paragraph}</p>
                        ))}
                    </div>
                </div>
            </div>

            {/* Errors list */}
            {errors.length > 0 && (
                <div className="errors-section">
                    <h3>🔍 Errores Encontrados</h3>
                    <div className="errors-list">
                        {errors.map((error: any, idx: number) => (
                            <div key={idx} className="error-item">
                                <div className="error-header">
                                    <span className="error-icon">
                                        {getErrorTypeIcon(error.type || error.tipo)}
                                    </span>
                                    <span className="error-type">
                                        {getErrorTypeName(error.type || error.tipo)}
                                    </span>
                                </div>
                                <div className="error-details">
                                    <div className="error-change">
                                        <span className="error-original">
                                            {error.original || error.textoOriginal || error.descripcion || 'N/A'}
                                        </span>
                                        <span className="arrow">→</span>
                                        <span className="error-corrected">
                                            {error.corrected || error.correccion || error.correction || 'N/A'}
                                        </span>
                                    </div>
                                    {(error.explanation || error.explicacion) && (
                                        <div className="error-explanation">
                                            {error.explanation || error.explicacion}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Suggestions */}
            {suggestions.length > 0 && (
                <div className="suggestions-section">
                    <h3>💡 Sugerencias de Mejora</h3>
                    <ul className="suggestions-list">
                        {suggestions.map((suggestion: string, idx: number) => (
                            <li key={idx}>{suggestion}</li>
                        ))}
                    </ul>
                </div>
            )}

            <style>{`
                .correction-viewer {
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .correction-stats {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: #fff;
                    padding: 2rem;
                    border-radius: 8px;
                    margin-bottom: 2rem;
                }

                .correction-stats h3 {
                    margin: 0 0 1.5rem 0;
                    font-size: 1.5rem;
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 1rem;
                }

                .stat-card {
                    background: rgba(255, 255, 255, 0.15);
                    padding: 1.5rem;
                    border-radius: 8px;
                    text-align: center;
                    backdrop-filter: blur(10px);
                }

                .stat-value {
                    font-size: 2.5rem;
                    font-weight: bold;
                    margin-bottom: 0.5rem;
                }

                .stat-label {
                    font-size: 0.9rem;
                    opacity: 0.9;
                }

                .correction-comparison {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }

                @media (max-width: 768px) {
                    .correction-comparison {
                        grid-template-columns: 1fr;
                    }
                }

                .comparison-column {
                    border-radius: 8px;
                    overflow: hidden;
                }

                .comparison-column h3 {
                    padding: 1rem 1.5rem;
                    margin: 0;
                    font-size: 1.1rem;
                }

                .comparison-column.original h3 {
                    background: #ffebee;
                    color: #c62828;
                }

                .comparison-column.corrected h3 {
                    background: #e8f5e9;
                    color: #2e7d32;
                }

                .text-content {
                    padding: 1.5rem;
                    background: #fff;
                    border: 1px solid #e0e0e0;
                    border-top: none;
                    min-height: 200px;
                    line-height: 1.8;
                }

                .text-content p {
                    margin-bottom: 1rem;
                }

                .errors-section {
                    background: #fff;
                    border-radius: 8px;
                    padding: 2rem;
                    margin-bottom: 2rem;
                    border: 1px solid #e0e0e0;
                }

                .errors-section h3 {
                    margin: 0 0 1.5rem 0;
                    color: #1a1a2e;
                }

                .errors-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .error-item {
                    border-left: 4px solid #ff5722;
                    background: #fff5f5;
                    padding: 1rem 1.5rem;
                    border-radius: 4px;
                }

                .error-header {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 0.75rem;
                }

                .error-icon {
                    font-size: 1.2rem;
                }

                .error-type {
                    font-weight: 600;
                    color: #d32f2f;
                }

                .error-details {
                    margin-left: 1.7rem;
                }

                .error-change {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 0.5rem;
                    flex-wrap: wrap;
                }

                .error-original {
                    background: #ffcdd2;
                    padding: 0.25rem 0.75rem;
                    border-radius: 4px;
                    text-decoration: line-through;
                    color: #c62828;
                }

                .arrow {
                    color: #666;
                    font-weight: bold;
                }

                .error-corrected {
                    background: #c8e6c9;
                    padding: 0.25rem 0.75rem;
                    border-radius: 4px;
                    color: #2e7d32;
                    font-weight: 500;
                }

                .error-explanation {
                    color: #666;
                    font-size: 0.95rem;
                    line-height: 1.5;
                }

                .suggestions-section {
                    background: #fff;
                    border-radius: 8px;
                    padding: 2rem;
                    border: 1px solid #e0e0e0;
                }

                .suggestions-section h3 {
                    margin: 0 0 1rem 0;
                    color: #1a1a2e;
                }

                .suggestions-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }

                .suggestions-list li {
                    padding: 1rem;
                    margin-bottom: 0.75rem;
                    background: #f5f5f5;
                    border-left: 4px solid #4caf50;
                    border-radius: 4px;
                    line-height: 1.6;
                }

                .suggestions-list li:last-child {
                    margin-bottom: 0;
                }
            `}</style>
        </div>
    );
};
