const { createDatabaseClient } = require("../core/database-client");
const { databaseResponse } = require("../core/database-errors");
const { validateRecord } = require("../core/database-validator");
const { id } = require("../json-store");

function normalizeRecord(schema, record = {}) {
  const now = new Date().toISOString();
  return {
    id: record.id || id(schema.table),
    status: "active",
    metadata: {},
    created_at: now,
    updated_at: now,
    created_by: record.created_by || record.createdBy || "system",
    updated_by: record.updated_by || record.updatedBy || "system",
    ...record
  };
}

function createRepository(schema, options = {}) {
  const client = createDatabaseClient(options);
  const collection = options.collection || schema.table;
  const fields = schema.searchFields || [];
  return {
    create(record = {}) {
      const item = normalizeRecord(schema, record);
      const validation = validateRecord(schema, item);
      if (!validation.ok) return databaseResponse(false, null, validation.errors.join(","));
      return client.create(collection, item);
    },
    findById(id) {
      return client.findById(collection, id);
    },
    findAll(filters = {}) {
      return client.findAll(collection, filters);
    },
    update(id, patch = {}) {
      return client.update(collection, id, { ...patch, updated_at: new Date().toISOString() });
    },
    remove(id) {
      return client.remove(collection, id);
    },
    search(query) {
      return client.search(collection, query, fields);
    },
    paginate(options = {}) {
      return client.findAll(collection, options.filters || {}).then((result) => {
        if (!result.ok) return result;
        const page = Math.max(1, Number(options.page || 1));
        const pageSize = Math.max(1, Math.min(100, Number(options.pageSize || 25)));
        const start = (page - 1) * pageSize;
        return databaseResponse(true, {
          items: result.data.slice(start, start + pageSize),
          page,
          pageSize,
          total: result.data.length
        });
      });
    },
    validate(record = {}) {
      return databaseResponse(true, validateRecord(schema, normalizeRecord(schema, record)));
    },
    schema
  };
}

module.exports = {
  createRepository
};
