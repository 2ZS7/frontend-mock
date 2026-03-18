import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import './Inspector.css';

export default function Inspector() {
    const { session_id } = useParams();
    const [logs, setLogs] = useState<any[]>([]);
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

    return (
        <div className="inspector-container">
            <Link to="/" className="back-link">
                ⬅ Назад к списку сессий
            </Link>

            <h2 className="inspector-title">Инспектор логов: {session_id}</h2>

            {loading ? (
                <p>Загрузка логов...</p>
            ) : logs.length === 0 ? (
                <p className="empty-logs">Для этой сессии пока нет логов.</p>
            ) : (
                <div className="logs-box">
                    <pre className="logs-pre">
                        {JSON.stringify(logs, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}