function customerContext(input = {}) {
  const customer = input.currentCustomer || input.customer || null;
  return {
    key: "customer",
    label: "Customer",
    score: customer ? 100 : 70,
    missing: customer ? [] : ["currentCustomer"],
    data: customer || { status: "not_selected" }
  };
}

module.exports = { customerContext };
