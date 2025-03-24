// Creazione della sidebar
function createSideBar(data) {
  const sidebar = d3
    .select("body")
    .append("div")
    .attr("id", "sidebar-container")
    .style("position", "absolute")
    .style("top", "120px")
    .style("left", "20px")
    .style("width", "250px")
    .style("padding", "15px")
    .style("background", "#2c3e50") // Rimuovi la trasparenza
    .style("color", "white")
    .style("border-radius", "8px")
    .style("z-index", "1000");

  const header = sidebar
    .append("div")
    .style("position", "sticky")
    .style("top", "0")
    .style("background", "#2c3e50") // Stesso colore di sfondo del menu
    .style("padding", "10px 0")
    .style("text-align", "center");

  header.append("h3").text("Select ingredient");

  const scrollableContent = sidebar
    .append("div")
    .style("max-height", "calc(70vh - 40px)") // Imposta un'altezza massima per il contenuto scrollabile
    .style("overflow-y", "auto"); // Abilita lo scorrimento verticale

  data.categories.forEach((el) => {
    const button = scrollableContent
      .append("button")
      .text(el)
      .attr("class", "sidebar-element")
      .style("display", "flex") // Utilizza flexbox
      .style("align-items", "center") // Centra verticalmente
      .style("justify-content", "center") // Centra orizzontalmente
      .style("width", "100%")
      .style("padding", "20px")
      .style("margin", "5px 0")
      .style("border", "none")
      .style("background", "#3498db")
      .style("color", "white")
      .style("cursor", "pointer")
      .on("click", function () {
        scrollableContent
          .select(`#section-${el.replace(/\s+/g, "_")}`)
          .style(
            "display",
            scrollableContent
              .select(`#section-${el.replace(/\s+/g, "_")}`)
              .style("display") == "block"
              ? "none"
              : "block"
          );
      });

    const section = scrollableContent
      .append("div")
      .style("display", "none")
      .attr("id", `section-${el.replace(/\s+/g, "_")}`);
      
    data.categorized_ingredients.forEach((obj) => {
      if (obj.category == el) {
        section
          .append("button")
          .text(obj.ingredient)
          .attr("class", "ingredient-button")
          .style("display", "flex") // Utilizza flexbox
          .style("align-items", "center") // Centra verticalmente
          .style("justify-content", "center") // Centra orizzontalmente
          .style("width", "90%")
          .style("margin", "3px auto")
          .style("padding", "8px")
          .style("background", "#1abc9c")
          .style("color", "white")
          .style("border", "none")
          .style("cursor", "pointer")
          .on("click", function () {
            addIngredientToGraph(obj.ingredient);
          });
      }
    });
  });
}

// Caricamento dei dati e creazione della sidebar e della classifica
d3.json("../../data/categorized_ingredients.json")
  .then((data) => {
    const categories = [...new Set(data.map((obj) => obj.category))];
    const categorized_ingredients = data.map((obj) => ({
      category: obj.category,
      ingredient: obj.ingredient,
    }));
    createSideBar({ categories, categorized_ingredients });
    createRankingColumn(); // Crea la colonna per la classifica
  })
  .catch((error) => {
    console.error("Errore nel caricamento dei dati:", error);
  });

let graphData = { nodes: [], links: [] };
let svg, g, simulation;

// Inizializzazione del grafo con zoom
function initializeGraph() {
  svg = d3
    .select("body")
    .append("svg")
    .attr("width", window.innerWidth)
    .attr("height", window.innerHeight)
    .call(
      d3.zoom().on("zoom", (event) => {
        g.attr("transform", event.transform);
      })
    )
    .append("g");

  g = svg.append("g");

  simulation = d3
    .forceSimulation()
    .force(
      "link",
      d3
        .forceLink()
        .id((d) => d.id)
        .distance(100)
    )
    .force("charge", d3.forceManyBody().strength(-200))
    .force("center", d3.forceCenter(window.innerWidth / 2, window.innerHeight / 2));
}

