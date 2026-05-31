import { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { Pencil, Trash2 } from 'lucide-react';
import './Rules.css';

export default function Rules() {
    const [rules, setRules] = useState<any[]>([]);
    const [isStateful, setIsStateful] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [payloadStr, setPayloadStr] = useState('{}');
    const [formData, setFormData] = useState({
        name: '',
        method: 'GET',
        path_pattern: '',
        priority: 0,
        status_code: 200,
        response_payload: {},
        state_logic: { action: 'insert', collection_name: '' }
    });

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

        setFormData({ name: '', method: 'GET', path_pattern: '', priority: 0, status_code: 200, response_payload: {}, state_logic: { action: 'insert', collection_name: '' } });
        setPayloadStr('{}');
        setIsStateful(false);
        fetchRules();
    };

    const startEdit = (rule: any) => {
        setEditingId(rule._id);
        setFormData({
            name: rule.name,
            method: rule.method,
            path_pattern: rule.path_pattern,
            priority: rule.priority,
            status_code: rule.status_code || 200,
            response_payload: rule.response_payload || {},
            state_logic: rule.state_logic || { action: 'insert', collection_name: '' }
        });
        setPayloadStr(JSON.stringify(rule.response_payload || {}, null, 2));
        setIsStateful(!!rule.state_logic);
    };

    const handleDelete = async (id: string) => {
        await apiService.deleteRules(id);
        fetchRules();
    };

    return (
        <div className="p-8 max-w-7xl mx-auto text-left">
            <h1 className="text-2xl font-bold mb-6">Редактор правил маршрутизации</h1>

            {/* ИЗМЕНИЛИ: Сетка теперь md:grid-cols-5 для расширения формы */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">

                {/* Форма создания/редактирования (Занимает 2 колонки из 5) */}
                <form onSubmit={handleSubmit} className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col gap-4">
                    <h2 className="text-lg font-semibold text-gray-800">
                        {editingId ? 'Редактировать правило' : 'Создать новое правило'}
                    </h2>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Название правила</label>
                        <input className="w-full border border-gray-300 p-2 rounded h-10" value={formData.name} placeholder="Введите название..." onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Метод</label>
                            <select className="w-full border border-gray-300 p-2 rounded h-10 bg-white" value={formData.method} onChange={(e) => setFormData({ ...formData, method: e.target.value })}>
                                <option>GET</option>
                                <option>POST</option>
                                <option>PUT</option>
                                <option>PATCH</option>
                                <option>DELETE</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Приоритет</label>
                            <input type="number" className="w-full border border-gray-300 p-2 rounded h-10" value={formData.priority} placeholder="0" onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Регулярное выражение пути (Regex)</label>
                        <input className="w-full border border-gray-300 p-2 rounded h-10" value={formData.path_pattern} placeholder="api/v1/..." onChange={(e) => setFormData({ ...formData, path_pattern: e.target.value })} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Код ответа</label>
                            <input type="number" className="w-full border border-gray-300 p-2 rounded h-10" value={formData.status_code} placeholder="200" onChange={(e) => setFormData({ ...formData, status_code: parseInt(e.target.value) || 200 })} />
                        </div>
                        {/* Идеальное выравнивание чекбокса по высоте */}
                        <div className="flex items-end pb-2">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input type="checkbox" className="cursor-pointer" checked={isStateful} onChange={(e) => setIsStateful(e.target.checked)} />
                                <span className="text-sm font-semibold text-gray-600">Stateful-логика</span>
                            </label>
                        </div>
                    </div>

                    {isStateful && (
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 flex flex-col gap-3">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Действие</label>
                                <select className="w-full border border-gray-300 p-2 rounded h-10 bg-white" value={formData.state_logic?.action || 'insert'} onChange={(e) => setFormData({ ...formData, state_logic: { ...formData.state_logic, action: e.target.value } })}>
                                    <option value="insert">Insert</option>
                                    <option value="find">Find</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Виртуальная коллекция</label>
                                <input className="w-full border border-gray-300 p-2 rounded h-10 bg-white" value={formData.state_logic?.collection_name || ''} placeholder="Например: users" onChange={(e) => setFormData({ ...formData, state_logic: { ...formData.state_logic, collection_name: e.target.value } })} />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Тело ответа (JSON Payload)</label>
                        <textarea className="json-textarea" placeholder='{"key": "value"}' value={payloadStr} onChange={(e) => {
                            setPayloadStr(e.target.value);
                            try {
                                setFormData({ ...formData, response_payload: JSON.parse(e.target.value) });
                            } catch (err) { }
                        }} />
                    </div>

                    <button className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition cursor-pointer">
                        {editingId ? 'Сохранить изменения' : 'Создать правило'}
                    </button>
                </form>

                {/* Таблица правил (Занимает 3 колонки из 5) */}
                <div className="md:col-span-3">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-700 uppercase">
                                <tr>
                                    <th className="px-6 py-3">Название</th>
                                    <th className="px-6 py-3 w-24">Метод</th>
                                    <th className="px-6 py-3 w-24 text-center">Действие</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rules.map(rule => (
                                    <tr key={rule._id} className="border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium">{rule.name}</td>
                                        <td className="px-6 py-4">
                                            <span className={`method-badge method-${rule.method}`}>
                                                {rule.method}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 flex gap-4 justify-center">
                                            <button onClick={() => startEdit(rule)} className="text-blue-600 hover:text-blue-800 cursor-pointer" title="Редактировать правило">
                                                <Pencil size={18} />
                                            </button>
                                            <button onClick={() => handleDelete(rule._id)} className="text-red-600 hover:text-red-800 cursor-pointer" title="Удалить правило">
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
        </div>
    );
}