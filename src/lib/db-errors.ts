type DbErrorLike = { code?: string | null; message?: string | null } | null | undefined;

// PostgREST / Postgres codes for "this table, view or function does not exist (yet)".
const MISSING_CODES = new Set(["PGRST202", "PGRST205", "42P01", "42883"]);

/** True when the database has not been migrated with the objects a feature needs. */
export function isMissingRelationError(error: DbErrorLike) {
  if (!error) return false;
  if (error.code && MISSING_CODES.has(error.code)) return true;
  return /schema cache|does not exist/i.test(error.message ?? "");
}

export function isNetworkError(error: DbErrorLike) {
  return /failed to fetch|networkerror|load failed|network request failed/i.test(
    error?.message ?? "",
  );
}
