import { Movie } from '../models/Movie';
import interstellarPoster from '../assets/posters/interstellar.png';
import spidermanPoster from '../assets/posters/spiderman.png';
import kanguvaPoster from '../assets/posters/kanguva.png';
import obsessionPoster from '../assets/posters/obsession.png';
import backroomsPoster from '../assets/posters/backrooms.png';
import michaelPoster from '../assets/posters/michael.png';

export const MOVIES: Movie[] = [
  new Movie(
    'interstellar',
    'Interstellar',
    '2h 49m',
    'PG-13',
    ['Sci-Fi', 'Adventure', 'Drama'],
    'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival as Earth\'s resources are depleted.',
    ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain', 'Michael Caine'],
    '2014',
    interstellarPoster
  ),
  new Movie(
    'spiderman-bnd',
    'Spider-Man: Brand New Day',
    '2h 15m',
    'PG-13',
    ['Action', 'Superhero', 'Adventure'],
    'Peter Parker faces his greatest challenge yet as a new villain emerges, forcing him to redefine what it means to be a hero in a brand new day.',
    ['Tom Holland', 'Zendaya', 'Jacob Batalon', 'Marisa Tomei'],
    '2026',
    spidermanPoster
  ),
  new Movie(
    'kanguva',
    'Kanguva',
    '2h 34m',
    'R',
    ['Action', 'Fantasy', 'Historical'],
    'An ancient warrior\'s epic saga of valor and vengeance spans across generations, intertwining a dark past with a modern-day conflict.',
    ['Suriya', 'Bobby Deol', 'Disha Patani'],
    '2024',
    kanguvaPoster
  ),
  new Movie(
    'obsession',
    'Obsession',
    '1h 55m',
    'R',
    ['Psychological Thriller', 'Mystery'],
    'A renowned architect becomes dangerously obsessed with a mysterious client, unravelling a web of secrets that threaten his life and sanity.',
    ['Cillian Murphy', 'Florence Pugh', 'Willem Dafoe'],
    '2025',
    obsessionPoster
  ),
  new Movie(
    'backrooms',
    'The Backrooms',
    '1h 48m',
    'R',
    ['Horror', 'Sci-Fi', 'Found Footage'],
    'A group of urban explorers clip out of reality and find themselves trapped in an endless maze of liminal spaces, hunted by unknown entities.',
    ['Anya Taylor-Joy', 'Daniel Kaluuya', 'Steven Yeun'],
    '2025',
    backroomsPoster
  ),
  new Movie(
    'michael',
    'Michael',
    '2h 20m',
    'PG-13',
    ['Biography', 'Music', 'Drama'],
    'The definitive biographical drama chronicling the complex life, unprecedented success, and lasting legacy of the King of Pop.',
    ['Jaafar Jackson', 'Colman Domingo', 'Nia Long'],
    '2025',
    michaelPoster
  )
];
