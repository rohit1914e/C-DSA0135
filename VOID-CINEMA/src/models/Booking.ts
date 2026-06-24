/**
 * C++ Equivalent: class Booking
 * Demonstrates Encapsulation. Stored as vector<Booking> in the store.
 */
export class Booking {
  public id: string;
  public bookingReference: string;
  public movieId: string;
  public theatreId: string;
  public theatreName: string;
  public seats: string[];
  public date: string;
  public time: string;
  public status: 'upcoming' | 'past';
  public paymentStatus: 'pending' | 'paid';
  public totalAmount: number;

  constructor(
    id: string,
    bookingReference: string,
    movieId: string,
    theatreId: string,
    theatreName: string,
    seats: string[],
    date: string,
    time: string,
    status: 'upcoming' | 'past',
    paymentStatus: 'pending' | 'paid',
    totalAmount: number
  ) {
    this.id = id;
    this.bookingReference = bookingReference;
    this.movieId = movieId;
    this.theatreId = theatreId;
    this.theatreName = theatreName;
    this.seats = seats;
    this.date = date;
    this.time = time;
    this.status = status;
    this.paymentStatus = paymentStatus;
    this.totalAmount = totalAmount;
  }
}
