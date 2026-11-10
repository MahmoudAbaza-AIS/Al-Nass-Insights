/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Insights API base (relative `/api/v1` or absolute). No secrets. */
  readonly VITE_API_BASE_URL?: string;
  /** Public dashboard origin (informational). */
  readonly VITE_DASHBOARD_PUBLIC_URL?: string;
  /** Vite dev-server proxy target for /api (and related paths). */
  readonly VITE_DEV_PROXY_TARGET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