// Funzione per aggiornare la visibilità e il raggio dei nodi pasto
function updateNodeVisibility() {
  const ingredientNodes = graphData.nodes.filter(n => n.type === "ingredient");

  if (ingredientNodes.length < 2) {
    g.selectAll(".node")
      .style("fill", d => d.type === "ingredient" ? "#1abc9c" : "#e74c3c")
      .attr("r", 10); // Reset dimensione nodi pasto
    return;
  }

  // Conta quante connessioni ha ogni pasto
  const mealConnections = {};
  graphData.links.forEach(link => {
    if (link.target.type === "meal") {
      mealConnections[link.target.id] = (mealConnections[link.target.id] || 0) + 1;
    }
  });

  g.selectAll(".node")
    .style("fill", d => {
      if (d.type === "ingredient") return "#1abc9c";
      return mealConnections[d.id] === 1 ? "#aaaaaa" : "#e74c3c"; // Grigio per i pasti con un solo ingrediente
    })
    .attr("r", d => {
      if (d.type === "meal") {
        return Math.min(10 + (mealConnections[d.id] || 1) * 3, 30); // Raggio massimo 30
      }
      return 10; // Raggio standard ingredienti
    });
}

// Funzione per creare la colonna della classifica dei piatti
function createRankingColumn() {
  const rankingColumn = d3
    .select("body")
    .append("div")
    .attr("id", "ranking-container")
    .style("display", "none"); // Nascondi inizialmente

  rankingColumn.append("h3").text("Top 5 Meals").style("text-align", "center");

  // Aggiungi un elemento vuoto iniziale
  rankingColumn.append("ul").attr("id", "ranking-list");
}

// Funzione per aggiornare la classifica dei piatti
function updateRanking() {
  // Conta il numero di ingredienti per ciascun piatto
  const mealCounts = {};

  graphData.links.forEach((link) => {
    if (link.target.type === "meal") {
      const mealId = link.target.id;
      mealCounts[mealId] = (mealCounts[mealId] || 0) + 1;
    }
  });

  // Ordina i piatti in base al numero di ingredienti selezionati
  const sortedMeals = Object.entries(mealCounts)
    .sort((a, b) => b[1] - a[1]) // Ordina in ordine decrescente
    .slice(0, 5); // Prendi i primi 5 piatti

  const rankingList = d3.select("#ranking-list");
  rankingList.selectAll("*").remove(); // Rimuovi gli elementi precedenti

  // Aggiungi i piatti alla classifica
  sortedMeals.forEach(([meal, count]) => {
    rankingList
      .append("li")
      .text(`${meal} (${count} ingredients)`)
      .style("color", "#1abc9c");
  });

  // Mostra o nascondi la classifica in base alla presenza di nodi "meal"
  if (sortedMeals.length > 0) {
    d3.select("#ranking-container").style("display", "block");
  } else {
    d3.select("#ranking-container").style("display", "none");
  }
}

// Funzione per aggiornare il grafo e applicare le modifiche
function updateGraph() {
  const link = g
    .selectAll(".link")
    .data(graphData.links, (d) => `${d.source.id}-${d.target.id}`);

  link
    .enter()
    .append("line")
    .attr("class", "link")
    .style("stroke", "#999")
    .style("stroke-width", 2);

  const node = g.selectAll(".node").data(graphData.nodes, (d) => d.id);

  const nodeEnter = node
    .enter()
    .append("circle")
    .attr("class", "node")
    .call(
      d3
        .drag()
        .on("start", dragStarted)
        .on("drag", dragged)
        .on("end", dragEnded)
    )
    .on("click", function (event, d) {
      if (d.type === "meal") {
        addRelatedIngredientsToGraph(d.id);
      } else if (d.type === "ingredient") {
        addRelatedMealsToGraph(d.id);
      }
    });

  nodeEnter.append("title").text((d) => d.id);

  // Ensure nodes are always on top
  g.selectAll(".node").raise();

  simulation.nodes(graphData.nodes).on("tick", () => {
    g.selectAll(".link")
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

    g.selectAll(".node")
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y);

    autoZoom();
  });

  simulation.force("link").links(graphData.links);
  simulation.alpha(1).restart();

  updateNodeVisibility(); // Controlla colori e dimensioni dei nodi pasto
  updateRanking(); // Aggiorna la classifica dei piatti
}

