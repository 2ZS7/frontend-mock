import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import './Dashboard.css';

export interface Session {
    _id: string;
    name: string;
    status: string;
    created_at: string;
}

export default function Dashboard() {
    const [newSessionName, setNewSessionName] = useState('');
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);

    // Выносим функцию загрузки наружу, чтобы вызывать ее когда угодно
    const loadSessions = async () => {
        try {
            const res = await apiService.getSessions();
            setSessions(res.data);
        } catch (error) {
            console.error("Ошибка загрузки:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadSessions(); }, []);

    // Функция для создания сессии
    const createNewSession = async () => {
        if (!newSessionName) return;
        await apiService.createSession(newSessionName);
        setNewSessionName('');
        await loadSessions(); // Теперь она определена!
    };

    const handleFinish = async (id: string) => {
        await apiService.deleteSession(id); // Вызываем наш API
        loadSessions(); // Обновляем список
    };

    return (
        <div className="dashboard-container">
            <h1 className="dashboard-title">Stateful Mock: Dashboard</h1>

            {/* Панель создания */}
            <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold mb-3">Инициализация новой сессии</h2>
                <div className="flex gap-2">
                    <input
                        className="border p-2 rounded w-64"
                        placeholder="Введите имя сессии"
                        value={newSessionName}
                        onChange={(e) => setNewSessionName(e.target.value)}
                    />
                    <button
                        onClick={createNewSession}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                    >
                        Создать сессию
                    </button>
                </div>
            </div>


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
                                <td className="px-6 py-4">
                                    {session.status === 'active' && (
                                        <button
                                            onClick={() => handleFinish(session._id)}
                                            className="text-red-600 hover:text-red-800 font-bold"
                                            title="Завершить сессию"
                                        >
                                            Завершить
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}