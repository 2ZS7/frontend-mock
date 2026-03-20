import { useEffect, useState } from 'react';
import { apiService } from '../services/api';

export default function Rules() {
    const [rules, setRules] = useState<any[]>([]);

    const fetchRules = async () => {
        const res = await apiService.getRules();
        setRules(res.data);
    };

    useEffect(() => { fetchRules(); }, []);

    const handleDelete = async (id: string) => {
        await apiService.deleteRule(id);
        fetchRules(); // Обновляем список
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Редактор правил</h1>
            {/* Здесь будет таблица с кнопками удаления */}
            <table border={1}>
                {rules.map(rule => (
                    <tr key={rule._id}>
                        <td>{rule.name}</td>
                        <td><button onClick={() => handleDelete(rule._id)}>Удалить</button></td>
                    </tr>
                ))}
            </table>
        </div>
    );
}