import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Inspector from './pages/Inspector';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/logs/:session_id" element={<Inspector />} />
      </Routes>
    </Router>
  );
}

export default App;