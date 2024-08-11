import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Form, FormGroup, FormLabel, FormControl } from 'react-bootstrap';

const EvaluationForm = () => {
    const [criteriaTypes, setCriteriaTypes] = useState([]);
    const [subCriteriaTypes, setSubCriteriaTypes] = useState([]);
    const [criterias, setCriterias] = useState([]);
    const [inputValues, setInputValues] = useState({});

    useEffect(() => {
        fetchCriteriaTypes();
        fetchSubCriteriaTypes();
        fetchCriterias();
    }, []);

    const fetchCriteriaTypes = () => {
        axios.get('http://localhost:8080/api/ct1s')
            .then(response => {
                console.log('Criteria Types:', response.data);
                setCriteriaTypes(response.data);
            })
            .catch(error => console.error('Error fetching criteria types:', error));
    };

    const fetchSubCriteriaTypes = () => {
        axios.get('http://localhost:8080/api/scts1')
            .then(response => {
                console.log('Sub Criteria Types:', response.data);
                setSubCriteriaTypes(response.data);
            })
            .catch(error => console.error('Error fetching sub criteria types:', error));
    };

    const fetchCriterias = () => {
        axios.get('http://localhost:8080/api/criteria1')
            .then(response => {
                console.log('Criterias:', response.data);
                setCriterias(response.data);
            })
            .catch(error => console.error('Error fetching criterias:', error));
    };

    const handleInputChange = (e, subTypeId, maxPts) => {
        let value = parseFloat(e.target.value);
        let min;

        if (subTypeId === '1.2') {
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

    const handleSelectChange = (e, subTypeId) => {
        const value = parseFloat(e.target.value);
        setInputValues(prevValues => ({ ...prevValues, [subTypeId]: value }));
    };

    return (
        <div className="container mt-5">
            <h2>Mẫu Đánh Giá</h2>
            <Form>
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
                                                        <FormControl
                                                            as="select"
                                                            value={inputValues[subType.id] || ''}
                                                            onChange={(e) => handleSelectChange(e, subType.id)}
                                                            style={{ width: '100px' }}
                                                        >
                                                            <option value={0}>Dưới trung bình</option>
                                                            <option value={4}>Trung bình</option>
                                                            <option value={6}>Khá</option>
                                                            <option value={8}>Tốt</option>
                                                            <option value={10}>Xuất sắc</option>
                                                            <option value={-1}>Thi lại</option>
                                                        </FormControl>
                                                    ) : (
                                                        <FormControl
                                                            type="number"
                                                            step="0.5"
                                                            value={inputValues[subType.id] || ''}
                                                            onChange={(e) => handleInputChange(e, subType.id, subType.score)}
                                                            min={subType.score < 0 ? subType.score : "0"}
                                                            max={subType.score > 0 ? subType.score : "0"}
                                                            style={{ width: '100px' }}
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
                <FormGroup controlId="formTotalScore">
                    <FormLabel>Tổng Điểm</FormLabel>
                    <FormControl
                        type="text"
                        value={calculateTotal()}
                        readOnly
                    />
                </FormGroup>
            </Form>
        </div>
    );
};

export default EvaluationForm;
