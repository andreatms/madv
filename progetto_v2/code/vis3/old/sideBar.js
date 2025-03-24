function createSideBar(data) {
  const sidebar = d3
    .select(".container")
    .append("div")
    .attr("id", "sidebar-container")
    .style("width", "250px")
    .style("padding", "15px")
    .style("background", "#2c3e50")
    .style("color", "white");

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

d3.json("../../data/categorized_ingredients.json")
  .then((data) => {
    const categories = new Set();

    data.forEach((obj) => {
      categories.add(obj.category);
    });

    const categorized_ingredients = data.map((obj) => ({
      category: obj.category,
      ingredient: obj.ingredient,
    }));

    createSideBar({ categories, categorized_ingredients });
  })
  .catch((error) => {
    console.error("Error loading the datasets:", error);
  });