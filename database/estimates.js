const { database } = require("./index");

const db = database();
const fields = ["customerName", "email", "service", "city", "status", "notes"];

module.exports = {
  create: (record) => db.createResult("estimates", record),
  list: (filters) => db.listResult("estimates", filters),
  getById: (id) => db.getByIdResult("estimates", id),
  update: (id, patch) => db.updateResult("estimates", id, patch),
  remove: (id) => db.removeResult("estimates", id),
  search: (query) => db.searchResult("estimates", query, fields)
};
