import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Form, Button, Container, Alert } from 'react-bootstrap';

const Profile = () => {
    const [profile, setProfile] = useState({
        id: '',
        sid: '',
        fullName: '',
        name: '',
        email: '',
        phoneNumber: '',
        address: '',
        role: '',
        department: '', // chỉ cho cố vấn
        clazz: ''
    });
    const [dept, setDept] = useState({
        id: '',
        name: ''
    });
    const [clazz, setClass] = useState({
        id: '',
        name: '',
        department: '',
        schoolYear: '',
        user: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswordError, setShowPasswordError] = useState(false);
    const id = localStorage.getItem('id');
    const role = localStorage.getItem('role');
    const userName = localStorage.getItem('userName');
    const cls = localStorage.getItem('cls');

    const fetchProfile = useCallback(async (id) => {
        try {
            let endpoint;
            switch (role) {
                case "student":
                    endpoint = `students/${id}`;
                    break;
                case "advisor":
                    endpoint = `advisors/${id}`;
                    break;
                case "clazz":
                    endpoint = `classes/${id}`;
                    break;
                case "admin":
                    endpoint = `advisors/${id}`;
                    break;
                default:
                    throw new Error('Invalid role');
            }
            const response = await axios.get(`http://localhost:8080/api/${endpoint}`);
            setProfile(response.data);
            setLoading(false);
        } catch (error) {
            setError('Error fetching profile.');
            setLoading(false);
        }
    }, [role]);

    useEffect(() => {
        if (id) {
            fetchProfile(id);
        }
        const fetchInitialData = async () => {
            try {
                if (role !== 'admin') {
                    await fetchClass(cls);
                }
                if (clazz.department) {
                    await fetchDept(clazz.department);
                }
            } catch (err) {
                setError(err);
                setLoading(false);
            }
        };
    
        fetchInitialData();
    }, [id, cls, role, clazz.department, fetchProfile]);
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSave = async () => {
        try {
            let endpoint;
            switch (role) {
                case "student":
                    endpoint = `students/${id}`;
                    break;
                case "advisor":
                    endpoint = `advisors/${id}`;
                    break;
                case "clazz":
                    endpoint = `classes/${id}`;
                    break;
                default:
                    throw new Error('Invalid role');
            }
            await axios.put(`http://localhost:8080/api/${endpoint}`, profile);
            alert('Profile updated successfully');
        } catch (error) {
            if (error.response && error.response.status === 404) {
                setError('User not found. Please check the username.');
            } else {
                setError('Error saving profile.');
            }
        }
    };

    const handlePasswordSubmit = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword || passwordData.newPassword === passwordData.oldPassword) {
            setShowPasswordError(true);
            return;
        }

        try {
            await axios.put(`http://localhost:8080/api/users/change/${userName}`, {
                id: profile.id,
                oldPassword: passwordData.oldPassword,
                newPassword: passwordData.newPassword
            });
            alert('Password changed successfully');
            setPasswordData({
                oldPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            setShowPasswordError(false);
        } catch (error) {
            setError('Error changing password.');
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <Container>
            <h1>Hồ Sơ Cá Nhân</h1>
            <Form>
                <Form.Group controlId="formUserId">
                    <Form.Label>ID</Form.Label>
                    <Form.Control
                        type="text"
                        name="id"
                        value={profile.id}
                        readOnly
                    />
                </Form.Group>
                {role === "student" && (
                    <Form.Group controlId="formUserName">
                        <Form.Label>Mã Sinh Viên</Form.Label>
                        <Form.Control
                            type="text"
                            name="sid"
                            value={profile.sid}
                            readOnly
                        />
                    </Form.Group>
                )}
                {role === "clazz" && (
                    <Form.Group controlId="formUserName">
                        <Form.Label>Tên Lớp</Form.Label>
                        <Form.Control
                            type="text"
                            name="name"
                            value={clazz.name}
                            onChange={handleChange}
                        />
                    </Form.Group>
                )}

                {role !== "clazz" && (
                    <>
                        <Form.Group controlId="formUserName">
                            <Form.Label>Họ Tên</Form.Label>
                            <Form.Control
                                type="text"
                                name="fullName"
                                value={profile.fullName}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group controlId="formUserPhoneNumber">
                            <Form.Label>Số Điện Thoại</Form.Label>
                            <Form.Control
                                type="text"
                                name="phoneNumber"
                                value={profile.phoneNumber}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group controlId="formUserAddress">
                            <Form.Label>Địa Chỉ</Form.Label>
                            <Form.Control
                                type="text"
                                name="address"
                                value={profile.address}
                                onChange={handleChange}
                            />
                        </Form.Group>
                    </>
                )}



                {(role === "advisor" || role === "student") &&(
                    <>
                    <Form.Group controlId="formUserClass">
                    <Form.Label>Lớp</Form.Label>
                        <Form.Control
                            type="text"
                            name="clazz"
                            value={clazz.name}
                            onChange={handleChange}
                            disabled
                        />
                    </Form.Group>
                    </>
                    
                )}
                {(role !== "admin") &&(
                    <Form.Group controlId="formUserDepartment">
                    <Form.Label>Khoa</Form.Label>
                        <Form.Control
                            type="text"
                            name="department"
                            value={dept.name}
                            onChange={handleChange}
                            disabled
                        />
                    </Form.Group>
                )}
                <Button variant="primary" onClick={handleSave}>Lưu</Button>
            </Form>

            <h2 className="mt-5">Đổi Mật Khẩu</h2>
            <Form>
                <Form.Group controlId="formOldPassword">
                    <Form.Label>Mật Khẩu Cũ</Form.Label>
                    <Form.Control
                        type="password"
                        name="oldPassword"
                        value={passwordData.oldPassword}
                        onChange={handlePasswordChange}
                    />
                </Form.Group>
                <Form.Group controlId="formNewPassword">
                    <Form.Label>Mật Khẩu Mới</Form.Label>
                    <Form.Control
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                    />
                </Form.Group>
                <Form.Group controlId="formConfirmPassword">
                    <Form.Label>Xác Nhận Mật Khẩu</Form.Label>
                    <Form.Control
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                    />
                </Form.Group>
                {showPasswordError && passwordData.confirmPassword !== passwordData.newPassword && (
                    <Alert variant="danger" className="mt-3">
                        Mật khẩu mới và xác nhận mật khẩu không khớp!
                    </Alert>
                )}
                {showPasswordError && passwordData.oldPassword === passwordData.newPassword && (
                    <Alert variant="danger" className="mt-3">
                        Mật khẩu mới và mật khẩu cũ trùng nhau!
                    </Alert>
                )}
                <Button variant="primary" onClick={handlePasswordSubmit}>Đổi Mật Khẩu</Button>
            </Form>
        </Container>
    );
};

export default Profile;
