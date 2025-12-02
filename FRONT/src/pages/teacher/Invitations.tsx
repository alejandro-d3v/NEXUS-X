import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { invitationService } from '../../services/invitation.service';
import { gradeService } from '../../services/grade.service';
import { InvitationCode, Grade } from '../../types';
import { DataTable } from '../../components/shared/DataTable';
import { FaPlus, FaCopy, FaTrash, FaTicketAlt } from 'react-icons/fa';

export const Invitations: React.FC = () => {
    const [invitations, setInvitations] = useState<InvitationCode[]>([]);
    const [grades, setGrades] = useState<Grade[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showCodeModal, setShowCodeModal] = useState(false);
    const [generatedCode, setGeneratedCode] = useState<InvitationCode | null>(null);
    const [codeForm, setCodeForm] = useState({
        gradeId: '',
        expiresAt: '',
        maxUses: '',
        description: '',
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [invitationsData, gradesData] = await Promise.all([
                invitationService.getMyCodes(),
                gradeService.getAll(),
            ]);

            // Filter only teacher's grades
            const myGrades = gradesData.filter((grade: Grade) => grade.teacher?.id);

            setInvitations(invitationsData);
            setGrades(myGrades);
        } catch (error) {
            toast.error('Error loading data');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = {
                gradeId: codeForm.gradeId,
                expiresAt: codeForm.expiresAt || undefined,
                maxUses: codeForm.maxUses ? parseInt(codeForm.maxUses) : undefined,
                description: codeForm.description || undefined,
            };

            const code = await invitationService.generateCode(data);
            setGeneratedCode(code);
            setShowModal(false);
            setShowCodeModal(true);
            resetForm();
            fetchData();
            toast.success('Invitation code generated!');
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Error generating code');
        }
    };

    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        toast.success('Code copied to clipboard!');
    };

    const handleDeactivate = async (codeId: string) => {
        if (!window.confirm('Are you sure you want to deactivate this code?')) return;

        try {
            await invitationService.deactivateCode(codeId);
            toast.success('Code deactivated');
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Error deactivating code');
        }
    };

    const resetForm = () => {
        setCodeForm({
            gradeId: '',
            expiresAt: '',
            maxUses: '',
            description: '',
        });
    };

    const getStatusBadge = (code: InvitationCode) => {
        if (!code.isActive) return <span className="badge badge-danger">Inactive</span>;
        if (code.expiresAt && new Date(code.expiresAt) < new Date()) {
            return <span className="badge badge-warning">Expired</span>;
        }
        if (code.maxUses && code.usedCount >= code.maxUses) {
            return <span className="badge badge-warning">Depleted</span>;
        }
        return <span className="badge badge-success">Active</span>;
    };

    const columns = [
        {
            key: 'code',
            label: 'Code',
            render: (item: InvitationCode) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <code style={{ background: '#f3f4f6', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                        {item.code}
                    </code>
                    <button
                        onClick={() => handleCopyCode(item.code)}
                        className="btn-icon"
                        title="Copy code"
                    >
                        <FaCopy />
                    </button>
                </div>
            ),
        },
        {
            key: 'grade',
            label: 'Grade',
            render: (item: InvitationCode) => item.grade?.name || '-',
        },
        {
            key: 'created',
            label: 'Created',
            render: (item: InvitationCode) => new Date(item.createdAt).toLocaleDateString(),
        },
        {
            key: 'expires',
            label: 'Expires',
            render: (item: InvitationCode) =>
                item.expiresAt ? new Date(item.expiresAt).toLocaleDateString() : 'Never',
        },
        {
            key: 'uses',
            label: 'Uses',
            render: (item: InvitationCode) =>
                `${item.usedCount}${item.maxUses ? ` / ${item.maxUses}` : ''}`,
        },
        {
            key: 'status',
            label: 'Status',
            render: (item: InvitationCode) => getStatusBadge(item),
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (item: InvitationCode) => (
                <button
                    onClick={() => handleDeactivate(item.id)}
                    className="btn-icon btn-danger"
                    title="Deactivate"
                    disabled={!item.isActive}
                >
                    <FaTrash />
                </button>
            ),
        },
    ];

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Invitation Codes</h1>
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        resetForm();
                        setShowModal(true);
                    }}
                >
                    <FaPlus /> Generate Code
                </button>
            </div>

            <DataTable
                data={invitations}
                columns={columns}
                loading={loading}
                emptyMessage="No invitation codes yet. Generate your first code!"
            />

            {/* Generate Code Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Generate Invitation Code</h2>
                            <button onClick={() => setShowModal(false)} className="modal-close">
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleGenerate}>
                            <div className="form-group">
                                <label>Grade *</label>
                                <select
                                    value={codeForm.gradeId}
                                    onChange={(e) => setCodeForm({ ...codeForm, gradeId: e.target.value })}
                                    required
                                >
                                    <option value="">Select Grade</option>
                                    {grades.map((grade) => (
                                        <option key={grade.id} value={grade.id}>
                                            {grade.name} - {grade.institution?.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Expiration Date</label>
                                <input
                                    type="date"
                                    value={codeForm.expiresAt}
                                    onChange={(e) => setCodeForm({ ...codeForm, expiresAt: e.target.value })}
                                    min={new Date().toISOString().split('T')[0]}
                                />
                                <small style={{ color: '#666' }}>Leave empty for no expiration</small>
                            </div>

                            <div className="form-group">
                                <label>Maximum Uses</label>
                                <input
                                    type="number"
                                    value={codeForm.maxUses}
                                    onChange={(e) => setCodeForm({ ...codeForm, maxUses: e.target.value })}
                                    min="1"
                                    placeholder="Unlimited"
                                />
                                <small style={{ color: '#666' }}>Leave empty for unlimited uses</small>
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={codeForm.description}
                                    onChange={(e) => setCodeForm({ ...codeForm, description: e.target.value })}
                                    rows={2}
                                    placeholder="Optional notes about this code"
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Generate Code
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Generated Code Display Modal */}
            {showCodeModal && generatedCode && (
                <div className="modal-overlay" onClick={() => setShowCodeModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Invitation Code Generated! 🎉</h2>
                            <button onClick={() => setShowCodeModal(false)} className="modal-close">
                                ×
                            </button>
                        </div>

                        <div className="invitation-code-card">
                            <FaTicketAlt size={48} />
                            <p style={{ margin: '1rem 0 0.5rem', fontSize: '1.1rem' }}>
                                Share this code with students:
                            </p>
                            <div className="invitation-code-display">{generatedCode.code}</div>
                            <button
                                onClick={() => handleCopyCode(generatedCode.code)}
                                className="copy-code-btn"
                            >
                                <FaCopy /> Copy Code
                            </button>
                            <p style={{ marginTop: '1.5rem', fontSize: '0.9rem', opacity: 0.9 }}>
                                Grade: <strong>{generatedCode.grade?.name}</strong>
                            </p>
                            {generatedCode.expiresAt && (
                                <p style={{ fontSize: '0.85rem', opacity: 0.8 }}>
                                    Expires: {new Date(generatedCode.expiresAt).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
