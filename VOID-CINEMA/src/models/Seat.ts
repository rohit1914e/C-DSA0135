/**
 * C++ Equivalent: class Seat
 * Demonstrates Encapsulation and structural abstraction.
 */
export class Seat {
  public id: string;
  public row: string;
  public number: number;
  public category: 'VIP' | 'PREMIUM' | 'REGULAR' | 'BUDGET';
  public price: number;
  public qualityScore: number;
  public viewingAngle: number;
  public distanceFromScreen: number;
  public distanceToScreen: number;
  public isBooked: boolean;
  public position: [number, number, number];
  public color: string;
  public ratingCategory: 'BEST VIEW' | 'PREMIUM' | 'GOOD' | 'BUDGET';
  public status: 'available' | 'booked' | 'selected';

  constructor(
    id: string,
    row: string,
    number: number,
    category: 'VIP' | 'PREMIUM' | 'REGULAR' | 'BUDGET',
    price: number,
    qualityScore: number,
    viewingAngle: number,
    distanceFromScreen: number,
    isBooked: boolean,
    position: [number, number, number] = [0, 0, 0],
    color: string = '#ffffff',
    ratingCategory: 'BEST VIEW' | 'PREMIUM' | 'GOOD' | 'BUDGET' = 'GOOD',
    status: 'available' | 'booked' | 'selected' = 'available'
  ) {
    this.id = id;
    this.row = row;
    this.number = number;
    this.category = category;
    this.price = price;
    this.qualityScore = qualityScore;
    this.viewingAngle = viewingAngle;
    this.distanceFromScreen = distanceFromScreen;
    this.distanceToScreen = distanceFromScreen;
    this.isBooked = isBooked;
    this.position = position;
    this.color = color;
    this.ratingCategory = ratingCategory;
    this.status = status;
  }
}
