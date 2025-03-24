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

function drawGraph(data) {
  // set the dimensions and margins of the graph
  const margin = { top: 10, right: 30, bottom: 30, left: 40 },
    width = 1400 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  const svg = d3
    .select(".container")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style("border", "2px solid black")
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Initialize the links
  const link = svg
    .selectAll("line")
    .data(data.links)
    .join("line")
    .style("stroke", "#aaa")
    .style("visibility", "hidden")
    .attr("id", (link) => {return link.id});
    

  // Initialize the nodes
  const node = svg
    .selectAll("circle")
    .data(data.nodes)
    .join("circle")
    .attr("r", 5)
    .style("fill", "#69b3a2")
    .style("visibility", "hidden")
    .attr("id", (node) => {return node.id});

  // Let's list the force we wanna apply on the network
  const simulation = d3
    .forceSimulation(data.nodes) // Force algorithm is applied to data.nodes
    .force(
      "link",
      d3
        .forceLink() // This force provides links between nodes
        .id(function (d) {
          return d.id;
        }) // This provide  the id of a node
        .links(data.links) // and this the list of links
    )
    .force("charge", d3.forceManyBody().strength(-40)) // This adds repulsion between nodes. Play with the -400 for the repulsion strength
    .force("center", d3.forceCenter(width / 2, height / 2)) // This force attracts nodes to the center of the svg area
    .on("tick", ticked);

  // This function is run at each iteration of the force algorithm, updating the nodes position.
  function ticked() {
    node
      .attr("cx", function (d) {
        return d.x + 6;
      })
      .attr("cy", function (d) {
        return d.y - 6;
      });

    link
      .attr("x1", function (d) {
        return d.source.x;
      })
      .attr("y1", function (d) {
        return d.source.y;
      })
      .attr("x2", function (d) {
        return d.target.x;
      })
      .attr("y2", function (d) {
        return d.target.y;
      });
  }
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

// Struttura dati del grafo
let graphData = { nodes: [], links: [] };
let graph = { nodes: [], links: [] };

Promise.all([
  d3.json("../../data/ingredients.json"),
  d3.json("../../data/meals_corrected.json"),
])
  .then(([ingredients, meals]) => {
    const nodes = [
      ...ingredients.map((ing) => ({ id: ing, type: "ingredient" })),
    ];
    const mealNodes = Object.keys(meals).map((meal) => ({
      id: meal,
      type: "meal",
    }));
    nodes.push(...mealNodes);

    const links = [];
    Object.entries(meals).forEach(([meal, details]) => {
      details.ingredients.forEach((ingredient) => {
        if (ingredients.includes(ingredient)) {
          links.push({ source: ingredient, target: meal });
        }
      });
    });

    graphData.nodes = nodes;
    graphData.links = links;

    drawGraph(graphData);
  })
  .catch((error) => {
    console.error("Error loading the datasets:", error);
  });

function updateGraph() {
  graphData.nodes.forEach((node) => {
    if (graph.nodes.includes(node)) {
      d3.select(`#${node.id}`).style("visibility", "visible");
    }
  });

  graphData.links.forEach((link) => {
    if (graph.links.includes(link)) {
      d3.select(`#${link.id}`).style("visibility", "visible");
    }
  });

  //drawGraph(graph);
}

function addIngredientToGraph(selectedIngredient) {
  //d3.select("svg").remove();

  if (
    !graph.nodes.some((node) => {
      return node.id == selectedIngredient;
    })
  ) {
    graph.nodes.push(
      graphData.nodes.find((node) => {
        return node.id == selectedIngredient;
      })
    );

    graphData.links.forEach((link) => {
      if (link.source == selectedIngredient) {
        graph.nodes.push(
          graphData.nodes.find((node) => {
            return node.id == link.target;
          })
        );

        graph.links.push(link);
      }
    });

    updateGraph();
  }
}

/*
d3.json("../../data/meals_corrected.json")
  .then((meals) => {
    console.log("Dati caricati:", meals);

    // Aggiunge l'ingrediente se non esiste
    if (!graphData.nodes.some((node) => node.id === selectedIngredient)) {
      graphData.nodes.push({ id: selectedIngredient, type: "ingredient" });
    }

    // Aggiunge i pasti collegati all'ingrediente
    Object.entries(meals).forEach(([meal, details]) => {
      if (details.ingredients.includes(selectedIngredient)) {
        if (!graphData.nodes.some((node) => node.id === meal)) {
          graphData.nodes.push({ id: meal, type: "meal" });
        }

        if (!graphData.links.some((link) => link.source === selectedIngredient && link.target === meal)) {
          graphData.links.push({
            source: selectedIngredient,
            target: meal
          });
        }
      }
    });

    console.log("Nodi aggiornati:", graphData.nodes);
    console.log("Link aggiornati:", graphData.links);

    drawGraph(graphData);
  })
  .catch((error) => {
    console.error("Errore nel caricamento dei dati:", error);
  });
  */
