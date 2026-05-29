## Curriculum Hub

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A static frontend interface for navigating MBA(Curriculum) syllabus data and reading materials. Can be used for any subject just change MBA to whatever.

## Tech Stack

- **Framework:** React, Vite
- **Styling:** Tailwind CSS (v4), shadcn/ui
- **Data Layer:** Local JSON files (No database required)
- **Deployment:** Pre-configured for static hosting (Netlify)

## Content Management

All curriculum data is decoupled from the application logic and stored in the `public/db/` directory.

To modify the syllabus, edit the JSON files:

- `syllabus_index.json`: Controls the sidebar navigation and main grid.
- `subjects/[subject-id].json`: Contains the specific modules, topics, markdown reading content, and Q&A for that subject.
