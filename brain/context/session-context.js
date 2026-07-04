function sessionContext(input = {}) {
  const session = input.currentSession || input.session || null;
  const user = input.currentUser || input.user || null;
  const missing = [];
  if (!session) missing.push("currentSession");
  if (!user) missing.push("currentUser");
  return {
    key: "session",
    label: "Session",
    score: missing.length ? 84 : 100,
    missing,
    data: { session: session || { status: "not_attached" }, user: user || { status: "not_attached" } }
  };
}

module.exports = { sessionContext };
