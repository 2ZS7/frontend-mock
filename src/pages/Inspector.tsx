import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiService } from '../services/api';
import './Inspector.css';

interface RequestLog {
    _id: string;
    timestamp: string;
    request: {
        method: string;
        path: string;
    };
    engine_decision: {
        matched_rule_id: string;
        matched_rule_name: string;
    };
    response: {
        status_code: number;
    };
}

export default function Inspector() {
    const { session_id } = useParams<{ session_id: string }>();
    const [logs, setLogs] = useState<RequestLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'error'>('all');
    const [searchText, setSearchText] = useState(''); // Состояние для живого поиска

    const loadLogs = async () => {
        if (!session_id) return;
        try {
            const res = await apiService.getLogs(session_id);
            setLogs(res.data);
        } catch (err) {
            console.error("Ошибка при загрузке логов:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadLogs(); }, [session_id]);

    // Умный комбинированный фильтр (Выполняется мгновенно в ОЗУ)
    const filteredLogs = logs.filter(log => {
        // 1. Проверка по статусу
        const matchesStatus =
            statusFilter === 'all' ||
            (statusFilter === 'success' && log.response.status_code >= 200 && log.response.status_code < 400) ||
            (statusFilter === 'error' && log.response.status_code >= 400);

        if (!matchesStatus) return false;

        // 2. Проверка по тексту (ищем в пути, методе, имени правила и во всем JSON-теле лога!)
        const searchLower = searchText.toLowerCase();
        const fullLogJsonString = JSON.stringify(log).toLowerCase();

        const matchesSearch =
            log.request.path.toLowerCase().includes(searchLower) ||
            log.request.method.toLowerCase().includes(searchLower) ||
            log.engine_decision.matched_rule_name.toLowerCase().includes(searchLower) ||
            fullLogJsonString.includes(searchLower);

        return matchesSearch;
    });

    const getMethodClass = (method: string) => `method-${method.toUpperCase()}`;
    const getStatusClass = (code: number) => code >= 200 && code < 400 ? 'status-success' : 'status-error';

    return (
        <div className="inspector-container">
            <Link to="/" className="back-link">⬅ Назад к списку сессий</Link>

            <h2 className="inspector-title">Инспектор логов сессии</h2>
            <p style={{ color: '#666', marginBottom: '20px', fontFamily: 'monospace' }}>ID: {session_id}</p>

            {loading ? (
                <p>Загрузка логов...</p>
            ) : logs.length === 0 ? (
                <p className="empty-logs">Для этой сессии пока нет логов.</p>
            ) : (
                <>
                    {/* Панель поиска и фильтрации */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6 flex flex-col gap-4 text-left">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Поиск по содержимому логов</label>
                            <input
                                className="border border-gray-300 p-2 rounded h-10 w-full max-w-md"
                                placeholder="Введите метод, путь, имя правила или часть JSON..."
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Фильтр по статусу ответа</label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setStatusFilter('all')}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition ${statusFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                >
                                    Все запросы
                                </button>
                                <button
                                    onClick={() => setStatusFilter('success')}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition ${statusFilter === 'success' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                >
                                    Только успешные (2xx/3xx)
                                </button>
                                <button
                                    onClick={() => setStatusFilter('error')}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition ${statusFilter === 'error' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                >
                                    Только ошибки (4xx/5xx)
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Вывод отфильтрованных логов */}
                    <div className="logs-list">
                        {filteredLogs.length === 0 ? (
                            <p className="text-gray-500 italic">Запросы, соответствующие критериям поиска, не найдены.</p>
                        ) : (
                            filteredLogs.map((log) => (
                                <div key={log._id} className="log-card">
                                    <div className="log-header">
                                        <div className="log-header-left">
                                            <span className={`method-badge ${getMethodClass(log.request.method)}`}>
                                                {log.request.method}
                                            </span>
                                            <span className="log-path">/{log.request.path}</span>
                                        </div>
                                        <div className={`status-badge ${getStatusClass(log.response.status_code)}`}>
                                            {log.response.status_code}
                                        </div>
                                    </div>

                                    <div className="log-body">
                                        <div className="log-meta">
                                            <span>Время: {new Date(log.timestamp).toLocaleTimeString()}</span>
                                            <span>
                                                Правило: <span className="log-rule-name">{log.engine_decision?.matched_rule_name || "no_rule"}</span>
                                            </span>
                                        </div>

                                        <details>
                                            <summary className="details-summary">Показать полный JSON</summary>
                                            <pre className="logs-pre">
                                                {JSON.stringify(log, null, 2)}
                                            </pre>
                                        </details>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </>
            )}
        </div>
    );
}