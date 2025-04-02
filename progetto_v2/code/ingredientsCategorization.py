import json

# Caricare il file degli ingredienti
input_file = "data/ingredients.json"
output_file = "data/categorized_ingredients.json"


with open(input_file, "r", encoding="utf-8") as f:
    ingredients = json.load(f)


# Definire le categorie di ingredienti
categories = {
    "Meat": {"Beef", "Chicken", "Turkey", "Lamb", "Veal", "Pork", "Duck Legs", "Sausages", "Ham", "Bacon", "Parma Ham", "Chorizo", 
            "Lamb Kidney", "Black Pudding", "Chicken Breast", "Chicken Thigh", "Lard", "Prosciutto"},
    "Fish and Seafood": {"Salmon", "Tuna", "Haddock", "Mussels", "Prawns", "Oysters", "Squid", "Clams", "Mackerel", "Pilchards", "Fish", 
                        "Fish Fillets", "Monkfish"},
    "Dairy": {"Milk", "Cheese", "Butter", "Cream", "Yogurt", "Parmesan", "Mozzarella", "Feta", "Ricotta", "Monterey Jack Cheese",
              "Cheddar Cheese", "Gruyere", "Mexican Cheese", "Sour Cream", "Greek Yogurt", "Ice Cream", "Cream Cheese", "Creme Fraiche", 
              "Custard", "Ghee", "Goat Cheese", "Fromage Frais", "Colby Jack Cheese", "Brie", "Blue Cheese", "Mascarpone"},
    "Vegetables": {"Onion", "Garlic", "Carrot", "Celery", "Potato", "Tomato", "Zucchini", "Spinach", "Broccoli", "Beans", "Shallots",
                   "Mushrooms", "Leek", "Swede", "Scallions", "Spring Onions", "Green Pepper", "Squash", "Sun-Dried Tomato", "Jalapeno", "Fried Vegetables",
                   "Pumpkin", "Fennel", "Peas", "Lettuce", "Brussels Sprouts", "Horseradish", "Artichokes", "Asparagus", "Aubergine", "Courgettes", "Zucchini",
                   "Rocket", "Yellow Pepper", "Kale", "Egg Plants", "Butternut Squash", "Roasted Vegetables", "Cabbage"},
    "Fruits": {"Apples", "Banana", "Peaches", "Lemon", "Orange", "Blueberries", "Strawberries", "Lime", "Avocado", "Chestnuts", "Blackberries", "Raspberries",
               "Apricot", "Sultanas", "Cherry", "Currants", "Pears", "Dates", "Redcurrants"},
    "Spices and Herbs": {"Salt", "Pepper", "Cumin", "Cinnamon", "Nutmeg", "Paprika", "Coriander", "Basil", "Thyme", "Bay Leaf", "Bouquet Garni", "Rosemary",
                         "Cardamom", "Parsley", "Ginger", "Bean Sprouts", "All spice", "Clove", "Oregano", "Chili Powder", "Curry Paste", "Chives", "Mustard Powder", "Pepper Flakes",
                         "Fajita Seasoning", "Sea Salt", "Turmeric", "Green Chili Powder", "Garam Masala", "Curry Powder", "Black Pepper", "Celery Salt", "Sage", "Marjoram", "Mint", "Star Anise",
                         "Cilantro", "Saffron", "Biryani masala", "Tarragon", "Cayenne Pepper", "Cajun", "Dill", "Chili", "Mustard Seeds", "Chili Flakes"},
    "Grains and Pasta": {"Rice", "Pasta", "Spaghetti", "Lasagne Sheets", "Bread", "Flour", "Oats", "Macaroni", "Breadcrumbs", "Rice Stick Pasta", "Oatmeal", "Fettuccine", "Vermicelli", "Grain"},
    "Sauces and Condiments": {"Soy Sauce", "Fish Sauce", "Balsamic Vinegar", "Tomato Puree", "Worcestershire Sauce", "Rapeseed Oil", "Mustard", "Olive Oil", "Goose Fat", "Suet", "Sesame Seed Oil", 
                              "Oil", "Oyster Sauce", "Sunflower Oil", "Tomato Ketchup", "Vegetable Oil", "Dijon Mustard", "Tabasco", "Hotsauce", "Enchilada Sauce", "Passata", "Vinaigrette Dressing", 
                              "Salsa", "Duck Sauce", "Rice Vinegar", "Gochujang", "Vinegar", "Green Curry Paste", "Barbeque Sauce", "Harissa", "Truffle Oil", "Italian Seasoning", "Mirin"},
    "Nuts and Seeds": {"Peanuts", "Almonds", "Walnuts", "Sesame Seed", "Pine nuts", "Pecan Nuts", "Hazlenuts", "Dried Fruit", "Cashews"},
    #"Sweeteners": {"Sugar", "Honey", "Maple Syrup", "Golden Syrup", "Brown Sugar", "Black Tracle"},
    #"Stocks": {"Beef Stock", "Chicken Stock", "Fish Stock", "Vegetable Stock"},
    #"Beverages":{"Red Wine", "White Wine", "Brandy", "Stout", "Sake", "Wine", "Ginger Cordial"},
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