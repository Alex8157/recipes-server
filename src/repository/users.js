const { db } = require('../storage');
const crypto = require('crypto');
const { BaseTransactionRepository } = require('./base');

class UsersRepository extends BaseTransactionRepository {
  constructor(db) {
    super(db, 'recipes');
  }

  /**
   * Создание нового пользователя
   * @param {string} email - Email пользователя
   * @param {string} password - Пароль пользователя
   * @returns {Promise<number>} - ID нового пользователя
   */
  async createUser(email, password) {
    try {
      const hashedPassword = this.hashPassword(password);
      const [userId] = await this.db('users').insert({ email, password: hashedPassword }, ['id']);
      return userId;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Редактирование данных пользователя
   * @param {number} userId - ID пользователя
   * @param {string} email - Новый email пользователя
   * @param {string} password - Новый пароль пользователя
   * @returns {Promise<void>}
   */
  async updateUser(userId, email, password) {
    try {
      const hashedPassword = this.hashPassword(password);
      await this.db('users').where({ id: userId }).update({ email, password: hashedPassword });
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Получение почты авторизации
   * @param {number} userId - ID пользователя
   * @returns {Promise<void>}
   */
  async getEmail(userId) {
    try {
      const email = await this.db('users').where({ id: userId }).select('email');
      if (email.length > 0) {
        return email[0];
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting users data:', error);
      throw error;
    }
  }

  /**
   * Удаление пользователя
   * @param {number} userId - ID пользователя
   * @returns {Promise<void>}
   */
  async deleteUser(userId) {
    try {
      await this.db('sessions').where({ user_id: userId }).del();
      await this.db('recipes').where({ user_id: userId }).del();
      await this.db('users').where({ id: userId }).del();
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  /**
   * Вход пользователя
   * @param {string} email - Email пользователя
   * @param {string} password - Пароль пользователя
   * @returns {Promise<UUID|null>} - UUID сессии или null в случае ошибки
   */
  async loginUser(email, password) {
    try {
      const user = await this.db('users').where({ email }).first();

      if (!user) {
        return null;
      }

      const storedPassword = user.password;
      const passwordMatch = this.comparePasswords(storedPassword, password);

      if (!passwordMatch) {
        return null;
      }

      const sessionId = await this.createSession(user.id);
      return sessionId;
    } catch (error) {
      console.error('Error logging in user:', error);
      throw error;
    }
  }

  /**
   * Выход пользователя (удаление сессии)
   * @param {UUID} sessionId - Идентификатор сессии
   * @returns {Promise<void>}
   */
  async logoutUser(sessionId) {
    try {
      await this.db('sessions').where({ id: sessionId }).del();
    } catch (error) {
      console.error('Error logging out user:', error);
      throw error;
    }
  }

  /**
   * Получение id пользователя по UUID сессии
   * @param {UUID} sessionId - Идентификатор сессии
   * @returns 
   */
  async getSessionUserId(sessionId) {
    try {
        const result = await this.db('sessions').where({ id: sessionId }).select('user_id').first();
        return result ? result.user_id : null;
    } catch (error) {
        console.error('Error getting user id from session:', error);
        return null;
    }
  }

  /**
   * Создание сессии
   * @param {number} userId - ID пользователя
   * @returns {Promise<string>} - UUID сессии
   */
  async createSession(userId) {
    try {
      const sessionId = crypto.randomBytes(16).toString('hex');
      const currentDate = new Date();
      const expirationDate = new Date(currentDate.getTime() + 14 * 24 * 60 * 60 * 1000);
      await this.db('sessions').insert({ id: sessionId, user_id: userId, expiration_date: expirationDate });
      return sessionId;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }

  /**
   * Удаление устаревших сессий
   * @returns {Promise<void>}
   */
  async deleteExpiredSessions() {
    try {
      const currentDate = new Date();
      await this.db('sessions') .where('expiration_date', '<', currentDate).del();
    } catch (error) {
      console.error('Error deleting expired sessions:', error);
      throw error;
    }
  }

  /**
   * Хеширование пароля
   * @param {string} password - Нехешированный пароль
   * @returns {string} - Хеш пароля
   */
  hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto
      .pbkdf2Sync(password, salt, 10000, 64, 'sha512')
      .toString('hex');
    return `${salt}:${hash}`;
  }

  /**
   * Проверка пароля
   * @param {string} storedHash - Хеш пароля с солью
   * @param {string} password - Нехешированный пароль
   * @returns {boolean} - Результат проверки
   */
  comparePasswords(storedHash, password) {
    const [salt, hash] = storedHash.split(':');
    const computedHash = crypto
      .pbkdf2Sync(password, salt, 10000, 64, 'sha512')
      .toString('hex');
    return hash === computedHash;
  }
}

module.exports = {
    usersRepository: new UsersRepository(db),
};
