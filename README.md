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
