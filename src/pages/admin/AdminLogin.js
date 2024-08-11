import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';

function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const loginData = {
      userName: username,
      passWord: password,
      role: 'admin'
    };
  
    try {
      const response = await axios.post('http://localhost:8080/api/users/login', loginData);
      console.log('API response:', response.data); // Kiểm tra phản hồi từ API

      const token = response.data.token;
      const fullName = response.data.fullName;
      const ids = response.data.id;
      const cls = response.data.cls;
  
      localStorage.setItem('token', token);
      localStorage.setItem('userName', username);
      localStorage.setItem('role', 'admin');
      localStorage.setItem('fullName', fullName); // Đảm bảo fullName được lưu trữ đúng cách
      localStorage.setItem('id', ids);
      localStorage.setItem('cls', cls);
  
      navigate('/index');
    } catch (error) {
      console.error('Login error:', error);
      setError('Đăng Nhập Thất Bại. Kiểm Tra Thông Tin Đăng Nhập.');
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card mt-5">
            <div className="card-body">
              <h2 className="card-title text-center">Login</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input
                    type="text"
                    className="form-control"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                {error && <div className="alert alert-danger mt-3">{error}</div>}
                <button type="submit" className="btn btn-primary btn-block mt-3">Login</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
