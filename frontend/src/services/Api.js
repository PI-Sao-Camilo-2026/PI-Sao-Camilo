const BASE_URL = 'http://localhost:8000';
export function getToken() { return localStorage.getItem("@token"); }
export function setToken(t) { t ? localStorage.setItem("@token", t) : localStorage.removeItem("@token"); }
export function getUsuario() { const r = localStorage.getItem("@usuario"); return r ? JSON.parse(r) : null; }
export function setUsuario(u) { u ? localStorage.setItem("@usuario", JSON.stringify(u)) : localStorage.removeItem("@usuario"); }

async function request(path, method = "GET", body = null) {
    const token = getToken();
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}${path}`, {
        method, headers,
        body: body ? JSON.stringify(body) : null,
    });

    if (res.status === 401) { setToken(null); setUsuario(null); window.location.href = "/"; throw new Error("Sessão expirada"); }

    const text = await res.text();
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) {
        const msg = data?.detail || text || "Erro desconhecido";
        throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
    }
    return data;
}

export const authApi = {
    async login(email, senha) {
        const form = new URLSearchParams();
        form.append("username", email);
        form.append("password", senha);
        const res = await fetch(`${BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: form.toString(),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.detail || "Credenciais inválidas");
        setToken(data.access_token);
        setUsuario({ id: data.usuario_id, nome: data.nome, tipo: data.tipo_usuario });
        return data;
    },

    async registrar(payload) { return request("/auth/registrar", "POST", payload); },

    logout() { setToken(null); setUsuario(null); },
};

export const sessoesApi = {
    iniciarPreTreino: (p) => request("/sessoes/pre-treino", "POST", p),
    registrarFluido: (id, ml) => request(`/sessoes/${id}/fluido?volume_ml=${ml}`, "POST"),
    finalizarSessao: (id, p) => request(`/sessoes/${id}/finalizar`, "POST", p),
    finalizarPosTreino: (p) => request("/sessoes/pos-treino", "POST", p),
    historico: (limit = 20, offset = 0) => request(`/sessoes/historico?limit=${limit}&offset=${offset}`),
    stats: () => request("/sessoes/historico/stats"),
    detalhe: (id) => request(`/sessoes/${id}`),
    sessoesAtleta: (atletaId, limit = 50) => request(`/sessoes/atleta/${atletaId}?limit=${limit}`),
};

export const usuariosApi = {
    me: () => request("/usuarios/me"),
    atualizarPerfil: (p) => request("/usuarios/me", "PUT", p),
    listarAtletas: () => request("/usuarios/atletas"),
    detalheAtleta: (id) => request(`/usuarios/atletas/${id}`),
    atualizarAtleta: (id, p) => request(`/usuarios/atletas/${id}`, "PUT", p),
    desvincularAtleta: (id) => request(`/usuarios/atletas/${id}/desvincular`, "POST"),

    cadastrarAtleta: (payload) => request("/usuarios/atletas", "POST", payload),

    buscarAtletasDisponiveis: (busca = "") =>
        request(`/usuarios/atletas-disponiveis${busca ? `?busca=${encodeURIComponent(busca)}` : ""}`),

    vincularAtleta: (atleta_id) => request("/usuarios/atletas/vincular", "POST", { atleta_id }),
};

export const relatoriosApi = {
    dashboardStats: () => request("/relatorios/dashboard-stats"),
    pdfUrl: (atletaId) => `${BASE_URL}/relatorios/pdf/${atletaId}`,
    excelUrl: (atletaId) => `${BASE_URL}/relatorios/excel/${atletaId}`,
};

export const climaApi = {
    async buscarPorCoordenadas(lat, lon) {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code,shortwave_radiation&timezone=auto`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Erro ao buscar clima");
        const data = await res.json();
        const c = data.current;
        return {
            temperatura: c.temperature_2m ?? "",
            umidade: c.relative_humidity_2m ?? "",
            sensacaoTermica: c.apparent_temperature ?? "",
            vento: c.wind_speed_10m ?? "",
            radiacao: c.shortwave_radiation ?? "",
            condicao: traduzirCondicao(c.weather_code),
            sol: classificarRadiacao(c.shortwave_radiation),
        };
    },

    async buscarAutomatico() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                this.buscarPorCoordenadas(-23.5505, -46.6333).then(resolve).catch(reject);
                return;
            }
            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    try { resolve(await this.buscarPorCoordenadas(pos.coords.latitude, pos.coords.longitude)); }
                    catch (e) { reject(e); }
                },
                async () => {
                    try { resolve(await this.buscarPorCoordenadas(-23.5505, -46.6333)); }
                    catch (e) { reject(e); }
                }
            );
        });
    },
};

function traduzirCondicao(c) {
    const m = { 0: "Céu limpo", 1: "Predominantemente limpo", 2: "Parcialmente nublado", 3: "Nublado", 45: "Neblina", 51: "Garoa leve", 61: "Chuva leve", 63: "Chuva moderada", 80: "Pancadas leves", 95: "Trovoada" };
    return m[c] || "Condição variável";
}

function classificarRadiacao(v) {
    if (!v) return "";
    return v < 250 ? "Baixa" : v < 600 ? "Moderada" : "Alta";
}