import React from 'react';

interface SurveyViewerProps {
    content: any;
    title: string;
}

export const SurveyViewer: React.FC<SurveyViewerProps> = ({ content, title }) => {
    // Parse content if it's a string
    let surveyData = content;
    while (typeof surveyData === 'string') {
        try {
            surveyData = JSON.parse(surveyData);
        } catch (e) {
            break;
        }
    }

    const surveyTitle = surveyData.title || surveyData.titulo || title;
    const introduction = surveyData.introduction || surveyData.introduccion || '';
    const questions = surveyData.questions || surveyData.preguntas || [];

    const renderQuestion = (question: any, index: number) => {
        const questionText = question.question || question.pregunta || '';
        const questionType = question.type || question.tipo || 'open';
        const options = question.options || question.opciones || [];

        return (
            <div key={index} className="survey-question">
                <div className="question-header">
                    <span className="question-number">{question.number || index + 1}</span>
                    <span className="question-text">{questionText}</span>
                </div>

                {questionType === 'multiple_choice' && options.length > 0 && (
                    <div className="question-options">
                        {options.map((option: string, idx: number) => (
                            <div key={idx} className="option-item">
                                <input type="radio" disabled />
                                <label>{option}</label>
                            </div>
                        ))}
                    </div>
                )}

                {questionType === 'checkbox' && options.length > 0 && (
                    <div className="question-options">
                        {options.map((option: string, idx: number) => (
                            <div key={idx} className="option-item">
                                <input type="checkbox" disabled />
                                <label>{option}</label>
                            </div>
                        ))}
                    </div>
                )}

                {questionType === 'scale' && (
                    <div className="question-scale">
                        <div className="scale-marks">
                            {[1, 2, 3, 4, 5].map((num) => (
                                <div key={num} className="scale-mark">
                                    <input type="radio" name={`q${index}`} disabled />
                                    <label>{num}</label>
                                </div>
                            ))}
                        </div>
                        <div className="scale-labels">
                            <span>Bajo</span>
                            <span>Alto</span>
                        </div>
                    </div>
                )}

                {questionType === 'open' && (
                    <div className="question-open">
                        <textarea rows={3} placeholder="Respuesta abierta..." disabled></textarea>
                    </div>
                )}

                {questionType === 'yes_no' && (
                    <div className="question-options">
                        <div className="option-item">
                            <input type="radio" disabled />
                            <label>Sí</label>
                        </div>
                        <div className="option-item">
                            <input type="radio" disabled />
                            <label>No</label>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="survey-viewer">
            <div className="survey-container">
                <div className="survey-header">
                    <h2>{surveyTitle}</h2>
                    {introduction && <p className="survey-intro">{introduction}</p>}
                </div>

                <div className="survey-body">
                    {questions.map((question: any, index: number) => renderQuestion(question, index))}
                </div>

                {surveyData.metadata && (
                    <div className="survey-footer">
                        <div className="survey-metadata">
                            {surveyData.metadata.totalQuestions && (
                                <span>📋 {surveyData.metadata.totalQuestions} preguntas</span>
                            )}
                            {surveyData.metadata.estimatedTime && (
                                <span>⏱️ Tiempo estimado: {surveyData.metadata.estimatedTime}</span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .survey-viewer {
                    max-width: 900px;
                    margin: 0 auto;
                }

                .survey-container {
                    background: #fff;
                    border-radius: 8px;
                    overflow: hidden;
                }

                .survey-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: #fff;
                    padding: 2rem;
                    text-align: center;
                }

                .survey-header h2 {
                    margin: 0 0 1rem 0;
                    font-size: 1.8rem;
                }

                .survey-intro {
                    margin: 0;
                    opacity: 0.95;
                    line-height: 1.6;
                }

                .survey-body {
                    padding: 2rem;
                }

                .survey-question {
                    background: #f8f9fa;
                    border-left: 4px solid #667eea;
                    padding: 1.5rem;
                    margin-bottom: 1.5rem;
                    border-radius: 4px;
                }

                .question-header {
                    display: flex;
                    align-items: start;
                    margin-bottom: 1rem;
                }

                .question-number {
                    background: #667eea;
                    color: #fff;
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-right: 1rem;
                    flex-shrink: 0;
                    font-weight: bold;
                }

                .question-text {
                    flex: 1;
                    font-size: 1.05rem;
                    font-weight: 500;
                    color: #333;
                    line-height: 1.5;
                }

                .question-options {
                    margin-top: 1rem;
                }

                .option-item {
                    display: flex;
                    align-items: center;
                    padding: 0.75rem;
                    margin-bottom: 0.5rem;
                    background: #fff;
                    border-radius: 4px;
                    border: 1px solid #e0e0e0;
                }

                .option-item input {
                    margin-right: 0.75rem;
                }

                .option-item label {
                    cursor: default;
                    flex: 1;
                }

                .question-scale {
                    margin-top: 1rem;
                    background: #fff;
                    padding: 1.5rem;
                    border-radius: 4px;
                }

                .scale-marks {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 0.5rem;
                }

                .scale-mark {
                    text-align: center;
                }

                .scale-mark input {
                    display: block;
                    margin: 0 auto 0.25rem;
                }

                .scale-labels {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.9rem;
                    color: #666;
                    margin-top: 0.5rem;
                }

                .question-open textarea {
                    width: 100%;
                    padding: 0.75rem;
                    border: 1px solid #e0e0e0;
                    border-radius: 4px;
                    font-family: inherit;
                    font-size: 1rem;
                    resize: vertical;
                }

                .survey-footer {
                    background: #f8f9fa;
                    padding: 1.5rem;
                    border-top: 1px solid #e0e0e0;
                }

                .survey-metadata {
                    display: flex;
                    justify-content: center;
                    gap: 2rem;
                    color: #666;
                    font-size: 0.95rem;
                }
            `}</style>
        </div>
    );
};
