const { database } = require("./index");

const db = database();
const fields = ["name", "phone", "email", "service", "city", "status", "source", "notes"];

module.exports = {
  create: (record) => db.createResult("leads", record),
  list: (filters) => db.listResult("leads", filters),
  getById: (id) => db.getByIdResult("leads", id),
  update: (id, patch) => db.updateResult("leads", id, patch),
  remove: (id) => db.removeResult("leads", id),
  search: (query) => db.searchResult("leads", query, fields)
};
