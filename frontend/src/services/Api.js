const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";


export function getToken() {
return localStorage.getItem("@token");
}

export function setToken(token) {
if (token) localStorage.setItem("@token", token);
else localStorage.removeItem("@token");
}

export function getUsuario() {
const raw = localStorage.getItem("@usuario");
return raw ? JSON.parse(raw) : null;
}

export function setUsuario(usuario) {
if (usuario) localStorage.setItem("@usuario", JSON.stringify(usuario));
else localStorage.removeItem("@usuario");
}

async function request(path, method = "GET", body = null) {
const token = getToken();

const headers = { "Content-Type": "application/json" };
if (token) headers["Authorization"] = `Bearer ${token}`;

const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
});

if (res.status === 401) {
    setToken(null);
    setUsuario(null);
    window.location.href = "/";
    throw new Error("Sessão expirada");
}

if (!res.status === 204) return null;

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

    if (!res.ok) {
    throw new Error(data?.detail || "Credenciais inválidas");
    }

    setToken(data.access_token);
    setUsuario({
    id: data.usuario_id,
    nome: data.nome,
    tipo: data.tipo_usuario,
    });

    return data;
},

async registrar(payload) {
    return request("/auth/registrar", "POST", payload);
},

logout() {
    setToken(null);
    setUsuario(null);
},
};


export const sessoesApi = {
iniciarPreTreino: (payload) =>
    request("/sessoes/pre-treino", "POST", payload),

registrarFluido: (sessaoId, volume_ml) =>
    request(`/sessoes/${sessaoId}/fluido?volume_ml=${volume_ml}`, "POST"),

finalizarSessao: (sessaoId, payload) =>
    request(`/sessoes/${sessaoId}/finalizar`, "POST", payload),

finalizarPosTreino: (payload) =>
    request("/sessoes/pos-treino", "POST", payload),

historico: (limit = 20, offset = 0) =>
    request(`/sessoes/historico?limit=${limit}&offset=${offset}`),

stats: () => request("/sessoes/historico/stats"),

detalhe: (sessaoId) => request(`/sessoes/${sessaoId}`),

sessoesAtleta: (atletaId, limit = 30) =>
    request(`/sessoes/atleta/${atletaId}?limit=${limit}`),
};


export const usuariosApi = {
me: () => request("/usuarios/me"),

atualizarPerfil: (payload) => request("/usuarios/me", "PUT", payload),

listarAtletas: () => request("/usuarios/atletas"),

detalheAtleta: (id) => request(`/usuarios/atletas/${id}`),
};


export const relatoriosApi = {
dashboardStats: () => request("/relatorios/dashboard-stats"),

pdfUrl: (atletaId) => `${BASE_URL}/relatorios/pdf/${atletaId}`,

excelUrl: (atletaId) => `${BASE_URL}/relatorios/excel/${atletaId}`,
};


export const climaApi = {
async buscarPorCoordenadas(latitude, longitude) {
    const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${latitude}` +
    `&longitude=${longitude}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code,shortwave_radiation` +
    `&timezone=auto`;

    const res = await fetch(url);
    if (!res.ok) throw new Error("Erro ao buscar clima");

    const data = await res.json();
    const atual = data.current;

    return {
    temperatura: atual.temperature_2m ?? "",
    umidade: atual.relative_humidity_2m ?? "",
    sensacaoTermica: atual.apparent_temperature ?? "",
    vento: atual.wind_speed_10m ?? "",
    radiacao: atual.shortwave_radiation ?? "",
    condicao: _traduzirCondicao(atual.weather_code),
    sol: _classificarRadiacao(atual.shortwave_radiation),
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
        try {
            resolve(await this.buscarPorCoordenadas(pos.coords.latitude, pos.coords.longitude));
        } catch (e) { reject(e); }
        },
        async () => {
        try {
            resolve(await this.buscarPorCoordenadas(-23.5505, -46.6333));
        } catch (e) { reject(e); }
        }
    );
    });
},
};

function _traduzirCondicao(codigo) {
const mapa = {
    0: "Céu limpo", 1: "Predominantemente limpo", 2: "Parcialmente nublado",
    3: "Nublado", 45: "Neblina", 48: "Neblina com geada",
    51: "Garoa leve", 53: "Garoa moderada", 55: "Garoa forte",
    61: "Chuva leve", 63: "Chuva moderada", 65: "Chuva forte",
    80: "Pancadas leves", 81: "Pancadas moderadas", 82: "Pancadas fortes",
    95: "Trovoada",
};
return mapa[codigo] || "Condição não identificada";
}

function _classificarRadiacao(valor) {
if (!valor) return "";
const r = Number(valor);
if (r < 250) return "Baixa";
if (r < 600) return "Moderada";
return "Alta";
}