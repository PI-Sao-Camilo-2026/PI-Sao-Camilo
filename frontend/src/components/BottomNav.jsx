import { useNavigate } from "react-router-dom";

const IconHome = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
);

const IconActivity = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
);

export const IconClock = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

// Adicionado o 'export' para que o Home.jsx possa utilizá-lo
export const IconBook = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
);

// Adicionado o 'export' para que o Home.jsx possa utilizá-lo
export const IconUser = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const ITEMS = [
    { id: "home",      label: "Início",    icon: <IconHome />,     path: "/home" },
    { id: "registro",  label: "Registro",  icon: <IconActivity />, path: "/presessao" },
    { id: "historico", label: "Histórico", icon: <IconClock />,    path: "/historico" },
    { id: "guia",      label: "Guia",      icon: <IconBook />,     path: "/guia" },
    { id: "perfil",    label: "Perfil",    icon: <IconUser />,     path: "/perfil" },
];

export default function BottomNav({ active }) {
    const navigate = useNavigate();

    return (
        <>
            {/* ── Sidebar desktop ── */}
            <aside className="atleta-sidebar">
                <div className="atleta-sidebar-brand">
                    <div className="atleta-sidebar-logo">
                        <IconActivity />
                    </div>
                    <div>
                        <div className="atleta-sidebar-titulo">Nutri-Esportiva</div>
                        <div className="atleta-sidebar-sub">Portal do Atleta</div>
                    </div>
                </div>

                <nav className="atleta-sidebar-nav">
                    {ITEMS.map((item) => (
                        <button
                            key={item.id}
                            className={`atleta-sidebar-item ${active === item.id ? "active" : ""}`}
                            onClick={() => navigate(item.path)}
                        >
                            <span className="atleta-sidebar-icon">{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </nav>
            </aside>

            {/* ── Bottom nav mobile ── */}
            <nav className="bottom-nav">
                {ITEMS.map((item) => (
                    <div
                        key={item.id}
                        className={`nav-item ${active === item.id ? "active" : ""}`}
                        onClick={() => navigate(item.path)}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        <span className="nav-label">{item.label}</span>
                    </div>
                ))}
            </nav>
        </>
    );
}