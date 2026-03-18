import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';

export default function Inspector() {
    const { session_id } = useParams();
    // Используем any[], так как структура лога сложная (в идеале тут тоже нужен interface)
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
        <div style={{ padding: '20px' }}>
            <Link to="/" style={{ textDecoration: 'none', fontSize: '18px', color: '#0066cc' }}>
                ⬅ Назад к списку сессий
            </Link>

            <h2 style={{ marginTop: '20px' }}>Инспектор логов: {session_id}</h2>

            {loading ? <p>Загрузка логов...</p> : (
                <div style={{ background: '#282c34', color: '#abb2bf', padding: '15px', borderRadius: '8px', overflowX: 'auto' }}>
                    {/* pre сохраняет форматирование JSON */}
                    <pre style={{ margin: 0, fontSize: '14px' }}>
                        {JSON.stringify(logs, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}