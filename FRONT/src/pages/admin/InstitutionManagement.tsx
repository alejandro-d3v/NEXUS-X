import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { institutionService } from '../../services/institution.service';
import { Institution, CreateInstitutionRequest } from '../../types';
import { DataTable } from '../../components/shared/DataTable';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

export const InstitutionManagement: React.FC = () => {
    const [institutions, setInstitutions] = useState<Institution[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingInstitution, setEditingInstitution] = useState<Institution | null>(null);
    const [formData, setFormData] = useState<CreateInstitutionRequest>({
        name: '',
        description: '',
        address: '',
        phone: '',
        email: '',
    });

    useEffect(() => {
        fetchInstitutions();
    }, []);

    const fetchInstitutions = async () => {
        try {
            const data = await institutionService.getAll();
            setInstitutions(data);
        } catch (error) {
            toast.error('Error loading institutions');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingInstitution) {
                await institutionService.update(editingInstitution.id, formData);
                toast.success('Institution updated successfully');
            } else {
                await institutionService.create(formData);
                toast.success('Institution created successfully');
            }
            setShowModal(false);
            resetForm();
            fetchInstitutions();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Error saving institution');
        }
    };

    const handleEdit = (institution: Institution) => {
        setEditingInstitution(institution);
        setFormData({
            name: institution.name,
            description: institution.description || '',
            address: institution.address || '',
            phone: institution.phone || '',
            email: institution.email || '',
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this institution?')) return;

        try {
            await institutionService.delete(id);
            toast.success('Institution deleted successfully');
            fetchInstitutions();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Error deleting institution');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            address: '',
            phone: '',
            email: '',
        });
        setEditingInstitution(null);
    };

    const columns = [
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone' },
        {
            key: '_count',
            label: 'Grades',
            render: (item: Institution) => item._count?.grades || 0,
        },
        {
            key: '_count',
            label: 'Teachers',
            render: (item: Institution) => item._count?.teachers || 0,
        },
        {
            key: '_count',
            label: 'Students',
            render: (item: Institution) => item._count?.students || 0,
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (item: Institution) => (
                <div className="action-buttons-inline">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(item);
                        }}
                        className="btn-icon"
                        title="Edit"
                    >
                        <FaEdit />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item.id);
                        }}
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
                <h1>Institution Management</h1>
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        resetForm();
                        setShowModal(true);
                    }}
                >
                    <FaPlus /> Create Institution
                </button>
            </div>

            <DataTable
                data={institutions}
                columns={columns}
                loading={loading}
                emptyMessage="No institutions found"
            />

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingInstitution ? 'Edit Institution' : 'Create Institution'}</h2>
                            <button onClick={() => setShowModal(false)} className="modal-close">
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                />
                            </div>
                            <div className="form-group">
                                <label>Address</label>
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Phone</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingInstitution ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
