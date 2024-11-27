import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Chat from './components/chat';
import Login from './components/login';
import Register from './components/register';
const HomePage = () => (
  <div>
    <Login />
    <Register />
  </div>
);
const App = () => {
  const isAuthenticated = localStorage.getItem('user');

  return (
    <Router>
      <Routes>
        <Route path="/chat" element={<Chat />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/chat" /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/chat" /> : <Register />} />
        <Route path="/" element={isAuthenticated ? <Navigate to="/chat" /> : <HomePage />} />
      </Routes>
    </Router>
  );
};

export default App;
