import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form } from 'react-bootstrap';

const SemesterManagement = () => {
    const [semesters, setSemesters] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentSemester, setCurrentSemester] = useState({
        id: '',
        name: '',
        begin: '',
        end: '',
        academicYear: '',
    });

    useEffect(() => {
        fetchSemesters();
    }, []);

    const fetchSemesters = async () => {
        const response = await fetch('http://localhost:8080/api/semesters');
        const data = await response.json();
        setSemesters(data);
    };

    const handleShowModal = (semester = null) => {
        if (semester) {
            setIsEditing(true);
            setCurrentSemester(semester);
        } else {
            setIsEditing(false);
            setCurrentSemester({ id: '', name: '', begin: '', end: '', academicYear: '' });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => setShowModal(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCurrentSemester({ ...currentSemester, [name]: value });
    };

    const handleSaveSemester = async () => {
        const requestOptions = {
            method: isEditing ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(currentSemester)
        };

        if (isEditing) {
            await fetch(`http://localhost:8080/api/semesters/${currentSemester.id}`, requestOptions);
        } else {
            await fetch('http://localhost:8080/api/semesters', requestOptions);
        }
        fetchSemesters();
        handleCloseModal();
    };

    const handleDeleteSemester = async (id) => {
        await fetch(`http://localhost:8080/api/semesters/${id}`, { method: 'DELETE' });
        fetchSemesters();
    };

    const formatDate = (dateString) => {
        const [year, month, day] = dateString.split('-');
        return `${day}-${month}-${year}`;
    };

    return (
        <div className="container mt-5">
            <h1>Quản Lý Học Kỳ</h1>
            <Button variant="primary" onClick={() => handleShowModal()}>Thêm Học Kỳ</Button>
            <Table striped bordered hover className="mt-3">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tên Học Kỳ</th>
                        <th>Ngày Bắt Đầu</th>
                        <th>Ngày Kết Thúc</th>
                        <th>Năm Học</th>
                        <th>Hành Động</th>
                    </tr>
                </thead>
                <tbody>
                    {semesters.map((semester) => (
                        <tr key={semester.id}>
                            <td>{semester.id}</td>
                            <td>{semester.name}</td>
                            <td>{formatDate(semester.begin)}</td>
                            <td>{formatDate(semester.end)}</td>
                            <td>{semester.academicYear}</td>
                            <td>
                                <Button
                                    variant="warning"
                                    onClick={() => handleShowModal(semester)}
                                    className="mr-2"
                                >
                                    Sửa
                                </Button>
                                <Button
                                    variant="danger"
                                    onClick={() => handleDeleteSemester(semester.id)}
                                >
                                    Xóa
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? 'Chỉnh Sửa Học Kỳ' : 'Thêm Học Kỳ'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formSemesterName">
                            <Form.Label>Tên Học Kỳ</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={currentSemester.name}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group controlId="formStartDate">
                            <Form.Label>Ngày Bắt Đầu</Form.Label>
                            <Form.Control
                                type="date"
                                name="begin"
                                value={currentSemester.begin}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group controlId="formEndDate">
                            <Form.Label>Ngày Kết Thúc</Form.Label>
                            <Form.Control
                                type="date"
                                name="end"
                                value={currentSemester.end}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group controlId="formAcademicYear">
                            <Form.Label>Năm Học</Form.Label>
                            <Form.Control
                                type="text"
                                name="academicYear"
                                value={currentSemester.academicYear}
                                onChange={handleChange}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>Đóng</Button>
                    <Button variant="primary" onClick={handleSaveSemester}>
                        {isEditing ? 'Lưu Thay Đổi' : 'Thêm Mới'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default SemesterManagement;
