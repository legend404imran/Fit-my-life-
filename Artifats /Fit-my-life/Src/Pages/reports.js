import { DB } from '../db.js';
import { getIcon } from '../utils/icons.js';
import { Calc } from '../utils/calculations.js';

export async function render(container) {
  // Aggregate simple stats for "All Time"
  const workouts = await DB.getAll('workouts');
  const meals = await DB.getAll('meals');
  const water = await DB.getAll('water_log');
  
  const totalWorkouts = workouts.length;
  const totalWater = water.reduce((acc, w) => acc + w.amount, 0);
  const avgWater = water.length ? Math.round(totalWater / new Set(water.map(w=>w.date)).size) : 0;
  
  let totalCals = 0;
  meals.forEach(m => totalCals += m.calories);
  const avgCals = meals.length ? Math.round(totalCals / new Set(meals.map(m=>m.date)).size) : 0;

  container.innerHTML = `
    <div class="page-container pb-24">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold flex items-center gap-2">
          ${getIcon('pieChart', 24)} Reports
        </h1>
        <button id="export-pdf" class="btn btn-glass btn-sm border-glass-border">Export</button>
      </div>
      
      <div class="grid grid-cols-2 gap-4 mb-6">
        <div class="card p-4 text-center">
          <div class="text-muted text-sm mb-2">Total Workouts</div>
          <div class="text-3xl font-bold text-warning">${totalWorkouts}</div>
        </div>
        <div class="card p-4 text-center">
          <div class="text-muted text-sm mb-2">Total Volume</div>
          <div class="text-3xl font-bold text-blue">${workouts.reduce((s,w) => s + (w.exercises?w.exercises.length:0),0)} <span class="text-sm font-normal text-muted">ex</span></div>
        </div>
        <div class="card p-4 text-center">
          <div class="text-muted text-sm mb-2">Avg Water</div>
          <div class="text-2xl font-bold">${avgWater} <span class="text-sm font-normal text-muted">ml</span></div>
        </div>
        <div class="card p-4 text-center">
          <div class="text-muted text-sm mb-2">Avg Calories</div>
          <div class="text-2xl font-bold">${avgCals} <span class="text-sm font-normal text-muted">kcal</span></div>
        </div>
      </div>
      
      <div class="card mb-6 p-6 flex flex-col items-center justify-center text-center">
        <div class="text-green opacity-50 mb-4">${getIcon('award', 48)}</div>
        <h3 class="font-bold text-lg mb-2">Great Consistency!</h3>
        <p class="text-sm text-secondary">Keep logging daily to generate more accurate reports and insights.</p>
      </div>
    </div>
  `;

  container.querySelector('#export-pdf').addEventListener('click', () => {
    window.print();
  });
}