import {
  MapPin,
  Utensils,
  BookOpen,
  Film,
  Disc,
  GraduationCap,
} from 'lucide-react';

export const LIST_CATEGORIES = [
  {
    id: 'places',
    name: 'Places to Go',
    singular: 'Place',
    subtitle: 'Destinations, cities, parks, and spots to visit.',
    icon: MapPin,
    fields: [
      { key: 'location', label: 'Location or Address', placeholder: 'e.g. Kyoto, Japan or 124 Main St' },
    ],
  },
  {
    id: 'food',
    name: 'Food to Try',
    singular: 'Dish',
    subtitle: 'Dishes, delicacies, and restaurants to experience.',
    icon: Utensils,
    fields: [
      { key: 'place', label: 'Restaurant or Place', placeholder: 'e.g. Joe\'s Pizza, NYC' },
    ],
  },
  {
    id: 'books',
    name: 'Books to Read',
    singular: 'Book',
    subtitle: 'Novels, essays, non-fiction, and reads on your list.',
    icon: BookOpen,
    fields: [
      { key: 'author', label: 'Author', placeholder: 'e.g. James Clear' },
    ],
  },
  {
    id: 'movies',
    name: 'Movies to Watch',
    singular: 'Movie',
    subtitle: 'Films, cinema, and documentaries to watch.',
    icon: Film,
    fields: [
      { key: 'genre', label: 'Genre', placeholder: 'e.g. Sci-Fi, Thriller' },
      { key: 'year', label: 'Release Year', placeholder: 'e.g. 1999' },
    ],
  },
  {
    id: 'albums',
    name: 'Albums to Listen To',
    singular: 'Album',
    subtitle: 'Records, albums, and discographies to hear.',
    icon: Disc,
    fields: [
      { key: 'artist', label: 'Artist', placeholder: 'e.g. Pink Floyd' },
      { key: 'genre', label: 'Genre', placeholder: 'e.g. Progressive Rock' },
    ],
  },
  {
    id: 'skills',
    name: 'Skills to Learn',
    singular: 'Skill',
    subtitle: 'Techniques, crafts, instruments, and abilities to master.',
    icon: GraduationCap,
    fields: [
      { key: 'resource', label: 'Learning Resource or Link', placeholder: 'e.g. Coursera, YouTube tutorial, Book' },
    ],
  },
];

export const getCategoryById = (id) =>
  LIST_CATEGORIES.find((cat) => cat.id === id) || null;

