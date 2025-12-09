import React from 'react';

interface EmailViewerProps {
    content: any;
    title: string;
}

export const EmailViewer: React.FC<EmailViewerProps> = ({ content, title }) => {
    // Parse content if it's a string
    let emailData = content;
    while (typeof emailData === 'string') {
        try {
            emailData = JSON.parse(emailData);
        } catch (e) {
            break;
        }
    }

    const subject = emailData.subject || emailData.asunto || title;
    const greeting = emailData.greeting || emailData.saludo || '';
    const body = emailData.body || emailData.cuerpo || '';
    const closing = emailData.closing || emailData.despedida || '';
    const signature = emailData.signature || emailData.firma || '';

    return (
        <div className="email-viewer">
            <div className="email-container">
                <div className="email-header">
                    <div className="email-field">
                        <strong>Asunto:</strong> {subject}
                    </div>
                </div>

                <div className="email-body">
                    {greeting && (
                        <div className="email-greeting">
                            {greeting}
                        </div>
                    )}

                    <div className="email-content">
                        {body.split('\n').map((paragraph: string, idx: number) => (
                            <p key={idx}>{paragraph}</p>
                        ))}
                    </div>

                    {closing && (
                        <div className="email-closing">
                            <p>{closing}</p>
                            {signature && <p><strong>{signature}</strong></p>}
                        </div>
                    )}
                </div>

                {emailData.metadata && (
                    <div className="email-metadata">
                        <h4>ℹ️ Información del Correo</h4>
                        <div className="metadata-grid">
                            {emailData.metadata.purpose && (
                                <div className="metadata-item">
                                    <strong>Propósito:</strong> {emailData.metadata.purpose}
                                </div>
                            )}
                            {emailData.metadata.tone && (
                                <div className="metadata-item">
                                    <strong>Tono:</strong> {emailData.metadata.tone}
                                </div>
                            )}
                            {emailData.metadata.recipient && (
                                <div className="metadata-item">
                                    <strong>Destinatario:</strong> {emailData.metadata.recipient}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .email-viewer {
                    max-width: 800px;
                    margin: 0 auto;
                }

                .email-container {
                    background: #fff;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    overflow: hidden;
                }

                .email-header {
                    background: #f5f5f5;
                    padding: 1.5rem;
                    border-bottom: 2px solid #1a1a2e;
                }

                .email-field {
                    margin-bottom: 0.5rem;
                    font-size: 1rem;
                }

                .email-field strong {
                    color: #1a1a2e;
                    margin-right: 0.5rem;
                }

                .email-body {
                    padding: 2rem;
                    line-height: 1.8;
                }

                .email-greeting {
                    margin-bottom: 1.5rem;
                    font-size: 1.05rem;
                }

                .email-content p {
                    margin-bottom: 1rem;
                    color: #333;
                }

                .email-closing {
                    margin-top: 2rem;
                    padding-top: 1rem;
                }

                .email-closing p {
                    margin-bottom: 0.5rem;
                }

                .email-metadata {
                    background: #f9f9f9;
                    padding: 1.5rem;
                    border-top: 1px solid #ddd;
                }

                .email-metadata h4 {
                    margin-bottom: 1rem;
                    color: #1a1a2e;
                }

                .metadata-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1rem;
                }

                .metadata-item {
                    font-size: 0.95rem;
                }

                .metadata-item strong {
                    color: #1a1a2e;
                    display: block;
                    margin-bottom: 0.25rem;
                }
            `}</style>
        </div>
    );
};
