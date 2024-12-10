# COMP 3512 - F1 Dashboard Project

## Overview

This project is a *Single-Page Application (SPA)* designed for viewing Formula 1 (F1) race data. It provides users with the ability to browse races, view qualifying and race results, and explore details about circuits, drivers, and constructors. The application adheres to the guidelines outlined in the COMP 3512 course.

The application retrieves data from the F1 API and emphasizes performance by utilizing localStorage to reduce redundant API requests.

## Features

- **Home View**: 
    - Brief description of the application and the technologies used.
    - Dropdown for selecting a season.
- **Races View**: 
    - Displays races sorted by round for a selected season.
    - Allows sorting of race data by columns (e.g., Round, Race Name).
    - Displays qualifying and race results for a selected race.
    - Highlights finishes (1st, 2nd, 3rd).
- **Dialogs/Popups**:
    - **Driver Details**: Comprehensive details about drivers and their race results.
    - **Constructor Details**:  Information about constructors and their race results.
    - **Circuit Details**: Detailed information about circuits.
- **Favorite**: 
    - Functionality to favorite circuits, drivers, and constructors.

## Technologies Used

- **HTML5**: Markup for all views contained in `index.html`.
- **CSS3**: Custom styling for layout, modals, and animations.
- **JavaScript (ES6)**:
    - DOM manipulation.
    - Event handling.
    - API interaction using `fetch`.
    - Modular structure for maintainability.
- **Visual Studio Code**: Primary IDE used for developing and debugging the application.
- **ChatGPT**: Assisted with planning, debugging, and optimizing code structure, UI design, and JavaScript logic.
- **GitHub Pages**: Hosting the application.

## Folder Structure

```
├── index.html              # Single HTML page
├── styles/
│   ├── styles.css          # Main CSS file for custom styling
├── modules/
│   ├── dataService.js      # Functions for API interaction
│   ├── eventHandlers.js    # Event listener functions
│   ├── initialize.js       # Application initialization logic
│   ├── modals.js           # Modal-specific rendering and logic
│   ├── uiHelper.js         # Functions for UI updates
│   main.js                 # Main application driver
├── assets/
│   ├── logos/              # F1 and MRU logos
├── README.md               # Project documentation
```

## Contributors
- **Name:** Justin Serrano
- **Email**: jserr538@mtroyal.ca
- **GitHub**: [@JustinSerrano](https://github.com/JustinSerrano)
