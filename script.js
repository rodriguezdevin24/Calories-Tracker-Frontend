
const API_KEY = 'fDzBVQf9yQdHWsF4P3bBg8f2YyP50gQi0F1WL8Dn';
const searchButton = document.getElementById('searchButton');
const scanButton = document.getElementById('scanButton');
const searchInput = document.getElementById('searchInput');
const modal = document.getElementById('food-modal');
const closeSpan = document.getElementsByClassName('close')[0];
const modalContent = document.querySelector('.modal-content');
const addToDiaryButton = document.getElementById('add-to-diary');
const foodTable = document.getElementById('foodTable'); 
const foodEntries = document.getElementById('foodEntries');
document.addEventListener('DOMContentLoaded', function() {
  let isScannerRunning = false;
// Initialize the barcode scanner
window.onload = function() {
  // Event handler for the "Scan Barcode" button
  scanButton.onclick = function() {
    if (!isScannerRunning) {
    Quagga.init(
      {
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: "#qr-reader",
        },
        decoder: {
          readers: ["ean_reader"], // specify the barcode format you want to read
        },
      },
      function(err) {
        if (err) {
          console.error("Error starting barcode scanner:", err);
          return;
        }
        console.log("Barcode scanner started successfully.");
        Quagga.start();
        isScannerRunning = true;
      }
    );
    }
  };
  document.addEventListener("click", function(event) {
    const qrReader = document.getElementById("qr-reader");
    if (!qrReader.contains(event.target) && isScannerRunning) {
      Quagga.stop();
      console.log("Barcode scanner stopped.");
      isScannerRunning = false;
      qrReader.style.display = "none";
    }
  });
};
});

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
function getNutrientValue(food, nutrientName) {
  const nutrient = food.foodNutrients.find(n => n.nutrientName === nutrientName);
  return nutrient ? nutrient.value : 'N/A';
}

function displayFoods(foods) {
  modalContent.innerHTML = '<span class="close">&times;</span><h2>Search Results:</h2>';
  const table = document.createElement('table');
  const tbody = document.createElement('tbody');
  
  foods.forEach(food => {
    const foodNameRow = document.createElement('tr');
    const foodNameCell = document.createElement('td');
    foodNameCell.setAttribute('colspan', '6');
    foodNameCell.innerHTML = `<h3>${food.description}</h3>`;
    foodNameRow.appendChild(foodNameCell);
    tbody.appendChild(foodNameRow);
    
    const nutrientCategories = [
      { label: 'Calories:', nutrientName: 'Energy' },
      { label: 'Protein:', nutrientName: 'Protein' },
      { label: 'Fats:', nutrientName: 'Total lipid (fat)' },
      { label: 'Carbs:', nutrientName: 'Carbohydrate, by difference' }
    ];
    
    nutrientCategories.forEach(category => {
      const categoryRow = document.createElement('tr');
      const labelCell = document.createElement('td');
      labelCell.innerText = category.label;
      const valueCell = document.createElement('td');
      valueCell.innerText = getNutrientValue(food, category.nutrientName);
      categoryRow.appendChild(labelCell);
      categoryRow.appendChild(valueCell);
      tbody.appendChild(categoryRow);
    });
    
    const addToDiaryRow = document.createElement('tr');
    const addToDiaryCell = document.createElement('td');
    addToDiaryCell.setAttribute('colspan', '6');
    addToDiaryCell.innerHTML = `<button onclick="addToDiary('${food.description}', ${food.fdcId})">Add to diary</button>`;
    addToDiaryRow.appendChild(addToDiaryCell);
    tbody.appendChild(addToDiaryRow);
  });
  
  table.appendChild(tbody);
  modalContent.appendChild(table);
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
    await displayTotals();
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
    await axios.delete(`https://ego-quest.herokuapp.com/users/647819fceee9cc64b271b635/food-entries/${id}`);
    const row = document.getElementById(`entry-${id}`);
    if (row) {
      row.remove(); // remove the deleted entry from the table
    }
    // After deleting an entry, re-fetch all entries and update the totals
    await displayFoodEntries();
    await displayTotals(); // This is a new function you'll create to calculate and display the totals
  } catch (error) {
    console.error(error);
  }
}

async function displayTotals() {
  // Fetch all entries
  const response = await axios.get('https://ego-quest.herokuapp.com/users/647819fceee9cc64b271b635/food-entries');
  const entries = response.data;

  // Calculate totals
  let totalCalories = 0;
  let totalProtein = 0;
  let totalFats = 0;
  let totalCarbs = 0;
  entries.forEach(entry => {
    totalCalories += entry.calories;
    totalProtein += entry.protein;
    totalFats += entry.fats;
    totalCarbs += entry.carbs;
  });
  totalCalories = Math.round(totalCalories);
  totalProtein = Math.round(totalProtein);
  totalFats = Math.round(totalFats);
  totalCarbs = Math.round(totalCarbs);

  // Update totals in the table
  const totalsRow = document.getElementById('totalsRow');
  if (totalsRow) {
    totalsRow.innerHTML = `
      <td>Totals</td>
      <td>${totalCalories}</td>
      <td>${totalProtein}</td>
      <td>${totalFats}</td>
      <td>${totalCarbs}</td>
    `;
  } else {
    // If the totals row doesn't exist yet, create it
    const newTotalsRow = document.createElement('tr');
    newTotalsRow.id = 'totalsRow';
    newTotalsRow.innerHTML = `
      <td>Totals</td>
      <td>${totalCalories}</td>
      <td>${totalProtein}</td>
      <td>${totalFats}</td>
      <td>${totalCarbs}</td>
    `;
    totalsTable.appendChild(newTotalsRow);
  }
}


// Call displayFoodEntries on page load to show all entries
displayFoodEntries();
displayTotals();


