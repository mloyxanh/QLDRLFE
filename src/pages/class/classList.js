import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Table } from 'react-bootstrap';

const ClassManagement = () => {
    const [classes, setClasses] = useState({
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
    const [error, setError] = useState('');

    const cls = localStorage.getItem('cls');

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                await fetchClass(cls);
                if (classes.department) {
                    await fetchDept(classes.department);
                }
            } catch (err) {
                setError(err);
            }
        };
    
        fetchInitialData();
    }, [cls, classes, classes.department]);

    const fetchClass = async (id) => {
        await axios.get(`http://localhost:8080/api/classes/${id}`)
            .then(response => {
                const data = response.data;
                setClasses(data); 
                setError(''); 
            })
            .catch(error => {
                setError('Error fetching class: ' + error.message);
            });
    };

    const fetchDept = async (id) => {
        try {
            const response = await axios.get(`http://localhost:8080/api/departments/${id}`);
            setDept(response.data);
        } catch (err) {
            setError('Error fetching department: ' + err.message);
        }
    };

    return (
        <div className="container mt-5">
            <h1>Thông Tin Lớp</h1>

            {error && <div className="alert alert-danger">{error}</div>}

            <Table striped bordered hover className="mt-3">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tên Lớp</th>
                        <th>Khoa</th>
                        <th>Niên Khóa</th>
                    </tr>
                </thead>
                <tbody>
                    {classes ? (
                        
                            <tr key={classes.id}>
                                <td>{classes.id}</td>
                                <td>{classes.name}</td>
                                <td>{dept.name}</td>
                                <td>{classes.schoolYear}</td>
                            </tr>
                        
                    ) : (
                        <tr>
                            <td colSpan="4">No class available.</td>
                        </tr>
                    )}
                </tbody>
            </Table>
        </div>
    );
};

export default ClassManagement;
