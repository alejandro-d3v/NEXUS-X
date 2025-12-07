import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { gradeService } from '../../services/grade.service';
import { institutionService } from '../../services/institution.service';
import { adminService } from '../../services/admin.service';
import { Grade, Institution, CreateGradeRequest, User, UserRole } from '../../types';
import { DataTable } from '../../components/shared/DataTable';
import { FaUsers, FaPlus, FaEdit, FaTrash, FaUserTie } from 'react-icons/fa';

export const GradeManagement: React.FC = () => {
    const [grades, setGrades] = useState<Grade[]>([]);
    const [institutions, setInstitutions] = useState<Institution[]>([]);
    const [teachers, setTeachers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterInstitution, setFilterInstitution] = useState<string>('ALL');
    const [showModal, setShowModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
    const [assigningGrade, setAssigningGrade] = useState<Grade | null>(null);
    const [formData, setFormData] = useState<CreateGradeRequest>({
        name: '',
        description: '',
        institutionId: '',
        teacherId: '',
    });

    useEffect(() => {
        fetchData();
    }, [filterInstitution]);

    const fetchData = async () => {
        try {
            const [gradesData, institutionsData, usersData] = await Promise.all([
                gradeService.getAll(
                    filterInstitution !== 'ALL' ? { institutionId: filterInstitution } : undefined
                ),
                institutionService.getAll(),
                adminService.getAllUsersWithProfiles({ role: UserRole.TEACHER }),
            ]);
            setGrades(gradesData);
            setInstitutions(institutionsData);
            setTeachers(usersData);
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
                await gradeService.update(editingGrade.id, formData);
                toast.success('Grade updated successfully');
            } else {
                await gradeService.create(formData);
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
        setFormData({
            name: grade.name,
            description: grade.description || '',
            institutionId: grade.institutionId,
            teacherId: grade.teacherId,
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this grade?')) return;

        try {
            await gradeService.delete(id);
            toast.success('Grade deleted successfully');
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Error deleting grade');
        }
    };

    const handleAssignTeacher = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!assigningGrade || !formData.teacherId) return;

        try {
            await gradeService.assignTeacher(assigningGrade.id, formData.teacherId);
            toast.success('Teacher assigned successfully');
            setShowAssignModal(false);
            setAssigningGrade(null);
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Error assigning teacher');
        }
    };

    const openAssignModal = (grade: Grade) => {
        setAssigningGrade(grade);
        setFormData({ ...formData, teacherId: grade.teacherId });
        setShowAssignModal(true);
    };

    const viewStudents = async (gradeId: string) => {
        try {
            const students = await gradeService.getStudents(gradeId);
            const grade = grades.find(g => g.id === gradeId);

            alert(`Students in ${grade?.name}:\n${students.length} students enrolled`);
        } catch (error: any) {
            toast.error('Error loading students');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            institutionId: '',
            teacherId: '',
        });
        setEditingGrade(null);
    };

    const columns = [
        { key: 'name', label: 'Grade Name' },
        {
            key: 'institution',
            label: 'Institution',
            render: (item: Grade) => item.institution?.name || '-',
        },
        {
            key: 'teacher',
            label: 'Teacher',
            render: (item: Grade) =>
                item.teacher
                    ? `${item.teacher.user.firstName} ${item.teacher.user.lastName}`
                    : '-',
        },
        {
            key: '_count',
            label: 'Students',
            render: (item: Grade) => item._count?.students || 0,
        },
        {
            key: 'isActive',
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
                        onClick={() => handleEdit(item)}
                        className="btn-icon"
                        title="Edit"
                    >
                        <FaEdit />
                    </button>
                    <button
                        onClick={() => openAssignModal(item)}
                        className="btn-icon"
                        title="Assign Teacher"
                    >
                        <FaUserTie />
                    </button>
                    <button
                        onClick={() => viewStudents(item.id)}
                        className="btn-sm btn-primary"
                        title="View Students"
                    >
                        <FaUsers /> Students
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
                <h1>Grade Management</h1>
                <div className="header-actions">
                    <select
                        value={filterInstitution}
                        onChange={(e) => setFilterInstitution(e.target.value)}
                        className="filter-select"
                    >
                        <option value="ALL">All Institutions</option>
                        {institutions.map(inst => (
                            <option key={inst.id} value={inst.id}>{inst.name}</option>
                        ))}
                    </select>
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
            </div>

            <DataTable
                data={grades}
                columns={columns}
                loading={loading}
                emptyMessage="No grades found"
            />

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingGrade ? 'Edit Grade' : 'Create Grade'}</h2>
                            <button onClick={() => setShowModal(false)} className="modal-close">
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Grade Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder="e.g., Grade 10A, Mathematics Advanced"
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    placeholder="Optional description"
                                />
                            </div>
                            <div className="form-group">
                                <label>Institution *</label>
                                <select
                                    value={formData.institutionId}
                                    onChange={(e) => setFormData({ ...formData, institutionId: e.target.value })}
                                    required
                                >
                                    <option value="">Select Institution</option>
                                    {institutions.map(inst => (
                                        <option key={inst.id} value={inst.id}>{inst.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Assign Teacher *</label>
                                <select
                                    value={formData.teacherId}
                                    onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                                    required
                                >
                                    <option value="">Select Teacher</option>
                                    {teachers.map(teacher => (
                                        <option key={teacher.id} value={teacher.teacherProfile?.id || ''}>
                                            {teacher.firstName} {teacher.lastName} - {teacher.teacherProfile?.institution?.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingGrade ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Assign Teacher Modal */}
            {showAssignModal && assigningGrade && (
                <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Assign Teacher to {assigningGrade.name}</h2>
                            <button onClick={() => setShowAssignModal(false)} className="modal-close">
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleAssignTeacher}>
                            <div className="form-group">
                                <label>Select Teacher *</label>
                                <select
                                    value={formData.teacherId}
                                    onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                                    required
                                >
                                    <option value="">Select Teacher</option>
                                    {teachers.map(teacher => (
                                        <option key={teacher.id} value={teacher.teacherProfile?.id || ''}>
                                            {teacher.firstName} {teacher.lastName} - {teacher.teacherProfile?.institution?.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowAssignModal(false)} className="btn btn-secondary">
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Assign Teacher
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
