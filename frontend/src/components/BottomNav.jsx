// src/components/BottomNav.jsx
import { useNavigate } from "react-router-dom";

const IconActivity = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
);

const IconClock = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
);

const IconBook = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
);

const IconUser = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
);

export default function BottomNav({ active }) {
    const navigate = useNavigate();

    const items = [
        { id: "registro", label: "Registro", icon: <IconActivity />, path: "/presessao" },
        { id: "historico", label: "Histórico", icon: <IconClock />, path: "/historico" },
        { id: "guia", label: "Guia", icon: <IconBook />, path: "/guia" },
        { id: "perfil", label: "Perfil", icon: <IconUser />, path: "/perfil" },
    ];

    return (
        <nav className="bottom-nav">
            {items.map((item) => (
                <div
                    key={item.id}
                    className={`nav-item ${active === item.id ? "active" : ""}`}
                    onClick={() => navigate(item.path)}
                >
                    <span className="nav-icon">{item.icon}</span>
                    {item.label}
                </div>
            ))}
        </nav>
    );
}