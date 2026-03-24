import { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { Pencil, Trash2 } from 'lucide-react';

export default function Rules() {
    const [rules, setRules] = useState<any[]>([]);
    const [isStateful, setIsStateful] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        method: 'GET',
        path_pattern: '',
        priority: 0,
        status_code: 200,
        response_payload: {},
        state_logic: { action: 'insert', collection_name: '' }
    });
    const [payloadStr, setPayloadStr] = useState('{}');


    const fetchRules = async () => {
        const res = await apiService.getRules();
        setRules(res.data);
    };

    useEffect(() => { fetchRules(); }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const dataToSend = { ...formData, state_logic: isStateful ? formData.state_logic : null };


        if (editingId) {
            await apiService.updateRules(editingId, dataToSend);
            setEditingId(null);
        } else {
            await apiService.createRules(dataToSend);
        }

        setFormData({
            name: '',
            method: 'GET',
            path_pattern: '',
            priority: 0,
            status_code: 200,
            response_payload: {},
            state_logic: { action: 'insert', collection_name: '' }
        });
        fetchRules();
    };

    const startEdit = (rule: any) => {
        setEditingId(rule._id);
        setFormData({ name: rule.name, method: rule.method, path_pattern: rule.path_pattern, priority: rule.priority, status_code: rule.status_code, response_payload: rule.response_payload, state_logic: rule.state_logic || { action: 'insert', collection_name: '' } });
        setIsStateful(!!rule.state_logic);
    };

    const handleDelete = async (id: string) => {
        await apiService.deleteRules(id);
        fetchRules();
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Редактор правил</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-lg font-semibold mb-4">{editingId ? 'Редактировать правило' : 'Создать правило'}</h2>
                    <input className="w-full border p-2 mb-3 rounded" value={formData.name} placeholder="Название" onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    <select className="w-full border p-2 mb-3 rounded" value={formData.method} onChange={(e) => setFormData({ ...formData, method: e.target.value })}>
                        <option>GET</option><option>POST</option><option>PUT</option><option>DELETE</option>
                    </select>
                    <input className="w-full border p-2 mb-3 rounded" value={formData.path_pattern} placeholder="Path (regex)" onChange={(e) => setFormData({ ...formData, path_pattern: e.target.value })} />


                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <input
                            type="number"
                            className="w-full border p-2 mb-4 rounded"
                            placeholder="Приоритет (число)"
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                        />
                        <input
                            type="number"
                            className="border p-2 rounded"
                            placeholder="Status Code (напр. 200)"
                            value={formData.status_code}
                            onChange={(e) => setFormData({ ...formData, status_code: parseInt(e.target.value) || 200 })}
                        />
                    </div>
                    <textarea
                        className="json-textarea mb-3"
                        placeholder='{"key": "value"}'
                        value={payloadStr}
                        onChange={(e) => {
                            setPayloadStr(e.target.value);
                            try {
                                const parsed = JSON.parse(e.target.value);
                                setFormData({ ...formData, response_payload: parsed });
                            } catch (err) {
                                // Игнорируем ошибку парсинга, пока пользователь печатает
                            }
                        }}
                    />
                    {/* Переключатель Stateful */}
                    <label className="flex items-center gap-2 mb-4">
                        <input type="checkbox" checked={isStateful} onChange={(e) => setIsStateful(e.target.checked)} />
                        <span>Stateful-логика</span>
                    </label>

                    {isStateful && (
                        <div className="mb-4 p-3 bg-gray-50 rounded">
                            <select className="w-full border p-2 mb-2" onChange={(e) => setFormData({ ...formData, state_logic: { ...formData.state_logic, action: e.target.value } })}>
                                <option value="insert">Insert</option>
                                <option value="find">Find</option>
                            </select>
                            <input className="w-full border p-2" placeholder="Коллекция (напр. users)" onChange={(e) => setFormData({ ...formData, state_logic: { ...formData.state_logic, collection_name: e.target.value } })} />
                        </div>
                    )}

                    <button className="w-full bg-blue-600 text-white py-2 rounded">{editingId ? 'Сохранить' : 'Создать'}</button>
                </form>

                <div className="md:col-span-2">
                    <table className="w-full bg-white shadow-sm rounded-xl overflow-hidden">
                        <thead className="bg-gray-50"><tr><th className="p-4">Название</th><th>Метод</th><th>Действие</th></tr></thead>
                        <tbody>
                            {rules.map(rule => (
                                <tr key={rule._id} className="border-b">
                                    <td className="p-4">{rule.name}</td>
                                    <td className="p-4">{rule.method}</td>
                                    <td className="p-4 flex gap-3">
                                        <button
                                            onClick={() => startEdit(rule)}
                                            className="text-blue-600 transition-colors duration-200 hover:text-blue-800 cursor-pointer"
                                            title="Редактировать правило"
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(rule._id)}
                                            className="text-red-600 transition-colors duration-200 hover:text-red-800 cursor-pointer"
                                            title="Удалить правило"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}