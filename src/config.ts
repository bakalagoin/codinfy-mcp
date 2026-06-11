/**
 * Runtime configuration — everything comes from env vars (rule R1: no
 * credential is ever hardcoded or shipped in this public package).
 */
export interface CodinfyConfig {
  /** REST API base, e.g. https://api.codinfy.com/api */
  apiBase: string;
  /** Public site base (used for human-facing links). */
  siteBase: string;
  /**
   * License HMAC secret delivered with a Codinfy license. Required only
   * by the license tools; catalog/health/design tools work without it.
   */
  licenseSecret: string | null;
  /**
   * Public API key (pk_live_… / pk_sandbox_…). Forwarded when present;
   * key issuance ships with the Codinfy developer portal (AGENT-15).
   */
  apiKey: string | null;
}

export const PACKAGE_NAME = "@codinfy/mcp";
export const PACKAGE_VERSION = "0.2.0";

export function loadConfig(env: NodeJS.ProcessEnv = process.env): CodinfyConfig {
  return {
    apiBase: (env.CODINFY_API_BASE ?? "https://api.codinfy.com/api").replace(/\/+$/, ""),
    siteBase: (env.CODINFY_SITE_BASE ?? "https://codinfy.com").replace(/\/+$/, ""),
    licenseSecret: env.CODINFY_LICENSE_SECRET?.trim() || null,
    apiKey: env.CODINFY_API_KEY?.trim() || null,
  };
}
