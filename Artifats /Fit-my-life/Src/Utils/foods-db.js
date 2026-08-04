export const foodsDB = [
  { id: 'f_1', name: 'Chicken Breast', category: 'Protein', calories: 165, protein: 31, carbs: 0, fat: 3.6, per: '100g' },
  { id: 'f_2', name: 'Eggs (Large)', category: 'Protein', calories: 72, protein: 6, carbs: 0.6, fat: 4.8, per: '1 large' },
  { id: 'f_3', name: 'Salmon', category: 'Protein', calories: 208, protein: 20, carbs: 0, fat: 13, per: '100g' },
  { id: 'f_4', name: 'White Rice (Cooked)', category: 'Grains', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, per: '100g' },
  { id: 'f_5', name: 'Oats (Dry)', category: 'Grains', calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9, per: '100g' },
  { id: 'f_6', name: 'Sweet Potato (Cooked)', category: 'Carbs', calories: 90, protein: 2, carbs: 21, fat: 0.1, per: '100g' },
  { id: 'f_7', name: 'Broccoli', category: 'Vegetables', calories: 34, protein: 2.8, carbs: 6.6, fat: 0.4, per: '100g' },
  { id: 'f_8', name: 'Almonds', category: 'Fats', calories: 579, protein: 21.1, carbs: 21.6, fat: 49.9, per: '100g' },
  { id: 'f_9', name: 'Banana', category: 'Fruits', calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, per: '1 medium' },
  { id: 'f_10', name: 'Greek Yogurt (0%)', category: 'Dairy', calories: 59, protein: 10, carbs: 3.6, fat: 0.4, per: '100g' }
];

export const searchFoods = (query) => {
  if (!query) return foodsDB;
  const q = query.toLowerCase();
  return foodsDB.filter(f => f.name.toLowerCase().includes(q));
};