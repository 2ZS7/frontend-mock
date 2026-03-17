import { useEffect, useState } from 'react'
import axios from 'axios'
import './App.css'

// Описываем интерфейс, чтобы TypeScript помогал нам с автодополнением!
interface Session {
  _id: string;
  name: string;
  status: string;
  created_at: string;
}

function App() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  // useEffect срабатывает один раз при загрузке страницы
  useEffect(() => {
    // Делаем запрос к нашему FastAPI
    axios.get<Session[]>('http://localhost:8000/sessions')
      .then((response) => {
        setSessions(response.data)
        setLoading(false)
      })
      .catch((error) => {
        console.error("Ошибка при загрузке сессий:", error)
        setLoading(false)
      })
  }, [])

  return (
    <div style={{ padding: '20px' }}>
      <h1>Stateful Mock: Dashboard</h1>
      {loading ? <p>Загрузка...</p> : (
        <table border={1} style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>ID сессии</th>
              <th>Имя</th>
              <th>Статус</th>
              <th>Дата создания</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <tr key={session._id}>
                <td>{session._id}</td>
                <td>{session.name}</td>
                <td>{session.status}</td>
                <td>{new Date(session.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default App