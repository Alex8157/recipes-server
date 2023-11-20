const { db } = require('../storage');
const { BaseTransactionRepository } = require('./base');

class ResipesRepository extends BaseTransactionRepository {
  constructor(db) {
    super(db, 'recipes');
  }
  
  /**
   * Получения всех категорий, в которых есть хотя бы один рецепт
   * @param {UUID} userId - Идентификатор пользователя
   * @returns 
   */
  async getCategoriesWithRecipes(userId) {
    return await this.db
    .select('category.name')
    .from('category')
    .join('recipes', 'category.id', '=', 'recipes.category')
    .where('recipes.user_id', '=', userId);
  }
  
  /**
   * Получения всех рецептов категории
   * @param {number} categoryId - Идентификатор категории
   * @param {UUID} userId - Идентификатор пользователя
   * @returns 
   */
  async getRecipesByCategory(categoryId, userId) {
    return await this.db
    .select('*')
    .from('recipes')
    .where({ category: categoryId, user_id: userId });
  }
  
  /**
   * Получения конкретного рецепта
   * @param {number} recipeId - Идентификатор рецепта
   * @returns 
   */
  async getRecipeById(recipeId) {
    return await this.db
    .select('*')
    .from('recipes')
    .where({ id: recipeId});
  }
  
  /**
   * Получения всех рецептов пользователя
   * @param {UUID} userId - Идентификатор пользователя
   * @returns 
   */
  async getAllRecipes(userId) {
    return await this.db
    .select('*')
    .from('recipes')
    .where({ user_id: userId});
  }

  /**
   * Проверка владельца рецепта
   * @param {number} recipeId - Идентификатор рецепта
   * @param {UUID} userId - Идентификатор пользователя
   * @returns {boolean} - Возвращает true, если пользователь является владельцем рецепта, в противном случае - false
   */
  async isRecipeOwner(recipeId, userId) {
    const result = await this.db
      .select('user_id')
      .from('recipes')
      .where({ id: recipeId })
      .first();

    return result.user_id === userId ;
  }
  
  /**
   * Добавления рецепта
   * @param {string} name - Название рецепта
   * @param {string} description - Описание рецепта
   * @param {string} image - Изображение рецепта
   * @param {number} category - Категория рецепта (ID категории)
   * @param {string[]} ingredients - Список ингредиентов
   * @param {string[]} cookingSteps - Список шагов приготовления
   * @param {UUID} userId - Идентификатор пользователя
   * @returns 
   */
  async addRecipe(name, description, image, category, ingredients, cookingSteps, userId) {
    return await this.db('recipes').insert({
      name,
      description,
      image,
      category,
      ingredients,
      cookingSteps: cookingSteps,
      user_id: userId
    });
  }
  
  /**
   * Редактирования рецепта
   * @param {number} recipeId - Идентификатор рецепта
   * @param {string} name - Новое название рецепта
   * @param {string} description - Новое описание рецепта
   * @param {string} image - Новое изображение рецепта
   * @param {number} category - Новая категория рецепта (ID категории)
   * @param {string[]} ingredients - Новый список ингредиентов
   * @param {string[]} cookingSteps - Новый список шагов приготовления
   * @param {UUID} userId - Идентификатор пользователя
   * @returns 
   */
  async updateRecipe(recipeId, name, description, image, category, ingredients, cookingSteps, userId) {
    return await this.db('recipes')
    .where({ id: recipeId, user_id: userId })
    .update({
      name,
      description,
      image,
      category,
      ingredients,
      cookingSteps: cookingSteps
    });
  }
  
  /**
   * Удаление рецепта
   * @param {number} recipeId - Идентификатор рецепта
   * @param {UUID} userId - Идентификатор пользователя
   * @returns 
   */
  async deleteRecipe(recipeId, userId) {
    return await this.db('recipes')
    .where({ id: recipeId, user_id: userId })
    .del();
  }
}

module.exports = {
  resipesRepository: new ResipesRepository(db),
};
