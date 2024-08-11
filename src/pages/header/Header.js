import React, { useEffect, useCallback } from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const fullName = localStorage.getItem('fullName');
  const role = localStorage.getItem('role'); 
  const loginTime = localStorage.getItem('loginTime');

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('fullName');
    localStorage.removeItem('id');
    localStorage.removeItem('cls');
    localStorage.removeItem('userName');
    localStorage.removeItem('role');
    localStorage.removeItem('loginTime');
    navigate('/login');
  }, [navigate]);

  useEffect(() => {
    const checkSessionExpiration = () => {
      const currentTime = new Date().getTime();
      const sessionDuration = 24 * 60 * 60 * 1000; // 1 ngày (milisecond)

      if (loginTime && currentTime - loginTime > sessionDuration) {
        handleLogout();
      }
    };

    checkSessionExpiration();
    const interval = setInterval(checkSessionExpiration, 60000); // Kiểm tra mỗi phút

    return () => clearInterval(interval);
  }, [loginTime, handleLogout]);

  const renderNavDropdown = () => {
    if (token) {
      return (
        <NavDropdown title={`Chào ${fullName}`} id="basic-nav-dropdown">
          <NavDropdown.Item as={Link} to="/profile">Tài Khoản</NavDropdown.Item>
          {role === 'student' && (
            <>
              <NavDropdown.Item as={Link} to="/stueva">Đánh Giá</NavDropdown.Item>
            </>
          )}
          {role === 'advisor' && (
            <>
              <NavDropdown.Item as={Link} to="/student">Danh Sách Sinh Viên</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/class">Lớp</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/adeva">Đánh Giá</NavDropdown.Item>
            </>
          )}
          {role === 'clazz' && (
            <>
              <NavDropdown.Item as={Link} to="/student">Danh Sách Sinh Viên</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/claeva">Đánh Giá</NavDropdown.Item>
            </>
          )}
          {role === 'admin' && (
            <>
              <NavDropdown.Item as={Link} to="/adept">Danh Sách Khoa</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/auser">Danh Sách Tài Khoản</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/asem">Danh Sách Học Kỳ</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/aclass">Danh Sách Lớp</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/astudent">Danh Sách Sinh Viên</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/aadvisor">Danh Sách Cố Vấn</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/admeva">Danh Sách Đánh Giá</NavDropdown.Item>
            </>
          )}
          <NavDropdown.Divider />
          <NavDropdown.Item onClick={handleLogout}>Đăng Xuất</NavDropdown.Item>
        </NavDropdown>
      );
    }
    return null;
  };

  return (
    <Navbar bg="primary" variant="dark">
      <Container>
        <Navbar.Brand as={Link} to="/index"><strong>Quản Lý Điểm Rèn Luyện</strong></Navbar.Brand>
        <Nav className="ms-auto">
          {renderNavDropdown()}
        </Nav>
      </Container>
    </Navbar>
  );
};

export default Header;
