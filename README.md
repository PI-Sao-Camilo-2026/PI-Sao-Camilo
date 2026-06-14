# Nutri-Esportiva

## Sistema Inteligente para Avaliação da Taxa de Sudorese e Gestão da Hidratação de Atletas

O **Nutri-Esportiva** é uma plataforma web desenvolvida para auxiliar atletas e profissionais da saúde esportiva no monitoramento da hidratação durante treinamentos.

A solução automatiza o cálculo da taxa de sudorese, registra variáveis fisiológicas e ambientais e utiliza Inteligência Artificial para gerar recomendações individualizadas de reposição hídrica.

O sistema foi desenvolvido como projeto acadêmico integrando conceitos de Engenharia de Software, Desenvolvimento Web, Banco de Dados, Inteligência Artificial e Saúde Esportiva.

---

# Problema

A desidratação é um dos fatores que mais impactam negativamente o desempenho esportivo.

Muitos atletas realizam o controle hídrico de forma manual, utilizando anotações em papel ou cálculos realizados posteriormente, o que gera:

* Falta de padronização;
* Erros de cálculo;
* Ausência de histórico;
* Dificuldade de acompanhamento profissional;
* Decisões tardias sobre hidratação.

O Nutri-Esportiva foi desenvolvido para transformar esse processo em uma experiência digital, automatizada e baseada em evidências científicas.

---

# Objetivos

## Objetivo Geral

Desenvolver uma plataforma capaz de monitorar a hidratação de atletas e calcular automaticamente a taxa de sudorese durante sessões de treinamento.

## Objetivos Específicos

* Registrar dados fisiológicos do atleta;
* Capturar informações climáticas automaticamente;
* Calcular indicadores de hidratação;
* Armazenar histórico de sessões;
* Gerar relatórios para profissionais;
* Aplicar modelos de Inteligência Artificial para apoio à tomada de decisão.

---

# Funcionalidades

## Pré-Sessão

Antes do treino o atleta registra:

* Massa corporal inicial;
* Cor da urina (escala de hidratação);
* Tipo de vestimenta utilizada;
* Condições ambientais.

O sistema obtém automaticamente:

* Temperatura;
* Umidade relativa do ar;
* Sensação térmica;
* Velocidade do vento;
* Radiação solar.

---

## Durante o Treino

O atleta pode:

* Registrar ingestão de líquidos;
* Controlar volume urinário;
* Acompanhar cronômetro em tempo real;
* Registrar sessões já concluídas informando apenas a duração;
* Visualizar indicador gráfico de hidratação.

---

## Pós-Sessão

Ao finalizar o treino são registrados:

* Massa corporal final;
* Sensação de sede;
* Nível de fadiga;
* Sintomas gastrointestinais;
* Observações adicionais.

---

## Histórico

Permite:

* Consultar sessões anteriores;
* Visualizar evolução dos indicadores;
* Comparar treinos;
* Analisar tendências de hidratação.

---

# Inteligência Artificial

O sistema incorpora modelos de Inteligência Artificial para:

* Predição da taxa de sudorese;
* Identificação de padrões de hidratação;
* Estimativa de necessidades hídricas futuras;
* Apoio à tomada de decisão dos profissionais.

As recomendações consideram:

* Condições climáticas;
* Histórico do atleta;
* Intensidade do exercício;
* Perfil fisiológico individual.

---

# Perfis de Usuário

## Atleta

* Registro de sessões;
* Histórico pessoal;
* Acompanhamento da hidratação.

## Treinador/ Profissional

* Monitoramento de desempenho;
* Controle de treinamentos;
* Acompanhamento da equipe,
* Avaliação clínica;
* Monitoramento de riscos de desidratação;
* Análise de indicadores fisiológicos;
* Prescrição hídrica;
* Análise da taxa de sudorese.

---

# Fórmula da Taxa de Sudorese

O cálculo segue recomendações científicas da literatura esportiva:

\text{Taxa de Sudorese (L/h)}=\frac{(Peso\ Pré-Peso\ Pós)+Ingestão\ de\ Fluidos-Volume\ Urinário}{Tempo\ de\ Exercício\ (h)}}

Onde:

* Peso Pré = massa corporal antes do treino;
* Peso Pós = massa corporal após o treino;
* Ingestão de Fluidos = líquidos consumidos durante a sessão;
* Volume Urinário = perdas urinárias registradas;
* Tempo = duração total do exercício.

---

# Arquitetura do Sistema

```text
┌──────────────────────────────┐
│          Frontend            │
│          React.js            │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│         REST API             │
│         FastAPI              │
└──────────────┬───────────────┘
               │
      ┌────────┴────────┐
      ▼                 ▼
┌─────────────┐  ┌─────────────┐
│ Banco Dados │  │ IA/Analytics│
│   MySQL     │  │ Machine     │
│             │  │ Learning    │
└─────────────┘  └─────────────┘
```

---

# Tecnologias Utilizadas

## Frontend

* React.js
* Vite
* React Router DOM
* JavaScript ES6+
* CSS3

## Backend

* FastAPI
* Python
* Uvicorn

## Banco de Dados

* MySQL
* Aiven Cloud Database

## Inteligência Artificial

* Scikit-Learn
* Pandas
* NumPy

## APIs Externas

* Open-Meteo API

---

# Estrutura do Projeto

```text
nutri-esportiva/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── routers/
│   ├── services/
│   ├── models/
│   ├── database/
│   └── main.py
│
├── docs/
│   ├── screenshots/
│   └── diagrams/
│
└── README.md
```

---

# Demonstração

## Fluxo do Atleta

* Pré-Sessão <img width="1912" height="797" alt="tela pre sessao - atleta" src="https://github.com/user-attachments/assets/5d55e1c2-a90d-45d7-8aea-e4591cdbe99f" />
* Durante o Treino <img width="1911" height="818" alt="tela durante sessao - atleta" src="https://github.com/user-attachments/assets/321741c4-9e2f-4512-99d2-e88dad8b5723" />
* Pós-Sessão <img width="1888" height="867" alt="tela pos sessao - atleta" src="https://github.com/user-attachments/assets/234ece6f-95c2-4ee8-ae98-644b1bf7646f" />
* Recomendação <img width="1887" height="850" alt="analise de recomendacao - atleta" src="https://github.com/user-attachments/assets/2fba86fc-7690-4fbb-bc8b-a4916ed13e16" />


## Fluxo Profissional

* Dashboard
* Relatórios
* Histórico
* Gestão de Atletas

---

# Relatórios

O sistema permite exportar:

* Relatório Individual (PDF);
* Relatório Consolidado da Equipe (PDF);

---

# Instalação

## Clonar Repositório

```bash
git clone https://github.com/seu-usuario/nutri-esportiva.git

cd nutri-esportiva
```

## Frontend

```bash
npm install
npm run dev
```

Aplicação disponível em:

```text
http://localhost:5173
```

---

## Backend

```bash
cd backend

python -m venv .venv

source .venv/bin/activate
# Linux

.venv\Scripts\activate
# Windows

pip install -r requirements.txt

uvicorn main:app --reload
```

Backend disponível em:

```text
http://localhost:8000
```

---

# Segurança

O sistema utiliza:

* JWT Authentication;
* Controle de acesso baseado em perfis (RBAC);
* Proteção de rotas;
* Sessões autenticadas.
* 
---

# Licença

Projeto desenvolvido para fins acadêmicos e educacionais.
