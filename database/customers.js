const { database } = require("./index");

const db = database();
const fields = ["name", "phone", "email", "city", "status", "notes"];

module.exports = {
  create: (record) => db.createResult("customers", record),
  list: (filters) => db.listResult("customers", filters),
  getById: (id) => db.getByIdResult("customers", id),
  update: (id, patch) => db.updateResult("customers", id, patch),
  remove: (id) => db.removeResult("customers", id),
  search: (query) => db.searchResult("customers", query, fields)
};
