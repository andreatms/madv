# InfoVis Project

Questo progetto è una dashboard interattiva per l'esplorazione di dati relativi a piatti, ingredienti e aree geografiche, realizzata per un corso di Information Visualization.

## Struttura del progetto

- **code/**: contiene il codice sorgente delle visualizzazioni e degli script di preprocessing
  - `vis1/`, `vis2/`, `vis3/`, `vis4/`: quattro visualizzazioni interattive basate su D3.js e/o Leaflet
  - `dataCleaning.py`, `ingredientsCategorization.py`: script Python per la pulizia e categorizzazione dei dati
- **data/**: dataset utilizzati dalle visualizzazioni (formato JSON)
- **resources/**: immagini utilizzate nella dashboard
  
## Come eseguire

1. **Preprocessing dati**  
   Esegui gli script Python in `code/dataCleaning.py` e `code/ingredientsCategorization.py` per generare i file corretti nella cartella `data/`.

2. **Avvio visualizzazioni**  
   Apri i file HTML in `code/vis1/`, `code/vis2/`, `code/vis3/`, `code/vis4/` per far partire le visualizzazioni.

3. **Dashboard**  
   Apri `code/index.html` per accedere alla dashboard e navigare tra le visualizzazioni.

## Dipendenze

- [D3.js](https://d3js.org/)
- [Leaflet](https://leafletjs.com/) (solo vis1)
- Python 3.x (per preprocessing dati)

## Autori

- Giulia Giglioni
- Andrea Tomassoni
