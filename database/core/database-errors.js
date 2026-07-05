function databaseResponse(ok, data, error, meta) {
  return ok
    ? { ok: true, data, ...(meta || {}) }
    : { ok: false, error: String(error || "database_error"), ...(meta || {}) };
}

function databaseError(message, where, meta) {
  return databaseResponse(false, null, message, { where, ...(meta || {}) });
}

module.exports = {
  databaseError,
  databaseResponse
};
