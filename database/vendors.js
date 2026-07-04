const { database } = require("./index");

const db = database();
const fields = ["name", "category", "city", "serviceArea", "status", "notes", "email", "phone"];

module.exports = {
  create: (record) => db.createResult("vendors", record),
  list: (filters) => db.listResult("vendors", filters),
  getById: (id) => db.getByIdResult("vendors", id),
  update: (id, patch) => db.updateResult("vendors", id, patch),
  remove: (id) => db.removeResult("vendors", id),
  search: (query) => db.searchResult("vendors", query, fields)
};
