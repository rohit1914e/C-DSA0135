# VOID CINEMA - C++ Architectural Mapping

This document maps the React/TypeScript implementation details of VOID CINEMA directly to traditional C++ Data Structures, Algorithms, and Object-Oriented paradigms. It serves as a translation layer to mathematically defend the project's logic during academic vivas.

## 1. Object-Oriented Programming (OOP) Mappings

| React Feature | Equivalent C++ Concept | Description |
| --- | --- | --- |
| `src/models/Theatre.ts` | **Class Encapsulation** | `class Theatre` encapsulates properties (name, location, screens) with formal typed constructors. |
| `src/models/Movie.ts` | **Class Encapsulation** | `class Movie` encapsulates movie metadata and exposes public methods like `matchesSearch()`. |
| Zustand state hook `useStore` | **Singleton Pattern** | Centralized, globally accessible state behaves as an instantiated `static` Singleton class. |

## 2. Data Structures

| React Feature | Equivalent C++ Concept | Description |
| --- | --- | --- |
| **Seat Selection** | **2D Array Matrix** | The seats in `SeatSelectionPage.tsx` are instantiated as `Seat seats[rows][cols]`. It iterates over rows, and then columns to map the UI visually. |
| **Booking History** | **Vector Array** | `bookingHistory` array behaves exactly like `std::vector<Booking>`, dynamically resizing as new bookings are appended. |
| **Movie List** | **Object Array** | `MOVIES` behaves as an array of instantiated classes `Movie[]` stored in memory. |

## 3. Algorithms & Search Logic

| Feature | Algorithm Equivalent | Time Complexity | File Reference |
| --- | --- | --- | --- |
| **Movie Search** | **Linear Search** | `O(n)` | `MoviesSystem.tsx` loops through the `MOVIES` array comparing title string substrings. |
| **Best Seat Recommendation** | **Linear Search (2D)** | `O(n)` | `SeatSelectionPage.tsx` iterates over every element in the `Seat[][]` matrix to compare `qualityScore` and dynamically outputs the highest value. |
| **Authentication** | **File Handling** | `O(1)` | Data written/read from LocalStorage mirrors the `fstream` file handling read/write operations in C++. |

## Summary of Implementation Layer
The application logic operates by instantiating formal classes, storing them in dynamically sized memory vectors, and traversing arrays using linear `O(n)` complexities for filtering and recommendations. All UI changes directly map to updating state variables tied to these strict foundational structures.
