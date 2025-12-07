import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { FaTicketAlt, FaSpinner, FaUserPlus } from 'react-icons/fa';
import api from '../../services/api';

export const JoinCourse: React.FC = () => {
    const navigate = useNavigate();
    const { user, loginWithToken } = useAuth();
    const { code: urlCode } = useParams<{ code: string }>();
    
    const [code, setCode] = useState(urlCode || '');
    const [loading, setLoading] = useState(false);
    const [showRegistrationForm, setShowRegistrationForm] = useState(false);
    const [registrationData, setRegistrationData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
    });

    useEffect(() => {
        // If code is in URL and user is logged in, auto-enroll
        if (urlCode && user) {
            handleAutoEnroll(urlCode);
        } else if (urlCode && !user) {
            // Show registration form for non-logged users
            setShowRegistrationForm(true);
        }
    }, [urlCode, user]);

    const handleAutoEnroll = async (inviteCode: string) => {
        try {
            setLoading(true);
            const response = await api.post(`/invitations/join/${inviteCode.trim().toUpperCase()}`);
            
            toast.success(response.data.message || `¡Bienvenido al curso ${response.data.grade?.name || ''}!`);
            
            // Redirect to dashboard
            setTimeout(() => {
                navigate('/student/dashboard');
            }, 2000);
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || 'Error al unirse al curso';
            toast.error(errorMessage);
            // If error, show the code input form
            setShowRegistrationForm(false);
        } finally {
            setLoading(false);
        }
    };

    const handleCodeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!code.trim()) {
            toast.error('Please enter an invitation code');
            return;
        }

        // If user exists, enroll them
        if (user) {
            handleAutoEnroll(code);
        } else {
            // Show registration form
            setShowRegistrationForm(true);
        }
    };

    const handleRegistrationSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!code.trim()) {
            toast.error('Invitation code is required');
            return;
        }

        try {
            setLoading(true);
            
            // Send data directly in body, not nested in userData
            const response = await api.post(`/invitations/join/${code.trim().toUpperCase()}`, {
                firstName: registrationData.firstName,
                lastName: registrationData.lastName,
                email: registrationData.email,
                password: registrationData.password,
            });

            toast.success(response.data.message || '¡Cuenta creada y matriculado exitosamente!');

            // Auto-login with returned token
            if (response.data.token) {
                loginWithToken(response.data.token, response.data.user);
                
                // Redirect to dashboard
                setTimeout(() => {
                    navigate('/student/dashboard');
                }, 1500);
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || 'Error creating account';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // If user is logged in and there's a URL code, show loading
    if (urlCode && user && loading) {
        return (
            <div className="page-container">
                <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                    <FaSpinner className="spinner" size={48} style={{ color: '#667eea' }} />
                    <h2 style={{ marginTop: '2rem' }}>Uniéndote al curso...</h2>
                </div>
            </div>
        );
    }

    // Show registration form for non-logged users with URL code
    if (showRegistrationForm && !user) {
        return (
            <div className="page-container">
                <div className="page-header">
                    <div>
                        <h1>Regístrate para unirte al curso</h1>
                        <p style={{ color: '#666', marginTop: '0.5rem' }}>
                            Código de invitación: <strong>{code}</strong>
                        </p>
                    </div>
                </div>

                <div className="section-card" style={{ maxWidth: '600px', margin: '2rem auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div
                            style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1rem',
                            }}
                        >
                            <FaUserPlus size={40} color="white" />
                        </div>
                        <h2>Crear Cuenta</h2>
                        <p style={{ color: '#666', fontSize: '0.95rem' }}>
                            Completa tus datos para unirte al curso
                        </p>
                    </div>

                    <form onSubmit={handleRegistrationSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Nombre *</label>
                                <input
                                    type="text"
                                    value={registrationData.firstName}
                                    onChange={(e) => setRegistrationData({ ...registrationData, firstName: e.target.value })}
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <div className="form-group">
                                <label>Apellido *</label>
                                <input
                                    type="text"
                                    value={registrationData.lastName}
                                    onChange={(e) => setRegistrationData({ ...registrationData, lastName: e.target.value })}
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Email *</label>
                            <input
                                type="email"
                                value={registrationData.email}
                                onChange={(e) => setRegistrationData({ ...registrationData, email: e.target.value })}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label>Contraseña *</label>
                            <input
                                type="password"
                                value={registrationData.password}
                                onChange={(e) => setRegistrationData({ ...registrationData, password: e.target.value })}
                                required
                                minLength={6}
                                disabled={loading}
                            />
                            <small style={{ color: '#666', display: 'block', marginTop: '0.5rem' }}>
                                Mínimo 6 caracteres
                            </small>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <FaSpinner className="spinner" /> Creando cuenta...
                                </>
                            ) : (
                                <>
                                    <FaUserPlus /> Crear Cuenta y Unirse
                                </>
                            )}
                        </button>
                    </form>

                    <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                        <p style={{ color: '#666', fontSize: '0.9rem' }}>
                            ¿Ya tienes cuenta?{' '}
                            <a
                                href="/login"
                                style={{ color: '#667eea', textDecoration: 'none', fontWeight: '500' }}
                            >
                                Inicia sesión
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Show code input form for logged users or when no URL code
    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Join a Course</h1>
                    <p style={{ color: '#666', marginTop: '0.5rem' }}>
                        Enter an invitation code to enroll in a new course
                    </p>
                </div>
            </div>

            <div className="section-card" style={{ maxWidth: '600px', margin: '2rem auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div
                        style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1rem',
                        }}
                    >
                        <FaTicketAlt size={40} color="white" />
                    </div>
                    <h2>Enter Invitation Code</h2>
                    <p style={{ color: '#666', fontSize: '0.95rem' }}>
                        Ask your teacher for an invitation code to join their course
                    </p>
                </div>

                <form onSubmit={handleCodeSubmit}>
                    <div className="form-group">
                        <label htmlFor="code">Invitation Code</label>
                        <input
                            id="code"
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            placeholder="Enter code (e.g., ABC123XY)"
                            maxLength={8}
                            style={{
                                textAlign: 'center',
                                fontSize: '1.5rem',
                                fontWeight: '600',
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                            }}
                            disabled={loading}
                            required
                        />
                        <small style={{ color: '#666', display: 'block', marginTop: '0.5rem' }}>
                            Invitation codes are 8 characters long
                        </small>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <FaSpinner className="spinner" /> Joining...
                            </>
                        ) : (
                            <>
                                <FaTicketAlt /> Join Course
                            </>
                        )}
                    </button>
                </form>

                <div
                    style={{
                        marginTop: '2rem',
                        padding: '1.5rem',
                        background: '#f9fafb',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                    }}
                >
                    <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#374151' }}>
                        💡 How to get an invitation code:
                    </h3>
                    <ul style={{ color: '#666', fontSize: '0.9rem', lineHeight: '1.8', paddingLeft: '1.5rem' }}>
                        <li>Ask your teacher for an invitation code</li>
                        <li>Teachers can generate codes from their dashboard</li>
                        <li>Each code is linked to a specific course</li>
                        <li>You can join multiple courses with different codes</li>
                    </ul>
                </div>

                {user?.studentProfile && (
                    <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                        <p style={{ color: '#666', fontSize: '0.9rem' }}>
                            Already enrolled in courses?{' '}
                            <a
                                href="/student/dashboard"
                                style={{ color: '#667eea', textDecoration: 'none', fontWeight: '500' }}
                            >
                                View Dashboard
                            </a>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
