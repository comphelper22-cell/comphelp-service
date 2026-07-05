const assert = require("assert");
const { createRepository } = require("../database/repositories/repository-factory");
const customersSchema = require("../database/schema/customers.schema");
const estimatesSchema = require("../database/schema/estimates.schema");

const customerRepository = createRepository(customersSchema);
const estimateRepository = createRepository(estimatesSchema);

["create", "findById", "findAll", "update", "remove", "search", "paginate", "validate"].forEach((method) => {
  assert.strictEqual(typeof customerRepository[method], "function", `customers repository missing ${method}`);
  assert.strictEqual(typeof estimateRepository[method], "function", `estimates repository missing ${method}`);
});

const invalidCustomer = customerRepository.validate({ name: "No Org Customer", status: "lead" });
assert.strictEqual(invalidCustomer.ok, true);
assert.strictEqual(invalidCustomer.data.ok, false);
assert.ok(invalidCustomer.data.errors.includes("organization_id_required"));

const validEstimate = estimateRepository.validate({
  organization_id: "org_demo",
  customer_id: "customer_demo",
  service: "Security Camera Installation",
  status: "draft",
  recommended_total: 299
});
assert.strictEqual(validEstimate.ok, true);
assert.strictEqual(validEstimate.data.ok, true);

console.log(JSON.stringify({
  ok: true,
  repositoryInterface: "consistent",
  validation: "active"
}, null, 2));
