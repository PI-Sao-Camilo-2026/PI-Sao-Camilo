USE master;
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'NutriEsportiva')
    CREATE DATABASE NutriEsportiva;
GO

USE NutriEsportiva;
GO

CREATE TABLE usuarios (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    nome            NVARCHAR(150)   NOT NULL,
    email           NVARCHAR(200)   NOT NULL UNIQUE,
    senha_hash      NVARCHAR(255)   NOT NULL,
    perfil          NVARCHAR(20)    NOT NULL
                        CONSTRAINT chk_perfil CHECK (perfil IN ('atleta','nutricionista','treinador','medico')),
    codigo_anonimizado NVARCHAR(20) UNIQUE,
    ativo           BIT             NOT NULL DEFAULT 1,
    criado_em       DATETIME2       NOT NULL DEFAULT GETDATE(),
    atualizado_em   DATETIME2       NOT NULL DEFAULT GETDATE()
);
GO

CREATE TABLE vinculos_treinador_atleta (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    treinador_id    INT             NOT NULL REFERENCES usuarios(id) ON DELETE NO ACTION,
    atleta_id       INT             NOT NULL REFERENCES usuarios(id) ON DELETE NO ACTION,
    criado_em       DATETIME2       NOT NULL DEFAULT GETDATE(),
    CONSTRAINT uq_vinculo UNIQUE (treinador_id, atleta_id)
);
GO

CREATE TABLE sessoes (
    id                      INT IDENTITY(1,1) PRIMARY KEY,
    atleta_id               INT             NOT NULL REFERENCES usuarios(id),
    registrado_por          INT             NOT NULL REFERENCES usuarios(id),

    -- Dados gerais
    modalidade              NVARCHAR(80),
    duracao_prevista_min    INT,
    duracao_real_min        INT,
    intensidade_percebida   INT             CONSTRAINT chk_intensidade CHECK (intensidade_percebida BETWEEN 1 AND 10),

    -- Dados pré-sessão
    massa_pre_kg            DECIMAL(5,2),
    temperatura_c           DECIMAL(4,1),
    umidade_pct             DECIMAL(4,1),
    exposicao_solar         NVARCHAR(20),   
    cor_urina               INT             CONSTRAINT chk_cor_urina CHECK (cor_urina BETWEEN 1 AND 8),
    sede_nivel              INT             CONSTRAINT chk_sede CHECK (sede_nivel BETWEEN 1 AND 5),
    sintomas_pre            NVARCHAR(500),

    -- Dados pós-sessão
    massa_pos_kg            DECIMAL(5,2),
    vestimenta              NVARCHAR(100),
    fadiga_nivel            INT             CONSTRAINT chk_fadiga CHECK (fadiga_nivel BETWEEN 1 AND 10),
    tolerancia_hidrica      INT             CONSTRAINT chk_tolerancia CHECK (tolerancia_hidrica BETWEEN 1 AND 5),
    sintomas_gi             NVARCHAR(500),  


    total_ingestao_ml       INT,
    total_urina_ml          INT,
    taxa_sudorese_lh        DECIMAL(5,3),
    variacao_massa_pct      DECIMAL(5,2),
    perda_ajustada_l        DECIMAL(5,3),
    balanco_hidrico_ml      INT,
    recomendacao_ml_h       INT,
    faixa_alvo_min_ml_h     INT,
    faixa_alvo_max_ml_h     INT,

    anomalia_detectada      BIT             DEFAULT 0,
    predicao_taxa           DECIMAL(5,3),

    status                  NVARCHAR(20)    NOT NULL DEFAULT 'em_andamento'
                                CONSTRAINT chk_status CHECK (status IN ('em_andamento','concluida','cancelada')),
    cidade                  NVARCHAR(100),
    criada_em               DATETIME2       NOT NULL DEFAULT GETDATE(),
    concluida_em            DATETIME2
);
GO

CREATE TABLE ingestoes_fluidos (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    sessao_id       INT             NOT NULL REFERENCES sessoes(id) ON DELETE CASCADE,
    volume_ml       INT             NOT NULL,
    tipo            NVARCHAR(50),   -- 'squeeze_250','squeeze_500','copo_200','garrafa_750','garrafa_1000','manual'
    registrado_em   DATETIME2       NOT NULL DEFAULT GETDATE()
);
GO


CREATE TABLE volumes_urinarios (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    sessao_id       INT             NOT NULL REFERENCES sessoes(id) ON DELETE CASCADE,
    volume_ml       INT             NOT NULL,
    registrado_em   DATETIME2       NOT NULL DEFAULT GETDATE()
);
GO

CREATE TABLE alertas (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    sessao_id       INT             NOT NULL REFERENCES sessoes(id) ON DELETE CASCADE,
    tipo            NVARCHAR(50)    NOT NULL
                        CONSTRAINT chk_tipo_alerta CHECK (tipo IN (
                            'desidratacao','superingestao','taxa_implausivel','anomalia')),
    mensagem        NVARCHAR(500)   NOT NULL,
    lido            BIT             NOT NULL DEFAULT 0,
    gerado_em       DATETIME2       NOT NULL DEFAULT GETDATE()
);
GO

