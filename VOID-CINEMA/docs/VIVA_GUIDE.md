# VOID CINEMA - Viva Preparation Guide

This guide breaks down the core concepts used in the VOID CINEMA booking system to perfectly align with theoretical academic questions. Use this document to navigate questions on OOP, Data Structures, and Algorithmic Complexities.

## OOP Concepts Used

### 1. Encapsulation
Data fields (properties) are bundled with the logic operating on them into formalized classes. We restrict raw object manipulation.
- **`Movie` Class**: Encapsulates movie properties and provides the `matchesSearch()` method.
- **`Theatre` Class**: Encapsulates theatre logic and attributes.
- **`Booking` Class**: Encapsulates ticket references, payments, and seat mapping arrays securely.

### 2. Abstraction
We hide the complex implementation details and expose only the required features to the user.
- The **User interacts with UI** components like clicking "Recommend Best Seat".
- The **Internal booking logic is hidden**; they do not see the math, `O(n)` algorithms, or Zustand global persistence handling underneath.

### 3. Inheritance
*(If asked: How can you extend this?)*
- We can create a base `Person` class that both `User` and a theoretical `Admin` class inherit from.
- We can create a base `Event` class, from which `Movie` and a theoretical `Concert` class could inherit.

### 4. Polymorphism
*(If asked: How can you use polymorphism here?)*
- We could introduce a `calculateDiscount()` method in the `Booking` class. By overriding this method in derived classes like `VIPBooking` or `StudentBooking`, the same method call yields different logic depending on the object type.

---

## Data Structures

### 1. Seat Matrix -> `2D Array`
The layout of the theatre is generated mathematically and stored as a two-dimensional array matrix `Seat[][]`.
Equivalent to `Seat seats[rows][cols]`. This allows iterating via nested loops.

### 2. Booking History -> `Vector`
The user's booking history operates identically to `std::vector<Booking>`. It dynamically scales its memory allocation as new bookings are pushed into the array at runtime.

### 3. Movie List -> `Array`
The internal movie database is stored as a static array `Movie[]`, which acts as a contiguous block of memory holding class instances.

---

## Algorithms

### 1. Linear Search
To find a movie by search string or genre, the application uses an explicit `for` loop to check each element one by one.

### 2. Best Seat Recommendation
When the "Recommend Best Seat" button is clicked, a 2D Linear Search iterates across the `Seat[][]` matrix, finding the seat with the highest mathematically evaluated `qualityScore` that isn't already booked.

### 3. Booking Reference Generation
Uses cryptographic-level randomized string generation algorithms to append a unique ID format (e.g., `VOID-XXXXXX`) to each instantiated booking.

---

## Time Complexities

| Feature | Complexity | Justification |
| --- | --- | --- |
| **Movie Search** | `O(n)` | Must iterate through the entire `n` array of Movies to find string matches. |
| **Best Seat Search** | `O(n)` | Requires iterating exactly once through all `n` seats in the 2D `rows * cols` matrix to determine the highest score. |
| **Booking History Lookup** | `O(n)` | Searching past tickets by reference string requires traversing the history vector. |
