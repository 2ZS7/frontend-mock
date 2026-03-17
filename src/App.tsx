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
    <div className="App">
      <h1>Сессии</h1>
      {loading ? (
        <p>Загрузка...</p>
      ) : (
        <ul>
          {sessions.map((session) => (
            <li key={session._id}>
              <strong>{session.name}</strong> - {session.status} (создано: {new Date(session.created_at).toLocaleString()})
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default App