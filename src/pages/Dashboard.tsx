import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

// Описываем интерфейс данных
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
        <div style={{ padding: '20px' }}>
            <h1>Stateful Mock: Dashboard</h1>
            {loading ? <p>Загрузка...</p> : (
                <table border={1} style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ backgroundColor: '#f0f0f0' }}>
                        <tr>
                            <th style={{ padding: '10px' }}>Имя сессии (Логи)</th>
                            <th style={{ padding: '10px' }}>ID сессии</th>
                            <th style={{ padding: '10px' }}>Статус</th>
                            <th style={{ padding: '10px' }}>Дата создания</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sessions.map((session) => (
                            <tr key={session._id}>
                                <td style={{ padding: '10px' }}>
                                    {/* Вот здесь магия: Имя сессии стало ссылкой на логи */}
                                    <Link to={`/logs/${session._id}`} style={{ color: '#0066cc', fontWeight: 'bold' }}>
                                        {session.name}
                                    </Link>
                                </td>
                                <td style={{ padding: '10px' }}>{session._id}</td>
                                <td style={{ padding: '10px' }}>{session.status}</td>
                                <td style={{ padding: '10px' }}>{new Date(session.created_at).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}