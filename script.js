const API_KEY = 'fDzBVQf9yQdHWsF4P3bBg8f2YyP50gQi0F1WL8Dn';
const searchButton = document.getElementById('searchButton');
const searchInput = document.getElementById('searchInput');
const modal = document.getElementById('food-modal');
const closeSpan = document.getElementsByClassName('close')[0];
const modalContent = document.querySelector('.modal-content');
const addToDiaryButton = document.getElementById('add-to-diary');
const foodTable = document.getElementById('foodTable'); 
const foodEntries = document.getElementById('foodEntries');

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
      <button onclick="addToDiary('${food.description}', ${food.fdcId})">Add to diary</button>
    `;
    modalContent.appendChild(foodDiv);
  });
}

async function addToDiary(foodName, foodItemId) {
  try {
    // replace 'userId' with the actual id of the user
    const userId = "647819fceee9cc64b271b635"
    const response = await axios.post('https://ego-quest.herokuapp.com/users/647819fceee9cc64b271b635/food-entries', {
      foodName,
      foodItemId,
      user: userId
    });
    displayFoodEntries();
  } catch (error) {
    console.error(error);
  }
}

async function displayFoodEntries() {
  try {
    // replace 'userId' with the actual id of the user
    const response = await axios.get('https://ego-quest.herokuapp.com/users/647819fceee9cc64b271b635/food-entries');
    const entries = response.data;
    foodTable.innerHTML = '';
    entries.forEach(entry => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${entry.foodName}</td>
        <td>${entry.calories}</td>
        <td>${entry.protein}</td>
        <td>${entry.fats}</td>
        <td>${entry.carbs}</td>
        <td><button onclick="deleteEntry('${entry._id}')">Delete</button></td>
      `;

      foodTable.appendChild(row);
    });

  } catch (error) {
    console.error(error);
  }
}
async function deleteEntry(id) {
  try {
    // replace 'userId' with the actual id of the user
    await axios.delete(`https://ego-quest.herokuapp.com/users/647819fceee9cc64b271b635/food-entries/${id}`);
    const row = document.getElementById(`entry-${id}`);
    if (row) {
      row.remove(); // remove the deleted entry from the table
    }
  } catch (error) {
    console.error(error);
  }
}


// async function deleteEntry(id) {
//   try {
//     // replace 'userId' with the actual id of the user
//     await axios.delete(`https://ego-quest.herokuapp.com/users/647819fceee9cc64b271b635/food-entries/${id}`);
//     displayFoodEntries();
//   } catch (error) {
//     console.error(error);
//   }
// }

// Call displayFoodEntries on page load to show all entries
displayFoodEntries();


// const API_KEY = 'fDzBVQf9yQdHWsF4P3bBg8f2YyP50gQi0F1WL8Dn';
// const searchButton = document.getElementById('searchButton');
// const searchInput = document.getElementById('searchInput');
// const modal = document.getElementById('food-modal');
// const closeSpan = document.getElementsByClassName('close')[0];
// const modalContent = document.querySelector('.modal-content');
// const addToDiaryButton = document.getElementById('add-to-diary');

// // When the user clicks on the button, open the modal 
// searchButton.onclick = function() {
//   modal.style.display = "block";
//   searchForFood(searchInput.value);
// }

// // When the user clicks on <span> (x), close the modal
// closeSpan.addEventListener("click", () => {
//   modal.style.display = "none";
// });

// // When the user clicks anywhere outside of the modal, close it
// window.onclick = function(event) {
//   if (event.target == modal) {
//     modal.style.display = "none";
//   }
// }

// async function searchForFood(query) {
//   try {
//     const response = await axios.get(`https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${API_KEY}&query=${query}`);
//     const foods = response.data.foods;
//     displayFoods(foods);
//   } catch (error) {
//     console.error(error);
//   }
// }

// function displayFoods(foods) {
//   modalContent.innerHTML = '<span class="close">&times;</span><h2>Search Results:</h2>';
//   foods.forEach(food => {
//     const foodDiv = document.createElement('div');
//     foodDiv.innerHTML = `
//       <h3>${food.description}</h3>
//       <p>Calories: ${getNutrientValue(food, 'Energy')}</p>
//       <p>Protein: ${getNutrientValue(food, 'Protein')}</p>
//       <p>Fats: ${getNutrientValue(food, 'Total lipid (fat)')}</p>
//       <p>Carbs: ${getNutrientValue(food, 'Carbohydrate, by difference')}</p>
//       <button onclick="addToDiary('${food.description}')">Add to diary</button>
//     `;
//     modalContent.appendChild(foodDiv);
//   });
// }

// function getNutrientValue(food, nutrientName) {
//   const nutrient = food.foodNutrients.find(n => n.nutrientName === nutrientName);
//   return nutrient ? nutrient.value : 'N/A';
// }

// function addToDiary(foodName) {
//   // Here you can add code to add the food to the user's diary
//   console.log(`Adding ${foodName} to diary...`);
// }
