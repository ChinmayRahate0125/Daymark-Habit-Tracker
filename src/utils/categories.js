export const CATEGORIES = ['Learn', 'Fitness', 'Personal', 'Skill'];

export function categoryIcon(cat) {
  const icons = { Learn: '📚', Fitness: '🏃', Personal: '✨', Skill: '🔧' };
  return icons[cat] || '📌';
}

export function categoryColor(cat) {
  const colors = {
    Learn: 'text-sky-400',
    Fitness: 'text-emerald-400',
    Personal: 'text-amber-400',
    Skill: 'text-rose-400',
  };
  return colors[cat] || 'text-violet-400';
}
