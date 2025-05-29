import json

meals_path = "progetto_v2/data/meals.json"
corrected_meals_path = "progetto_v2/data/meals_corrected.json"

ingredients_path = "progetto_v2/data/ingredients.json"
corrected_ingredients_path = "progetto_v2/data/ingredients_corrected.json"

with open(meals_path, "r", encoding="utf-8") as f:
    meals = json.load(f)

with open(ingredients_path, "r", encoding="utf-8") as f:
    ingredients = json.load(f)

for meal_name, meal_data in meals.items():
    if meal_data.get("category", "").strip() == "Desert":
        meals[meal_name]["category"] = "Dessert"
    if "ingredients" in meal_data:
        for i, ingredient in enumerate(meal_data["ingredients"]):
            if ingredient.strip() == "Challots":
                meal_data["ingredients"][i] = "Shallots"
            elif ingredient.strip() == "Cacao":
                meal_data["ingredients"][i] = "Cocoa"
            elif ingredient.strip() == "Zucchini":
                meal_data["ingredients"][i] = "Courgettes"

for i, ingredient in enumerate(ingredients):
    if isinstance(ingredient, dict):
        if ingredient.get("name", "").strip() == "Challots":
            ingredient["name"] = "Shallots"
        elif ingredient.get("name", "").strip() == "Cacao":
            ingredient["name"] = "Cocoa"
        elif ingredient.get("name", "").strip() == "Zucchini":
            ingredients.pop(i)
    elif isinstance(ingredient, str):
        if ingredient.strip() == "Challots":
            ingredients[i] = "Shallots"
        elif ingredient.strip() == "Cacao":
            ingredients.pop(i)
        elif ingredient.strip() == "Zucchini":
            ingredients.pop(i)

with open(corrected_meals_path, "w", encoding="utf-8") as f:
    json.dump(meals, f, indent=4)

with open(corrected_ingredients_path, "w", encoding="utf-8") as f:
    json.dump(ingredients, f, indent=4)