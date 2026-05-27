import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { Trash2 } from 'lucide-react';
import './Dashboard.css';

export interface Session {
    _id: string;
    name: string;
    status: string;
    created_at: string;
    metrics?: {
        total_requests: number;
        failed_requests: number;
    };
}

export default function Dashboard() {
    const [newSessionName, setNewSessionName] = useState('');
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(''); // Поиск
    const [selectedIds, setSelectedIds] = useState<string[]>([]); // Множественный выбор

    const loadSessions = async () => {
        try {
            const res = await apiService.getSessions();
            setSessions(res.data);
        } catch (error) {
            console.error("Ошибка загрузки сессий:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadSessions(); }, []);

    const createNewSession = async () => {
        if (!newSessionName) return;
        await apiService.createSession(newSessionName);
        setNewSessionName('');
        await loadSessions();
    };

    const handleFinish = async (id: string) => {
        await apiService.deleteSession(id);
        loadSessions();
    };

    // Массовое завершение сессий (Bulk delete)
    const handleBulkFinish = async () => {
        if (selectedIds.length === 0) return;
        setLoading(true);
        try {
            // Параллельно отправляем запросы на удаление
            await Promise.all(selectedIds.map(id => apiService.deleteSession(id)));
            setSelectedIds([]);
            await loadSessions();
        } catch (err) {
            console.error("Ошибка при массовом удалении:", err);
        } finally {
            setLoading(false);
        }
    };

    // Логика выбора индивидуального чекбокса
    const handleSelectSession = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    // Выбрать только АКТИВНЫЕ отфильтрованные сессии
    const handleSelectAll = (filteredList: Session[]) => {
        const activeSessions = filteredList.filter(s => s.status === 'active');

        if (selectedIds.length === activeSessions.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(activeSessions.map(s => s._id));
        }
    };

    // Живая фильтрация по имени или по ID
    const filteredSessions = sessions.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s._id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="dashboard-container text-left">
            <h1 className="dashboard-title">Панель управления сессиями</h1>

            {/* Инициализация и Поиск */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-sm font-semibold mb-2 text-gray-500 uppercase">Новая сессия</h2>
                    <div className="flex gap-2">
                        {/* СДЕЛАЛИ ШИРЕ: класс w-full max-w-md */}
                        <input
                            className="border p-2 rounded w-full max-w-md"
                            placeholder="Введите имя сессии..."
                            value={newSessionName}
                            onChange={(e) => setNewSessionName(e.target.value)}
                        />
                        <button
                            onClick={createNewSession}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition cursor-pointer"
                        >
                            Создать
                        </button>
                    </div>
                </div>

                <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-sm font-semibold mb-2 text-gray-500 uppercase">Поиск и фильтрация</h2>
                    <input
                        className="border p-2 rounded w-full"
                        placeholder="Поиск по имени или ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Кнопка группового удаления */}
            {selectedIds.length > 0 && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex justify-between items-center">
                    <span className="text-red-700 font-medium">Выбрано сессий: {selectedIds.length}</span>
                    <button
                        onClick={handleBulkFinish}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition flex items-center gap-2 cursor-pointer"
                    >
                        <Trash2 size={16} /> Завершить выбранные
                    </button>
                </div>
            )}

            {loading ? <p>Загрузка...</p> : (
                <table className="dashboard-table">
                    <thead>
                        <tr>
                            <th className="w-12 text-center">
                                <input
                                    type="checkbox"
                                    className="cursor-pointer"
                                    checked={selectedIds.length === filteredSessions.length && filteredSessions.length > 0}
                                    onChange={() => handleSelectAll(filteredSessions)}
                                />
                            </th>
                            <th>Имя сессии (Логи)</th>
                            <th>ID сессии</th>
                            <th>Статус</th>
                            {/* ДОБАВИЛИ КОЛОНКИ В ШАПКУ */}
                            <th>Всего запросов</th>
                            <th>Ошибки</th>
                            <th>Дата создания</th>
                            <th className="w-24">Действие</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSessions.map((session) => (
                            <tr key={session._id}>
                                <td className="text-center">
                                    <input
                                        type="checkbox"
                                        className="cursor-pointer"
                                        // ПОЧИНИЛИ: Чекбокс заблокирован, если сессия finished
                                        disabled={session.status === 'finished'}
                                        checked={selectedIds.includes(session._id)}
                                        onChange={() => handleSelectSession(session._id)}
                                    />
                                </td>
                                <td>
                                    <Link to={`/logs/${session._id}`} className="session-link">
                                        {session.name}
                                    </Link>
                                </td>
                                <td><code className="text-xs">{session._id}</code></td>
                                <td>
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${session.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {session.status.toUpperCase()}
                                    </span>
                                </td>
                                {/* ДОБАВИЛИ ВЫВОД МЕТРИК В СТРОКИ */}
                                <td className="font-semibold">{session.metrics?.total_requests ?? 0}</td>
                                <td className="font-semibold text-red-600">{session.metrics?.failed_requests ?? 0}</td>

                                <td>{new Date(session.created_at).toLocaleString('ru-RU')}</td>
                                <td>
                                    {session.status === 'active' && (
                                        <button
                                            onClick={() => handleFinish(session._id)}
                                            className="text-red-600 hover:text-red-800 font-bold cursor-pointer"
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