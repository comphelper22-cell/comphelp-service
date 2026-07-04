const { database } = require("./index");

const db = database();
const fields = ["title", "owner", "status", "priority", "relatedType", "notes"];

module.exports = {
  create: (record) => db.createResult("tasks", record),
  list: (filters) => db.listResult("tasks", filters),
  getById: (id) => db.getByIdResult("tasks", id),
  update: (id, patch) => db.updateResult("tasks", id, patch),
  remove: (id) => db.removeResult("tasks", id),
  search: (query) => db.searchResult("tasks", query, fields)
};
