import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FaGraduationCap, FaBuilding, FaChalkboardTeacher, FaSpinner } from 'react-icons/fa';

interface JoinResponse {
    success: boolean;
    message: string;
    user: any;
    studentProfile: any;
    grade: any;
    institution: any;
    token?: string;
}

export const JoinCourse: React.FC = () => {
    const { code } = useParams<{ code: string }>();
    const { user, loginWithToken } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [validating, setValidating] = useState(true);
    const [codeInfo, setCodeInfo] = useState<any>(null);
    const [error, setError] = useState<string>('');

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    useEffect(() => {
        validateCode();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [code]);

    const validateCode = async () => {
        try {
            const response = await api.post('/invitations/validate', { code });
            if (response.data.valid) {
                setCodeInfo(response.data);

                // If user is already logged in as student, auto-enroll
                if (user && user.role === 'STUDENT') {
                    handleAutoEnroll();
                }
            } else {
                setError(response.data.message || 'Invalid invitation code');
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Error validating code');
        } finally {
            setValidating(false);
        }
    };

    const handleAutoEnroll = async () => {
        setLoading(true);
        try {
            const response = await api.post<JoinResponse>(`/invitations/join/${code}`);
            toast.success(response.data.message);

            // Update user context with new enrollment data
            if (response.data.user) {
                const updatedUser = {
                    ...response.data.user,
                    studentProfile: response.data.studentProfile
                };
                loginWithToken(localStorage.getItem('token') || '', updatedUser);
            }

            // Navigate to welcome page with state
            navigate('/welcome', {
                state: {
                    enrollmentData: response.data
                }
            });
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Error enrolling in course');
            setError(err.response?.data?.error || 'Error enrolling in course');
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post<JoinResponse>(`/invitations/join/${code}`, {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                password: formData.password,
            });

            toast.success(response.data.message);

            // Auto-login with returned token
            if (response.data.token) {
                loginWithToken(response.data.token, response.data.user);
            }

            // Navigate to welcome page
            navigate('/welcome', {
                state: {
                    enrollmentData: response.data
                }
            });
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Error joining course');
            setError(err.response?.data?.error);
        } finally {
            setLoading(false);
        }
    };

    if (validating) {
        return (
            <div className="join-page">
                <div className="join-container">
                    <FaSpinner className="spinner" />
                    <p>Validating invitation code...</p>
                </div>
            </div>
        );
    }

    if (error && !codeInfo) {
        return (
            <div className="join-page">
                <div className="join-container">
                    <div className="error-state">
                        <h1>❌ Invalid Invitation</h1>
                        <p>{error}</p>
                        <button onClick={() => navigate('/')} className="btn btn-primary">
                            Go to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="join-page">
                <div className="join-container">
                    <FaSpinner className="spinner" />
                    <p>Enrolling you in the course...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="join-page">
            <div className="join-container">
                {/* Hero Section */}
                <div className="join-hero">
                    <FaGraduationCap className="hero-icon" />
                    <h1>Join {codeInfo?.grade?.name}</h1>
                    <div className="course-info">
                        <div className="info-item">
                            <FaBuilding />
                            <span>{codeInfo?.institution?.name}</span>
                        </div>
                        {codeInfo?.grade?.teacher && (
                            <div className="info-item">
                                <FaChalkboardTeacher />
                                <span>
                                    {codeInfo.grade.teacher.user?.firstName} {codeInfo.grade.teacher.user?.lastName}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Registration Form (only for non-authenticated users) */}
                {!user && (
                    <form onSubmit={handleSubmit} className="join-form">
                        <h2>Create Your Account</h2>

                        <div className="form-row">
                            <div className="form-group">
                                <label>First Name *</label>
                                <input
                                    type="text"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    required
                                    placeholder="John"
                                />
                            </div>
                            <div className="form-group">
                                <label>Last Name *</label>
                                <input
                                    type="text"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    required
                                    placeholder="Doe"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Email *</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                placeholder="john.doe@example.com"
                            />
                        </div>

                        <div className="form-group">
                            <label>Password *</label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                minLength={6}
                                placeholder="At least 6 characters"
                            />
                        </div>

                        <div className="form-group">
                            <label>Confirm Password *</label>
                            <input
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                required
                                placeholder="Confirm your password"
                            />
                        </div>

                        {error && <div className="error-message">{error}</div>}

                        <button type="submit" className="btn btn-primary btn-large" disabled={loading}>
                            {loading ? 'Joining...' : 'Join Course'}
                        </button>

                        <p className="form-footer">
                            Already have an account? <a href="/login">Login here</a>
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
};
