import React, { useState } from 'react';
import { Modal, Form } from 'react-bootstrap';

const UserPermissionsModal = ({ user, onClose, onSave }) => {
    const [permissions, setPermissions] = useState({
        dashboard: { view: true, edit: false },
        students: { view: true, edit: false },
        paymentManagement: { view: true, edit: false },
        dailyDues: { view: true, edit: false },
        paymentHistory: { view: true, edit: false },
        emailNotifications: { view: false, edit: false },
        studentArchive: { view: true, edit: false },
        paymentCategories: { view: false, edit: false },
        paymentStatus: { view: true, edit: false }
    });

    return (
        <Modal show={true} onHide={onClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>
                    <i className="fas fa-user-shield me-2"></i>
                    Edit Access for {user.name}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Module</th>
                                <th className="text-center">View</th>
                                <th className="text-center">Edit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(permissions).map(([module, access]) => (
                                <tr key={module}>
                                    <td className="text-capitalize">
                                        {module.replace(/([A-Z])/g, ' $1').trim()}
                                    </td>
                                    <td className="text-center">
                                        <Form.Check
                                            type="checkbox"
                                            checked={access.view}
                                            onChange={(e) => {
                                                setPermissions({
                                                    ...permissions,
                                                    [module]: { ...access, view: e.target.checked }
                                                });
                                            }}
                                        />
                                    </td>
                                    <td className="text-center">
                                        <Form.Check
                                            type="checkbox"
                                            checked={access.edit}
                                            onChange={(e) => {
                                                setPermissions({
                                                    ...permissions,
                                                    [module]: { ...access, edit: e.target.checked }
                                                });
                                            }}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <button className="btn btn-secondary" onClick={onClose}>
                    Cancel
                </button>
                <button
                    className="btn system-button"
                    onClick={() => onSave(permissions)}
                >
                    Save Changes
                </button>
            </Modal.Footer>
        </Modal>
    );
};

export default UserPermissionsModal; 
