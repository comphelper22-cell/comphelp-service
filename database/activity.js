const { database } = require("./index");

const db = database();
const fields = ["type", "message", "actor", "status"];

module.exports = {
  create: (record) => db.createResult("activityLogs", record),
  list: (filters) => db.listResult("activityLogs", filters),
  getById: (id) => db.getByIdResult("activityLogs", id),
  update: (id, patch) => db.updateResult("activityLogs", id, patch),
  remove: (id) => db.removeResult("activityLogs", id),
  search: (query) => db.searchResult("activityLogs", query, fields)
};
