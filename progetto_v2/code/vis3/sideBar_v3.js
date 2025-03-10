function createSideBar(data) {
  const sidebar = d3
    .select(".container")
    .append("div")
    .attr("id", "sidebar-container")
    .attr("width", 400)
    .attr("height", 800);

  sidebar.append("h3").text("Select ingredient");
  data.categories.forEach((el) => {
    const button = sidebar
      .append("button")
      .text(el)
      .attr("class", "sidebar-element")
      .style("display", "block")
      .on("click", function () {
sidebar.select(`#section-${el.replace(/\s+/g, '_')}`).style("display", ((sidebar.select(`#section-${el.replace(/\s+/g, '_')}`).style("display") == "block") ? "none" : "block" ))
      });

    const section = sidebar.append("div").style("display", "none").attr("id", `section-${el.replace(/\s+/g, '_')}`);
    data.categorized_ingredients.forEach((obj) => {
      if (obj.category == el) {
        const subLabel = section
          .append("label")
          .attr("value", obj.ingredient)
          .text(obj.ingredient)
          .style("display", "block");
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

    console.log("Loaded Ingredients:", categories);

    const categorized_ingredients = data.map((obj) => ({
      category: obj.category,
      ingredient: obj.ingredient,
    }));

    console.log("Loaded Ingredients:", categorized_ingredients);

    createSideBar({ categories, categorized_ingredients });
  })
  .catch((error) => {
    console.error("Error loading the datasets:", error);
  });
