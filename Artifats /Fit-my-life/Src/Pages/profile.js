import { Calc } from '../utils/calculations.js';
import { Toast } from '../components/toast.js';

export async function render(container) {
  const store = window.Store;
  const p = store.get('fml_profile', {
    name: '', age: 25, gender: 'male', height: 175, weight: 70, targetWeight: 65,
    goal: 'lose', activityLevel: 'moderate', dailyTargets: {}
  });

  container.innerHTML = `
    <div class="page-container pb-24">
      <h1 class="text-2xl font-bold mb-6">Profile & Goals</h1>
      
      <form id="profile-form" class="flex flex-col gap-6">
        <div class="card">
          <h2 class="font-bold text-lg mb-4 text-blue">Personal Details</h2>
          <div class="form-group">
            <label class="form-label">Name</label>
            <input type="text" id="p-name" value="${p.name}" required />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="form-label">Age</label>
              <input type="number" id="p-age" value="${p.age}" required />
            </div>
            <div>
              <label class="form-label">Gender</label>
              <select id="p-gender">
                <option value="male" ${p.gender==='male'?'selected':''}>Male</option>
                <option value="female" ${p.gender==='female'?'selected':''}>Female</option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label class="form-label">Height (cm)</label>
              <input type="number" id="p-height" value="${p.height}" required />
            </div>
            <div>
              <label class="form-label">Weight (kg)</label>
              <input type="number" id="p-weight" value="${p.weight}" step="0.1" required />
            </div>
          </div>
        </div>
        
        <div class="card">
          <h2 class="font-bold text-lg mb-4 text-warning">Goals</h2>
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label class="form-label">Target Weight (kg)</label>
              <input type="number" id="p-tweight" value="${p.targetWeight}" step="0.1" />
            </div>
            <div>
              <label class="form-label">Primary Goal</label>
              <select id="p-goal">
                <option value="lose" ${p.goal==='lose'?'selected':''}>Lose Fat</option>
                <option value="maintain" ${p.goal==='maintain'?'selected':''}>Maintain</option>
                <option value="gain" ${p.goal==='gain'?'selected':''}>Build Muscle</option>
              </select>
            </div>
          </div>
          <div>
            <label class="form-label">Activity Level</label>
            <select id="p-activity">
              <option value="sedentary" ${p.activityLevel==='sedentary'?'selected':''}>Sedentary (Office job)</option>
              <option value="light" ${p.activityLevel==='light'?'selected':''}>Lightly Active (1-2 days/wk)</option>
              <option value="moderate" ${p.activityLevel==='moderate'?'selected':''}>Moderately Active (3-5 days/wk)</option>
              <option value="active" ${p.activityLevel==='active'?'selected':''}>Very Active (6-7 days/wk)</option>
            </select>
          </div>
        </div>
        
        <div class="card">
          <div class="flex justify-between items-center mb-4">
            <h2 class="font-bold text-lg text-green">Daily Targets</h2>
            <button type="button" id="calc-targets" class="text-xs bg-card px-2 py-1 border border-glass-border rounded">Auto Calculate</button>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div><label class="form-label">Calories</label><input type="number" id="t-cals" value="${p.dailyTargets?.calories || 2000}" /></div>
            <div><label class="form-label">Water (ml)</label><input type="number" id="t-water" value="${p.dailyTargets?.water || 2500}" /></div>
            <div><label class="form-label">Protein (g)</label><input type="number" id="t-pro" value="${p.dailyTargets?.protein || 150}" /></div>
            <div><label class="form-label">Carbs (g)</label><input type="number" id="t-carbs" value="${p.dailyTargets?.carbs || 250}" /></div>
            <div><label class="form-label">Fat (g)</label><input type="number" id="t-fat" value="${p.dailyTargets?.fat || 70}" /></div>
          </div>
        </div>
        
        <button type="submit" class="btn btn-primary py-4 text-lg w-full mb-8">Save Profile</button>
      </form>
    </div>
  `;

  // Auto Calculate
  container.querySelector('#calc-targets').addEventListener('click', () => {
    const prof = getFormData();
    const tdee = Calc.tdee(prof);
    const macros = Calc.macroSplit(prof.goal, tdee, prof.weight);
    const water = Calc.waterBaseline(prof.weight);
    
    document.getElementById('t-cals').value = tdee;
    document.getElementById('t-pro').value = macros.protein;
    document.getElementById('t-carbs').value = macros.carbs;
    document.getElementById('t-fat').value = macros.fat;
    document.getElementById('t-water').value = water;
    
    Toast.show('Targets calculated based on profile', 'info');
  });

  // Save
  container.querySelector('#profile-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const prof = getFormData();
    
    prof.dailyTargets = {
      calories: parseInt(document.getElementById('t-cals').value) || 2000,
      protein: parseInt(document.getElementById('t-pro').value) || 150,
      carbs: parseInt(document.getElementById('t-carbs').value) || 250,
      fat: parseInt(document.getElementById('t-fat').value) || 70,
      water: parseInt(document.getElementById('t-water').value) || 2500
    };
    
    store.set('fml_profile', prof);
    store.set('fml_onboarded', true);
    
    Toast.show('Profile updated successfully');
    
    // Check if we came from onboarding
    if(window.location.hash === '#/profile') {
      setTimeout(() => { window.location.hash = '#/'; }, 1000);
    }
  });

  function getFormData() {
    return {
      name: document.getElementById('p-name').value,
      age: parseInt(document.getElementById('p-age').value) || 25,
      gender: document.getElementById('p-gender').value,
      height: parseFloat(document.getElementById('p-height').value) || 175,
      weight: parseFloat(document.getElementById('p-weight').value) || 70,
      targetWeight: parseFloat(document.getElementById('p-tweight').value) || 65,
      goal: document.getElementById('p-goal').value,
      activityLevel: document.getElementById('p-activity').value
    };
  }
}