const fastifyFactory = require('fastify');
const { port, logsLevel } = require('../../config/index');
const { usersService } = require('../../services');
const { recipesService } = require('../../services');

const start = () => {
    //Создание сервера
    const fastify = fastifyFactory({ 
        logger: { 
            level: logsLevel,
            transport: {
                target: 'pino-pretty',
                options: {
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
                },
            },
        } 
    });

    // Подставляем в запросы id пользователя
    fastify.addHook('preParsing', async (request) => {
        const cookiesHeader = request.headers.cookie;
        if (cookiesHeader) {
            const cookiesArray = cookiesHeader.split(';');
            const cookies = cookiesArray.reduce((object, cookie) => {
                const [key, value] = cookie.split('=');
                object[key] = value;
                return object;
            }, {});
    
            const sessionIdCookieId = cookies['session_id'];
            if (sessionIdCookieId) {
                const userId = await usersService.getSessionUserId(sessionIdCookieId);
                request.local = { userId };
            }
        }
    });

    // Создание нового пользователя и вход
    fastify.post('/users', async (request, reply) => {
        const { email, password } = request.body;
        const { userId, sessionId } = await usersService.createUserAndLogin(email, password);
        reply.header('Set-Cookie', `session_id=${sessionId}; HttpOnly; Path=/`);

        reply.send({ userId });
    });

    // Редактирование данных пользователя
    fastify.patch('/users', async (request, reply) => {
        const userId = request.local.userId;
        const { email, password } = request.body;
        await usersService.updateUser(userId, email, password);
        reply.send({ message: 'User updated successfully' });
    });

    // Удаление пользователя
    fastify.delete('/users', async (request, reply) => {
        const userId = request.local.userId;
        await usersService.deleteUser(userId);
        reply.header('Set-Cookie', `session_id=; HttpOnly; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`);
        reply.send({ message: 'User deleted successfully' });
    });

    // Вход пользователя
    fastify.post('/login', async (request, reply) => {
        const { email, password } = request.body;
        const sessionId = await usersService.loginUser(email, password);
        if (sessionId) {
            reply.header('Set-Cookie', `session_id=${sessionId}; HttpOnly; Path=/`);
            reply.send({ message: 'Logged in successfully' });
        } else {
            reply.status(401).send({ message: 'Invalid credentials' });
        }
    });

    // Выход пользователя (удаление сессии)
    fastify.post('/logout', async (request, reply) => {
        const cookiesHeader = request.headers.cookie; 
        if (cookiesHeader) {
            const cookiesArray = cookiesHeader.split(';');
            const cookies = cookiesArray.reduce((object, cookie) => {
                const [key, value] = cookie.split('=');
                object[key] = value;
                return object;
            }, {});
            const sessionId = cookies['session_id'];
            if (sessionId) {
                await usersService.logoutUser(sessionId);
                reply.header('Set-Cookie', `session_id=; HttpOnly; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`);
                reply.send({ message: 'Logged out successfully' });
            } else {
                reply.status(401).send({ message: 'Not logged in' });
            }  
        }
    });

    // Получения всех категорий, в которых есть хотя бы один рецепт
    fastify.get('/categories', async (request, reply) => {
        const userId = request.local.userId;
        const categories = await recipesService.getCategoriesWithRecipes(userId);
        reply.send(categories);
    });

    // Получения всех рецептов категории
    fastify.get('/categories/:categoryId', async (request, reply) => {
        const userId = request.local.userId;
        const categoryId = request.params.categoryId;
        const recipes = await recipesService.getRecipesByCategory(categoryId, userId);
        reply.send(recipes);
    });
    
    // Получения конкретного рецепта
    fastify.get('/recipes/:recipeId', async (request, reply) => {
        const recipeId = request.params.recipeId;
        const recipe = await recipesService.getRecipeById(recipeId);
        reply.send(recipe);
    });
    
    // Проверка владельца рецепта
    fastify.get('/recipes/:recipeId/check-owner', async (request, reply) => {
        const userId = request.local.userId;
        const recipeId = request.params.recipeId;
        const isOwner = await recipesService.isRecipeOwner(recipeId, userId);
        reply.send({ isOwner });
    });
    
    // Добавления рецепта
    fastify.post('/recipes', async (request, reply) => {
        const userId = request.local.userId;
        const { name, description, image, category, ingredients, cookingSteps } = request.body;
        await recipesService.addRecipe(name, description, image, category, ingredients, cookingSteps, userId);
        reply.send({ message: 'Рецепт добавлен успешно' });
    });
    
    // Редактирования рецепта
    fastify.patch('/recipes/:recipeId', async (request, reply) => {
        const userId = request.local.userId;
        const recipeId = request.params.recipeId;
        const { name, description, image, category, ingredients, cookingSteps } = request.body;
        await recipesService.updateRecipe(recipeId, name, description, image, category, ingredients, cookingSteps, userId);
        reply.send({ message: 'Рецепт обновлен успешно' });
    });
    
    // Удаление рецепта
    fastify.delete('/recipes/:recipeId', async (request, reply) => {
        const userId = request.local.userId;
        const recipeId = request.params.recipeId;
        await recipesService.deleteRecipe(recipeId, userId);
        reply.send({ message: 'Рецепт удален успешно' });
    });

    fastify.listen({ port, host: '0.0.0.0' });
};

module.exports = { start };