-- ============================================================
-- 7. REFRESH TOKENS
-- ============================================================
CREATE TABLE refresh_tokens (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    usuario_id      INT             NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    token_hash      NVARCHAR(255)   NOT NULL UNIQUE,
    expira_em       DATETIME2       NOT NULL,
    revogado        BIT             NOT NULL DEFAULT 0,
    criado_em       DATETIME2       NOT NULL DEFAULT GETDATE()
);
GO

CREATE INDEX idx_sessoes_atleta     ON sessoes(atleta_id, criada_em DESC);
CREATE INDEX idx_sessoes_status     ON sessoes(status);
CREATE INDEX idx_alertas_sessao     ON alertas(sessao_id);
CREATE INDEX idx_vinculos_treinador ON vinculos_treinador_atleta(treinador_id);
CREATE INDEX idx_refresh_usuario    ON refresh_tokens(usuario_id);
GO

CREATE VIEW vw_resumo_sessoes AS
SELECT
    s.id,
    s.atleta_id,
    u.nome           AS atleta_nome,
    u.codigo_anonimizado,
    s.modalidade,
    s.criada_em,
    s.status,
    s.taxa_sudorese_lh,
    s.variacao_massa_pct,
    s.balanco_hidrico_ml,
    s.recomendacao_ml_h,
    s.anomalia_detectada,
    COUNT(a.id)      AS total_alertas
FROM sessoes s
JOIN usuarios u ON u.id = s.atleta_id
LEFT JOIN alertas a ON a.sessao_id = s.id
GROUP BY
    s.id, s.atleta_id, u.nome, u.codigo_anonimizado,
    s.modalidade, s.criada_em, s.status, s.taxa_sudorese_lh,
    s.variacao_massa_pct, s.balanco_hidrico_ml, s.recomendacao_ml_h,
    s.anomalia_detectada;
GO

CREATE PROCEDURE sp_fechar_sessao
    @sessao_id INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE
        @massa_pre      DECIMAL(5,2),
        @massa_pos      DECIMAL(5,2),
        @duracao_h      DECIMAL(6,4),
        @ingestao_l     DECIMAL(8,3),
        @urina_l        DECIMAL(8,3),
        @perda_ajust    DECIMAL(8,3),
        @taxa           DECIMAL(5,3),
        @variacao       DECIMAL(5,2),
        @balanco        INT,
        @recomendacao   INT;

    SELECT @massa_pre = massa_pre_kg, @massa_pos = massa_pos_kg,
           @duracao_h = CAST(duracao_real_min AS DECIMAL) / 60.0
    FROM sessoes WHERE id = @sessao_id;

    SELECT @ingestao_l = ISNULL(SUM(volume_ml),0) / 1000.0
    FROM ingestoes_fluidos WHERE sessao_id = @sessao_id;

    SELECT @urina_l = ISNULL(SUM(volume_ml),0) / 1000.0
    FROM volumes_urinarios WHERE sessao_id = @sessao_id;

    SET @perda_ajust = (@massa_pre - @massa_pos) + @ingestao_l - @urina_l;
    SET @taxa        = CASE WHEN @duracao_h > 0 THEN @perda_ajust / @duracao_h ELSE 0 END;
    SET @variacao    = (@massa_pre - @massa_pos) / @massa_pre * 100;
    SET @balanco     = CAST((@ingestao_l - (@massa_pre - @massa_pos)) * 1000 AS INT);
    SET @recomendacao = CAST(@taxa * 800 AS INT);  -- 80% da taxa

    UPDATE sessoes SET
        total_ingestao_ml  = CAST(@ingestao_l * 1000 AS INT),
        total_urina_ml     = CAST(@urina_l * 1000 AS INT),
        perda_ajustada_l   = ROUND(@perda_ajust, 3),
        taxa_sudorese_lh   = ROUND(@taxa, 3),
        variacao_massa_pct = ROUND(@variacao, 2),
        balanco_hidrico_ml = @balanco,
        recomendacao_ml_h  = @recomendacao,
        faixa_alvo_min_ml_h = CAST(@recomendacao * 0.9 AS INT),
        faixa_alvo_max_ml_h = CAST(@recomendacao * 1.1 AS INT),
        status             = 'concluida',
        concluida_em       = GETDATE()
    WHERE id = @sessao_id;

    IF @variacao > 2.0
        INSERT INTO alertas (sessao_id, tipo, mensagem)
        VALUES (@sessao_id, 'desidratacao',
            CONCAT('Perda de ', CAST(ROUND(@variacao,1) AS NVARCHAR), '% da massa corporal — risco de desidratação.'));

    IF @balanco > 500
        INSERT INTO alertas (sessao_id, tipo, mensagem)
        VALUES (@sessao_id, 'superingestao', 'Ingestão hídrica acima do recomendado — risco de hiperidratação.');

    IF @taxa > 3.0 OR @taxa < 0.1
        INSERT INTO alertas (sessao_id, tipo, mensagem)
        VALUES (@sessao_id, 'taxa_implausivel',
            CONCAT('Taxa de sudorese de ', CAST(ROUND(@taxa,2) AS NVARCHAR), ' L/h fora do intervalo esperado.'));
END;
GO

PRINT 'Schema NutriEsportiva criado com sucesso.';
