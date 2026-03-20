import { useState } from 'react';
import { apiService } from '../services/api';

export default function RulesForm({ onCreated }: { onCreated: () => void }) {
    const [formData, setFormData] = useState({ name: '', method: 'GET', path_pattern: '', priority: 0 });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await apiService.createRules(formData);
        onCreated(); // Обновляем список после создания
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg font-bold mb-4">Создать правило</h3>
            <div className="grid grid-cols-2 gap-4">
                <input className="border p-2 rounded" placeholder="Название" onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                <select className="border p-2 rounded" onChange={(e) => setFormData({ ...formData, method: e.target.value })}>
                    <option>GET</option><option>POST</option><option>PUT</option><option>DELETE</option>
                </select>
                <input className="border p-2 rounded col-span-2" placeholder="Path Pattern (regex)" onChange={(e) => setFormData({ ...formData, path_pattern: e.target.value })} />
            </div>
            <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Создать</button>
        </form>
    );
}