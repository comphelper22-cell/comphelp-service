function passwordReset(input = {}) {
  return {
    ok: true,
    data: {
      resetSent: false,
      email: input.email ? "provided" : "missing",
      passwordStored: false,
      message: "Password reset flow placeholder; no email is sent."
    }
  };
}

module.exports = {
  passwordReset
};
