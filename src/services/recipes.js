const { resipesRepository } = require('../repository');

class RecipesService {
  /**
   * Получения всех категорий, в которых есть хотя бы один рецепт
   * @param {UUID} userId - Идентификатор пользователя
   * @returns 
   */
  async getCategoriesWithRecipes(userId) {
    return await resipesRepository.getCategoriesWithRecipes(userId);
  }
  
  /**
   * Получения всех рецептов категории
   * @param {number} categoryId - Идентификатор категории
   * @param {UUID} userId - Идентификатор пользователя
   * @returns 
   */
  async getRecipesByCategory(categoryId, userId) {
    return await resipesRepository.getRecipesByCategory(categoryId, userId);
  }
  
  /**
   * Получения конкретного рецепта
   * @param {number} recipeId - Идентификатор рецепта
   * @param {UUID} userId - Идентификатор пользователя
   * @returns 
   */
  async getRecipeById(recipeId) {
    return await resipesRepository.getRecipeById(recipeId);
  }

  /**
   * Проверка владельца рецепта
   * @param {number} recipeId - Идентификатор рецепта
   * @param {UUID} userId - Идентификатор пользователя
   * @returns {boolean} - Возвращает true, если пользователь является владельцем рецепта, в противном случае - false
   */
  async isRecipeOwner(recipeId, userId) {
    return await resipesRepository.isRecipeOwner(recipeId, userId);
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
    return await resipesRepository.addRecipe(name, description, image, category, ingredients, cookingSteps, userId);
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
    return await resipesRepository.updateRecipe(recipeId, name, description, image, category, ingredients, cookingSteps, userId);
  }
  
  /**
   * Удаление рецепта
   * @param {number} recipeId - Идентификатор рецепта
   * @param {UUID} userId - Идентификатор пользователя
   * @returns 
   */
  async deleteRecipe(recipeId, userId) {
    return await resipesRepository.deleteRecipe(recipeId, userId);
  } 
}

module.exports = {
  recipesService: new RecipesService(),
};
