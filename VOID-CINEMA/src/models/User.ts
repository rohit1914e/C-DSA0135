/**
 * C++ Equivalent: class User
 * Demonstrates Encapsulation.
 */
export class User {
  public id: string;
  public name: string;
  public email: string;
  public memberSince: string;

  constructor(id: string, name: string, email: string, memberSince: string) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.memberSince = memberSince;
  }
}
