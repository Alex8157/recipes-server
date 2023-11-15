const BASE_URL = 'http://localhost:3000';

describe('API Tests', () => {
    const categoryId = 1;
    let recipeId;
    let cookies = {};

    const setCookies = (response) => {
        const cookieHeader = response.headers.get('set-cookie');
        if (!cookieHeader) return;
        for (const header of (typeof cookieHeader === 'string' ? [cookieHeader] : cookieHeader)) {
            const entry = header.split(';')[0];
            const [key, value] = entry.split('=');
            if (value.trim() !== '') {
                cookies[key] = value;
            } else delete cookies[key];
        }
    };

    const getCookies = () => {
        const entries = [];
        for (const [key, value] of Object.entries(cookies)) {
            entries.push(`${key}=${value}`);
        };
        return entries.join(';');
    };

    const requestFetch = async ({URL, method, body = null, clear = false} = {}) => {
        if (clear) cookies = {};
        const header = body ? {'Content-Type': 'application/json'} : {};
        const response = await fetch(`${BASE_URL}${URL}`, {
            method,
            headers: { 
                ...header,
                Cookie: getCookies()
            },
            body: body && JSON.stringify(body)
        });
        setCookies(response);
        return response;
    };

    test ('should register and log in a user', async () => {
        const response = await requestFetch({URL: '/users', method: 'POST', body: { email: 'test@example.com', password: 'password' }});
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toHaveProperty('userId');
        expect(response.headers.get('set-cookie')).toContain('session_id');
    });

    test ('should check the user`s authorization (authorizationed)', async () => {
        const response = await requestFetch({URL: '/check-auth', method: 'GET'});
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toHaveProperty('isAuthenticated', true);
    });

    test ('should update user data', async () => {
        const response = await requestFetch({URL: '/users', method: 'PATCH', body: { email: 'newemail@example.com', password: 'newpassword' }});
        const data = await response.json();
    
        expect(response.status).toBe(200);
        expect(data).toHaveProperty('message', 'User updated successfully');
    });
    

    test ('should log out a user', async () => {
        const response = await requestFetch({URL: '/logout', method: 'POST'});
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toHaveProperty('message', 'Logged out successfully');
    });

    test ('should log in a user', async () => {
        const response = await requestFetch({URL: '/login', method: 'POST', body: { email: 'newemail@example.com', password: 'newpassword' }, clear: true });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toHaveProperty('message', 'Logged in successfully');
        expect(response.headers.get('set-cookie')).toContain('session_id');

        sessionId = response.headers.get('set-cookie').split('=')[1].split(';')[0];
    });

    test ('should add a recipe to category 1', async () => {
        const response = await requestFetch({URL: '/recipes', method: 'POST', 
            body: {
                name: 'New Recipe',
                description: 'Description of the new recipe',
                image: 'http://example.com/image.jpg',
                category: categoryId,
                ingredients: ['Ingredient 1', 'Ingredient 2'],
                cookingSteps: ['Step 1', 'Step 2']
            }
        });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toHaveProperty('message', 'Рецепт добавлен успешно');
    });

    test ('should get categories', async () => {
        const response = await requestFetch({URL: '/categories', method: 'GET'});

        const data = await response.json();

        expect(response.status).toBe(200);
        expect(Array.isArray(data)).toBe(true);
        const firstCategory = data[0];
        expect(firstCategory).toHaveProperty('name');
    });

    test ('should get all recipes of category', async () => {
        const response = await requestFetch({URL: `/categories/${categoryId}`, method: 'GET'});

        const data = await response.json();

        recipeId = data[0].id;
        

        expect(response.status).toBe(200);  
        expect(Array.isArray(data)).toBe(true);
        const expectedRecipe = {
            id: recipeId,
            user_id: 1,
            name: 'New Recipe',
            description: 'Description of the new recipe',
            image: 'http://example.com/image.jpg',
            category: categoryId,
            ingredients: ['Ingredient 1', 'Ingredient 2'],
            cookingSteps: ['Step 1', 'Step 2']
        };
        expect(data[0]).toEqual(expectedRecipe);
    });

    test ('should update a recipe', async () => {
        const response = await requestFetch({URL: `/recipes/${recipeId}`, method: 'PATCH',
            body: {
                name: 'Updated Recipe',
                description: 'Updated description of the recipe',
                image: 'http://example.com/updated-image.jpg',
                category: categoryId,
                ingredients: ['Updated Ingredient 1', 'Updated Ingredient 2'],
                cookingSteps: ['Updated Step 1', 'Updated Step 2']
            }
        });

        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toHaveProperty('message', 'Рецепт обновлен успешно');
    });

    test ('should check if the user is the owner of the recipe', async () => {
        const response = await requestFetch({URL: `/recipes/${recipeId}/check-owner`, method: 'GET'});
    
        const data = await response.json();
        expect(response.status).toBe(200);
        expect(data.isOwner).toBe(true);
    });

    test ('should get a specific recipe', async () => {
        const response = await requestFetch({URL: `/recipes/${recipeId}`, method: 'GET'});

        const data = await response.json();

        expect(response.status).toBe(200);  
        const expectedRecipe = {
            id: recipeId,
            user_id: 1,
            name: 'Updated Recipe',
            description: 'Updated description of the recipe',
            image: 'http://example.com/updated-image.jpg',
            category: categoryId,
            ingredients: ['Updated Ingredient 1', 'Updated Ingredient 2'],
            cookingSteps: ["Updated Step 1", "Updated Step 2"],
        };
        expect(data[0]).toEqual(expectedRecipe);
    });

    test ('should delete a recipe', async () => {
        const response = await requestFetch({URL: `/recipes/${recipeId}`, method: 'DELETE'});

        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toHaveProperty('message', 'Рецепт удален успешно');
    });

    test ('should delete a user', async () => {
        const response = await requestFetch({URL: `/users`, method: 'DELETE'});

        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toHaveProperty( 'message', 'User deleted successfully' );
    });

    test ('should check the user`s authorization (not authorizationed)', async () => {
        const response = await requestFetch({URL: '/check-auth', method: 'GET', clear: true});
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toHaveProperty('isAuthenticated', false);
    });
});