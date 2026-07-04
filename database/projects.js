const { database } = require("./index");

const db = database();
const fields = ["title", "customerName", "service", "city", "status", "notes"];

module.exports = {
  create: (record) => db.createResult("projects", record),
  list: (filters) => db.listResult("projects", filters),
  getById: (id) => db.getByIdResult("projects", id),
  update: (id, patch) => db.updateResult("projects", id, patch),
  remove: (id) => db.removeResult("projects", id),
  search: (query) => db.searchResult("projects", query, fields)
};
