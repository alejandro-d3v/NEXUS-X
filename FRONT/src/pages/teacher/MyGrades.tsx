import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { gradeService } from '../../services/grade.service';
import { institutionService } from '../../services/institution.service';
import { Grade, Institution } from '../../types';
import { DataTable } from '../../components/shared/DataTable';
import { FaPlus, FaEdit, FaTrash, FaUsers } from 'react-icons/fa';

export const MyGrades: React.FC = () => {
    const [grades, setGrades] = useState<Grade[]>([]);
    const [institutions, setInstitutions] = useState<Institution[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showStudentsModal, setShowStudentsModal] = useState(false);
    const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
    const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
    const [gradeForm, setGradeForm] = useState({
        name: '',
        description: '',
        institutionId: '',
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [gradesData, institutionsData] = await Promise.all([
                gradeService.getMyGrades(), // Only get my grades
                institutionService.getAll(),
            ]);

            setGrades(gradesData);
            setInstitutions(institutionsData);
        } catch (error) {
            toast.error('Error loading data');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingGrade) {
                await gradeService.update(editingGrade.id, gradeForm);
                toast.success('Grade updated successfully');
            } else {
                // Backend will automatically assign current user as teacher
                await gradeService.create(gradeForm as any);
                toast.success('Grade created successfully');
            }
            setShowModal(false);
            resetForm();
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Error saving grade');
        }
    };

    const handleEdit = (grade: Grade) => {
        setEditingGrade(grade);
        setGradeForm({
            name: grade.name,
            description: grade.description || '',
            institutionId: grade.institutionId,
        });
        setShowModal(true);
    };

    const handleDelete = async (gradeId: string) => {
        if (!window.confirm('Are you sure you want to delete this grade?')) return;

        try {
            await gradeService.delete(gradeId);
            toast.success('Grade deleted successfully');
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Error deleting grade');
        }
    };

    const handleViewStudents = (grade: Grade) => {
        setSelectedGrade(grade);
        setShowStudentsModal(true);
    };

    const resetForm = () => {
        setGradeForm({
            name: '',
            description: '',
            institutionId: '',
        });
        setEditingGrade(null);
    };

    const columns = [
        { key: 'name', label: 'Name' },
        {
            key: 'institution',
            label: 'Institution',
            render: (item: Grade) => item.institution?.name || '-',
        },
        {
            key: 'students',
            label: 'Students',
            render: (item: Grade) => item._count?.students || 0,
        },
        {
            key: 'status',
            label: 'Status',
            render: (item: Grade) => (
                <span className={`badge ${item.isActive ? 'badge-success' : 'badge-danger'}`}>
                    {item.isActive ? 'Active' : 'Inactive'}
                </span>
            ),
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (item: Grade) => (
                <div className="action-buttons-inline">
                    <button
                        onClick={() => handleViewStudents(item)}
                        className="btn-icon"
                        title="View Students"
                    >
                        <FaUsers />
                    </button>
                    <button
                        onClick={() => handleEdit(item)}
                        className="btn-icon"
                        title="Edit"
                    >
                        <FaEdit />
                    </button>
                    <button
                        onClick={() => handleDelete(item.id)}
                        className="btn-icon btn-danger"
                        title="Delete"
                    >
                        <FaTrash />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>My Grades</h1>
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        resetForm();
                        setShowModal(true);
                    }}
                >
                    <FaPlus /> Create Grade
                </button>
            </div>

            <DataTable
                data={grades}
                columns={columns}
                loading={loading}
                emptyMessage="No grades found. Create your first grade!"
            />

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingGrade ? 'Edit Grade' : 'Create New Grade'}</h2>
                            <button onClick={() => setShowModal(false)} className="modal-close">
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Name *</label>
                                <input
                                    type="text"
                                    value={gradeForm.name}
                                    onChange={(e) => setGradeForm({ ...gradeForm, name: e.target.value })}
                                    required
                                    placeholder="e.g., Mathematics 101"
                                />
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={gradeForm.description}
                                    onChange={(e) => setGradeForm({ ...gradeForm, description: e.target.value })}
                                    rows={3}
                                    placeholder="Brief description of the grade"
                                />
                            </div>

                            <div className="form-group">
                                <label>Institution *</label>
                                <select
                                    value={gradeForm.institutionId}
                                    onChange={(e) => setGradeForm({ ...gradeForm, institutionId: e.target.value })}
                                    required
                                >
                                    <option value="">Select Institution</option>
                                    {institutions.map((inst) => (
                                        <option key={inst.id} value={inst.id}>
                                            {inst.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingGrade ? 'Update' : 'Create'} Grade
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Students Modal */}
            {showStudentsModal && selectedGrade && (
                <div className="modal-overlay" onClick={() => setShowStudentsModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Students in {selectedGrade.name}</h2>
                            <button onClick={() => setShowStudentsModal(false)} className="modal-close">
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            <p className="text-center" style={{ padding: '2rem', color: '#666' }}>
                                {selectedGrade._count?.students || 0} students enrolled
                            </p>
                            <p className="text-center" style={{ color: '#999', fontSize: '0.9rem' }}>
                                Detailed student list coming soon...
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
