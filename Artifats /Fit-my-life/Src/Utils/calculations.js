export const Calc = {
  bmi(weightKg, heightCm) {
    if (!weightKg || !heightCm) return 0;
    return (weightKg / ((heightCm / 100) ** 2)).toFixed(1);
  },
  
  bmiCategory(bmi) {
    const val = parseFloat(bmi);
    if (val < 18.5) return { label: 'Underweight', color: 'var(--warning)' };
    if (val < 25) return { label: 'Normal', color: 'var(--green)' };
    if (val < 30) return { label: 'Overweight', color: 'var(--warning)' };
    return { label: 'Obese', color: 'var(--danger)' };
  },
  
  tdee(profile) {
    // Mifflin-St Jeor Equation
    let bmr = (10 * profile.weight) + (6.25 * profile.height) - (5 * profile.age);
    bmr += profile.gender === 'male' ? 5 : -161;
    
    const multipliers = {
      'sedentary': 1.2,
      'light': 1.375,
      'moderate': 1.55,
      'active': 1.725,
      'very_active': 1.9
    };
    
    let tdee = bmr * (multipliers[profile.activityLevel] || 1.2);
    
    // Adjust for goal
    if (profile.goal === 'lose') tdee -= 500;
    if (profile.goal === 'gain') tdee += 500;
    
    return Math.round(tdee);
  },
  
  macroSplit(goal, tdee, weightKg) {
    // Basic macro rules: 
    // Protein: 2g per kg bodyweight
    // Fat: 0.8g per kg bodyweight
    // Carbs: the rest
    
    const proteinGrams = Math.round(weightKg * 2.2); // ~1g per lb
    const fatGrams = Math.round(weightKg * 0.8);
    
    const proteinCals = proteinGrams * 4;
    const fatCals = fatGrams * 9;
    
    const carbCals = tdee - (proteinCals + fatCals);
    const carbGrams = Math.max(0, Math.round(carbCals / 4));
    
    return { protein: proteinGrams, carbs: carbGrams, fat: fatGrams };
  },
  
  waterBaseline(weightKg) {
    return Math.round(weightKg * 35); // 35ml per kg
  }
};