const list = [];
let currentDrinks = [];
let count = 0;

window.onload = async function () {
  try {
    const response = await fetch(
      "https://www.thecocktaildb.com/api/json/v1/1/search.php?s=cocktail"
    );
    const data = await response.json();
    if (data && data.drinks) {
      currentDrinks = data.drinks;
      displayResults(data.drinks);
    } else {
      document.getElementById("resultsGrid").innerHTML =
        "<p>No drinks found</p>";
    }
  } catch (error) {
    console.error("Error loading initial drinks:", error);
    document.getElementById("resultsGrid").innerHTML =
      "<p>Error loading drinks. Please try again.</p>";
  }
};

async function searchCocktails() {
  try {
    const searchTerm = document.getElementById("searchInput").value;
    const response = await fetch(
      `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${searchTerm}`
    );
    const data = await response.json();
    if (data && data.drinks) {
      currentDrinks = data.drinks;
      displayResults(data.drinks);
    } else {
      currentDrinks = [];
      document.getElementById("resultsGrid").innerHTML =
        "<p>No drinks found</p>";
    }
  } catch (error) {
    console.error("Error searching drinks:", error);
    document.getElementById("resultsGrid").innerHTML =
      "<p>Error searching drinks. Please try again.</p>";
  }
}

function displayResults(drinks) {
  const grid = document.getElementById("resultsGrid");
  grid.innerHTML = "";

  if (!Array.isArray(drinks) || drinks.length === 0) {
    grid.innerHTML = "<p>No drinks found</p>";
    return;
  }

  drinks.forEach((drink) => {
    const truncatedInstructions = drink.strInstructions
      ? drink.strInstructions.slice(0, 15) +
        (drink.strInstructions.length > 15 ? "..." : "")
      : "No instructions available";

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
                    <img src="${drink.strDrinkThumb}" alt="${drink.strDrink}">
                    <div class="card-content">
                        <h3 class="card-title">${drink.strDrink}</h3>
                        <div class="card-category">${
                          drink.strCategory || "Uncategorized"
                        }</div>
                        <p class="card-instructions">${truncatedInstructions}</p>
                        <div class="card-buttons">
                            <button class="add-to-cart" onclick="addToList('${
                              drink.idDrink
                            }')">Add to List</button>
                            <button class="details" onclick="showDetails('${
                              drink.idDrink
                            }')">Details</button>
                        </div>
                    </div>
                `;
    grid.appendChild(card);
  });
}

function addToList(drinkId) {
  if (list.length >= 7) {
    alert("You can't add more than 7 drinks to your list!");
    return;
  }

  const drink = currentDrinks.find((d) => d.idDrink === drinkId);
  if (drink && !list.some((item) => item.id === drinkId)) {
    count++;
    list.push({
      id: drinkId,
      name: drink.strDrink,
      image: drink.strDrinkThumb,
    });
    updateList();
  }
}

function updateList() {
  const listItems = document.getElementById("cartItems");
  const cartTotal = document.getElementById("cartTotal");
  listItems.innerHTML = "";
  cartTotal.innerHTML = count;
  list.forEach((item, index) => {
    const listItem = document.createElement("div");
    listItem.className = "cart-item";
    listItem.innerHTML = `
                    <img src="${item.image}" alt="${
      item.name
    }" class="cart-item-image">
                    <div class="cart-item-content">
                        <div class="cart-item-number">${index + 1}</div>
                        <div class="cart-item-name">${item.name}</div>
                    </div>
                    <div class="cart-item-remove" onclick="removeFromList(${index})">✕</div>
                `;
    listItems.appendChild(listItem);
  });
}

function removeFromList(index) {
  list.splice(index, 1);
  count--;
  updateList();
}

async function showDetails(drinkId) {
  try {
    const response = await fetch(
      `https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${drinkId}`
    );
    const data = await response.json();
    const drink = data.drinks[0];

    const ingredients = [];
    for (let i = 1; i <= 15; i++) {
      if (drink[`strIngredient${i}`]) {
        const ingredient = drink[`strIngredient${i}`];
        const measure = drink[`strMeasure${i}`] || "";
        ingredients.push(`${measure.trim()} ${ingredient}`);
      }
    }

    const detailsHtml = `
            <h2>${drink.strDrink}</h2>
            <img src="${drink.strDrinkThumb}" alt="${drink.strDrink}">
            <div class="drink-info">
                <p><strong>Category:</strong> ${drink.strCategory}</p>
                <p><strong>Glass:</strong> ${drink.strGlass}</p>
            </div>
            <h3>Ingredients:</h3>
            <ul class="ingredients-list">
                ${ingredients.map((ing) => `<li>${ing}</li>`).join("")}
            </ul>
            <h3>Instructions:</h3>
            <p class="instructions">${drink.strInstructions}</p>
        `;

    document.getElementById("drinkDetails").innerHTML = detailsHtml;
    document.getElementById("detailsModal").style.display = "block";
  } catch (error) {
    console.error("Error loading drink details:", error);
    alert("Error loading drink details. Please try again.");
  }
}

function closeModal() {
  document.getElementById("detailsModal").style.display = "none";
}

window.onclick = function (event) {
  const modal = document.getElementById("detailsModal");
  if (event.target == modal) {
    modal.style.display = "none";
  }
};
