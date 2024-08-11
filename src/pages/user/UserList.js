import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button, Form } from 'react-bootstrap';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [currentUser, setCurrentUser] = useState({
        userName: '',
        passWord: '',
        department: '',
        role: ''
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = () => {
        axios.get('http://localhost:8080/api/users')
            .then(response => {
                setUsers(response.data);
                setLoading(false);
            })
            .catch(error => {
                setError(error);
                setLoading(false);
            });
    };

    const handleAdd = () => {
        setCurrentUser({
            userName: '',
            passWord: '',
            department: '',
            role: ''
        });
        setShowModal(true);
    };

    const handleEdit = (user) => {
        setCurrentUser(user);
        setShowModal(true);
    };

    const handleDelete = (userName) => {
        axios.delete(`http://localhost:8080/api/users/${userName}`)
            .then(() => {
                fetchUsers();
            })
            .catch(error => {
                setError(error);
            });
    };

    const handleSave = () => {
        if (currentUser.userName) {
            axios.put(`http://localhost:8080/api/users/${currentUser.userName}`, currentUser)
                .then(() => {
                    fetchUsers();
                    setShowModal(false);
                })
                .catch(error => {
                    setError(error);
                });
        } else {
            axios.post('http://localhost:8080/api/users', currentUser)
                .then(() => {
                    fetchUsers();
                    setShowModal(false);
                })
                .catch(error => {
                    setError(error);
                });
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCurrentUser(prevState => ({
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
            <h2>Danh Sách Người Dùng</h2>
            <Button variant="primary" onClick={handleAdd}>Thêm Người Dùng</Button>
            <table className="table table-striped table-bordered mt-3">
                <thead className="thead-dark">
                    <tr>
                        <th>Tên Đăng Nhập</th>
                        <th>Mật Khẩu</th>
                        <th>Khoa</th>
                        <th>Vai Trò</th>
                        <th>Hành Động</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.userName}>
                            <td>{user.userName}</td>
                            <td>{user.passWord}</td>
                            <td>{user.department}</td>
                            <td>{user.role}</td>
                            <td>
                                <Button variant="warning" onClick={() => handleEdit(user)}>Sửa</Button>{' '}
                                <Button variant="danger" onClick={() => handleDelete(user.userName)}>Xóa</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{currentUser.userName ? 'Sửa Người Dùng' : 'Thêm Người Dùng'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formUserName">
                            <Form.Label>Tên Đăng Nhập</Form.Label>
                            <Form.Control
                                type="text"
                                name="userName"
                                value={currentUser.userName}
                                onChange={handleChange}
                                placeholder="Enter user name"
                            />
                        </Form.Group>
                        <Form.Group controlId="formPassWord">
                            <Form.Label>Mật Khẩu</Form.Label>
                            <Form.Control
                                type="password"
                                name="passWord"
                                value={currentUser.passWord}
                                onChange={handleChange}
                                placeholder="Enter password"
                            />
                        </Form.Group>
                        <Form.Group controlId="formDepartment">
                            <Form.Label>Khoa</Form.Label>
                            <Form.Control
                                type="text"
                                name="department"
                                value={currentUser.department}
                                onChange={handleChange}
                                placeholder="Enter department"
                            />
                        </Form.Group>
                        <Form.Group controlId="formRole">
                            <Form.Label>Vai Trò</Form.Label>
                            <Form.Control
                                type="text"
                                name="role"
                                value={currentUser.role}
                                onChange={handleChange}
                                placeholder="Enter role"
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

export default UserList;
