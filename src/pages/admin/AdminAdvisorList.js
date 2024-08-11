import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Table, Form, Button, InputGroup, Modal, Alert } from 'react-bootstrap';

const AdvisorManagement = () => {
    const [departments, setDepartments] = useState([]);
    const [advisors, setAdvisors] = useState([]);
    const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');
    const [error, setError] = useState(null);
    const [showAdvisorModal, setShowAdvisorModal] = useState(false);
    const [isEditingAdvisor, setIsEditingAdvisor] = useState(false);
    const [currentAdvisor, setCurrentAdvisor] = useState({
        id: '',
        fullName: '',
        phoneNumber: '',
        address: '',
        clazz: '',
        department: '',
        user: ''
    });
    const [importAdvisorFile, setImportAdvisorFile] = useState(null);

    useEffect(() => {
        fetchDepartments();
    }, []);

    useEffect(() => {
        if (selectedDepartmentId) {
            fetchAdvisorsByDepartment(selectedDepartmentId);
        }
    }, [selectedDepartmentId]);

    const fetchDepartments = () => {
        axios.get('http://localhost:8080/api/departments')
            .then(response => setDepartments(response.data))
            .catch(error => setError('Lỗi khi lấy danh sách khoa.'));
    };

    const fetchAdvisorsByDepartment = (departmentId) => {
        axios.get(`http://localhost:8080/api/advisors/dept/${departmentId}`)
            .then(response => setAdvisors(response.data))
            .catch(error => setError('Chọn Khoa và Lớp để xem sinh viên.'));
    };

    const handleDepartmentChange = (event) => {
        setSelectedDepartmentId(event.target.value);
        setAdvisors([]); // Clear the list of advisors when changing department
        setError('');
    };

    const handleSearchChange = (event) => setSearchTerm(event.target.value);

    const handleSortChange = () => setSortOrder(prevOrder => (prevOrder === 'asc' ? 'desc' : 'asc'));

    const handleEditAdvisor = (advisor) => {
        setCurrentAdvisor(advisor);
        setIsEditingAdvisor(true);
        setShowAdvisorModal(true);
    };

    const handleSaveAdvisor = () => {
        const saveAction = isEditingAdvisor
            ? axios.put(`http://localhost:8080/api/advisors/${currentAdvisor.id}`, currentAdvisor)
            : axios.post('http://localhost:8080/api/advisors', currentAdvisor);

        saveAction
            .then(() => {
                fetchAdvisorsByDepartment(selectedDepartmentId);
                setShowAdvisorModal(false);
            })
            .catch(error => setError('Lỗi khi lưu giảng viên.'));
    };

    const handleDeleteAdvisor = (id) => {
        axios.delete(`http://localhost:8080/api/advisors/${id}`)
            .then(() => fetchAdvisorsByDepartment(selectedDepartmentId))
            .catch(error => setError('Lỗi khi xóa giảng viên.'));
    };

    const handleAdvisorFileChange = (e) => setImportAdvisorFile(e.target.files[0]);

    const handleChangeAdvisor = (e) => {
        const { name, value } = e.target;
        setCurrentAdvisor(prevState => ({ ...prevState, [name]: value }));
    };

    const handleImportAdvisors = () => {
        if (!importAdvisorFile) {
            setError('Vui lòng chọn tệp để nhập');
            return;
        }

        const formData = new FormData();
        formData.append('file', importAdvisorFile);

        axios.post('http://localhost:8080/api/advisors/import', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
            .then(() => {
                fetchAdvisorsByDepartment(selectedDepartmentId);
                setImportAdvisorFile(null);
                alert('Thêm người dùng thành công.');
            })
            .catch(error => setError(error));
    };

    const filteredAdvisors = advisors
        .filter(advisor => advisor.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => sortOrder === 'asc' ? a.fullName.localeCompare(b.fullName) : b.fullName.localeCompare(a.fullName));

    return (
        <div className="container mt-5">
            <h1>Danh Sách Giảng Viên Theo Khoa</h1>
            <input type="file" onChange={handleAdvisorFileChange} className="ml-3" />
            <Button variant="success" onClick={handleImportAdvisors} className="ml-2">
                Import Giảng Viên
            </Button>
            <Button variant="primary" onClick={() => { setIsEditingAdvisor(false); setShowAdvisorModal(true); }}>
                Thêm Giảng Viên
            </Button>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form.Group controlId="departmentSelect">
                <Form.Label>Chọn Khoa</Form.Label>
                <Form.Control as="select" onChange={handleDepartmentChange} value={selectedDepartmentId}>
                    <option value="">Chọn khoa</option>
                    {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                </Form.Control>
            </Form.Group>

            <div className="d-flex justify-content-between my-3">
                <InputGroup>
                    <Form.Control
                        placeholder="Tìm kiếm theo tên giảng viên"
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                    <Button variant="outline-secondary" onClick={handleSortChange}>
                        Sắp xếp {sortOrder === 'asc' ? 'Giảm dần' : 'Tăng dần'}
                    </Button>
                </InputGroup>
            </div>

            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tên Giảng Viên</th>
                        <th>Khoa</th>
                        <th>Địa Chỉ</th>
                        <th>Lớp</th>
                        <th>Số Điện Thoại</th>
                        <th>Tên Đăng Nhập</th>
                        <th>Hành Động</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredAdvisors.map(advisor => (
                        <tr key={advisor.id}>
                            <td>{advisor.id}</td>
                            <td>{advisor.fullName}</td>
                            <td>{advisor.department}</td>
                            <td>{advisor.address}</td>
                            <td>{advisor.clazz}</td>
                            <td>{advisor.phoneNumber}</td>
                            <td>{advisor.user}</td>
                            <td>
                                <Button variant="warning" onClick={() => handleEditAdvisor(advisor)}>Sửa</Button>{' '}
                                <Button variant="danger" onClick={() => handleDeleteAdvisor(advisor.id)}>Xóa</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <Modal show={showAdvisorModal} onHide={() => setShowAdvisorModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{isEditingAdvisor ? 'Sửa Giảng Viên' : 'Thêm Giảng Viên'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formAdvisorName">
                            <Form.Label>Tên Giảng Viên</Form.Label>
                            <Form.Control
                                type="text"
                                name="fullName"
                                value={currentAdvisor.fullName}
                                onChange={handleChangeAdvisor}
                            />
                        </Form.Group>
                        <Form.Group controlId="formAdvisorAddress">
                            <Form.Label>Địa Chỉ</Form.Label>
                            <Form.Control
                                type="text"
                                name="address"
                                value={currentAdvisor.address}
                                onChange={handleChangeAdvisor}
                            />
                        </Form.Group>
                        <Form.Group controlId="formAdvisorPhoneNumber">
                            <Form.Label>Số Điện Thoại</Form.Label>
                            <Form.Control
                                type="text"
                                name="phoneNumber"
                                value={currentAdvisor.phoneNumber}
                                onChange={handleChangeAdvisor}
                            />
                        </Form.Group>
                        <Form.Group controlId="formAdvisorClazz">
                            <Form.Label>Lớp</Form.Label>
                            <Form.Control
                                type="text"
                                name="clazz"
                                value={currentAdvisor.clazz}
                                onChange={handleChangeAdvisor}
                            />
                        </Form.Group>
                        <Form.Group controlId="formAdvisorDepartment">
                            <Form.Label>Khoa</Form.Label>
                            <Form.Control
                                as="select"
                                name="department"
                                value={currentAdvisor.department}
                                onChange={handleChangeAdvisor}
                            >
                                <option value="">Chọn khoa</option>
                                {departments.map(dept => (
                                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                        <Form.Group controlId="formAdvisorUser">
                            <Form.Label>Tên Người Dùng</Form.Label>
                            <Form.Control
                                type="text"
                                name="user"
                                value={currentAdvisor.user}
                                onChange={handleChangeAdvisor}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowAdvisorModal(false)}>
                        Hủy
                    </Button>
                    <Button variant="primary" onClick={handleSaveAdvisor}>
                        Lưu
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AdvisorManagement;
