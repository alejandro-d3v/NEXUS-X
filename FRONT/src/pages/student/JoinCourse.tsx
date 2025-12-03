import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { FaTicketAlt, FaSpinner } from 'react-icons/fa';
import api from '../../services/api';

export const JoinCourse: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!code.trim()) {
            toast.error('Please enter an invitation code');
            return;
        }

        try {
            setLoading(true);
            const response = await api.post(`/invitations/join/${code.trim().toUpperCase()}`);

            toast.success(response.data.message || 'Successfully joined the course!');

            // Redirect to dashboard to see the new course
            setTimeout(() => {
                navigate('/student/dashboard');
            }, 1500);
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || 'Invalid or expired invitation code';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

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

                <form onSubmit={handleSubmit}>
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
