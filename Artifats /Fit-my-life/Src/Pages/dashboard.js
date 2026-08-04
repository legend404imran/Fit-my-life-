import { DB } from '../db.js';
import { Charts } from '../components/charts.js';
import { getDailyQuote } from '../utils/quotes.js';
import { getIcon } from '../utils/icons.js';
import { Fab } from '../components/fab.js';

export async function render(container) {
  const today = new Date().toISOString().split('T')[0];
  
  // Fetch data
  const profile = window.Store.get('fml_profile', { name: 'Friend', dailyTargets: { calories: 2000, protein: 150, water: 2500, workout: 1 } });
  const meals = await DB.getByIndex('meals', 'date', today);
  const waterLog = await DB.getByIndex('water_log', 'date', today);
  const workouts = await DB.getByIndex('workouts', 'date', today);
  const weight = await DB.get('weight_log', today);
  
  // Calculate totals
  let cals = 0, pro = 0, carbs = 0, fat = 0;
  meals.forEach(m => { cals += m.calories; pro += m.protein; carbs += m.carbs; fat += m.fat; });
  const waterTotal = waterLog.reduce((sum, w) => sum + w.amount, 0);
  const workoutCount = workouts.length;
  
  const targets = profile.dailyTargets || { calories: 2000, protein: 150, water: 2500, workout: 1 };
  const quote = getDailyQuote();
  
  container.innerHTML = `
    <div class="page-container pb-24">
      <div class="flex justify-between items-center mb-6">
        <div>
          <p class="text-muted font-semibold text-sm">Good morning,</p>
          <h1 class="text-2xl font-bold">${profile.name}</h1>
        </div>
        <div class="bg-card px-3 py-1 rounded-full border border-glass-border flex items-center gap-2">
          <span class="text-warning">${getIcon('flame', 16)}</span>
          <span class="font-bold text-sm">12 Day Streak</span>
        </div>
      </div>
      
      <div class="card mb-6 stagger-1">
        <p class="italic text-sm text-secondary">"${quote.text}"</p>
        <p class="text-xs text-muted mt-2 text-right">- ${quote.author}</p>
      </div>
      
      <div class="grid grid-cols-4 gap-2 mb-6 stagger-2" id="dashboard-rings"></div>
      
      <div class="card mb-6 stagger-3">
        <h2 class="text-lg font-bold mb-4">Today's Macros</h2>
        <div class="flex flex-col gap-4">
          <div>
            <div class="flex justify-between text-sm mb-1">
              <span>Protein</span>
              <span class="font-bold">${pro} / ${targets.protein}g</span>
            </div>
            <div class="w-full bg-secondary rounded-full h-2">
              <div class="bg-blue h-2 rounded-full" style="width: ${Math.min((pro/targets.protein)*100, 100)}%"></div>
            </div>
          </div>
          <div>
            <div class="flex justify-between text-sm mb-1">
              <span>Carbs</span>
              <span class="font-bold">${carbs} / ${targets.carbs || 250}g</span>
            </div>
            <div class="w-full bg-secondary rounded-full h-2">
              <div class="bg-green h-2 rounded-full" style="width: ${Math.min((carbs/(targets.carbs||250))*100, 100)}%"></div>
            </div>
          </div>
          <div>
            <div class="flex justify-between text-sm mb-1">
              <span>Fat</span>
              <span class="font-bold">${fat} / ${targets.fat || 70}g</span>
            </div>
            <div class="w-full bg-secondary rounded-full h-2">
              <div class="bg-warning h-2 rounded-full" style="width: ${Math.min((fat/(targets.fat||70))*100, 100)}%"></div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="grid grid-cols-2 gap-4 mb-6 stagger-4">
        <a href="#/weight" class="card flex flex-col gap-1">
          <div class="text-muted mb-1">${getIcon('activity', 20)}</div>
          <div class="text-sm text-secondary">Current Weight</div>
          <div class="text-xl font-bold">${weight ? weight.weight : (profile.weight || '--')} kg</div>
        </a>
        <a href="#/workout" class="card flex flex-col gap-1">
          <div class="text-muted mb-1">${getIcon('dumbbell', 20)}</div>
          <div class="text-sm text-secondary">Next Workout</div>
          <div class="text-md font-bold text-blue">Push Day</div>
        </a>
      </div>
      
      <div class="card mb-6" style="height: 200px">
        <h3 class="text-sm font-bold text-muted mb-2">CALORIES THIS WEEK</h3>
        <canvas id="dash-chart" width="300" height="130" style="width:100%; height:100%; display:block;"></canvas>
      </div>
    </div>
  `;
  
  // Render Rings
  const ringsContainer = container.querySelector('#dashboard-rings');
  ringsContainer.innerHTML = `
    <div id="ring-cal"></div>
    <div id="ring-pro"></div>
    <div id="ring-wat"></div>
    <div id="ring-wor"></div>
  `;
  
  Charts.ring(document.getElementById('ring-cal'), { value: cals, max: targets.calories, color: 'var(--blue)', label: 'Kcal', size: 60, stroke: 6 });
  Charts.ring(document.getElementById('ring-pro'), { value: pro, max: targets.protein, color: 'var(--green)', label: 'Protein', size: 60, stroke: 6 });
  Charts.ring(document.getElementById('ring-wat'), { value: waterTotal, max: targets.water, color: 'var(--blue)', label: 'Water', size: 60, stroke: 6 });
  Charts.ring(document.getElementById('ring-wor'), { value: workoutCount, max: targets.workout || 1, color: 'var(--warning)', label: 'Workout', size: 60, stroke: 6 });

  // Render Chart
  setTimeout(() => {
    const canvas = document.getElementById('dash-chart');
    if (canvas) {
      // Mock data for week
      Charts.bar(canvas, {
        labels: ['M','T','W','T','F','S','S'],
        data: [1800, 2100, 1950, 2200, 2000, 2400, cals],
        color: '#3b82f6',
        maxVal: 2500
      });
    }
  }, 100);
  
  Fab.render(container);
}