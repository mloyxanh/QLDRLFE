import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button, Form } from 'react-bootstrap';

const StudentList = () => {
    const [students, setStudents] = useState([]);
    const [clazz, setClass] = useState({
        id: '',
        name: '',
        department: '',
        schoolYear: '',
        user: ''
    });
    const [dept, setDept] = useState({
        id: '',
        name: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [currentStudent, setCurrentStudent] = useState({
        sid: '',
        fullName: '',
        phoneNumber: '',
        address: '',
        clazz: '',
        user: '',
        department: ''
    });
    const ids = localStorage.getItem('id');
    const role = localStorage.getItem('role');
    const cls = localStorage.getItem('cls');

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                if (role === 'clazz') {
                    if (ids) {
                        await fetchStudents(ids);
                    }
                } else {
                    await fetchStudents(cls);
                }
                await fetchClass(cls);
                if (clazz.department) {
                    await fetchDept(clazz.department);
                }
            } catch (err) {
                setError(err);
                setLoading(false);
            }
        };
    
        fetchInitialData();
    }, [ids, cls, role, clazz.department]);
    

    const fetchStudents = async (id) => {
        try {
            const response = await axios.get(`http://localhost:8080/api/students/class/${id}`);
            setStudents(response.data); 
            setLoading(false);
        } catch (err) {
            setError(err);
            setLoading(false);
        }
    };

    const fetchClass = async (id) => {
        try {
            const response = await axios.get(`http://localhost:8080/api/classes/${id}`);
            setClass(response.data);
            setLoading(false);
        } catch (err) {
            setError(err);
            setLoading(false);
        }
    };

    const fetchDept = async (id) => {
        try {
            const response = await axios.get(`http://localhost:8080/api/departments/${id}`);
            setDept(response.data);
            setLoading(false);
        } catch (err) {
            setError(err);
            setLoading(false);
        }
    };


    const handleViewDetails = (student) => {
        axios.get(`http://localhost:8080/api/students/${student.id}`)
            .then(response => {
                setCurrentStudent(response.data);
                setShowModal(true);
            })
            .catch(error => {
                setError(error);
            });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCurrentStudent(prevState => ({
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
            <h2>Danh Sách Sinh Viên</h2>
            {students.length > 0 && (
                <table className="table table-striped table-bordered mt-3">
                    <thead className="thead-dark">
                        <tr>
                            <th>Mã Sinh Viên</th>
                            <th>Họ Tên</th>
                            <th>Số Điện Thoại</th>
                            <th>Địa Chỉ</th>
                            <th>Lớp</th>
                            <th>Khoa</th>
                            <th>Hành Động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map(student => (
                            <tr key={student.sid}>
                                <td>{student.sid}</td>
                                <td>{student.fullName}</td>
                                <td>{student.phoneNumber}</td>
                                <td>{student.address}</td>
                                <td>{clazz.name}</td>
                                <td>{dept.name}</td>
                                <td>
                                    <Button variant="info" onClick={() => handleViewDetails(student)}>Xem Chi Tiết</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{'Thông Tin Sinh Viên'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formStudentId">
                            <Form.Label>Mã Sinh Viên</Form.Label>
                            <Form.Control
                                type="text"
                                name="sid"
                                value={currentStudent.sid}
                                onChange={handleChange}
                                placeholder="Enter student id"
                                readOnly
                            />
                        </Form.Group>
                        <Form.Group controlId="formStudentName">
                            <Form.Label>Họ Tên</Form.Label>
                            <Form.Control
                                type="text"
                                name="fullName"
                                value={currentStudent.fullName}
                                onChange={handleChange}
                                placeholder="Enter full name"
                                readOnly
                            />
                        </Form.Group>
                        <Form.Group controlId="formStudentPhoneNumber">
                            <Form.Label>Số Điện Thoại</Form.Label>
                            <Form.Control
                                type="text"
                                name="phoneNumber"
                                value={currentStudent.phoneNumber}
                                onChange={handleChange}
                                placeholder="Enter phone number"
                                readOnly
                            />
                        </Form.Group>
                        <Form.Group controlId="formStudentAddress">
                            <Form.Label>Địa Chỉ</Form.Label>
                            <Form.Control
                                type="text"
                                name="address"
                                value={currentStudent.address}
                                onChange={handleChange}
                                placeholder="Enter address"
                                readOnly
                            />
                        </Form.Group>
                        <Form.Group controlId="formStudentClazz">
                            <Form.Label>Lớp</Form.Label>
                            <Form.Control
                                type="text"
                                name="clazz"
                                value={clazz.name}
                                onChange={handleChange}
                                placeholder="Enter class"
                                readOnly
                            />
                        </Form.Group>
                        <Form.Group controlId="formStudentDepartment">
                            <Form.Label>Khoa</Form.Label>
                            <Form.Control
                                type="text"
                                name="department"
                                value={dept.name}
                                onChange={handleChange}
                                placeholder="Enter department"
                                readOnly
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Đóng</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default StudentList;
