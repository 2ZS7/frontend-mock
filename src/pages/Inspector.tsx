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

    // Логика живой фильтрации в памяти браузера
    const filteredLogs = logs.filter(log => {
        if (statusFilter === 'all') return true;
        if (statusFilter === 'success') return log.response.status_code >= 200 && log.response.status_code < 400;
        if (statusFilter === 'error') return log.response.status_code >= 400;
        return true;
    });

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
                // Оборачиваем в пустой фрагмент <></> для соблюдения структуры JSX
                <>
                    {/* ВСТАВИЛИ: Кнопки фильтрации в стиле Tailwind */}
                    <div className="flex gap-2 mb-6">
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

                    {/* ИСПРАВИЛИ: Рендерим filteredLogs вместо logs */}
                    <div className="logs-list">
                        {filteredLogs.map((log) => (
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
                                            Правило: <span className="log-rule-name">{log.engine_decision.matched_rule_name}</span>
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
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}