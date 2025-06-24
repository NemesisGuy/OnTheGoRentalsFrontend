# OnTheGoRentals - Developer Guide

## 1. Introduction

This guide provides information for developers working on the OnTheGoRentals frontend project. It covers project setup, architecture, development workflow, and contribution guidelines.

## 2. Project Setup

### 2.1. Prerequisites
*   **Node.js**: Latest LTS version recommended. (e.g., v18.x or v20.x). You can use [nvm](https://github.com/nvm-sh/nvm) to manage Node.js versions.
*   **npm**: Should be installed with Node.js.
*   **Git**: For version control.
*   **Recommended IDE**: [VSCode](https://code.visualstudio.com/) with the following extensions:
    *   [Volar (Vue)](https://marketplace.visualstudio.com/items?itemName=Vue.volar)
    *   [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin)
    *   (Add any other common extensions like ESLint, Prettier if they are set up for the project)

### 2.2. Installation
1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd OnTheGoRentalsFrontend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Environment Variables:**
    *   The application uses `.env` files for environment-specific configurations, particularly for the API URL during development.
    *   Copy `.env.development.example` (if one exists) to `.env.development` and update the variables as needed.
    *   Key variables:
        *   `VITE_API_BASE_URL` (or similar, check `src/api.js` or `vite.config.js` for actual usage): Sets the backend API URL for local development.
    *   **Note:** For production builds, the API URL is injected at runtime. See the [Deployment Guide](DEPLOYMENT.md).


## 3. Architecture Overview

*   **Framework**: Vue 3 with Vite.
*   **Language**: JavaScript (and potentially TypeScript if used).
*   **Routing**: `vue-router` is used for client-side navigation. Configurations are in `src/router/`.
*   **State Management**: Pinia (or Vuex, check `src/store/`) is used for global state management. Store modules are typically located in `src/store/`.
*   **API Communication**: `axios` is used for making HTTP requests to the backend. The primary Axios instance and interceptors are configured in `src/api.js`.
*   **Styling**: (Describe the styling approach, e.g., "Global CSS in `src/assets/Styles/styles.css`, component-scoped styles within Vue components").

## 4. Key Directories and Files

Refer to the "Project Structure" section in the main [README.md](../README.md) for a general overview. Key areas for developers include:

*   **`src/`**: Contains all the core application code.
    *   **`main.js`**: The entry point of the Vue application.
    *   **`App.vue`**: The root Vue component.
    *   **`api.js`**: Axios configuration for backend API calls. This is where the runtime API URL configuration (see `DEPLOYMENT.md`) is primarily consumed.
    *   **`router/index.js`**: Defines all application routes.
    *   **`store/store.js`** (or `src/stores/` for Pinia): Defines the state management setup.
    *   **`components/`**: Contains reusable UI components, organized into:
        *   `Admin/`: Components specific to the admin interface.
        *   `Main/`: Components for the main user-facing application.
    *   **`assets/`**: Static assets like images, global stylesheets.
    *   **`views/`** (or `pages/`): (If this convention is used) Higher-level components that represent application pages/views. Otherwise, components in `components/` might serve this role directly.
*   **`public/`**: Static assets that are copied directly to the build output. `index.html` and `config.js` (generated at runtime in Docker) are key files here.
*   **`configs/`**: May contain configuration files used by other services (e.g., Nginx).
*   **`docker/`**: Contains Docker-related files (`Dockerfile`, `docker-compose*.yml`).
*   **`docs/`**: Project documentation.

## 5. Development Workflow

### 5.1. Running the Development Server
```bash
npm run dev
```
This will start the Vite development server, usually on `http://localhost:5173` (check your `vite.config.js` or terminal output). It supports Hot Module Replacement (HMR) for a fast development experience.

### 5.2. Linting and Formatting
*(If ESLint, Prettier, or other tools are configured)*
*   "The project uses ESLint for code linting and Prettier for code formatting."
*   "Run linters: `npm run lint` (if script exists)"
*   "Run formatters: `npm run format` (if script exists)"
*   "It's recommended to configure your IDE to format on save."

### 5.3. Creating New Components/Routes/Store Modules
*   Follow the existing patterns in `src/components/`, `src/router/`, and `src/store/`.
*   (Add any specific naming conventions or patterns if they exist).

## 6. API Integration

*   The frontend communicates with the backend via a RESTful API.
*   The `axios` instance is configured in `src/api.js`. This file handles setting the `baseURL` and any interceptors (e.g., for adding auth tokens, error handling).
*   For local development, the API base URL is typically set via an environment variable in a `.env.development` file (e.g., `VITE_API_BASE_URL`).
*   In deployed environments (Docker), the API URL is injected at runtime via `public/config.js`. Refer to [Deployment Guide](DEPLOYMENT.md) for details.

## 7. State Management

*   The application uses [Pinia/Vuex] for managing global application state.
*   The main store setup is in `src/store/store.js` (or `src/stores/index.js` for Pinia).
*   Modules are used to organize state for different features (e.g., user authentication, car data).
*   When adding new global state, consider if it belongs in an existing module or if a new one is needed.

## 8. Routing

*   `vue-router` handles client-side navigation.
*   Route definitions are located in `src/router/index.js` and potentially broken into multiple files within `src/router/`.
*   When adding new pages or views, define new routes here.
*   Navigation guards (if used) for authentication or other purposes are also configured in the router setup.

## 9. Styling

*   Global styles are defined in `src/assets/Styles/styles.css`.
*   Components typically use scoped CSS within their `<style scoped>` tags to avoid style conflicts.
*   (Mention any CSS frameworks like Tailwind CSS, Bootstrap, or UI component libraries like Vuetify, Quasar if they are used).

## 10. Testing

*(This section needs to be adapted based on the project's actual testing setup)*
*   **If no tests exist:** "Currently, there is no formal testing suite set up for this project. Contributions in this area are welcome."
*   **If tests exist (e.g., Vitest, Jest, Cypress):**
    *   "The project uses [Testing Framework, e.g., Vitest] for unit tests and [E2E Testing Framework, e.g., Cypress] for end-to-end tests."
    *   "Unit test files are typically located alongside the components/modules they test (e.g., `*.spec.js` or `*.test.js`)."
    *   "E2E tests are in the `tests/e2e` directory (or similar)."
    *   **Running Tests:**
        *   `npm run test` (or specific scripts like `npm run test:unit`, `npm run test:e2e`)
    *   **Writing Tests:**
        *   (Provide brief guidelines or link to more detailed testing documentation if available).
        *   "Ensure new features and bug fixes are accompanied by relevant tests."

## 11. Contribution Guidelines

We welcome contributions to OnTheGoRentals! Please adhere to the following guidelines:

### 11.1. General Workflow
1.  **Fork** the repository.
2.  Create a new **feature branch** from `main` (or `develop` if used) for your changes (e.g., `git checkout -b feature/your-feature-name`).
3.  Make your changes, adhering to the code style and testing guidelines.
4.  Commit your changes with clear and descriptive commit messages.
5.  Push your feature branch to your fork.
6.  Create a **Pull Request (PR)** against the main project repository's `main` (or `develop`) branch.
7.  Clearly describe your changes in the PR.
8.  Ensure any CI checks pass.
9.  Participate in the code review process.

### 11.2. Code Style
*   Follow the existing code style.
*   If ESLint and Prettier are configured, ensure your code passes linting and formatting checks.
*   (Add any other specific style guidelines).

### 11.3. Commit Messages
*   Use conventional commit messages if adopted (e.g., `feat: add new login button`, `fix: resolve issue with booking dates`).
*   Otherwise, ensure messages are clear and concise.

### 11.4. Contributor List
*   For a list of contributors, please see the [Contributions README](../Contributions-README.md).

## 12. Building and Deployment

*   **Building for Production:**
    ```bash
    npm run build
    ```
    This command bundles the application into the `dist/` directory.
*   **Deployment:**
    *   The project is designed for Docker-based deployment. For comprehensive details on how the Docker image is built, how Nginx serves the static files, and how the API URL is configured at runtime, please refer to the [Deployment Guide](DEPLOYMENT.MD).

---

*This Developer Guide is a living document. Please update it as the project evolves.*
