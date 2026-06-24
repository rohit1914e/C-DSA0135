/**
 * C++ Equivalent: class Theatre
 * Demonstrates Encapsulation and Data Abstraction.
 */
export class Theatre {
  public id: string;
  public name: string;
  public location: string;
  public rating: number;
  public features: string[];
  public screens: number;

  constructor(
    id: string,
    name: string,
    location: string,
    rating: number,
    features: string[],
    screens: number
  ) {
    this.id = id;
    this.name = name;
    this.location = location;
    this.rating = rating;
    this.features = features;
    this.screens = screens;
  }
}
