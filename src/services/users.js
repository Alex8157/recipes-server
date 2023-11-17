const { usersRepository } = require('../repository');

class UsersService {
  // Создание нового пользователя и вход
  async createUserAndLogin(email, password) {
    const userId = await this.createUser(email, password);
    const sessionId = await this.loginUser(email, password);
    return { userId, sessionId };
  }

  /**
   * Создание нового пользователя
   * @param {string} email - Email пользователя
   * @param {string} password - Пароль пользователя
   * @returns {Promise<number>} - ID нового пользователя
   */
  async createUser(email, password) {
    return await usersRepository.createUser(email, password);
  }

  /**
   * Редактирование данных пользователя
   * @param {number} userId - ID пользователя
   * @param {string} email - Новый email пользователя
   * @param {string} password - Новый пароль пользователя
   * @returns {Promise<void>}
   */
  async updateUser(userId, email, password) {
    return await usersRepository.updateUser(userId, email, password);
  }

  /**
   * Получение почты авторизации
   * @param {number} userId - ID пользователя
   * @returns {Promise<void>}
   */
  async getEmail(userId) {
    return await usersRepository.getEmail(userId);
  }

  /**
   * Удаление пользователя
   * @param {number} userId - ID пользователя
   * @returns {Promise<void>}
   */
  async deleteUser(userId) {
    return await usersRepository.deleteUser(userId);
  }

  /**
   * Вход пользователя
   * @param {string} email - Email пользователя
   * @param {string} password - Пароль пользователя
   * @returns {Promise<UUID|null>} - UUID сессии или null в случае ошибки
   */
  async loginUser(email, password) {
    return await usersRepository.loginUser(email, password);
  }

  /**
   * Выход пользователя (удаление сессии)
   * @param {UUID} sessionId - Идентификатор сессии
   * @returns {Promise<void>}
   */
  async logoutUser(sessionId) {
    return await usersRepository.logoutUser(sessionId);
  }

  /**
   * Получение id пользователя по UUID сессии
   * @param {UUID} sessionId - Идентификатор сессии
   * @returns 
   */
  async getSessionUserId(sessionId) {
    return await usersRepository.getSessionUserId(sessionId)
  }
}

module.exports = {
  usersService: new UsersService(),
};
