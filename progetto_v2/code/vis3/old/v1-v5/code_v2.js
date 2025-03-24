// Creazione della sidebar
function createSideBar(data) {
  const sidebar = d3
    .select("body")
    .append("div")
    .attr("id", "sidebar-container")
    .style("position", "absolute")
    .style("top", "200px")
    .style("left", "20px")
    .style("width", "250px")
    .style("padding", "15px")
    .style("background", "rgba(44, 62, 80, 0.9)")
    .style("color", "white")
    .style("border-radius", "8px")
    .style("z-index", "1000");

  sidebar.append("h3").text("Select ingredient").style("text-align", "center");

  data.categories.forEach((el) => {
    const button = sidebar
      .append("button")
      .text(el)
      .attr("class", "sidebar-element")
      .style("display", "block")
      .style("width", "100%")
      .style("padding", "20px")
      .style("margin", "5px 0")
      .style("border", "none")
      .style("background", "#3498db")
      .style("color", "white")
      .style("cursor", "pointer")
      .on("click", function () {
        sidebar
          .select(`#section-${el.replace(/\s+/g, "_")}`)
          .style(
            "display",
            sidebar
              .select(`#section-${el.replace(/\s+/g, "_")}`)
              .style("display") == "block"
              ? "none"
              : "block"
          );
      });

    const section = sidebar
      .append("div")
      .style("display", "none")
      .attr("id", `section-${el.replace(/\s+/g, "_")}`);
      
    data.categorized_ingredients.forEach((obj) => {
      if (obj.category == el) {
        section
          .append("button")
          .text(obj.ingredient)
          .attr("class", "ingredient-button")
          .style("display", "block")
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

// Caricamento dati per la sidebar
d3.json("../../data/categorized_ingredients.json")
  .then((data) => {
    const categories = [...new Set(data.map((obj) => obj.category))];
    const categorized_ingredients = data.map((obj) => ({
      category: obj.category,
      ingredient: obj.ingredient,
    }));
    createSideBar({ categories, categorized_ingredients });
  })
  .catch((error) => {
    console.error("Errore nel caricamento dei dati:", error);
  });

let graphData = { nodes: [], links: [] };
let svg, g, simulation;

// Inizializzazione del grafo con zoom
function initializeGraph() {
  svg = d3.select("body")
    .append("svg")
    .attr("width", 800)
    .attr("height", 600)
    .style("border", "2px black solid")
    .call(d3.zoom().on("zoom", (event) => {
      g.attr("transform", event.transform);
    }))
    .append("g");

  g = svg.append("g");

  simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(d => d.id).distance(100))
    .force("charge", d3.forceManyBody().strength(-200))
    .force("center", d3.forceCenter(400, 300));
}

// Aggiornamento del grafo
function updateGraph() {
  const link = g.selectAll(".link")
    .data(graphData.links, d => `${d.source.id}-${d.target.id}`);

  link.enter()
    .append("line")
    .attr("class", "link")
    .style("stroke", "#999")
    .style("stroke-width", 2);

  const node = g.selectAll(".node")
    .data(graphData.nodes, d => d.id);

  const nodeEnter = node.enter()
    .append("circle")
    .attr("class", "node")
    .attr("r", 10)
    .style("fill", d => d.type === "ingredient" ? "#1abc9c" : "#e74c3c")
    .call(d3.drag()
      .on("start", dragStarted)
      .on("drag", dragged)
      .on("end", dragEnded));

  nodeEnter.append("title").text(d => d.id);

  simulation.nodes(graphData.nodes).on("tick", () => {
    g.selectAll(".link")
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);

    g.selectAll(".node")
      .attr("cx", d => d.x)
      .attr("cy", d => d.y);

    autoZoom();
  });

  simulation.force("link").links(graphData.links);
  simulation.alpha(1).restart();
}

// Aggiunta di un ingrediente al grafo
function addIngredientToGraph(selectedIngredient) {
  if (!graphData.nodes.find(n => n.id === selectedIngredient)) {
    graphData.nodes.push({ id: selectedIngredient, type: "ingredient" });
  }

  const relatedMeals = Object.entries(mealsData).filter(([meal, details]) =>
    details.ingredients.includes(selectedIngredient)
  );

  relatedMeals.forEach(([meal]) => {
    if (!graphData.nodes.find(n => n.id === meal)) {
      graphData.nodes.push({ id: meal, type: "meal" });
    }

    if (!graphData.links.find(l => l.source.id === selectedIngredient && l.target.id === meal)) {
      graphData.links.push({ source: selectedIngredient, target: meal });
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
  const svgWidth = 800, svgHeight = 600;

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
