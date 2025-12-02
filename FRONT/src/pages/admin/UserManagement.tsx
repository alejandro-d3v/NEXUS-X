import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { adminService } from '../../services/admin.service';
import { institutionService } from '../../services/institution.service';
import { gradeService } from '../../services/grade.service';
import { User, UserRole, Institution, Grade, CreateTeacherRequest, CreateStudentRequest } from '../../types';
import { DataTable } from '../../components/shared/DataTable';
import { FaUserTie, FaUserGraduate, FaUserShield, FaEdit } from 'react-icons/fa';

export const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [institutions, setInstitutions] = useState<Institution[]>([]);
    const [grades, setGrades] = useState<Grade[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [userType, setUserType] = useState<'teacher' | 'student'>('teacher');
    const [teacherForm, setTeacherForm] = useState<CreateTeacherRequest>({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        institutionId: '',
        subject: '',
        title: '',
    });
    const [studentForm, setStudentForm] = useState<CreateStudentRequest>({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        institutionId: '',
        gradeId: '',
        studentId: '',
    });
    const [editForm, setEditForm] = useState({
        userId: '',
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        credits: 0,
    });
    const [roleUpdateData, setRoleUpdateData] = useState<{ userId: string; newRole: UserRole } | null>(null);
    const [filterRole, setFilterRole] = useState<UserRole | 'ALL'>('ALL');

    useEffect(() => {
        fetchData();
    }, [filterRole]);

    const fetchData = async () => {
        try {
            const [usersData, institutionsData, gradesData] = await Promise.all([
                adminService.getAllUsersWithProfiles(
                    filterRole !== 'ALL' ? { role: filterRole } : undefined
                ),
                institutionService.getAll(),
                gradeService.getAll(),
            ]);
            setUsers(usersData);
            setInstitutions(institutionsData);
            setGrades(gradesData);
        } catch (error) {
            toast.error('Error loading data');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTeacher = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await adminService.createTeacher(teacherForm);
            toast.success('Teacher created successfully');
            setShowModal(false);
            resetForms();
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Error creating teacher');
        }
    };

    const handleCreateStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await adminService.createStudent(studentForm);
            toast.success('Student created successfully');
            setShowModal(false);
            resetForms();
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Error creating student');
        }
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const updateData: any = {
                firstName: editForm.firstName,
                lastName: editForm.lastName,
                email: editForm.email,
                credits: editForm.credits,
            };

            // Only include password if it was changed
            if (editForm.password) {
                updateData.password = editForm.password;
            }

            await adminService.updateUser(editForm.userId, updateData);
            toast.success('User updated successfully');
            setShowEditModal(false);
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Error updating user');
        }
    };

    const handleUpdateRole = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!roleUpdateData) return;

        try {
            await adminService.updateUserRole(roleUpdateData.userId, roleUpdateData.newRole);
            toast.success('User role updated successfully');
            setShowRoleModal(false);
            setRoleUpdateData(null);
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Error updating role');
        }
    };

    const openEditModal = (user: User) => {
        setEditForm({
            userId: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            password: '',
            credits: user.credits,
        });
        setShowEditModal(true);
    };

    const openRoleModal = (user: User) => {
        setRoleUpdateData({ userId: user.id, newRole: user.role });
        setShowRoleModal(true);
    };

    const handleToggleActive = async (user: User) => {
        try {
            if (user.isActive) {
                await adminService.deactivateUser(user.id);
                toast.success('User deactivated successfully');
            } else {
                await adminService.activateUser(user.id);
                toast.success('User activated successfully');
            }
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Error updating user status');
        }
    };

    const resetForms = () => {
        setTeacherForm({
            email: '',
            password: '',
            firstName: '',
            lastName: '',
            institutionId: '',
            subject: '',
            title: '',
        });
        setStudentForm({
            email: '',
            password: '',
            firstName: '',
            lastName: '',
            institutionId: '',
            gradeId: '',
            studentId: '',
        });
    };

    const getInstitutionName = (user: User) => {
        if (user.studentProfile?.institution) {
            return user.studentProfile.institution.name;
        }
        if (user.teacherProfile?.institution) {
            return user.teacherProfile.institution.name;
        }
        return '-';
    };

    const getGradeName = (user: User) => {
        if (user.studentProfile?.grade) {
            return user.studentProfile.grade.name;
        }
        return '-';
    };

    const columns = [
        {
            key: 'firstName',
            label: 'Name',
            render: (item: User) => `${item.firstName} ${item.lastName}`,
        },
        { key: 'email', label: 'Email' },
        {
            key: 'role',
            label: 'Role',
            render: (item: User) => (
                <span className={`badge ${item.role === 'ADMIN' ? 'badge-danger' :
                        item.role === 'TEACHER' ? 'badge-primary' :
                            'badge-success'
                    }`}>
                    {item.role}
                </span>
            ),
        },
        {
            key: 'institution',
            label: 'Institution',
            render: (item: User) => getInstitutionName(item),
        },
        {
            key: 'grade',
            label: 'Grade',
            render: (item: User) => getGradeName(item),
        },
        {
            key: 'credits',
            label: 'Credits',
            render: (item: User) => item.credits || 0,
        },
        {
            key: 'isActive',
            label: 'Status',
            render: (item: User) => (
                <span className={`badge ${item.isActive ? 'badge-success' : 'badge-danger'}`}>
                    {item.isActive ? 'Active' : 'Inactive'}
                </span>
            ),
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (item: User) => (
                <div className="action-buttons-inline">
                    <button
                        onClick={() => openEditModal(item)}
                        className="btn-icon"
                        title="Edit User"
                    >
                        <FaEdit />
                    </button>
                    <button
                        onClick={() => openRoleModal(item)}
                        className="btn-icon"
                        title="Change Role"
                    >
                        <FaUserShield />
                    </button>
                    <button
                        onClick={() => handleToggleActive(item)}
                        className={`btn-sm ${item.isActive ? 'btn-danger' : 'btn-success'}`}
                    >
                        {item.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                </div>
            ),
        },
    ];

    const filteredGrades = grades.filter(g => g.institutionId === studentForm.institutionId);

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>User Management</h1>
                <div className="header-actions">
                    <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value as UserRole | 'ALL')}
                        className="filter-select"
                    >
                        <option value="ALL">All Roles</option>
                        <option value="ADMIN">Admins</option>
                        <option value="TEACHER">Teachers</option>
                        <option value="STUDENT">Students</option>
                    </select>
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            resetForms();
                            setUserType('teacher');
                            setShowModal(true);
                        }}
                    >
                        <FaUserTie /> Create Teacher
                    </button>
                    <button
                        className="btn btn-success"
                        onClick={() => {
                            resetForms();
                            setUserType('student');
                            setShowModal(true);
                        }}
                    >
                        <FaUserGraduate /> Create Student
                    </button>
                </div>
            </div>

            <DataTable
                data={users}
                columns={columns}
                loading={loading}
                emptyMessage="No users found"
            />

            {/* Create User Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Create {userType === 'teacher' ? 'Teacher' : 'Student'}</h2>
                            <button onClick={() => setShowModal(false)} className="modal-close">
                                ×
                            </button>
                        </div>

                        {userType === 'teacher' ? (
                            <form onSubmit={handleCreateTeacher}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>First Name *</label>
                                        <input
                                            type="text"
                                            value={teacherForm.firstName}
                                            onChange={(e) => setTeacherForm({ ...teacherForm, firstName: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Last Name *</label>
                                        <input
                                            type="text"
                                            value={teacherForm.lastName}
                                            onChange={(e) => setTeacherForm({ ...teacherForm, lastName: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Email *</label>
                                        <input
                                            type="email"
                                            value={teacherForm.email}
                                            onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Password *</label>
                                        <input
                                            type="password"
                                            value={teacherForm.password}
                                            onChange={(e) => setTeacherForm({ ...teacherForm, password: e.target.value })}
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Institution *</label>
                                    <select
                                        value={teacherForm.institutionId}
                                        onChange={(e) => setTeacherForm({ ...teacherForm, institutionId: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Institution</option>
                                        {institutions.map(inst => (
                                            <option key={inst.id} value={inst.id}>{inst.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Subject</label>
                                        <input
                                            type="text"
                                            value={teacherForm.subject}
                                            onChange={(e) => setTeacherForm({ ...teacherForm, subject: e.target.value })}
                                            placeholder="e.g., Mathematics"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Title</label>
                                        <input
                                            type="text"
                                            value={teacherForm.title}
                                            onChange={(e) => setTeacherForm({ ...teacherForm, title: e.target.value })}
                                            placeholder="e.g., Professor, Instructor"
                                        />
                                    </div>
                                </div>
                                <div className="modal-actions">
                                    <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        Create Teacher
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handleCreateStudent}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>First Name *</label>
                                        <input
                                            type="text"
                                            value={studentForm.firstName}
                                            onChange={(e) => setStudentForm({ ...studentForm, firstName: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Last Name *</label>
                                        <input
                                            type="text"
                                            value={studentForm.lastName}
                                            onChange={(e) => setStudentForm({ ...studentForm, lastName: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Email *</label>
                                        <input
                                            type="email"
                                            value={studentForm.email}
                                            onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Password *</label>
                                        <input
                                            type="password"
                                            value={studentForm.password}
                                            onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Institution *</label>
                                    <select
                                        value={studentForm.institutionId}
                                        onChange={(e) => {
                                            setStudentForm({ ...studentForm, institutionId: e.target.value, gradeId: '' });
                                        }}
                                        required
                                    >
                                        <option value="">Select Institution</option>
                                        {institutions.map(inst => (
                                            <option key={inst.id} value={inst.id}>{inst.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Grade *</label>
                                    <select
                                        value={studentForm.gradeId}
                                        onChange={(e) => setStudentForm({ ...studentForm, gradeId: e.target.value })}
                                        required
                                        disabled={!studentForm.institutionId}
                                    >
                                        <option value="">Select Grade</option>
                                        {filteredGrades.map(grade => (
                                            <option key={grade.id} value={grade.id}>{grade.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Student ID</label>
                                    <input
                                        type="text"
                                        value={studentForm.studentId}
                                        onChange={(e) => setStudentForm({ ...studentForm, studentId: e.target.value })}
                                        placeholder="Optional student ID"
                                    />
                                </div>
                                <div className="modal-actions">
                                    <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-success">
                                        Create Student
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {showEditModal && (
                <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Edit User</h2>
                            <button onClick={() => setShowEditModal(false)} className="modal-close">
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleUpdateUser}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>First Name *</label>
                                    <input
                                        type="text"
                                        value={editForm.firstName}
                                        onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Last Name *</label>
                                    <input
                                        type="text"
                                        value={editForm.lastName}
                                        onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Email *</label>
                                <input
                                    type="email"
                                    value={editForm.email}
                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>New Password (leave blank to keep current)</label>
                                <input
                                    type="password"
                                    value={editForm.password}
                                    onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                                    minLength={6}
                                    placeholder="Enter new password or leave blank"
                                />
                            </div>
                            <div className="form-group">
                                <label>Credits</label>
                                <input
                                    type="number"
                                    value={editForm.credits}
                                    onChange={(e) => setEditForm({ ...editForm, credits: parseInt(e.target.value) || 0 })}
                                    min={0}
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowEditModal(false)} className="btn btn-secondary">
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Update User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Role Update Modal */}
            {showRoleModal && roleUpdateData && (
                <div className="modal-overlay" onClick={() => setShowRoleModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Update User Role</h2>
                            <button onClick={() => setShowRoleModal(false)} className="modal-close">
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleUpdateRole}>
                            <div className="form-group">
                                <label>Select New Role *</label>
                                <select
                                    value={roleUpdateData.newRole}
                                    onChange={(e) => setRoleUpdateData({ ...roleUpdateData, newRole: e.target.value as UserRole })}
                                    required
                                >
                                    <option value="STUDENT">Student</option>
                                    <option value="TEACHER">Teacher</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                                <p style={{ marginTop: '0.5rem', color: '#666', fontSize: '0.9rem' }}>
                                    ⚠️ Warning: Changing roles may affect user permissions and access.
                                </p>
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowRoleModal(false)} className="btn btn-secondary">
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Update Role
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
