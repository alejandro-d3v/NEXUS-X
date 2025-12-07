import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { adminService } from '../../services/admin.service';
import { FaExclamationTriangle, FaTrashAlt } from 'react-icons/fa';

export const DatabaseReset: React.FC = () => {
    const [confirmationPhrase, setConfirmationPhrase] = useState('');
    const [isResetting, setIsResetting] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);

    const handleReset = async () => {
        if (confirmationPhrase !== 'DELETE ALL DATA') {
            toast.error('Please type the exact confirmation phrase');
            return;
        }

        if (!window.confirm('⚠️ ÚLTIMA ADVERTENCIA: ¿Estás absolutamente seguro? Esta acción NO se puede deshacer. Se eliminarán TODOS los datos excepto tu cuenta de administrador.')) {
            return;
        }

        setIsResetting(true);
        try {
            const result = await adminService.resetDatabase(confirmationPhrase);
            
            toast.success(result.message);
            
            // Show deleted counts
            console.log('Deleted records:', result.deletedCounts);
            
            setConfirmationPhrase('');
            setShowConfirmation(false);

            // Reload page after 2 seconds
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Error resetting database');
        } finally {
            setIsResetting(false);
        }
    };

    const isPhraseCorrect = confirmationPhrase === 'DELETE ALL DATA';

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 style={{ color: '#dc2626' }}>
                    <FaExclamationTriangle style={{ marginRight: '10px' }} />
                    Database Reset
                </h1>
            </div>

            <div style={{
                maxWidth: '800px',
                margin: '0 auto',
                padding: '2rem',
            }}>
                {/* Warning Boxes */}
                <div style={{
                    backgroundColor: '#fef2f2',
                    border: '2px solid #dc2626',
                    borderRadius: '8px',
                    padding: '1.5rem',
                    marginBottom: '2rem',
                }}>
                    <h2 style={{ color: '#dc2626', marginTop: 0 }}>
                        ⚠️ ADVERTENCIA CRÍTICA
                    </h2>
                    <p style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
                        Esta operación es <strong>EXTREMADAMENTE PELIGROSA</strong> y{' '}
                        <strong>NO SE PUEDE DESHACER</strong>.
                    </p>
                </div>

                <div style={{
                    backgroundColor: '#fffbeb',
                    border: '2px solid #f59e0b',
                    borderRadius: '8px',
                    padding: '1.5rem',
                    marginBottom: '2rem',
                }}>
                    <h3 style={{ color: '#f59e0b', marginTop: 0 }}>
                        Esta acción eliminará permanentemente:
                    </h3>
                    <ul style={{ lineHeight: '1.8', fontSize: '1rem' }}>
                        <li>✗ Todas las instituciones</li>
                        <li>✗ Todos los cursos/grados</li>
                        <li>✗ Todos los profesores</li>
                        <li>✗ Todos los estudiantes</li>
                        <li>✗ Todas las actividades</li>
                        <li>✗ Todos los códigos de invitación</li>
                        <li>✗ Todo el historial de créditos</li>
                        <li style={{ color: '#059669', fontWeight: 'bold' }}>
                            ✓ Solo se preservará tu cuenta de ADMIN
                        </li>
                    </ul>
                </div>

                {!showConfirmation ? (
                    <div style={{ textAlign: 'center' }}>
                        <button
                            onClick={() => setShowConfirmation(true)}
                            className="btn btn-danger"
                            style={{
                                padding: '1rem 2rem',
                                fontSize: '1.1rem',
                            }}
                        >
                            Continuar con Reset de Base de Datos
                        </button>
                    </div>
                ) : (
                    <div style={{
                        backgroundColor: '#fff',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '2rem',
                    }}>
                        <h3 style={{ marginTop: 0 }}>Confirmación Requerida</h3>
                        <p style={{ marginBottom: '1rem' }}>
                            Para proceder, escribe exactamente la siguiente frase:
                        </p>
                        <p style={{
                            backgroundColor: '#f3f4f6',
                            padding: '1rem',
                            borderRadius: '4px',
                            fontFamily: 'monospace',
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            textAlign: 'center',
                            marginBottom: '1rem',
                        }}>
                            DELETE ALL DATA
                        </p>

                        <div className="form-group">
                            <input
                                type="text"
                                value={confirmationPhrase}
                                onChange={(e) => setConfirmationPhrase(e.target.value)}
                                placeholder="Escribe la frase de confirmación"
                                style={{
                                    fontSize: '1.1rem',
                                    padding: '0.75rem',
                                    border: isPhraseCorrect
                                        ? '2px solid #059669'
                                        : '2px solid #dc2626',
                                }}
                                disabled={isResetting}
                            />
                        </div>

                        {confirmationPhrase && !isPhraseCorrect && (
                            <p style={{ color: '#dc2626', fontSize: '0.9rem' }}>
                                ❌ La frase no coincide
                            </p>
                        )}

                        {isPhraseCorrect && (
                            <p style={{ color: '#059669', fontSize: '0.9rem' }}>
                                ✓ Frase correcta
                            </p>
                        )}

                        <div style={{
                            display: 'flex',
                            gap: '1rem',
                            marginTop: '2rem',
                        }}>
                            <button
                                onClick={() => {
                                    setShowConfirmation(false);
                                    setConfirmationPhrase('');
                                }}
                                className="btn btn-secondary"
                                disabled={isResetting}
                                style={{ flex: 1 }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleReset}
                                className="btn btn-danger"
                                disabled={!isPhraseCorrect || isResetting}
                                style={{ flex: 1 }}
                            >
                                <FaTrashAlt style={{ marginRight: '8px' }} />
                                {isResetting ? 'Eliminando...' : 'ELIMINAR TODO'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
