export const exerciseLibrary = [
  { id: 'ex_1', name: 'Bench Press', muscle: 'Chest', group: 'Push', equipment: 'Barbell', difficulty: 'Intermediate' },
  { id: 'ex_2', name: 'Incline Dumbbell Press', muscle: 'Chest', group: 'Push', equipment: 'Dumbbell', difficulty: 'Intermediate' },
  { id: 'ex_3', name: 'Push Ups', muscle: 'Chest', group: 'Push', equipment: 'Bodyweight', difficulty: 'Beginner' },
  { id: 'ex_4', name: 'Pull Ups', muscle: 'Back', group: 'Pull', equipment: 'Bodyweight', difficulty: 'Hard' },
  { id: 'ex_5', name: 'Lat Pulldown', muscle: 'Back', group: 'Pull', equipment: 'Cable', difficulty: 'Beginner' },
  { id: 'ex_6', name: 'Barbell Row', muscle: 'Back', group: 'Pull', equipment: 'Barbell', difficulty: 'Intermediate' },
  { id: 'ex_7', name: 'Deadlift', muscle: 'Back', group: 'Legs/Back', equipment: 'Barbell', difficulty: 'Hard' },
  { id: 'ex_8', name: 'Squat', muscle: 'Legs', group: 'Legs', equipment: 'Barbell', difficulty: 'Hard' },
  { id: 'ex_9', name: 'Leg Press', muscle: 'Legs', group: 'Legs', equipment: 'Machine', difficulty: 'Beginner' },
  { id: 'ex_10', name: 'Lunges', muscle: 'Legs', group: 'Legs', equipment: 'Dumbbell', difficulty: 'Intermediate' },
  { id: 'ex_11', name: 'Overhead Press', muscle: 'Shoulders', group: 'Push', equipment: 'Barbell', difficulty: 'Intermediate' },
  { id: 'ex_12', name: 'Lateral Raise', muscle: 'Shoulders', group: 'Push', equipment: 'Dumbbell', difficulty: 'Beginner' },
  { id: 'ex_13', name: 'Bicep Curl', muscle: 'Biceps', group: 'Pull', equipment: 'Dumbbell', difficulty: 'Beginner' },
  { id: 'ex_14', name: 'Tricep Pushdown', muscle: 'Triceps', group: 'Push', equipment: 'Cable', difficulty: 'Beginner' },
  { id: 'ex_15', name: 'Plank', muscle: 'Abs', group: 'Core', equipment: 'Bodyweight', difficulty: 'Beginner' },
  { id: 'ex_16', name: 'Running', muscle: 'Cardio', group: 'Cardio', equipment: 'None', difficulty: 'Beginner' }
];

export const searchExercises = (query) => {
  if (!query) return exerciseLibrary;
  const q = query.toLowerCase();
  return exerciseLibrary.filter(ex => 
    ex.name.toLowerCase().includes(q) || 
    ex.muscle.toLowerCase().includes(q)
  );
};