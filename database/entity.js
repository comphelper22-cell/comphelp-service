const { database } = require("./index");

function createEntityModule(collection, fields) {
  const db = database();
  return {
    create: (record) => db.createResult(collection, record),
    list: (filters) => db.listResult(collection, filters),
    getById: (id) => db.getByIdResult(collection, id),
    update: (id, patch) => db.updateResult(collection, id, patch),
    remove: (id) => db.removeResult(collection, id),
    search: (query) => db.searchResult(collection, query, fields)
  };
}

module.exports = { createEntityModule };
