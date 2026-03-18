import { BrowserRouter as Router, Routes, Route, Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

// --- Компонент списка сессий ---
function Dashboard() {
  const [sessions, setSessions] = useState<any[]>([]);
  useEffect(() => {
    axios.get('http://localhost:8000/sessions').then(res => setSessions(res.data));
  }, []);

  return (
    <div>
      <h1>Активные сессии</h1>
      <ul>
        {sessions.map(s => (
          <li key={s._id}>
            <Link to={`/logs/${s._id}`}>{s.name}</Link> ({s.status})
          </li>
        ))}
      </ul>
    </div>
  );
}

// --- Компонент логов ---
function Inspector() {
  const { session_id } = useParams();
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    axios.get(`http://localhost:8000/logs/${session_id}`).then(res => setLogs(res.data));
  }, [session_id]);

  return (
    <div>
      <Link to="/">Назад</Link>
      <h2>Логи сессии {session_id}</h2>
      <pre>{JSON.stringify(logs, null, 2)}</pre>
    </div>
  );
}

// --- Роутер ---
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