import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiService } from '../services/api';
import './Inspector.css';

// Описываем структуру лога, чтобы TS нам помогал
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

    // Вспомогательная функция для выбора цвета метода
    const getMethodClass = (method: string) => `method-${method.toUpperCase()}`;
    const getStatusClass = (code: number) => code >= 200 && code < 400 ? 'status-success' : 'status-error';


    return (
        <div className="inspector-container">
            <Link to="/" className="back-link">⬅ Назад к списку сессий</Link>

            <h2 className="inspector-title">Инспектор логов: {session_id}</h2>

            {loading ? <p>Загрузка логов...</p> : logs.length === 0 ? (
                <p className="empty-logs">Для этой сессии пока нет логов.</p>
            ) : (
                <div className="logs-list">
                    {logs.map((log) => (
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
            )}
        </div>
    );
}