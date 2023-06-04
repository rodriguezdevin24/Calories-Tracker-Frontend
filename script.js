const API_KEY = 'fDzBVQf9yQdHWsF4P3bBg8f2YyP50gQi0F1WL8Dn';
const searchButton = document.getElementById('searchButton');
const searchInput = document.getElementById('searchInput');
const modal = document.getElementById('food-modal');
const closeSpan = document.getElementsByClassName('close')[0];
const modalContent = document.querySelector('.modal-content');
const addToDiaryButton = document.getElementById('add-to-diary');

// When the user clicks on the button, open the modal 
searchButton.onclick = function() {
  modal.style.display = "block";
  searchForFood(searchInput.value);
}

// When the user clicks on <span> (x), close the modal
closeSpan.onclick = function() {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

async function searchForFood(query) {
  try {
    const response = await axios.get(`https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${API_KEY}&query=${query}`);
    const foods = response.data.foods;
    displayFoods(foods);
  } catch (error) {
    console.error(error);
  }
}

function displayFoods(foods) {
  modalContent.innerHTML = '<span class="close">&times;</span><h2>Search Results:</h2>';
  foods.forEach(food => {
    const foodDiv = document.createElement('div');
    foodDiv.innerHTML = `
      <h3>${food.description}</h3>
      <p>Calories: ${getNutrientValue(food, 'Energy')}</p>
      <p>Protein: ${getNutrientValue(food, 'Protein')}</p>
      <p>Fats: ${getNutrientValue(food, 'Total lipid (fat)')}</p>
      <p>Carbs: ${getNutrientValue(food, 'Carbohydrate, by difference')}</p>
      <button onclick="addToDiary('${food.description}')">Add to diary</button>
    `;
    modalContent.appendChild(foodDiv);
  });
}

function getNutrientValue(food, nutrientName) {
  const nutrient = food.foodNutrients.find(n => n.nutrientName === nutrientName);
  return nutrient ? nutrient.value : 'N/A';
}

function addToDiary(foodName) {
  // Here you can add code to add the food to the user's diary
  console.log(`Adding ${foodName} to diary...`);
}
