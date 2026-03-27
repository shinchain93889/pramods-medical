export type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  image: string;
  composition?: string;
  sideEffects?: string;
};

export const categories = [
  { id: 'Tablets', name: 'Tablets', image: 'cat-tablets' },
  { id: 'Syrups', name: 'Syrups', image: 'cat-syrups' },
  { id: 'First Aid', name: 'First Aid', image: 'cat-firstaid' },
  { id: 'Health Supplements', name: 'Health Supplements', image: 'cat-health' },
];

export const products: Product[] = [
  {
    id: '1',
    name: 'Paracetamol 500mg',
    price: 15.00,
    category: 'Tablets',
    description: 'Relief from pain and fever.',
    image: 'prod-paracetamol'
  },
  {
    id: '2',
    name: 'Benadryl Cough Syrup',
    price: 120.00,
    category: 'Syrups',
    description: 'Effective relief for dry cough.',
    image: 'prod-cough'
  },
  {
    id: '3',
    name: 'Band-Aid Adhesive',
    price: 45.00,
    category: 'First Aid',
    description: 'Protection for minor cuts and scrapes.',
    image: 'prod-bandage'
  },
  {
    id: '4',
    name: 'Revital H Multivitamin',
    price: 350.00,
    category: 'Health Supplements',
    description: 'Daily multivitamin for energy and health.',
    image: 'prod-multivitamin'
  },
  {
    id: '5',
    name: 'Amoxicillin 250mg',
    price: 85.00,
    category: 'Tablets',
    description: 'Antibiotic for bacterial infections.',
    image: 'prod-paracetamol'
  },
  {
    id: '6',
    name: 'Corex Syrup',
    price: 110.00,
    category: 'Syrups',
    description: 'Standard relief for wet cough.',
    image: 'prod-cough'
  },
  {
    id: '7',
    name: 'Dettol Antiseptic',
    price: 95.00,
    category: 'First Aid',
    description: 'Protection against germs and infection.',
    image: 'prod-bandage'
  },
  {
    id: '8',
    name: 'Omega-3 Fish Oil',
    price: 550.00,
    category: 'Health Supplements',
    description: 'Heart and brain health support.',
    image: 'prod-multivitamin'
  }
];
