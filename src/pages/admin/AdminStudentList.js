import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Table, Form, Button, InputGroup, Modal, Alert } from 'react-bootstrap';

const StudentManagement = () => {
    const [departments, setDepartments] = useState([]);
    const [classes, setClasses] = useState([]);
    const [classes1, setClasses1] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
    const [selectedClassId, setSelectedClassId] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');
    const [error, setError] = useState(null);
    const [showStudentModal, setShowStudentModal] = useState(false);
    const [isEditingStudent, setIsEditingStudent] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [importStudentFile, setImportStudentFile] = useState(null);

    const [currentStudent, setCurrentStudent] = useState({
        id: '',
        sid: '',
        fullName: '',
        phoneNumber: '',
        address: '',
        clazz: '',
        department: '',
        user: '',
    });

    useEffect(() => {
        fetchDepartments();
        fetchClasses1();
    }, []);

    useEffect(() => {
        if (selectedDepartmentId) {
            fetchClassesByDepartment(selectedDepartmentId);
        }
    }, [selectedDepartmentId]);

    useEffect(() => {
        if (selectedClassId) {
            fetchStudents(selectedClassId);
        }
    }, [selectedClassId]);

    const handleImportStudents = () => {
        if (!importStudentFile) {
            setError('Vui lòng chọn tệp để nhập');
            return;
        }

        const formData = new FormData();
        formData.append('file', importStudentFile);

        axios
            .post('http://localhost:8080/api/students/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            .then(() => {
                fetchStudents(selectedClassId);
                setImportStudentFile(null);
                setSuccessMessage('Danh sách sinh viên đã được nhập thành công!');
            })
            .catch((error) => {
                setError('Lỗi khi nhập danh sách sinh viên: ' + error.message);
            });
    };

    const fetchDepartments = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/departments');
            setDepartments(response.data);
        } catch (error) {
            console.error('Error fetching departments:', error);
            setError('Error fetching departments.');
        }
    };

    const handleStudentFileChange = (e) => {
        setImportStudentFile(e.target.files[0]);
    };

    const fetchClasses1 = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/classes');
            setClasses1(response.data);
        } catch (error) {
            console.error('Error fetching classes:', error);
            setError('Error fetching classes.');
        }
    };

    const fetchClassesByDepartment = async (departmentId) => {
        try {
            const response = await axios.get(`http://localhost:8080/api/classes/dept/${departmentId}`);
            setClasses(response.data);
        } catch (error) {
            console.error('Error fetching classes:', error);
            setError('Error fetching classes.');
        }
    };

    const fetchStudents = async (classId) => {
        try {
            const response = await axios.get(`http://localhost:8080/api/students/class/${classId}`);
            setStudents(response.data);
            setError(null);
        } catch (error) {
            console.error('Error fetching students:', error);
            setError('Chọn Khoa và Lớp để xem sinh viên.');
        }
    };

    const handleDepartmentChange = (event) => {
        const departmentId = event.target.value;
        setSelectedDepartmentId(departmentId);
        setSelectedClassId(''); // Clear selected class when department changes
        setStudents([]); // Clear students when department changes
    };

    const handleClassChange = (event) => {
        const classId = event.target.value;
        setSelectedClassId(classId);
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleSortChange = () => {
        setSortOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'));
    };

    const handleEditStudent = (student) => {
        setCurrentStudent(student);
        setIsEditingStudent(true);
        setShowStudentModal(true);
    };

    const handleSaveStudent = async () => {
        try {
            if (isEditingStudent) {
                await axios.put(`http://localhost:8080/api/students/${currentStudent.id}`, currentStudent);
            } else {
                await axios.post('http://localhost:8080/api/students', currentStudent);
            }
            fetchStudents(selectedClassId);
            setShowStudentModal(false);
        } catch (error) {
            console.error('Error saving student:', error);
            setError('Error saving student.');
        }
    };

    const handleDeleteStudent = async (id) => {
        try {
            await axios.delete(`http://localhost:8080/api/students/${id}`);
            fetchStudents(selectedClassId);
        } catch (error) {
            console.error('Error deleting student:', error);
            setError('Error deleting student.');
        }
    };

    const handleChangeStudent = (e) => {
        const { name, value } = e.target;
        setCurrentStudent((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const filteredStudents = students
        .filter((student) => student.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
            if (sortOrder === 'asc') {
                return a.fullName.localeCompare(b.fullName);
            }
            return b.fullName.localeCompare(a.fullName);
        });

    return (
        <div className="container mt-5">
            <h1>Danh Sách Sinh Viên Theo Lớp</h1>
            <input type="file" onChange={handleStudentFileChange} className="ml-3" />
            <Button variant="success" onClick={handleImportStudents} className="ml-2">
                Import Sinh Viên
            </Button>
            <Button variant="primary" onClick={() => { setIsEditingStudent(false); setShowStudentModal(true); }}>
                Thêm Sinh Viên
            </Button>
            {error && <Alert variant="danger">{error}</Alert>}
            {successMessage && <Alert variant="success">{successMessage}</Alert>}
            <Form.Group controlId="departmentSelect">
                <Form.Label>Chọn Khoa</Form.Label>
                <Form.Control as="select" onChange={handleDepartmentChange} value={selectedDepartmentId}>
                    <option value="">Chọn khoa</option>
                    {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                            {dept.name}
                        </option>
                    ))}
                </Form.Control>
            </Form.Group>

            <Form.Group controlId="classSelect" className="mt-3">
                <Form.Label>Chọn Lớp</Form.Label>
                <Form.Control as="select" onChange={handleClassChange} value={selectedClassId} disabled={!selectedDepartmentId}>
                    <option value="">Chọn lớp</option>
                    {classes.map((clazz) => (
                        <option key={clazz.id} value={clazz.id}>
                            {clazz.name}
                        </option>
                    ))}
                </Form.Control>
            </Form.Group>

            {selectedClassId && (
                <>
                    <div className="d-flex justify-content-between my-3">
                        <InputGroup>
                            <Form.Control
                                placeholder="Tìm kiếm theo tên sinh viên"
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                            <Button variant="outline-secondary" onClick={handleSortChange}>
                                Sắp xếp {sortOrder === 'asc' ? 'Giảm dần' : 'Tăng dần'}
                            </Button>
                        </InputGroup>
                    </div>

                    {error && <div className="alert alert-danger">{error}</div>}

                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Mã Sinh Viên</th>
                                <th>Họ Tên</th>
                                <th>Số Điện Thoại</th>
                                <th>Địa Chỉ</th>
                                <th>Mã Lớp</th>
                                <th>Mã Khoa</th>
                                <th>Tên Đăng Nhập</th>
                                <th>Hành Động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map(student => (
                                <tr key={student.id}>
                                    <td>{student.id}</td>
                                    <td>{student.sid}</td>
                                    <td>{student.fullName}</td>
                                    <td>{student.phoneNumber}</td>
                                    <td>{student.address}</td>
                                    <td>{student.clazz}</td>
                                    <td>{student.department}</td>
                                    <td>{student.user}</td>
                                    <td>
                                        <Button variant="warning" onClick={() => handleEditStudent(student)}>Sửa</Button>{' '}
                                        <Button variant="danger" onClick={() => handleDeleteStudent(student.id)}>Xóa</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </>
            )}

            <Modal show={showStudentModal} onHide={() => setShowStudentModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{isEditingStudent ? 'Sửa Sinh Viên' : 'Thêm Sinh Viên'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formStudentSid">
                            <Form.Label>Mã Sinh Viên</Form.Label>
                            <Form.Control
                                type="text"
                                name="sid"
                                value={currentStudent.sid}
                                onChange={handleChangeStudent}
                                disabled={isEditingStudent}
                            />
                        </Form.Group>
                        <Form.Group controlId="formStudentFullName">
                            <Form.Label>Họ Tên</Form.Label>
                            <Form.Control
                                type="text"
                                name="fullName"
                                value={currentStudent.fullName}
                                onChange={handleChangeStudent}
                            />
                        </Form.Group>
                        <Form.Group controlId="formStudentPhoneNumber">
                            <Form.Label>Số Điện Thoại</Form.Label>
                            <Form.Control
                                type="text"
                                name="phoneNumber"
                                value={currentStudent.phoneNumber}
                                onChange={handleChangeStudent}
                            />
                        </Form.Group>
                        <Form.Group controlId="formStudentAddress">
                            <Form.Label>Địa Chỉ</Form.Label>
                            <Form.Control
                                type="text"
                                name="address"
                                value={currentStudent.address}
                                onChange={handleChangeStudent}
                            />
                        </Form.Group>
                        <Form.Group controlId="formStudentClazz">
                            <Form.Label>Lớp</Form.Label>
                            <Form.Control
                                as="select"
                                name="clazz"
                                value={currentStudent.clazz}
                                onChange={handleChangeStudent}
                            >
                                <option value="">Chọn lớp</option>
                                {classes1.map(clazz => (
                                    <option key={clazz.id} value={clazz.id}>{clazz.name}</option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                        <Form.Group controlId="formStudentDepartment">
                            <Form.Label>Khoa</Form.Label>
                            <Form.Control
                                as="select"
                                name="department"
                                value={currentStudent.department}
                                onChange={handleChangeStudent}
                            >
                                <option value="">Chọn khoa</option>
                                {departments.map(dept => (
                                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                        <Form.Group controlId="formStudentUser">
                            <Form.Label>Tên Đăng Nhập</Form.Label>
                            <Form.Control
                                type="text"
                                name="user"
                                value={currentStudent.user}
                                onChange={handleChangeStudent}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                {currentStudent.user &&(
                    <Alert variant="danger" className="mt-3">
                        Tài Khoản Rỗng
                    </Alert>
                )}
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowStudentModal(false)}>Hủy</Button>
                    <Button variant="primary" onClick={handleSaveStudent}>{isEditingStudent ? 'Lưu Thay Đổi' : 'Thêm Mới'}</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default StudentManagement;
