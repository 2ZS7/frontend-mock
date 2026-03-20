import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Rules from './pages/Rules';
import Inspector from './pages/Inspector';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/rules" element={<Rules />} />
        <Route path="/logs/:session_id" element={<Inspector />} />
      </Routes>
    </Router>
  );
}

export default App;