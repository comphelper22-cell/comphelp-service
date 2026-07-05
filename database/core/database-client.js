const { database } = require("../index");
const { databaseConfig } = require("./database-config");

function createDatabaseClient(options = {}) {
  const db = database(options);
  const config = databaseConfig(options.env || process.env);
  return {
    mode: () => db.mode(),
    config: () => config,
    create: (collection, record) => db.createResult(collection, record),
    findById: (collection, id) => db.getByIdResult(collection, id),
    findAll: (collection, filters) => db.listResult(collection, filters),
    update: (collection, id, patch) => db.updateResult(collection, id, patch),
    remove: (collection, id) => db.removeResult(collection, id),
    search: (collection, query, fields) => db.searchResult(collection, query, fields),
    health: () => db.health()
  };
}

module.exports = {
  createDatabaseClient
};
