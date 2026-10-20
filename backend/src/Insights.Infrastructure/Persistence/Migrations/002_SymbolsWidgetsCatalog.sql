-- Customer-style SQL Server catalog for dashboards, widgets, and visual symbols
-- derived from Al Nas Hospital Figma/UI mockups (Platform.Docs/Executive Dashboard/UI Mockups).

IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = N'meta')
    EXEC(N'CREATE SCHEMA meta');

IF OBJECT_ID(N'meta.Dashboard', N'U') IS NULL
BEGIN
    CREATE TABLE meta.Dashboard
    (
        dashboard_id    NVARCHAR(20)   NOT NULL CONSTRAINT PK_meta_Dashboard PRIMARY KEY,
        name            NVARCHAR(120)  NOT NULL,
        business_area   NVARCHAR(200)  NOT NULL,
        sort_order      INT            NOT NULL,
        nav_symbol_key  NVARCHAR(80)   NOT NULL,
        is_active       BIT            NOT NULL CONSTRAINT DF_meta_Dashboard_active DEFAULT (1)
    );
END;

IF OBJECT_ID(N'meta.Symbol', N'U') IS NULL
BEGIN
    CREATE TABLE meta.Symbol
    (
        symbol_key      NVARCHAR(80)   NOT NULL CONSTRAINT PK_meta_Symbol PRIMARY KEY,
        name            NVARCHAR(200)  NOT NULL,
        category        NVARCHAR(100)  NOT NULL,
        symbol_kind     NVARCHAR(80)   NOT NULL,
        asset_hint      NVARCHAR(200)  NULL,
        description     NVARCHAR(500)  NULL,
        is_active       BIT            NOT NULL CONSTRAINT DF_meta_Symbol_active DEFAULT (1)
    );
END;

IF OBJECT_ID(N'meta.Widget', N'U') IS NULL
BEGIN
    CREATE TABLE meta.Widget
    (
        widget_id           NVARCHAR(20)   NOT NULL CONSTRAINT PK_meta_Widget PRIMARY KEY,
        dashboard_id        NVARCHAR(20)   NOT NULL,
        canonical_kpi_id    NVARCHAR(80)   NOT NULL,
        display_name        NVARCHAR(200)  NOT NULL,
        section_name        NVARCHAR(120)  NULL,
        widget_type         NVARCHAR(80)   NOT NULL,
        unit_hint           NVARCHAR(40)   NULL,
        primary_symbol_key  NVARCHAR(80)   NULL,
        sort_order          INT            NOT NULL CONSTRAINT DF_meta_Widget_sort DEFAULT (0),
        mapping_status      NVARCHAR(40)   NOT NULL,
        mockup_notes        NVARCHAR(500)  NULL,
        CONSTRAINT FK_meta_Widget_Dashboard FOREIGN KEY (dashboard_id) REFERENCES meta.Dashboard(dashboard_id)
    );
END;

IF OBJECT_ID(N'meta.WidgetSymbol', N'U') IS NULL
BEGIN
    CREATE TABLE meta.WidgetSymbol
    (
        widget_id   NVARCHAR(20) NOT NULL,
        symbol_key  NVARCHAR(80) NOT NULL,
        role        NVARCHAR(40) NOT NULL CONSTRAINT DF_meta_WidgetSymbol_role DEFAULT (N'primary'),
        CONSTRAINT PK_meta_WidgetSymbol PRIMARY KEY (widget_id, symbol_key, role),
        CONSTRAINT FK_meta_WS_Widget FOREIGN KEY (widget_id) REFERENCES meta.Widget(widget_id),
        CONSTRAINT FK_meta_WS_Symbol FOREIGN KEY (symbol_key) REFERENCES meta.Symbol(symbol_key)
    );
END;

IF OBJECT_ID(N'meta.v_SymbolCatalog', N'V') IS NULL
BEGIN
    EXEC(N'
    CREATE VIEW meta.v_SymbolCatalog
    AS
    SELECT
        s.symbol_key AS SymbolId,
        s.name AS Name,
        s.category AS Category,
        s.symbol_kind AS SymbolKind,
        s.asset_hint AS AssetHint,
        s.description AS Description
    FROM meta.Symbol s
    WHERE s.is_active = 1;
    ');
END;

IF OBJECT_ID(N'meta.v_WidgetCatalog', N'V') IS NULL
BEGIN
    EXEC(N'
    CREATE VIEW meta.v_WidgetCatalog
    AS
    SELECT
        w.widget_id AS SymbolId,
        w.display_name AS Name,
        CONCAT(N''Widget:'', w.widget_type) AS Category,
        w.widget_type AS SymbolKind,
        w.dashboard_id AS AssetHint,
        w.mockup_notes AS Description
    FROM meta.Widget w;
    ');
END;
