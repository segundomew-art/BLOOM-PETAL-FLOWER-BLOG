import { Post, Feedback } from './types';

export const INITIAL_POSTS: Post[] = [
  {
    id: '1',
    title: 'The Elegance of White Lilies',
    shortDescription: 'Discover the symbolism and beauty of lilies in modern floral arrangements.',
    content: 'White lilies are often associated with purity and virtue. In the language of flowers, they represent a sense of being reborn and a fresh start. They are popular in weddings and funerals alike for their serene presence. Caring for them requires bright, indirect light and consistent moisture without waterlogging the soil.',
    imageUrl: 'https://i.imgur.com/31djDD2.jpg',
    date: '2024-03-10',
    featured: true,
  },
  {
    id: '2',
    title: 'Sunflowers: Bringing Joy to Your Garden',
    shortDescription: 'Learn how to grow these towering giants and harvest their seeds.',
    content: 'Sunflowers are the quintessential summer flower. They are heliotropic, meaning they turn their heads to follow the sun. Growing them is relatively easy as they are hardy and drought-tolerant once established. They need at least 6-8 hours of direct sunlight daily to thrive and reach their full height.',
    imageUrl: 'https://i.imgur.com/30gW6Hi.jpg',
    date: '2024-03-08',
    featured: true,
  },
  {
    id: '3',
    title: 'The Secret Life of Peonies',
    shortDescription: 'Why these lush blooms are the stars of the spring season.',
    content: 'Peonies are beloved for their massive, fragrant blooms that appear for a short but spectacular window in late spring. They are perennials that can live for decades if planted in the right spot. They prefer well-drained soil and a cold winter period to set their buds for the following year.',
    imageUrl: 'https://i.imgur.com/NlAfexM.jpg',
    date: '2024-03-05',
    featured: false,
  },
];

export const INITIAL_FEEDBACK: Feedback[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    message: 'I love your care guides! My lilies are finally thriving.',
    date: '2024-03-09',
  }
];
