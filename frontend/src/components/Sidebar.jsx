// src/components/Sidebar.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "../css/profissional.css";

const IconHome = () => (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
);

const IconUsers = () => (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

const IconHistory = () => (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="12 8 12 12 14 14" />
        <path d="M3.05 11a9 9 0 1 0 .5-4.5" />
        <polyline points="3 3 3 9 9 9" />
    </svg>
);

const IconChart = () => (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
);

const IconSettings = () => (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
);

const IconSupport = () => (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
);

const IconLogout = () => (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
);

const IconDroplet = () => (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
);

const NAV_ITEMS = [
    {
        id: "dashboard",
        label: "Início",
        icon: <IconHome />,
        path: "/homepage",
    },
    {
        id: "atletas",
        label: "Atletas",
        icon: <IconUsers />,
        path: "/atletas",
    },
    {
        id: "historico",
        label: "Histórico",
        icon: <IconHistory />,
        path: "/historico-prof",
    },
    {
        id: "relatorios",
        label: "Relatórios",
        icon: <IconChart />,
        path: "/relatorios-prof",
    },
];

export default function Sidebar({ active }) {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const [menuAberto, setMenuAberto] = useState(false);

    useEffect(() => {
        function handleResize() {
            if (window.innerWidth > 768) {
                setMenuAberto(false);
            }
        }

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    function navegar(path) {
        navigate(path);
        setMenuAberto(false);
    }

    return (
        <>
            <button
                className="menu-hamburger"
                onClick={() => setMenuAberto(true)}
            >
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
            </button>

            {menuAberto && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setMenuAberto(false)}
                />
            )}

            <aside
                className={`prof-sidebar ${
                    menuAberto ? "open" : ""
                }`}
            >
                <div className="sidebar-brand">
                    <div className="sidebar-brand-row">
                        <div className="sidebar-logo">
                            <IconDroplet />
                        </div>

                        <div>
                            <h2>São Camilo</h2>
                            <p>Área Médica</p>
                        </div>
                    </div>

                    <button
                        className="close-sidebar-btn"
                        onClick={() => setMenuAberto(false)}
                    >
                        &times;
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {NAV_ITEMS.map((item) => (
                        <button
                            key={item.id}
                            className={`sidebar-item ${
                                active === item.id
                                    ? "active"
                                    : ""
                            }`}
                            onClick={() => navegar(item.path)}
                        >
                            {item.icon}
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button
                        className={`sidebar-item ${
                            active === "suporte"
                                ? "active"
                                : ""
                        }`}
                        onClick={() => navegar("/suporte")}
                    >
                        <IconSupport />
                        Suporte
                    </button>

                    <button
                        className={`sidebar-item ${
                            active === "perfil" ||
                            active === "config"
                                ? "active"
                                : ""
                        }`}
                        onClick={() => navegar("/configuracoes")}
                    >
                        <IconSettings />
                        Configurações
                    </button>

                    <button
                        className="sidebar-item"
                        onClick={() => logout(navigate)}
                    >
                        <IconLogout />
                        Sair
                    </button>
                </div>
            </aside>
        </>
    );
}