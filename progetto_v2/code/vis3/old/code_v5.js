// code.js - Gestione della sidebar e del grafo

// Creazione della sidebar in sovraimpressione
function createSideBar(data) {
  const sidebar = d3
    .select("body")
    .append("div")
    .attr("id", "sidebar-container")
    .style("position", "absolute")
    .style("top", "20px")
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
      .style("padding", "10px")
      .style("margin", "5px 0")
      .style("border", "none")
      .style("background", "#3498db")
      .style("color", "white")
      .style("cursor", "pointer")
      .on("click", function () {
        sidebar.select(`#section-${el.replace(/\s+/g, '_')}`).style("display", 
          (sidebar.select(`#section-${el.replace(/\s+/g, '_')}`).style("display") == "block") ? "none" : "block");
      });

    const section = sidebar.append("div").style("display", "none").attr("id", `section-${el.replace(/\s+/g, '_')}`);
    data.categorized_ingredients.forEach((obj) => {
      if (obj.category == el) {
        section.append("button")
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

// Grafo dinamico
let graphData = { nodes: [], links: [] };

function addIngredientToGraph(selectedIngredient) {
  d3.json("../../data/meals_corrected.json").then((meals) => {
    if (!graphData.nodes.some(node => node.id === selectedIngredient)) {
      graphData.nodes.push({ id: selectedIngredient, type: "ingredient", x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight });
    }

    Object.entries(meals).forEach(([meal, details]) => {
      if (details.ingredients.includes(selectedIngredient)) {
        if (!graphData.nodes.some(node => node.id === meal)) {
          graphData.nodes.push({ id: meal, type: "meal", x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight });
        }
        if (!graphData.links.some(link => link.source.id === selectedIngredient && link.target.id === meal)) {
          graphData.links.push({ source: graphData.nodes.find(n => n.id === selectedIngredient), target: graphData.nodes.find(n => n.id === meal) });
        }
      }
    });

    updateGraph();
  }).catch((error) => {
    console.error("Error loading the datasets:", error);
  });
}

function updateGraph() {
  d3.select("svg").remove();
  console.log(graphData);
  drawGraph(graphData);
}

function drawGraph(data) {
  const width = window.innerWidth, height = window.innerHeight;

  const svg = d3.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const simulation = d3.forceSimulation(data.nodes)
    .force("link", d3.forceLink(data.links).id(d => d.id).distance(100))
    .force("charge", d3.forceManyBody().strength(-200))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("collide", d3.forceCollide(20));

  const link = svg.append("g")
    .selectAll("line")
    .data(data.links)
    .enter().append("line")
    .attr("stroke", "#999")
    .attr("stroke-width", 1);

  const node = svg.append("g")
    .selectAll("circle")
    .data(data.nodes)
    .enter().append("circle")
    .attr("r", d => d.type === "meal" ? 8 : 12)
    .attr("fill", d => d.type === "meal" ? "red" : "blue")
    .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended));

  simulation.on("tick", () => {
    link.attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

    node.attr("cx", d => d.x)
        .attr("cy", d => d.y);
  });

  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
}

// Caricamento dati per la sidebar
d3.json("../../data/categorized_ingredients.json")
  .then((data) => {
    const categories = new Set();
    data.forEach((obj) => { categories.add(obj.category); });
    const categorized_ingredients = data.map((obj) => ({
      category: obj.category,
      ingredient: obj.ingredient,
    }));
    createSideBar({ categories, categorized_ingredients });
  })
  .catch((error) => {
    console.error("Error loading the datasets:", error);
  });
