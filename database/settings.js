const { database } = require("./index");

const db = database();
const fields = ["key", "scope", "status", "notes"];

module.exports = {
  create: (record) => db.createResult("settings", record),
  list: (filters) => db.listResult("settings", filters),
  getById: (id) => db.getByIdResult("settings", id),
  update: (id, patch) => db.updateResult("settings", id, patch),
  remove: (id) => db.removeResult("settings", id),
  search: (query) => db.searchResult("settings", query, fields)
};
