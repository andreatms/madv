import json

# Percorso del file originale e del file corretto
meals_path = "data/meals.json"
corrected_meals_path = "data/meals_corrected.json"

# Caricamento dei dati
with open(meals_path, "r", encoding="utf-8") as f:
    meals = json.load(f)

# Correzione delle categorie errate
for meal_name, meal_data in meals.items():
    if meal_data.get("category", "").strip() == "Desert":
        meals[meal_name]["category"] = "Dessert"

# Salvataggio del file corretto
with open(corrected_meals_path, "w", encoding="utf-8") as f:
    json.dump(meals, f, indent=4)

print(f"File corretto salvato come {corrected_meals_path}")
