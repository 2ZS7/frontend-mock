// В "больших" проектах запросы (axios.get('http://localhost:8000/...')) 
// не пишут прямо внутри страниц. Их выносят в папку services, 
// чтобы, если у бэкенда поменяется адрес или порт, 
// программисту нужно было поменять его только в одном месте, 
// а не в двадцати файлах.
// У нас запросов всего два, поэтому мы оставили их внутри страниц для скорости.

import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:8000' });

export const apiService = {
    getRules: () => api.get('/definitions'),
    createRules: (data: any) => api.post('/definitions', data),
    updateRules: (id: string, data: any) => api.put(`/definitions/${id}`, data),
    deleteRules: (id: string) => api.delete(`/definitions/${id}`),

    // Добавляем сессии:
    getSessions: () => api.get('/sessions'),
    createSession: (name: string) => api.post('/sessions', { name }),
    deleteSession: (id: string) => api.delete(`/sessions/${id}`),
};