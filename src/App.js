import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from "./pages/header/Header";
import './App.css';
import Index from './pages/index/Index';
import NoMatch from './pages/noMatch/NoMatch';
import Login from './pages/login/Login';
import AdminLogin from './pages/admin/AdminLogin';
import StudentList from './pages/student/studentList';
import AdminStudentList from './pages/admin/AdminStudentList';
import ClassList from './pages/class/classList';
import UserList from './pages/user/UserList';
import EvaluationForm from './pages/evaluationform/EvaluationForm';
import AdvisorList from './pages/advisor/advisorList';
import Profile from './pages/profile/Profile';
import StudentEvaluationForm from './pages/evaluationform/StudentEvaluationForm';
import AdminEvaluationForm from './pages/admin/AdminEvaluationForm';
import ClassEvaluationForm from './pages/evaluationform/ClassEvaluationForm';
import AdminClassList from './pages/admin/AdminClassList';
import AdminAdvisorList from './pages/admin/AdminAdvisorList';
import AdminUserList from './pages/admin/AdminUserList';
import AdminDepthList from './pages/admin/AdminDepthList';
import AdminSemesterList from './pages/admin/AdminSemesterList';
import AdvisorEvaluationForm from './pages/evaluationform/AdvisorEvaluationForm';
const ids = localStorage.getItem('id');
function App(){
  return (
    <Router>
      <Header/>
      <Routes>
        <Route path="/" element={ids ? <Index/> : <Login />} />
        <Route path="/index" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/stueva" element={<StudentEvaluationForm />} />
        <Route path="/adeva" element={<AdvisorEvaluationForm />} />
        <Route path="/admeva" element={<AdminEvaluationForm />} />
          <Route path="/student" element={<StudentList />} />
          <Route path="/astudent" element={<AdminStudentList />} />
          <Route path="/advisor" element={<AdvisorList />} />
          <Route path="/class" element={<ClassList />} />
          <Route path="/user" element={<UserList />} />
          <Route path="/evaluate" element={<EvaluationForm />} />
          <Route path="/claeva" element={<ClassEvaluationForm />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/alogin" element={<AdminLogin />} />
          <Route path="/aclass" element={<AdminClassList />} />
          <Route path="/aadvisor" element={<AdminAdvisorList />} />
          <Route path="/auser" element={<AdminUserList />} />
          <Route path="/adept" element={<AdminDepthList />} />
          <Route path="/asem" element={<AdminSemesterList />} />
        <Route path="*" element={<NoMatch />} />
      </Routes>
    </Router>
  );
}

export default App;
