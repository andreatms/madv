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
    // Aggiungi l'ingrediente selezionato se non esiste già
    if (!graphData.nodes.some(node => node.id === selectedIngredient)) {
      graphData.nodes.push({ id: selectedIngredient, type: "ingredient", x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight });
    }

    // Aggiungi i collegamenti tra ingredienti e pasti
    Object.entries(meals).forEach(([meal, details]) => {
      if (details.ingredients.includes(selectedIngredient)) {
        if (!graphData.nodes.some(node => node.id === meal)) {
          graphData.nodes.push({ id: meal, type: "meal", x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight });
        }
        if (!graphData.links.some(link => link.source.id === selectedIngredient && link.target.id === meal)) {
          const sourceNode = graphData.nodes.find(n => n.id === selectedIngredient);
          const targetNode = graphData.nodes.find(n => n.id === meal);
          if (sourceNode && targetNode) {  // Assicurati che source e target esistano
            graphData.links.push({ source: sourceNode, target: targetNode });
          }
        }
      }
    });

    updateGraph(selectedIngredient); // Aggiungi l'ingrediente alla visualizzazione
  }).catch((error) => {
    console.error("Error loading the datasets:", error);
  });
}

function updateGraph(selectedIngredient) {
  d3.select("svg").remove();
  drawGraph(selectedIngredient); // Passiamo l'ingrediente selezionato
}

function drawGraph(selectedIngredient) {
  const width = window.innerWidth * 0.9, height = window.innerHeight * 0.7;  // 90% larghezza e 70% altezza della finestra

  const svg = d3.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // Filtriamo i nodi che includono l'ingrediente selezionato
  const selectedNodes = graphData.nodes.filter(node => node.id === selectedIngredient || graphData.links.some(link => link.source.id === node.id || link.target.id === node.id));
  const selectedLinks = graphData.links.filter(link => selectedNodes.includes(link.source) && selectedNodes.includes(link.target));

  // Calcola i limiti del grafo (bounding box)
  const minX = d3.min(selectedNodes, d => d.x);
  const maxX = d3.max(selectedNodes, d => d.x);
  const minY = d3.min(selectedNodes, d => d.y);
  const maxY = d3.max(selectedNodes, d => d.y);

  // Calcola la scala per fare in modo che il grafo rientri nella finestra
  const scaleX = width / (maxX - minX);
  const scaleY = height / (maxY - minY);
  const scale = Math.min(scaleX, scaleY);

  // Calcola il pan necessario per centrare il grafo
  const offsetX = (width - (maxX - minX) * scale) / 2 - minX * scale;
  const offsetY = (height - (maxY - minY) * scale) / 2 - minY * scale;

  // Simulazione di forze
  const simulation = d3.forceSimulation(selectedNodes)
    .force("link", d3.forceLink(selectedLinks).id(d => d.id).distance(100))
    .force("charge", d3.forceManyBody().strength(-200))  // Forza di repulsione per tutti i nodi
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("collide", d3.forceCollide(20)) // Forza per evitare sovrapposizioni
    .on("tick", ticked); // Funzione di aggiornamento ad ogni tick della simulazione

  // Link tra nodi
  const link = svg.append("g")
    .selectAll("line")
    .data(selectedLinks)
    .enter().append("line")
    .attr("stroke", "#999")
    .attr("stroke-width", 1);

  // Nodi (cerchi)
  const node = svg.append("g")
    .selectAll("circle")
    .data(selectedNodes)
    .enter().append("circle")
    .attr("r", d => d.type === "meal" ? 8 : 12)  // Raggio del nodo
    .attr("fill", d => d.type === "meal" ? "red" : "blue")  // Colore in base al tipo
    .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended));

  // Funzione per aggiornare la posizione dei nodi e dei link ad ogni "tick" della simulazione
  function ticked() {
    link.attr("x1", d => d.source.x * scale + offsetX)
        .attr("y1", d => d.source.y * scale + offsetY)
        .attr("x2", d => d.target.x * scale + offsetX)
        .attr("y2", d => d.target.y * scale + offsetY);

    node.attr("cx", d => d.x * scale + offsetX)
        .attr("cy", d => d.y * scale + offsetY);
  }

  // Funzioni di drag&drop
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
