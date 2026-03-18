import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

export interface Session {
    _id: string;
    name: string;
    status: string;
    created_at: string;
}

export default function Dashboard() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get<Session[]>('http://localhost:8000/sessions')
            .then((response) => {
                setSessions(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Ошибка при загрузке сессий:", error);
                setLoading(false);
            });
    }, []);

    return (
        <div className="dashboard-container">
            <h1 className="dashboard-title">Stateful Mock: Dashboard</h1>

            {loading ? <p>Загрузка...</p> : (
                <table className="dashboard-table">
                    <thead>
                        <tr>
                            <th>Имя сессии (Логи)</th>
                            <th>ID сессии</th>
                            <th>Статус</th>
                            <th>Дата создания</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sessions.map((session) => (
                            <tr key={session._id}>
                                <td>
                                    <Link to={`/logs/${session._id}`} className="session-link">
                                        {session.name}
                                    </Link>
                                </td>
                                <td>{session._id}</td>
                                <td>{session.status}</td>
                                <td>{new Date(session.created_at).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}