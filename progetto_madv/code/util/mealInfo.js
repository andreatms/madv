function getAreas(){
    // Caricamento del dataset con D3
    d3.json("meals_corrected.json").then(data => {
        // Estrazione dei valori distinti per il campo "area"
        const areas = Array.from(new Set(Object.values(data).map(d => d.area)));

        return areas;
    }).catch(error => console.error("Errore nel caricamento dei dati:", error));
}

function getCategories(){
    // Caricamento del dataset con D3
    d3.json("meals_corrected.json").then(data => {
        // Estrazione dei valori distinti per il campo "category"
        const categories = Array.from(new Set(Object.values(data).map(d => d.category)));

        return categories;
    }).catch(error => console.error("Errore nel caricamento dei dati:", error));
}