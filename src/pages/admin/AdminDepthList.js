import React, { useState, useEffect } from 'react';  
import axios from 'axios';  
import { Table, Form, Button, Modal } from 'react-bootstrap';  

const DepartmentManagement = () => {  
    const [departments, setDepartments] = useState([]);  
    const [showModal, setShowModal] = useState(false);  
    const [isEditing, setIsEditing] = useState(false);  
    const [currentDepartment, setCurrentDepartment] = useState({  
        id: '',  
        name: ''  
    });  
    const [error, setError] = useState(null);  
    const [selectedFile, setSelectedFile] = useState(null);  

    useEffect(() => {  
        fetchDepartments();  
    }, []);  

    const fetchDepartments = () => {  
        axios.get('http://localhost:8080/api/departments')  
            .then(response => {  
                setDepartments(response.data);  
            })  
            .catch(error => {  
                console.error('Lỗi khi lấy danh sách khoa:', error);  
                setError('Lỗi khi lấy danh sách khoa.');  
            });  
    };  

    const handleChange = (e) => {  
        const { name, value } = e.target;  
        setCurrentDepartment(prevState => ({  
            ...prevState,  
            [name]: value  
        }));  
    };  

    const handleSave = () => {  
        // Check for duplicate ID  
        const isDuplicate = departments.some(department => department.id === currentDepartment.id);  
    
        if (isEditing) {  
            if (isDuplicate) {  
                setError('ID đã tồn tại. Vui lòng nhập ID khác.'); // Error message for duplicate ID  
                return;  
            }  
            axios.put(`http://localhost:8080/api/departments/${currentDepartment.id}`, currentDepartment)  
                .then(() => {  
                    fetchDepartments();  
                    setShowModal(false);  
                })  
                .catch(error => {  
                    console.error('Lỗi khi cập nhật khoa:', error);  
                    setError('Lỗi khi cập nhật khoa.');  
                });  
        } else {  
            if (isDuplicate) {  
                setError('ID đã tồn tại. Vui lòng nhập ID khác.'); // Error message for duplicate ID  
                return;  
            }  
            axios.post('http://localhost:8080/api/departments', currentDepartment)  
                .then(() => {  
                    fetchDepartments();  
                    setShowModal(false);  
                })  
                .catch(error => {  
                    console.error('Lỗi khi thêm khoa:', error);  
                    setError('Lỗi khi thêm khoa.');  
                });  
        }  
    };  

    const handleDelete = (id) => {  
        axios.delete(`http://localhost:8080/api/departments/${id}`)  
            .then(() => {  
                fetchDepartments();  
            })  
            .catch(error => {  
                console.error('Lỗi khi xóa khoa:', error);  
                setError('Lỗi khi xóa khoa.');  
            });  
    };  

    const handleEdit = (department) => {  
        setCurrentDepartment(department);  
        setIsEditing(true);  
        setShowModal(true);  
    };  

    const handleAdd = () => {  
        setCurrentDepartment({  
            id: '',  
            name: ''  
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

        axios.post('http://localhost:8080/api/departments/import', formData, {  
            headers: {  
                'Content-Type': 'multipart/form-data'  
            }  
        })  
        .then(() => {  
            fetchDepartments(); // Refresh the departments list
            setSelectedFile(null); // Clear the selected file  
            alert('Thêm khoa thành công.');  
        })  
        .catch(error => {  
            console.error('Lỗi khi nhập khẩu khoa:', error);  
            setError('Lỗi khi nhập khẩu khoa.');  
        });  
    };  

    return (  
        <div className="container">  
            <h2>Quản Lý Khoa</h2>  
            {error && <div className="alert alert-danger">{error}</div>}  
            <Button variant="primary" onClick={handleAdd} className="mb-2">  
                Thêm Khoa  
            </Button>  
            <input type="file" accept=".xls,.xlsx" onChange={handleFileChange} className="mb-2"/>  
            <Button variant="success" onClick={handleImport} disabled={!selectedFile}>  
                Thêm Từ File Excel  
            </Button>  
            <Table striped bordered hover>  
                <thead>  
                    <tr>  
                        <th>ID</th>  
                        <th>Tên Khoa</th>  
                        <th>Actions</th>  
                    </tr>  
                </thead>  
                <tbody>  
                    {departments.map(department => (  
                        <tr key={department.id}>  
                            <td>{department.id}</td>  
                            <td>{department.name}</td>  
                            <td>  
                                <Button variant="info" onClick={() => handleEdit(department)}>Sửa</Button>  
                                <Button variant="danger" onClick={() => handleDelete(department.id)}>Xóa</Button>  
                            </td>  
                        </tr>  
                    ))}  
                </tbody>  
            </Table>  

            <Modal show={showModal} onHide={() => setShowModal(false)}>  
                <Modal.Header closeButton>  
                    <Modal.Title>{isEditing ? 'Sửa Khoa' : 'Thêm Khoa'}</Modal.Title>  
                </Modal.Header>  
                <Modal.Body>  
                    <Form>  
                        <Form.Group controlId="formId">  
                            <Form.Label>ID</Form.Label>  
                            <Form.Control  
                                type="text"  
                                name="id"  
                                value={currentDepartment.id}  
                                onChange={handleChange}  
                                readOnly={isEditing}  
                            />  
                        </Form.Group>  
                        <Form.Group controlId="formName">  
                            <Form.Label>Tên Khoa</Form.Label>  
                            <Form.Control  
                                type="text"  
                                name="name"  
                                value={currentDepartment.name}  
                                onChange={handleChange}  
                            />  
                        </Form.Group>  
                    </Form>  
                </Modal.Body>  
                <Modal.Footer>  
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Hủy</Button>  
                    <Button variant="primary" onClick={handleSave}>{isEditing ? 'Lưu' : 'Thêm'}</Button>  
                </Modal.Footer>  
            </Modal>  
        </div>  
    );  
};  

export default DepartmentManagement;