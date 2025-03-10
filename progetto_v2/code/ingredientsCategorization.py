import json

# Caricare il file degli ingredienti
input_file = "data/ingredients.json"
input_file2 = "data/meals.json"
output_file = "data/categorized_ingredients.json"
output_file2 = "data/corr_meals.json"


with open(input_file, "r", encoding="utf-8") as f:
    ingredients = json.load(f)
	
with open(input_file2, "r", encoding="utf-8") as f:
    meals_data = json.load(f)

for ing in ingredients:
    if ing == "Macaroni" and ing == "Spaghetti" and ing == "Fettuccine":
        del ing

for meal in meals_data.values():
    meal["ingredients"] = ["Pasta" if ingredient == "Macaroni" else ingredient for ingredient in meal["ingredients"]]
    meal["ingredients"] = ["Pasta" if ingredient == "Spaghetti" else ingredient for ingredient in meal["ingredients"]]
    meal["ingredients"] = ["Pasta" if ingredient == "Fettuccine" else ingredient for ingredient in meal["ingredients"]]



# Definire le categorie di ingredienti
categories = {
    "Meat": {"Beef", "Chicken", "Turkey", "Lamb", "Veal", "Pork", "Duck Legs", "Sausages", "Ham", "Bacon"},
    "Fish and Seafood": {"Salmon", "Tuna", "Haddock", "Mussels", "Prawns", "Oysters", "Squid", "Clams", "Mackerel"},
    "Dairy": {"Milk", "Cheese", "Butter", "Cream", "Yogurt", "Parmesan", "Mozzarella", "Feta", "Ricotta"},
    "Vegetables": {"Onion", "Garlic", "Carrot", "Celery", "Potato", "Tomato", "Zucchini", "Spinach", "Broccoli"},
    "Fruits": {"Apples", "Banana", "Peaches", "Lemon", "Orange", "Blueberries", "Strawberries"},
    "Spices and Herbs": {"Salt", "Pepper", "Cumin", "Cinnamon", "Nutmeg", "Paprika", "Coriander", "Basil", "Thyme"},
    "Grains and Pasta": {"Rice", "Pasta", "Spaghetti", "Lasagne Sheets", "Bread", "Flour", "Oats"},
    "Sauces and Condiments": {"Soy Sauce", "Fish Sauce", "Balsamic Vinegar", "Tomato Puree", "Worcestershire Sauce"},
    "Nuts and Seeds": {"Peanuts", "Almonds", "Walnuts", "Sesame Seed", "Pine nuts"},
    "Sweeteners": {"Sugar", "Honey", "Maple Syrup", "Golden Syrup"},
    "Others": set()  # Categoria per gli ingredienti non classificati
}


# Creare una lista di ingredienti con la categoria associata
categorized_ingredients = []
for ingredient in ingredients:
    found = False
    for category, items in categories.items():
        if ingredient in items:
            categorized_ingredients.append({"ingredient": ingredient, "category": category})
            found = True
            break
    if not found:
        categorized_ingredients.append({"ingredient": ingredient, "category": "Others"})

# Salvare il nuovo file JSON con i tag di categoria
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(categorized_ingredients, f, indent=4, ensure_ascii=False)

print(f"File '{output_file}' creato con successo!")


with open(output_file2, "w", encoding="utf-8") as f:
    json.dump(meals_data, f, indent=4, ensure_ascii=False)