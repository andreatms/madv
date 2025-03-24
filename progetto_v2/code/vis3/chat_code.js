// Funzione per aggiornare la visibilità dei nodi in base al nodo meal selezionato
function updateNodeVisibilityOnMealClick(mealId) {
  // Ottieni gli ingredienti connessi al pasto selezionato
  const connectedIngredients = graphData.links
    .filter((link) => link.target.id === mealId)
    .map((link) => link.source.id);

  // Aggiorna la visibilità dei nodi
  g.selectAll(".node").each(function (d) {
    const node = d3.select(this);
    if (d.type === "ingredient") {
      // Nascondi i nodi ingredienti non connessi al pasto
      if (connectedIngredients.includes(d.id)) {
        node.style("visibility", "visible");
      } else {
        node.style("visibility", "hidden");
      }
    }
  });
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
    );

  nodeEnter.append("title").text((d) => d.id);

  // Aggiungi evento di clic per i nodi "meal"
  nodeEnter
    .filter((d) => d.type === "meal")
    .on("click", function (event, d) {
      // Mostra solo gli ingredienti connessi al pasto selezionato
      updateNodeVisibilityOnMealClick(d.id);
    });

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
