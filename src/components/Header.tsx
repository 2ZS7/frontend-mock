// верхняя синяя панель с названием системы 
// "Stateful Mock Engine", которая отображается на ВСЕХ страницах

import { Link } from 'react-router-dom';

export default function Header() {
    return (
        <nav className="p-4 bg-gray-900 text-white flex gap-6 shadow-lg mb-6">
            <Link to="/" className="font-bold hover:text-blue-400">Dashboard</Link>
            <Link to="/rules" className="font-bold hover:text-blue-400">Редактор правил</Link>
            <Link to="/" className="ml-auto font-bold hover:text-blue-400">Stateful Mock Engine</Link>
        </nav>
    );
}