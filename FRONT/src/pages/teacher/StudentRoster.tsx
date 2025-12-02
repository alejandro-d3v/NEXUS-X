import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { gradeService } from '../../services/grade.service';
import { Grade, StudentProfile } from '../../types';
import { DataTable } from '../../components/shared/DataTable';
import { FaUsers, FaEnvelope } from 'react-icons/fa';

export const StudentRoster: React.FC = () => {
    const [grades, setGrades] = useState<Grade[]>([]);
    const [selectedGradeId, setSelectedGradeId] = useState<string>('');
    const [students, setStudents] = useState<StudentProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingStudents, setLoadingStudents] = useState(false);

    useEffect(() => {
        fetchGrades();
    }, []);

    useEffect(() => {
        if (selectedGradeId) {
            fetchStudents(selectedGradeId);
        } else {
            setStudents([]);
        }
    }, [selectedGradeId]);

    const fetchGrades = async () => {
        try {
            const gradesData = await gradeService.getAll();
            // Filter only teacher's grades
            const myGrades = gradesData.filter((grade: Grade) => grade.teacher?.id);
            setGrades(myGrades);

            // Auto-select first grade if available
            if (myGrades.length > 0) {
                setSelectedGradeId(myGrades[0].id);
            }
        } catch (error) {
            toast.error('Error loading grades');
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async (gradeId: string) => {
        setLoadingStudents(true);
        try {
            const studentsData = await gradeService.getStudents(gradeId);
            setStudents(studentsData);
        } catch (error) {
            toast.error('Error loading students');
            setStudents([]);
        } finally {
            setLoadingStudents(false);
        }
    };

    const selectedGrade = grades.find((g) => g.id === selectedGradeId);

    const columns = [
        {
            key: 'name',
            label: 'Name',
            render: (item: StudentProfile) => {
                const firstName = item.user?.firstName || '';
                const lastName = item.user?.lastName || '';
                return `${firstName} ${lastName}`;
            },
        },
        {
            key: 'email',
            label: 'Email',
            render: (item: StudentProfile) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FaEnvelope size={14} color="#666" />
                    {item.user?.email || '-'}
                </div>
            ),
        },
        {
            key: 'studentId',
            label: 'Student ID',
            render: (item: StudentProfile) => item.studentId || '-',
        },
        {
            key: 'enrolled',
            label: 'Enrolled',
            render: (item: StudentProfile) =>
                item.enrollmentDate
                    ? new Date(item.enrollmentDate).toLocaleDateString()
                    : '-',
        },
        {
            key: 'status',
            label: 'Status',
            render: (item: StudentProfile) => {
                const isActive = item.user?.isActive;
                return (
                    <span className={isActive ? 'badge badge-success' : 'badge badge-danger'}>
                        {isActive ? 'Active' : 'Inactive'}
                    </span>
                );
            },
        },
    ];

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Student Roster</h1>
                    <p style={{ color: '#666', marginTop: '0.5rem' }}>
                        View students enrolled in your grades
                    </p>
                </div>
            </div>

            {/* Grade Selector */}
            <div className="section-card" style={{ marginBottom: '2rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Select Grade</label>
                    <select
                        value={selectedGradeId}
                        onChange={(e) => setSelectedGradeId(e.target.value)}
                        disabled={loading || grades.length === 0}
                        style={{ maxWidth: '400px' }}
                    >
                        {grades.length === 0 ? (
                            <option value="">No grades available</option>
                        ) : (
                            grades.map((grade) => (
                                <option key={grade.id} value={grade.id}>
                                    {grade.name} - {grade.institution?.name} ({grade._count?.students || 0} students)
                                </option>
                            ))
                        )}
                    </select>
                </div>
            </div>

            {/* Students Table */}
            {selectedGrade && (
                <div className="section-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2>{selectedGrade.name}</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#666' }}>
                            <FaUsers />
                            <span>{students.length} students</span>
                        </div>
                    </div>

                    <DataTable
                        data={students}
                        columns={columns}
                        loading={loadingStudents}
                        emptyMessage="No students enrolled in this grade yet"
                    />
                </div>
            )}

            {!selectedGrade && !loading && grades.length === 0 && (
                <div className="empty-state">
                    <FaUsers size={48} color="#ccc" />
                    <p>No grades found</p>
                    <p style={{ fontSize: '0.9rem', color: '#999' }}>
                        Create a grade first to view students
                    </p>
                </div>
            )}
        </div>
    );
};
