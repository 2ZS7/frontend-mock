import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
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
    };
    response: {
        status_code: number;
    };
}

export default function Inspector() {
    const { session_id } = useParams();
    const [logs, setLogs] = useState<RequestLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`http://localhost:8000/logs/${session_id}`)
            .then((res) => {
                setLogs(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, [session_id]);

    // Вспомогательная функция для выбора цвета метода
    const getMethodClass = (method: string) => {
        const validMethods = ['GET', 'POST', 'PUT', 'DELETE'];
        return validMethods.includes(method.toUpperCase())
            ? `method-${method.toUpperCase()}`
            : 'method-DEFAULT';
    };

    // Вспомогательная функция для подсветки статуса (зеленый - ок, красный - ошибка)
    const getStatusClass = (code: number) => {
        return code >= 200 && code < 400 ? 'status-success' : 'status-error';
    };

    return (
        <div className="inspector-container">
            <Link to="/" className="back-link">
                ⬅ Назад к списку сессий
            </Link>

            <h2 className="inspector-title">Инспектор логов сессии</h2>
            <p style={{ color: '#666', marginBottom: '20px', fontFamily: 'monospace' }}>ID: {session_id}</p>

            {loading ? (
                <p>Загрузка логов...</p>
            ) : logs.length === 0 ? (
                <p>Для этой сессии пока нет логов.</p>
            ) : (
                <div className="logs-list">
                    {logs.map((log) => (
                        <div key={log._id} className="log-card">

                            {/* Шапка карточки: Метод, Путь и Статус */}
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

                            {/* Тело карточки: Время, Сработавшее правило и полный JSON */}
                            <div className="log-body">
                                <div className="log-meta">
                                    <span>Время: {new Date(log.timestamp).toLocaleTimeString()}</span>
                                    <span>
                                        Правило: <span className="log-rule">{log.engine_decision.matched_rule_id}</span>
                                    </span>
                                </div>

                                {/* HTML тег details позволяет скрыть длинный JSON под спойлер, чтобы не засорять экран */}
                                <details>
                                    <summary style={{ cursor: 'pointer', color: '#0066cc', marginBottom: '10px' }}>
                                        Показать полный JSON
                                    </summary>
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