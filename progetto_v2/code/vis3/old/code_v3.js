function drawGraph(data) {
  const width = 800,
    height = 600;

  const svg = d3
    .select(".container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const simulation = d3
    .forceSimulation(data.nodes)
    .force(
      "link",
      d3.forceLink(data.links).id((d) => d.id)
    )
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2));

  const link = svg
    .append("g")
    .selectAll("line")
    .data(data.links)
    .enter()
    .append("line")
    .attr("stroke", "#999")
    .attr("stroke-width", 1);

  const node = svg
    .append("g")
    .selectAll("circle")
    .data(data.nodes)
    .enter()
    .append("circle")
    .attr("r", (d) =>
      d.type === "meal" ? 8 : Math.min(4 + (d.usage || 1), 15)
    )
    .attr("fill", (d) => (d.type === "meal" ? "red" : "blue"))
    .call(
      d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
    );

  simulation.on("tick", () => {
    link
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

    node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
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

Promise.all([
  d3.json("../../data/ingredients.json"),
  d3.json("../../data/meals_corrected.json"),
])
  .then(([ingredients, meals]) => {
    console.log("Loaded Ingredients:", ingredients);
    console.log("Loaded Meals:", meals);

    const ingredientUsage = {};
    Object.entries(meals).forEach(([meal, details]) => {
      new Set(details.ingredients).forEach((ingredient) => {
        ingredientUsage[ingredient] = (ingredientUsage[ingredient] || 0) + 1;
      });
    });

    console.log("Ingredient Usage Counts:", ingredientUsage);

    const nodes = ingredients.map((ing) => ({
      id: ing,
      type: "ingredient",
      usage: ingredientUsage[ing] ? ingredientUsage[ing] : 1,
    }));

    const mealNodes = Object.entries(meals).map(([meal, details]) => ({
      id: meal,
      type: "meal",
    }));
    nodes.push(...mealNodes);

    console.log("Generated Nodes:", nodes);

    const links = [];
    Object.entries(meals).forEach(([meal, details]) => {
      details.ingredients.forEach((ingredient) => {
        if (ingredients.includes(ingredient)) {
          links.push({ source: ingredient, target: meal });
        }
      });
    });

    console.log("Generated Links:", links);
    drawGraph({ nodes, links });
  })
  .catch((error) => {
    console.error("Error loading the datasets:", error);
  });
