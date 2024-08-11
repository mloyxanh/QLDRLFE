import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button, Form } from 'react-bootstrap';

const AdminEvaluationForm = () => {
    const [evaluations, setEvaluations] = useState([]);
    const [studentNames, setStudentNames] = useState({});
    const [exist, setExist] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [criteriaTypes, setCriteriaTypes] = useState([]);
    const [criterias, setCriterias] = useState([]);
    const [currentEvaluation, setCurrentEvaluation] = useState({
        id: '',
        student: '',
        advisor: '',
        clazz: '',
        createdAt: '',
        evaluationDetails: [],
        semester: '',
        reviewedByAdvisor: ''
    });
    const [subCriteriaTypes, setSubCriteriaTypes] = useState([]);
    const [inputValues, setInputValues] = useState({});
    const [semesters, setSemesters] = useState([]);
    const [selectedSemester, setSelectedSemester] = useState('');

    useEffect(() => {
        fetchSemesters();
        fetchCriteriaTypes();
        fetchSubCriteriaTypes();
        fetchCriterias();
    }, []);

    const fetchCriteriaTypes = () => {
        axios.get('http://localhost:8080/api/ct1s')
            .then(response => setCriteriaTypes(response.data))
            .catch(error => console.error('Error fetching criteria types:', error));
    };

    const handleSelectChange = (e, subTypeId) => {
        const value = parseFloat(e.target.value);
        setInputValues(prevValues => ({ ...prevValues, [subTypeId]: value }));
    };

    const fetchSemesters = () => {
        axios.get('http://localhost:8080/api/semesters')
            .then(response => {
                setSemesters(response.data);
                setLoading(false);
            })
            .catch(error => {
                setError(error);
                setLoading(false);
            });
    };

    const fetchCriterias = () => {
        axios.get('http://localhost:8080/api/criteria1')
            .then(response => {
                console.log(response.data); // Thêm dòng này để kiểm tra dữ liệu trả về
                setCriterias(response.data);
            })
            .catch(error => console.error('Error fetching criterias:', error));
    };

    const fetchEvaluations = (semesterId) => {
        axios.get(`http://localhost:8080/api/evaluate/semester/${semesterId}`)
            .then(response => {
                setEvaluations(response.data);
                setExist(true);
                setLoading(false);
                fetchStudentNames(response.data);
            })
            .catch(error => {
                setExist(false);
                setLoading(false);
            });
    };

    const fetchStudentNames = (evaluations) => {
        const studentIds = evaluations.map(evaluation => evaluation.student);

        Promise.all(
            studentIds.map(id => 
                axios.get(`http://localhost:8080/api/students/${id}`)
            )
        ).then(responses => {
            const names = responses.reduce((acc, response) => {
                acc[response.data.id] = response.data.fullName;
                return acc;
            }, {});
            setStudentNames(names);
        }).catch(error => {
            setError(error);
        });
    };

    const fetchSubCriteriaTypes = () => {
        axios.get('http://localhost:8080/api/scts1')
            .then(response => setSubCriteriaTypes(response.data))
            .catch(error => console.error('Error fetching sub criteria types:', error));
    };

    const handleEdit = (evaluation) => {
        axios.get(`http://localhost:8080/api/eva-details/eva/${evaluation.id}`)
            .then(response => {
                const evaluationDetails = response.data;
                const initialValues = {};
                subCriteriaTypes.forEach(subType => {
                    const detail = evaluationDetails.find(d => d.subCriteriaType === subType.id);
                    initialValues[subType.id] = detail ? detail.score : 0;
                });
                setCurrentEvaluation({ ...evaluation, evaluationDetails });
                setInputValues(initialValues);
                setIsEditing(true);
                setShowModal(true);
            })
            .catch(error => {
                setError(error);
            });
    };

    const handleDelete = (id) => {
        axios.delete(`http://localhost:8080/api/evaluate/${id}`)
            .then(() => {
                fetchEvaluations(selectedSemester);
            })
            .catch(error => {
                setError(error);
            });
    };

    const handleSave = () => {
        if (!currentEvaluation.student) {
            setError(new Error("Student ID must not be null"));
            return;
        }
        currentEvaluation.reviewedByAdvisor = 1;
        const newEvaluation = {
            ...currentEvaluation,
            evaluationDetails: Object.keys(inputValues).map(key => ({
                subCriteriaType: key,
                score: inputValues[key]
            }))
        };

        const request = isEditing
            ? axios.put(`http://localhost:8080/api/evaluate/${currentEvaluation.id}`, newEvaluation)
            : axios.post('http://localhost:8080/api/evaluate', newEvaluation);

        request
            .then(() => {
                fetchEvaluations(selectedSemester);
                setShowModal(false);
            })
            .catch(error => {
                setError(error);
            });
    };

    const handleInputChange = (e, subTypeId, maxPts) => {
        let value = parseFloat(e.target.value);
        let min;

        if (subTypeId === 1.2) {
            min = -1;
        } else {
            min = maxPts < 0 ? maxPts : 0;
        }

        let max = maxPts < 0 ? 0 : maxPts;

        if (isNaN(value)) {
            value = min;
        } else if (value < min) {
            value = min;
        } else if (value > max) {
            value = max;
        }

        setInputValues(prevValues => ({ ...prevValues, [subTypeId]: value }));
    };

    const calculateTotal = () => {
        return Object.values(inputValues).reduce((sum, value) => sum + value, 0);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCurrentEvaluation(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSemesterChange = (e) => {
        const semesterId = e.target.value;
        setSelectedSemester(semesterId);
        fetchEvaluations(semesterId);
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <div className="container mt-5">
            <h2>Sổ Điểm Học Kỳ</h2>
            <Form.Group controlId="formSemesterSelect">
                <Form.Label>Chọn Học Kỳ</Form.Label>
                <Form.Control as="select" value={selectedSemester} onChange={handleSemesterChange}>
                    <option value="">Chọn học kỳ</option>
                    {semesters.map(semester => (
                        <option key={semester.id} value={semester.id}>{semester.name}</option>
                    ))}
                </Form.Control>
            </Form.Group>
            {exist && selectedSemester && (
                <table className="table table-striped table-bordered mt-3">
                    <thead className="thead-dark">
                        <tr>
                            <th>ID</th>
                            <th>Mã Sinh Viên</th>
                            <th>Họ Tên Sinh Viên</th>
                            <th>Mã Cố Vấn</th>
                            <th>Mã Lớp</th>
                            <th>Thời Gian Tạo</th>
                            <th>Tổng Điểm</th>
                            <th>Hành Động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {evaluations.map(evaluation => (              
                            <tr key={evaluation.id}>
                                <td>{evaluation.id}</td>
                                <td>{evaluation.student}</td>
                                <td>{studentNames[evaluation.student]}</td>
                                <td>{evaluation.advisor}</td>
                                <td>{evaluation.clazz}</td>
                                <td>{new Date(evaluation.createdAt).toLocaleString()}</td>
                                <td>{evaluation.evaluationDetails ? evaluation.evaluationDetails.reduce((sum, detail) => sum + detail.score, 0) : 0}</td>
                                <td>
                                    <Button variant="warning" onClick={() => handleEdit(evaluation)}>Sửa</Button>
                                    {' '}
                                    <Button variant="danger" onClick={() => handleDelete(evaluation.id)}>Xóa</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? 'Sửa' : 'Thêm'} Phiếu Đánh Giá</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formStudentId">
                            <Form.Label>Mã Sinh Viên</Form.Label>
                            <Form.Control
                                type="text"
                                name="student"
                                value={currentEvaluation.student}
                                onChange={handleChange}
                                disabled={isEditing} // Không cho phép sửa mã sinh viên khi đang ở chế độ sửa
                            />
                        </Form.Group>
                        <Form.Group controlId="formAdvisorId">
                            <Form.Label>Mã Cố Vấn</Form.Label>
                            <Form.Control
                                type="text"
                                name="advisor"
                                value={currentEvaluation.advisor}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group controlId="formClassId">
                            <Form.Label>Mã Lớp</Form.Label>
                            <Form.Control
                                type="text"
                                name="clazz"
                                value={currentEvaluation.clazz}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group controlId="formSemesterId">
                            <Form.Label>Học Kỳ</Form.Label>
                            <Form.Control
                                as="select"
                                name="semester"
                                value={currentEvaluation.semester}
                                onChange={handleChange}
                            >
                                {semesters.map(semester => (
                                    <option key={semester.id} value={semester.id}>{semester.name}</option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                        <table className="table table-bordered">
                            <thead>
                                <tr>
                                    <th>TT</th>
                                    <th>Nội dung đánh giá</th>
                                    <th>Điểm quy định</th>
                                    <th>Sinh viên đánh giá</th>
                                </tr>
                            </thead>
                            <tbody>
                                                {criteriaTypes.map((type) => (
                                <React.Fragment key={type.id}>
                                    <tr>
                                        <th>{type.id}</th>
                                        <th colSpan={1}>{type.mainContent}</th>
                                        <th colSpan={2}>Tối Đa {type.score} điểm</th>
                                    </tr>
                                    {subCriteriaTypes
                                        .filter(subType => subType.criteriaType1 === type.id)
                                        .map((subType) => (
                                            <React.Fragment key={subType.id}>
                                                <tr>
                                                    <td>{subType.id}</td>
                                                    <td colSpan={1}>{subType.content}</td>
                                                    <td className="text-primary"><b>{subType.score} điểm</b></td>
                                                    <td>
                                                        {subType.id === '1.2' ? (
                                                            <select
                                                                className="form-control"
                                                                value={inputValues[subType.id] || ''}
                                                                onChange={(e) => handleSelectChange(e, subType.id)}
                                                                style={{ width: '100px' }}
                                                                disabled={!isEditing}
                                                            >
                                                                <option value={0}>Dưới trung bình</option>
                                                                <option value={4}>Trung bình</option>
                                                                <option value={6}>Khá</option>
                                                                <option value={8}>Tốt</option>
                                                                <option value={10}>Xuất sắc</option>
                                                                <option value={-1}>Thi lại</option>
                                                            </select>
                                                        ) : (
                                                            <input
                                                                type="number"
                                                                step="0.5"
                                                                className="form-control"
                                                                value={inputValues[subType.id] || ''}
                                                                onChange={(e) => handleInputChange(e, subType.id, subType.score)}
                                                                min={subType.score < 0 ? subType.score : "0"}
                                                                max={subType.score > 0 ? subType.score : "0"}
                                                                style={{ width: '100px' }}
                                                                disabled={!isEditing}
                                                            />
                                                        )}
                                                    </td>
                                                </tr>
                                                {criterias
                                                    .filter(criteria => criteria.subCriteriaType1 === subType.id) 
                                                    .map((criteria) => (
                                                        <React.Fragment key={criteria.id}>
                                                            <tr>
                                                                <td></td>
                                                                <td colSpan={1}>{criteria.content}</td>
                                                                <td>{criteria.score} {criteria.score === null ? "" : "điểm"}</td>
                                                                <td></td>
                                                            </tr>
                                                        </React.Fragment>
                                                    ))}
                                            </React.Fragment>
                                        ))}
                                </React.Fragment>
                            ))}
                                </tbody>

                        </table>
                        <Form.Group controlId="formTotalScore">
                            <Form.Label>Tổng Điểm</Form.Label>
                            <Form.Control
                                type="text"
                                value={calculateTotal()}
                                readOnly
                            />
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

export default AdminEvaluationForm;

