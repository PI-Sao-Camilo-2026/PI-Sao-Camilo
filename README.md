# Nutri-Esportiva

**Aplicativo para Avaliação da Taxa de Sudorese e Suporte à Tomada de Decisão em Hidratação de Atletas**

O **Nutri-Esportiva** é uma solução de software multiplataforma desenvolvida para otimizar a avaliação e o monitoramento do balanço hídrico de atletas. O sistema substitui métodos manuais por um fluxo de trabalho automatizado e fundamentado em evidências científicas, permitindo recomendações individualizadas de hidratação usando Inteligência Artificial.

## Contexto do Problema
A desidratação é um fator limitante para o desempenho esportivo. Atualmente, o controle hídrico costuma ser feito de forma manual e sem padronização, o que gera erros de cálculo e falta de histórico. O Nutri-Esportiva resolve isso através de um motor de cálculo preciso e registro sistemático de variáveis ambientais (temperatura e umidade).

## Funcionalidades Principais
* **Fluxo de Avaliação Completo**: Coleta de dados pré, durante e pós-sessão de treino (massa corporal, modalidade, sintomas e fadigas).
* **Motor de Cálculo Automatizado**: Cálculo instantâneo da taxa de sudorese (L/h), variação de massa corporal e balanço hídrico.
* **Inteligência Artificial**:
    * **Predição**: Estimativa de taxa de sudorese para sessões futuras.
* **Integração Climática**: Busca automática de dados de temperatura e umidade em tempo real via API do OpenWeatherMap.
* **Exportação de Dados**: Geração de relatórios em PDF por sessão e histórico consolidado em Excel (.xlsx).
* **Controle de Acesso**: Sistema com quatro níveis de permissão:
    * **Atleta**: Acesso aos próprios dados e histórico.
    * **Nutricionista**: Acompanhamento completo dos atletas vinculados.
    * **Treinador**: Foco em desempenho e tolerância ao plano hídrico.
    * **Médico**: Visão clínica com ênfase em alertas de desidratação/hiperidratação.



## organizacao das pastas - colocar nome do lado do arquivo q for mexer:
nutri-esportiva/
│
├── backend/
│   ├── main.py                        # Ponto de entrada FastAPI
│   ├── database.py                    # Models SQLAlchemy + conexão SQL Server
│   ├── requirements.txt               # Dependências Python
│   ├── .env                           # Variáveis de ambiente (criar a partir do .env.example)
│   ├── .env.example                   # Modelo de configuração
│   ├── schema.sql                     # DDL completo do banco (rodar no SQL Server)
│   ├── populate.py                    # Seeds com dados fake para testes
│   │
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── auth.py                    # Login e refresh de token (JWT)
│   │   ├── sessoes.py                 # Fluxo pré/durante/pós sessão (RF02, RF04–RF11)
│   │   ├── relatorios.py              # Exportação PDF e Excel (RF12, RF13)
│   │   ├── usuarios.py                # Cadastro e listagem de atletas (RF01)
│   │   ├── fluidos.py                 # Consulta de ingestões e urina
│   │   └── clima.py                   # Proxy OpenWeatherMap (RF03)
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth_service.py            # JWT + bcrypt + guards de perfil
│   │   ├── calculo.py                 # Motor de cálculo de sudorese (RF07–RF10)
│   │   └── ia.py                      # Isolation Forest + Random Forest (RF14, RF15)
│   │
│   └── exportacao/
│       ├── __init__.py
│       ├── pdf.py                     # Geração de relatório PDF por sessão (RF12)
│       └── excel.py                   # Planilha Excel com histórico + estatísticas (RF13)
│
└── mobile/
    ├── app.json                       # Configuração Expo
    ├── package.json                   # Dependências Node
    ├── tsconfig.json                  # Configuração TypeScript
    │
    ├── app/
    │   ├── _layout.tsx                # Root layout — AuthProvider + Stack de navegação
    │   │
    │   ├── (auth)/                    # ⚠️ parênteses obrigatórios
    │   │   └── login.tsx              # Tela de login com atalhos por perfil
    │   │
    │   └── (tabs)/                    # ⚠️ parênteses obrigatórios
    │       ├── _layout.tsx            # Navegação por abas (bottom tabs)
    │       ├── dashboard.tsx          # Dashboard com métricas e sessões recentes
    │       ├── nova-sessao.tsx        # Fluxo 4 etapas: pré → durante → pós → resultado
    │       ├── historico.tsx          # Histórico longitudinal + filtros + exportação
    │       └── atletas.tsx            # Lista de atletas (nutricionista/treinador/médico)
    │
    └── shared/
        ├── contexts/
        │   └── AuthContext.tsx        # Contexto de autenticação (Web + Mobile)
        └── services/
            └── api.ts                 # Axios + interceptors JWT + refresh automático
