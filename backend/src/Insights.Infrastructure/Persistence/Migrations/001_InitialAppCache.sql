-- Application-owned cache schema only. Never target customer Oracle/SQL Server sources.

IF OBJECT_ID(N'dbo.sync_lease', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.sync_lease
    (
        tier            INT            NOT NULL CONSTRAINT PK_sync_lease PRIMARY KEY,
        holder_id       NVARCHAR(100)  NOT NULL,
        lease_until_utc DATETIME2      NOT NULL
    );
END;

IF OBJECT_ID(N'dbo.sync_run', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.sync_run
    (
        sync_run_id     BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_sync_run PRIMARY KEY,
        tier            INT            NOT NULL,
        started_at_utc  DATETIME2      NOT NULL,
        completed_at_utc DATETIME2     NULL,
        outcome         NVARCHAR(40)   NULL,
        diagnostics     NVARCHAR(2000) NULL
    );
END;

IF OBJECT_ID(N'dbo.kpi_value', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.kpi_value
    (
        kpi_id          NVARCHAR(80)   NOT NULL,
        grain           NVARCHAR(10)   NOT NULL,
        period_start    DATE           NOT NULL,
        dimension_key   NVARCHAR(100)  NOT NULL CONSTRAINT DF_kpi_value_dim DEFAULT (N''),
        numerator       DECIMAL(18,4)  NULL,
        denominator     DECIMAL(18,4)  NULL,
        value           DECIMAL(18,4)  NULL,
        unit            NVARCHAR(40)   NULL,
        is_final        BIT            NOT NULL CONSTRAINT DF_kpi_value_final DEFAULT (0),
        captured_at_utc DATETIME2      NOT NULL,
        query_version   NVARCHAR(80)   NOT NULL,
        sync_run_id     BIGINT         NOT NULL,
        state           NVARCHAR(40)   NOT NULL,
        explanation     NVARCHAR(1000) NULL,
        CONSTRAINT PK_kpi_value PRIMARY KEY (kpi_id, grain, period_start, dimension_key)
    );
END;

IF OBJECT_ID(N'dbo.kpi_value_latest', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.kpi_value_latest
    (
        kpi_id          NVARCHAR(80)   NOT NULL,
        dimension_key   NVARCHAR(100)  NOT NULL CONSTRAINT DF_kpi_latest_dim DEFAULT (N''),
        grain           NVARCHAR(10)   NOT NULL,
        period_start    DATE           NOT NULL,
        numerator       DECIMAL(18,4)  NULL,
        denominator     DECIMAL(18,4)  NULL,
        value           DECIMAL(18,4)  NULL,
        unit            NVARCHAR(40)   NULL,
        is_final        BIT            NOT NULL,
        captured_at_utc DATETIME2      NOT NULL,
        query_version   NVARCHAR(80)   NOT NULL,
        sync_run_id     BIGINT         NOT NULL,
        state           NVARCHAR(40)   NOT NULL,
        explanation     NVARCHAR(1000) NULL,
        CONSTRAINT PK_kpi_value_latest PRIMARY KEY (kpi_id, dimension_key)
    );
END;

IF OBJECT_ID(N'dbo.symbol_metadata', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.symbol_metadata
    (
        symbol_id       NVARCHAR(80)   NOT NULL CONSTRAINT PK_symbol_metadata PRIMARY KEY,
        name            NVARCHAR(200)  NOT NULL,
        category        NVARCHAR(100)  NULL,
        payload_json    NVARCHAR(MAX)  NOT NULL,
        captured_at_utc DATETIME2      NOT NULL,
        source_version  NVARCHAR(80)   NOT NULL
    );
END;
