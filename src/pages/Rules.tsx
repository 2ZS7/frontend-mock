import { useEffect, useState } from 'react';
import { apiService } from '../services/api';

export default function Rules() {
    const [Rules, setRules] = useState<any[]>([]);
    const [formData, setFormData] = useState({ name: '', method: 'GET', path_pattern: '', priority: 0 });

    const fetchRules = async () => {
        const res = await apiService.getRules();
        setRules(res.data);
    };

    useEffect(() => { fetchRules(); }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await apiService.createRules(formData);
        // ВАЖНО: вызываем функцию, которая снова тянет список с сервера
        await fetchRules();
    };

    const handleDelete = async (id: string) => {
        await apiService.deleteRules(id);
        fetchRules();
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Редактор правил маршрутизации</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Форма создания */}
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-lg font-semibold mb-4">Создать новое правило</h2>
                    <input className="w-full border p-2 mb-3 rounded" placeholder="Название" onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    <select className="w-full border p-2 mb-3 rounded" onChange={(e) => setFormData({ ...formData, method: e.target.value })}>
                        <option>GET</option><option>POST</option><option>PUT</option><option>DELETE</option>
                    </select>
                    <input className="w-full border p-2 mb-3 rounded" placeholder="Path (regex)" onChange={(e) => setFormData({ ...formData, path_pattern: e.target.value })} />
                    <input type="number" className="w-full border p-2 mb-4 rounded" placeholder="Приоритет" onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })} />
                    <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">Создать правило</button>
                </form>

                {/* Список правил */}
                <div className="md:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-700 uppercase">
                                <tr>
                                    <th className="px-6 py-3">Название</th>
                                    <th className="px-6 py-3">Метод</th>
                                    <th className="px-6 py-3">Действие</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Rules.map(Rules => (
                                    <tr key={Rules._id} className="border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium">{Rules.name}</td>
                                        <td className="px-6 py-4">{Rules.method}</td>
                                        <td className="px-6 py-4">
                                            <button onClick={() => handleDelete(Rules._id)} className="text-red-600 hover:text-red-800">Удалить</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}