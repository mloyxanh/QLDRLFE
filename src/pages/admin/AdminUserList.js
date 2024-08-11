import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Form, Button, Modal } from 'react-bootstrap';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentUser, setCurrentUser] = useState({
        userName: '',
        passWord: '',
        role: ''
    });
    const [error, setError] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null); // New state for file
    const fetchUsers = () => {  
        axios.get('http://localhost:8080/api/users')  
            .then(response => {  
                setUsers(response.data);  
            })  
            .catch(error => {  
                console.error('Lỗi khi lấy danh sách người dùng:', error);  
                setError(extractErrorMessage(error));  
            });    
    };  
    useEffect(() => {
        fetchUsers();
    }, []);



    const extractErrorMessage = (error) => {  
        if (error.response && error.response.data && error.response.data.message) {  
            return error.response.data.message;  // Adjust this based on your actual API response structure  
        }  
        return 'Đã xảy ra lỗi không xác định.';  
    };  

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCurrentUser(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSave = () => {
        // Check if role is selected
        if (!currentUser.role) {
            setError('Vui lòng chọn vai trò.');
            return;
        }

        if (isEditing) {
            axios.put(`http://localhost:8080/api/users/${currentUser.userName}`, currentUser)
                .then(() => {
                    fetchUsers();
                    setShowModal(false);
                })
                .catch(error => {
                    console.error('Lỗi khi cập nhật người dùng:', error);
                    setError('Lỗi khi cập nhật người dùng.');
                });
        } else {
            axios.post('http://localhost:8080/api/users', currentUser)
                .then(() => {
                    fetchUsers();
                    setShowModal(false);
                })
                .catch(error => {
                    console.error('Lỗi khi thêm người dùng:', error);
                    setError('Lỗi khi thêm người dùng.');
                });
        }
    };

    const handleDelete = (userName) => {
        axios.delete(`http://localhost:8080/api/users/${userName}`)
            .then(() => {
                fetchUsers();
            })
            .catch(error => {
                console.error('Lỗi khi xóa người dùng:', error);
                setError('Lỗi khi xóa người dùng.');
            });
    };

    const handleAdd = () => {
        setCurrentUser({
            userName: '',
            passWord: '',
            role: ''
        });
        setIsEditing(false);
        setShowModal(true);
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]); // Get the selected file
    };

    const handleImport = () => {
        if (!selectedFile) {
            alert('Vui lòng chọn tệp Excel để nhập.');
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile); // Append file to FormData

        axios.post('http://localhost:8080/api/users/import', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        .then(() => {
            fetchUsers(); // Refresh the users list
            setSelectedFile(null); // Clear the selected file
            alert('Thêm người dùng thành công.');
        })
        .catch(error => {
            console.error('Lỗi khi nhập khẩu người dùng:', error);
            setError('Lỗi khi nhập khẩu người dùng.');
        });
    };

    return (
        <div className="container mt-5">
            <h1>Quản Lý Người Dùng</h1>
            <Button variant="primary" className="mb-3" onClick={handleAdd}>Thêm Người Dùng</Button>
            
            {error && <div className="alert alert-danger">{error}</div>}
            
            <input type="file" accept=".xls,.xlsx" onChange={handleFileChange} className="mb-2"/>  
            <Button variant="success" onClick={handleImport} disabled={!selectedFile}>  
                Thêm Từ File Excel  
            </Button>  

            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Role</th>
                        <th>Hành Động</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.userName}>
                            <td>{user.userName}</td>
                            <td>{user.role}</td>
                            <td>
                                <Button variant="danger" onClick={() => handleDelete(user.userName)}>Xóa</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? 'Sửa Người Dùng' : 'Thêm Người Dùng'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formUserName">
                            <Form.Label>Username</Form.Label>
                            <Form.Control
                                type="text"
                                name="userName"
                                value={currentUser.userName}
                                onChange={handleChange}
                                readOnly={isEditing}
                            />
                        </Form.Group>
                        <Form.Group controlId="formPassword">
                            <Form.Label>Mật Khẩu</Form.Label>
                            <Form.Control
                                type="password"
                                name="passWord"
                                value={currentUser.passWord}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group controlId="formRole">
                            <Form.Label>Chọn Vai Trò</Form.Label>
                            <Form.Control 
                                name="role" 
                                required 
                                as="select" 
                                onChange={handleChange} 
                                value={currentUser.role}>
                                <option value="">Chọn vai trò</option>
                                <option value="student">Sinh Viên</option>
                                <option value="advisor">Cố Vấn</option>
                                <option value="clazz">Lớp Trưởng</option>
                                <option value="admin">Quản Trị Viên</option>
                            </Form.Control>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Hủy</Button>
                    <Button variant="primary" onClick={handleSave}>Lưu</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default UserManagement;
