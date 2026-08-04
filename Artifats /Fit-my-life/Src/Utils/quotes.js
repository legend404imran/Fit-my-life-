export const quotes = [
  { text: "The hardest lift of all is lifting your butt off the couch.", author: "Unknown" },
  { text: "If you think lifting is dangerous, try being weak. Being weak is dangerous.", author: "Bret Contreras" },
  { text: "The only bad workout is the one that didn't happen.", author: "Unknown" },
  { text: "It never gets easier, you just get stronger.", author: "Unknown" },
  { text: "What seems impossible today will one day become your warm-up.", author: "Unknown" },
  { text: "Discipline is doing what you hate to do, but nonetheless doing it like you love it.", author: "Mike Tyson" },
  { text: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Ryun" },
  { text: "No pain, no gain. Shut up and train.", author: "Unknown" },
  { text: "Your body can stand almost anything. It's your mind that you have to convince.", author: "Unknown" },
  { text: "Don't stop when you're tired. Stop when you're done.", author: "David Goggins" }
];

export const getDailyQuote = () => {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  return quotes[dayOfYear % quotes.length];
};