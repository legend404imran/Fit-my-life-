import { DB } from '../db.js';
import { searchFoods } from '../utils/foods-db.js';
import { getIcon } from '../utils/icons.js';
import { Modal } from '../components/modals.js';
import { Toast } from '../components/toast.js';

let currentDate = new Date().toISOString().split('T')[0];

export async function render(container) {
  await renderFoodPage(container);
}

async function renderFoodPage(container) {
  const meals = await DB.getByIndex('meals', 'date', currentDate);
  
  let cals = 0, pro = 0, carbs = 0, fat = 0;
  const categorized = { Breakfast: [], Lunch: [], Dinner: [], Snacks: [] };
  
  meals.forEach(m => {
    cals += m.calories; pro += m.protein; carbs += m.carbs; fat += m.fat;
    if (categorized[m.type]) categorized[m.type].push(m);
  });
  
  const targets = window.Store.get('fml_profile', {}).dailyTargets || { calories: 2000, protein: 150 };

  container.innerHTML = `
    <div class="page-container pb-24">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Food Log</h1>
        <input type="date" id="food-date" value="${currentDate}" class="bg-card text-sm py-1 px-2 w-auto" />
      </div>
      
      <div class="card mb-6 flex items-center justify-between">
        <div>
          <div class="text-sm text-muted">Calories Remaining</div>
          <div class="text-3xl font-bold ${cals > targets.calories ? 'text-danger' : 'text-blue'}">
            ${targets.calories - cals}
          </div>
          <div class="text-xs text-secondary mt-1">${cals} / ${targets.calories} kcal</div>
        </div>
        <div style="width: 80px; height: 80px; position:relative;">
          <svg viewBox="0 0 36 36" style="transform: rotate(-90deg); width:100%; height:100%;">
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--glass-border)" stroke-width="3" />
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--blue)" stroke-width="3" stroke-dasharray="${Math.min((cals/targets.calories)*100, 100)}, 100" />
          </svg>
        </div>
      </div>
      
      <div class="flex gap-2 mb-6 overflow-x-auto pb-2 text-sm">
        <div class="bg-card px-3 py-1 rounded-full">P: ${pro}g</div>
        <div class="bg-card px-3 py-1 rounded-full">C: ${carbs}g</div>
        <div class="bg-card px-3 py-1 rounded-full">F: ${fat}g</div>
      </div>
      
      <div class="flex flex-col gap-6">
        ${Object.keys(categorized).map(type => `
          <div>
            <div class="flex justify-between items-center mb-2">
              <h2 class="font-bold text-lg">${type}</h2>
              <button class="add-food-btn text-blue bg-blue-glow rounded-full w-8 h-8 flex items-center justify-center" data-type="${type}">
                ${getIcon('plus', 16)}
              </button>
            </div>
            
            <div class="flex flex-col gap-2">
              ${categorized[type].length === 0 ? `
                <div class="card text-center text-sm text-muted py-4 border-dashed">No food logged yet.</div>
              ` : categorized[type].map(food => `
                <div class="card py-3 flex justify-between items-center">
                  <div>
                    <div class="font-semibold">${food.name}</div>
                    <div class="text-xs text-secondary">${food.amount}${food.unit} • ${food.protein}P ${food.carbs}C ${food.fat}F</div>
                  </div>
                  <div class="flex items-center gap-4">
                    <div class="font-bold">${food.calories}</div>
                    <button class="delete-food-btn text-muted" data-id="${food.id}">${getIcon('trash', 16)}</button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  // Bind Events
  container.querySelector('#food-date').addEventListener('change', (e) => {
    currentDate = e.target.value;
    renderFoodPage(container);
  });

  container.querySelectorAll('.add-food-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const type = e.currentTarget.dataset.type;
      openAddFoodModal(type, container);
    });
  });

  container.querySelectorAll('.delete-food-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.currentTarget.dataset.id;
      await DB.delete('meals', id);
      Toast.show('Item deleted');
      renderFoodPage(container);
    });
  });
}

function openAddFoodModal(mealType, container) {
  Modal.open(`Add to ${mealType}`, `
    <div class="mb-4">
      <div class="relative">
        <span class="absolute left-3 top-3 text-muted">${getIcon('search', 16)}</span>
        <input type="text" id="food-search" placeholder="Search foods..." class="pl-10" />
      </div>
    </div>
    <div id="food-search-results" class="flex flex-col gap-2 max-h-60 overflow-y-auto"></div>
    <div class="mt-4 border-t border-glass-border pt-4">
      <button id="custom-food-btn" class="btn btn-glass w-full text-blue">Add Custom Food</button>
    </div>
  `);

  const resultsContainer = document.getElementById('food-search-results');
  
  const renderResults = (query = '') => {
    const results = searchFoods(query);
    resultsContainer.innerHTML = results.map(f => `
      <div class="card p-3 flex justify-between items-center cursor-pointer hover-elevate food-item" data-id="${f.id}">
        <div>
          <div class="font-semibold text-sm">${f.name}</div>
          <div class="text-xs text-muted">${f.calories} kcal / ${f.per}</div>
        </div>
        <div>${getIcon('plus', 16)}</div>
      </div>
    `).join('');
    
    resultsContainer.querySelectorAll('.food-item').forEach(item => {
      item.addEventListener('click', () => {
        const food = results.find(f => f.id === item.dataset.id);
        openFoodDetailModal(food, mealType, container);
      });
    });
  };
  
  renderResults();
  
  document.getElementById('food-search').addEventListener('input', (e) => {
    renderResults(e.target.value);
  });
  
  document.getElementById('custom-food-btn').addEventListener('click', () => {
    openFoodDetailModal(null, mealType, container);
  });
}

function openFoodDetailModal(food, mealType, container) {
  const isCustom = !food;
  const defaultFood = food || { name: '', calories: 0, protein: 0, carbs: 0, fat: 0, per: '1 serving' };
  
  Modal.open(isCustom ? 'Add Custom Food' : 'Log Food', `
    <form id="log-food-form" class="flex flex-col gap-4">
      ${isCustom ? `
        <div>
          <label class="form-label">Name</label>
          <input type="text" id="f-name" required />
        </div>
      ` : `
        <div class="text-lg font-bold text-center mb-2">${food.name}</div>
        <div class="text-sm text-center text-muted mb-4">${food.calories} kcal per ${food.per}</div>
      `}
      
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="form-label">Amount</label>
          <input type="number" id="f-amount" value="1" step="0.1" required />
        </div>
        <div>
          <label class="form-label">Unit</label>
          <input type="text" id="f-unit" value="${isCustom ? 'serving' : (food.per.includes('g') ? 'x100g' : 'serving')}" required />
        </div>
      </div>
      
      ${isCustom ? `
        <div class="grid grid-cols-2 gap-4">
          <div><label class="form-label">Calories</label><input type="number" id="f-cals" required /></div>
          <div><label class="form-label">Protein (g)</label><input type="number" id="f-pro" required /></div>
          <div><label class="form-label">Carbs (g)</label><input type="number" id="f-carbs" required /></div>
          <div><label class="form-label">Fat (g)</label><input type="number" id="f-fat" required /></div>
        </div>
      ` : ''}
      
      <button type="submit" class="btn btn-primary w-full mt-2">Log Food</button>
    </form>
  `);

  document.getElementById('log-food-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const amount = parseFloat(document.getElementById('f-amount').value) || 1;
    
    let cals, pro, carbs, fat, name, unit;
    
    if (isCustom) {
      name = document.getElementById('f-name').value;
      cals = parseFloat(document.getElementById('f-cals').value) * amount;
      pro = parseFloat(document.getElementById('f-pro').value) * amount;
      carbs = parseFloat(document.getElementById('f-carbs').value) * amount;
      fat = parseFloat(document.getElementById('f-fat').value) * amount;
      unit = document.getElementById('f-unit').value;
    } else {
      name = food.name;
      unit = document.getElementById('f-unit').value;
      cals = food.calories * amount;
      pro = food.protein * amount;
      carbs = food.carbs * amount;
      fat = food.fat * amount;
    }
    
    const entry = {
      id: 'm_' + Date.now(),
      date: currentDate,
      type: mealType,
      name,
      amount,
      unit,
      calories: Math.round(cals),
      protein: Math.round(pro),
      carbs: Math.round(carbs),
      fat: Math.round(fat),
      timestamp: Date.now()
    };
    
    await DB.put('meals', entry);
    Toast.show('Food logged');
    Modal.close();
    renderFoodPage(container);
  });
}