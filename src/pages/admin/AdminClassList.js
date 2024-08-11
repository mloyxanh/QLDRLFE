import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Table, Form, Button, Modal, Alert } from 'react-bootstrap';

const ClassList = () => {
    const [classes, setClasses] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentClass, setCurrentClass] = useState({
        id: '',
        name: '',
        department: '',
        schoolYear: '',
        user: ''
    });
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [importFile, setImportFile] = useState(null);

    useEffect(() => {
        fetchClasses();
        fetchDepartments();
    }, []);

    const fetchClasses = () => {
        axios.get('http://localhost:8080/api/classes')
            .then(response => {
                setClasses(response.data);
                setError(null);
            })
            .catch(error => {
                setError('Lỗi khi tải danh sách lớp: ' + error.message);
            });
    };

    const fetchDepartments = () => {
        axios.get('http://localhost:8080/api/departments')
            .then(response => {
                setDepartments(response.data);
            })
            .catch(error => {
                setError('Lỗi khi tải danh sách khoa: ' + error.message);
            });
    };

    const handleShowModal = (clazz = {
        id: '',
        name: '',
        department: '',
        schoolYear: '',
        user: ''
    }) => {
        setCurrentClass(clazz);
        setIsEditing(!!clazz.id);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSuccessMessage('');
        setError(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCurrentClass(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSave = () => {
        if (currentClass.department === '' || !departments.some(d => d.id === currentClass.department)) {
            setError('ID Khoa không hợp lệ');
            return;
        }

        const apiCall = isEditing
            ? axios.put(`http://localhost:8080/api/classes/${currentClass.id}`, currentClass)
            : axios.post('http://localhost:8080/api/classes', currentClass);

        apiCall
            .then(() => {
                const action = isEditing ? 'cập nhật' : 'thêm mới';
                setSuccessMessage(`Lớp đã được ${action} thành công!`);
                fetchClasses();
                handleCloseModal();
            })
            .catch(error => {
                setError('Lỗi khi lưu lớp: ' + error.message);
            });
    };

    const handleDelete = (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa lớp này không?")) {
            axios.delete(`http://localhost:8080/api/classes/${id}`)
                .then(() => {
                    fetchClasses();
                    setSuccessMessage('Lớp đã được xóa thành công!');
                })
                .catch(error => {
                    setError('Lỗi khi xóa lớp: ' + error.message);
                });
        }
    };

    const handleFileChange = (e) => {
        setImportFile(e.target.files[0]);
    };

    const handleImport = () => {
        if (!importFile) {
            setError('Vui lòng chọn tệp để nhập');
            return;
        }

        const formData = new FormData();
        formData.append('file', importFile);

        axios.post('http://localhost:8080/api/classes/import', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        .then(() => {
            fetchClasses();
            setImportFile(null);
            setSuccessMessage('Danh sách lớp đã được nhập thành công!');
        })
        .catch(error => {
            setError('Lỗi khi nhập danh sách lớp: ' + error.message);
        });
    };

    return (
        <div className="container mt-5">
            <h1>Quản Lý Lớp Học</h1>

            <div className="mb-3">
                <Button variant="primary" onClick={() => handleShowModal()}>
                    Thêm Lớp
                </Button>

                <input type="file" onChange={handleFileChange} className="ml-3" />
                <Button variant="success" onClick={handleImport} className="ml-2">
                    Import Lớp
                </Button>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}
            {successMessage && <Alert variant="success">{successMessage}</Alert>}

            <Table striped bordered hover className="mt-3">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tên Lớp</th>
                        <th>Khoa</th>
                        <th>Niên Khóa</th>
                        <th>User</th>
                        <th>Hành Động</th>
                    </tr>
                </thead>
                <tbody>
                    {classes.map(clazz => (
                        <tr key={clazz.id}>
                            <td>{clazz.id}</td>
                            <td>{clazz.name}</td>
                            <td>{clazz.department}</td>
                            <td>{clazz.schoolYear}</td>
                            <td>{clazz.user}</td>
                            <td>
                                <Button variant="warning" onClick={() => handleShowModal(clazz)}>Sửa</Button>
                                <Button variant="danger" onClick={() => handleDelete(clazz.id)}>Xóa</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? 'Sửa Lớp' : 'Thêm Lớp'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formClassId">
                            <Form.Label>ID</Form.Label>
                            <Form.Control
                                type="text"
                                name="id"
                                value={currentClass.id}
                                onChange={handleChange}
                                placeholder="Nhập mã lớp"
                                readOnly={isEditing}
                            />
                        </Form.Group>
                        <Form.Group controlId="formClassName">
                            <Form.Label>Tên Lớp</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={currentClass.name}
                                onChange={handleChange}
                                placeholder="Nhập tên lớp"
                            />
                        </Form.Group>
                        <Form.Group controlId="formClassDepartment">
                            <Form.Label>Khoa</Form.Label>
                            <Form.Control
                                as="select"
                                name="department"
                                value={currentClass.department}
                                onChange={handleChange}
                            >
                                <option value="">Chọn khoa</option>
                                {departments.map(department => (
                                    <option key={department.id} value={department.id}>{department.name}</option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                        <Form.Group controlId="formClassSchoolYear">
                            <Form.Label>Niên Khóa</Form.Label>
                            <Form.Control
                                type="text"
                                name="schoolYear"
                                value={currentClass.schoolYear}
                                onChange={handleChange}
                                placeholder="Nhập niên khóa"
                            />
                        </Form.Group>
                        <Form.Group controlId="formClassUser">
                            <Form.Label>User</Form.Label>
                            <Form.Control
                                type="text"
                                name="user"
                                value={currentClass.user}
                                onChange={handleChange}
                                placeholder="Nhập user"
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Hủy
                    </Button>
                    <Button variant="primary" onClick={handleSave}>
                        Lưu
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ClassList;
