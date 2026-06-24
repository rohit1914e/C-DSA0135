/**
 * C++ Equivalent: class Movie
 * Demonstrates Encapsulation and Data Abstraction.
 */
export class Movie {
  public id: string;
  public title: string;
  public duration: string;
  public rating: string;
  public genre: string[];
  public description: string;
  public cast: string[];
  public releaseYear: string;
  public posterUrl?: string;

  constructor(
    id: string,
    title: string,
    duration: string,
    rating: string,
    genre: string[],
    description: string,
    cast: string[],
    releaseYear: string,
    posterUrl?: string
  ) {
    this.id = id;
    this.title = title;
    this.duration = duration;
    this.rating = rating;
    this.genre = genre;
    this.description = description;
    this.cast = cast;
    this.releaseYear = releaseYear;
    this.posterUrl = posterUrl;
  }

  // Method to check if movie matches search query
  public matchesSearch(query: string): boolean {
    return this.title.toLowerCase().includes(query.toLowerCase());
  }
}
