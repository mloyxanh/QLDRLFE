import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button, Form } from 'react-bootstrap';

const AdvisorList = () => {
    const [advisors, setAdvisors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false); // Biến xác định xem đang tạo mới hay chỉnh sửa
    const [currentAdvisor, setCurrentAdvisor] = useState({
        fullName: '',
        phoneNumber: '',
        address: '',
        department: '',
        user: ''
    });

    useEffect(() => {
        fetchAdvisors();
    }, []);

    const fetchAdvisors = () => {
        axios.get('http://localhost:8080/api/advisors')
            .then(response => {
                setAdvisors(response.data);
                setLoading(false);
            })
            .catch(error => {
                setError(error);
                setLoading(false);
            });
    };

    const handleAdd = () => {
        setCurrentAdvisor({
            fullName: '',
            phoneNumber: '',
            address: '',
            department: '',
            user: ''
        });
        setIsEditing(false);
        setShowModal(true);
    };

    const handleEdit = (advisor) => {
        setCurrentAdvisor(advisor);
        setIsEditing(true);
        setShowModal(true);
    };

    const handleDelete = (id) => {
        axios.delete(`http://localhost:8080/api/advisors/${id}`)
            .then(() => {
                fetchAdvisors();
            })
            .catch(error => {
                setError(error);
            });
    };

    const handleSave = () => {
        if (isEditing) {
            axios.put(`http://localhost:8080/api/advisors/${currentAdvisor.id}`, currentAdvisor)
                .then(() => {
                    fetchAdvisors();
                    setShowModal(false);
                })
                .catch(error => {
                    setError(error);
                });
        } else {
            axios.post('http://localhost:8080/api/advisors', currentAdvisor)
                .then(() => {
                    fetchAdvisors();
                    setShowModal(false);
                })
                .catch(error => {
                    setError(error);
                });
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCurrentAdvisor(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return (
        <div className="container mt-5">
            <h2>Danh Sách Cố Vấn</h2>
            <Button variant="primary" onClick={handleAdd}>Thêm Cố Vấn</Button>
            <table className="table table-striped table-bordered mt-3">
                <thead className="thead-dark">
                    <tr>
                        <th>ID</th>
                        <th>Họ Tên</th>
                        <th>Số Điện Thoại</th>
                        <th>Địa Chỉ</th>
                        <th>Khoa</th>
                        <th>Tên Đăng Nhập</th>
                        <th>Hành Động</th>
                    </tr>
                </thead>
                <tbody>
                    {advisors.map(advisor => (
                        <tr key={advisor.id}>
                            <td>{advisor.id}</td>
                            <td>{advisor.fullName}</td>
                            <td>{advisor.phoneNumber}</td>
                            <td>{advisor.address}</td>
                            <td>{advisor.department}</td>
                            <td>{advisor.user}</td>
                            <td>
                                <Button variant="warning" onClick={() => handleEdit(advisor)}>Sửa</Button>{' '}
                                <Button variant="danger" onClick={() => handleDelete(advisor.id)}>Xóa</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? 'Sửa Cố Vấn' : 'Thêm Cố Vấn'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        {isEditing && (
                            <Form.Group controlId="formAdvisorId">
                                <Form.Label>ID</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="id"
                                    value={currentAdvisor.id}
                                    onChange={handleChange}
                                    placeholder="Enter ID"
                                    readOnly
                                />
                            </Form.Group>
                        )}
                        {!isEditing && (
                            <Form.Group controlId="formAdvisorId">
                                <Form.Label>ID</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="id"
                                    value={currentAdvisor.id}
                                    onChange={handleChange}
                                    placeholder="Enter ID"
                                />
                            </Form.Group>
                        )}
                        <Form.Group controlId="formAdvisorName">
                            <Form.Label>Họ Tên</Form.Label>
                            <Form.Control
                                type="text"
                                name="fullName"
                                value={currentAdvisor.fullName}
                                onChange={handleChange}
                                placeholder="Enter full name"
                            />
                        </Form.Group>
                        <Form.Group controlId="formAdvisorPhoneNumber">
                            <Form.Label>Số Điện Thoại</Form.Label>
                            <Form.Control
                                type="text"
                                name="phoneNumber"
                                value={currentAdvisor.phoneNumber}
                                onChange={handleChange}
                                placeholder="Enter phone number"
                            />
                        </Form.Group>
                        <Form.Group controlId="formAdvisorAddress">
                            <Form.Label>Địa Chỉ</Form.Label>
                            <Form.Control
                                type="text"
                                name="address"
                                value={currentAdvisor.address}
                                onChange={handleChange}
                                placeholder="Enter address"
                            />
                        </Form.Group>
                        <Form.Group controlId="formAdvisorClazz">
                            <Form.Label>Khoa</Form.Label>
                            <Form.Control
                                type="text"
                                name="department"
                                value={currentAdvisor.department}
                                onChange={handleChange}
                                placeholder="Enter class"
                            />
                        </Form.Group>
                        <Form.Group controlId="formAdvisorUser">
                            <Form.Label>Người Dùng</Form.Label>
                            <Form.Control
                                type="text"
                                name="user"
                                value={currentAdvisor.user}
                                onChange={handleChange}
                                placeholder="Enter user"
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Đóng</Button>
                    <Button variant="primary" onClick={handleSave}>Lưu</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AdvisorList;