// Funzione per aggiungere un ingrediente al grafo
function addIngredientToGraph(selectedIngredient) {
  if (!graphData.nodes.find((n) => n.id === selectedIngredient)) {
    graphData.nodes.push({ id: selectedIngredient, type: "ingredient" });
  }

  const relatedMeals = Object.entries(mealsData).filter(([meal, details]) =>
    details.ingredients.includes(selectedIngredient)
  );

  relatedMeals.forEach(([meal]) => {
    if (!graphData.nodes.find((n) => n.id === meal)) {
      graphData.nodes.push({ id: meal, type: "meal" });
    }

    if (
      !graphData.links.find(
        (l) => l.source.id === selectedIngredient && l.target.id === meal
      )
    ) {
      graphData.links.push({ source: selectedIngredient, target: meal });
    }
  });

  updateGraph();
}

// Funzione per aggiungere ingredienti correlati al grafo
function addRelatedIngredientsToGraph(mealId) {
  const relatedIngredients = mealsData[mealId].ingredients;

  relatedIngredients.forEach((ingredient) => {
    if (!graphData.nodes.find((n) => n.id === ingredient)) {
      graphData.nodes.push({ id: ingredient, type: "ingredient" });
    }

    if (
      !graphData.links.find(
        (l) => l.source.id === ingredient && l.target.id === mealId
      )
    ) {
      graphData.links.push({ source: ingredient, target: mealId });
    }
  });

  updateGraph();
}

function addRelatedMealsToGraph(ingredientId) {
  const relatedMeals = Object.entries(mealsData).filter(([meal, details]) =>
    details.ingredients.includes(ingredientId)
  );

  relatedMeals.forEach(([meal]) => {
    if (!graphData.nodes.find((n) => n.id === meal)) {
      graphData.nodes.push({ id: meal, type: "meal" });
    }

    if (
      !graphData.links.find(
        (l) => l.source.id === ingredientId && l.target.id === meal
      )
    ) {
      graphData.links.push({ source: ingredientId, target: meal });
    }
  });

  updateGraph();
}

// Funzione di auto-zoom per mantenere il grafo visibile
function autoZoom() {
  const bounds = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };

  graphData.nodes.forEach(node => {
    if (node.x < bounds.minX) bounds.minX = node.x;
    if (node.x > bounds.maxX) bounds.maxX = node.x;
    if (node.y < bounds.minY) bounds.minY = node.y;
    if (node.y > bounds.maxY) bounds.maxY = node.y;
  });

  const graphWidth = bounds.maxX - bounds.minX;
  const graphHeight = bounds.maxY - bounds.minY;
  const svgWidth = +svg.attr("width");
  const svgHeight = +svg.attr("height");

  const scaleFactor = Math.min(svgWidth / graphWidth, svgHeight / graphHeight) * 0.9;
  const translateX = (svgWidth - graphWidth * scaleFactor) / 2 - bounds.minX * scaleFactor;
  const translateY = (svgHeight - graphHeight * scaleFactor) / 2 - bounds.minY * scaleFactor;

  svg.transition()
    .duration(500)
    .call(d3.zoom().transform, d3.zoomIdentity.translate(translateX, translateY).scale(scaleFactor));
}

// Funzioni per il drag dei nodi
function dragStarted(event, d) {
  if (!event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(event, d) {
  d.fx = event.x;
  d.fy = event.y;
}

function dragEnded(event, d) {
  if (!event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}

let mealsData = {};
Promise.all([
  d3.json("../../data/ingredients.json"),
  d3.json("../../data/meals_corrected.json"),
]).then(([ingredients, meals]) => {
  mealsData = meals;
  initializeGraph();
}).catch(error => console.error("Error loading datasets:", error));
