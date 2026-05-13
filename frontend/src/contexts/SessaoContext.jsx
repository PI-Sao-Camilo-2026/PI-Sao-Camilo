import React, { createContext, useContext, useState } from 'react';

/**
 * SessaoContext
 * Mantém o estado da sessão de treino em curso (pré → durante → pós).
 * Evita passar sessao_id por params em cada tela.
 */
const SessaoContext = createContext(null);

export function SessaoProvider({ children }) {
    const [sessaoId, setSessaoId] = useState(null);
    const [dadosPre, setDadosPre] = useState(null);   // payload do pré-treino
    const [ingestao, setIngestao] = useState(0);       // ml acumulados (durante)
    const [resultado, setResultado] = useState(null);   // resposta do pós-treino

    function iniciarSessao(id, dados) {
        setSessaoId(id);
        setDadosPre(dados);
        setIngestao(0);
        setResultado(null);
    }

    function atualizarIngestao(totalMl) {
        setIngestao(totalMl);
    }

    function finalizarSessao(res) {
        setResultado(res);
    }

    function resetar() {
        setSessaoId(null);
        setDadosPre(null);
        setIngestao(0);
        setResultado(null);
    }

    return (
        <SessaoContext.Provider
            value={{
                sessaoId,
                dadosPre,
                ingestao,
                resultado,
                iniciarSessao,
                atualizarIngestao,
                finalizarSessao,
                resetar,
            }}
        >
            {children}
        </SessaoContext.Provider>
    );
}

export function useSessao() {
    const ctx = useContext(SessaoContext);
    if (!ctx) throw new Error('useSessao deve ser usado dentro de <SessaoProvider>');
    return ctx;
}