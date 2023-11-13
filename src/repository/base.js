const { mapKeys, camelCase } = require('lodash');

const errorMapper = (error) => {
  throw error;
};

const getOffset = (limit, page) => (page - 1) * limit;

/**
 * @typedef {import('knex').Knex} Knex
 * @typedef {import('knex').Knex.Transaction} KnexTransaction
 */

class BaseTransactionRepository {
  /**
   * Main database instance. (Knex instance)
   * @type {Knex}
   */
  db = null;

  /**
   * Relation(Table) name.
   * @type {String}
   */
  relation = '';

  /**
   * Transform case for result fields in standart CRUD operations.
   * @type {Boolean}
   */
  transformCase = true;

  /**
   * @param {Knex} db
   * @param {string} relation
   */
  constructor(db, relation) {
    this.db = db;
    this.relation = relation;
  }

  /**
   * @returns {Promise<BaseTransaction>}
   */
  async transaction() {
    return new BaseTransaction(await this.db.transaction());
  }

  /**
   * Impleemnt this. Method Should return instance of this class that use db instance within transaction.
   * @param {BaseTransaction} transaction
   */
  transacting() {
    throw new Error('Not implementing.');
  }

  /**
   * Run queries inside transactions. Helper method to avoid boilerplate code.
   * @param {(repository: this, transaction: BaseTransaction) => Promise<*>} callback
   * @param {BaseTransaction} trx
   */
  async runTransaction(callback, trx) {
    const transaction = trx || (await this.transaction());
    try {
      const repository = this.transacting(transaction);
      const result = await callback(repository, transaction);
      if (!trx) await transaction.commit();
      return result;
    } catch (error) {
      if (!trx) await transaction.rollback();
      throw error;
    }
  }

  /**
   * Helper method for standart CRUD operations.
   * @param {Promise<*>} query Knex query.
   * @param {Boolean} single Get first entry of result and return as single object.
   * @returns {Promise<Object | Array<Object>>} Result of the query.
   */
  async #processQuery(query, single = true) {
    const result = this.transformCase
      ? await this.transformResultCase(query)
      : query;
    return single ? result[0] || null : result;
  }

  create(entity = {}) {
    return this.#processQuery(
      this.db(this.relation).insert(entity).returning('*')
    );
  }

  get(condition = {}) {
    return this.#processQuery(
      this.db.select('*').from(this.relation).where(condition)
    );
  }

  getAll(condition = {}) {
    return this.#processQuery(
      this.db.select('*').from(this.relation).where(condition),
      false
    );
  }

  remove(condition = {}) {
    return this.#processQuery(
      this.db(this.relation).where(condition).del().returning('*')
    );
  }

  update(condition = {}, fields = {}) {
    return this.#processQuery(
      this.db(this.relation).update(fields).where(condition).returning('*')
    );
  }

  async count(condition = {}, field = 'id') {
    const { count } = await this.#processQuery(
      this.db(this.relation).count(field).where(condition)
    );
    return count;
  }

  /**
   * Transform all result entries to camelCase.
   * @param {Promise<*>} query Database running query.
   * @returns {Promise<Object>} Transformed result array.
   */
  async transformResultCase(query) {
    const result = await query.catch(errorMapper);
    return result.map((entry) => {
      return mapKeys(entry, (_, key) => camelCase(key));
    });
  }
}

class BaseTransaction {
  /**
   * @type {KnexTransaction}
   */
  #transaction = null;

  /**
   * @param {Knex} transaction
   */
  constructor(transaction) {
    this.#transaction = transaction;
  }

  commit() {
    if (this.#transaction) return this.#transaction.commit();
  }

  rollback() {
    if (this.#transaction) return this.#transaction.rollback();
  }

  /**
   * @returns {KnexTransaction}
   */
  getDatabaseInstance() {
    return this.#transaction;
  }
}

module.exports = {
  BaseTransactionRepository,
  errorMapper,
  getOffset,
};
