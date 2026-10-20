-- Application-owned auth schema (local JWT users). Never target customer Oracle.

IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = N'auth')
    EXEC(N'CREATE SCHEMA auth');

IF OBJECT_ID(N'auth.Users', N'U') IS NULL
BEGIN
    CREATE TABLE auth.Users
    (
        user_id             UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_auth_Users PRIMARY KEY
                            CONSTRAINT DF_auth_Users_id DEFAULT (NEWSEQUENTIALID()),
        username            NVARCHAR(100)  NOT NULL,
        email               NVARCHAR(256)  NULL,
        password_hash       NVARCHAR(500)  NOT NULL,
        display_name        NVARCHAR(200)  NOT NULL,
        organization        NVARCHAR(200)  NOT NULL,
        roles               NVARCHAR(500)  NOT NULL,
        dashboards          NVARCHAR(500)  NOT NULL CONSTRAINT DF_auth_Users_dashboards DEFAULT (N'*'),
        is_active           BIT            NOT NULL CONSTRAINT DF_auth_Users_active DEFAULT (1),
        created_at_utc      DATETIME2      NOT NULL,
        last_login_at_utc   DATETIME2      NULL,
        CONSTRAINT UQ_auth_Users_username UNIQUE (username)
    );

    CREATE INDEX IX_auth_Users_active ON auth.Users (is_active) INCLUDE (username);
END;
