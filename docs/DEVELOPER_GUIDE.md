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
    *   The application uses environment configuration files located in the `env/` directory. For local development, configure `env/.env.development`.
    *   Key variable for local development:
        *   `VITE_API_BASE_URL`: Sets the backend API URL (e.g., `VITE_API_BASE_URL=http://localhost:8080/api`). This is used by `src/api.js`.
    *   **Note:** For production builds, the API URL is injected at runtime. See the [Deployment Guide](DEPLOYMENT.md).


## 3. Architecture Overview

*   **Framework**: Vue 3 with Vite.
*   **Language**: JavaScript.
*   **Routing**: `vue-router` is used for client-side navigation. Configurations are in `src/router/`.
*   **State Management**: Vuex is included as a project dependency (`vuex: ^4.1.0`), and a store file exists at `src/store/store.js`. However, the store file content is currently commented out, and the store is not registered with the Vue application in `src/main.js`. Global state management might be handled through other means or is minimal at present.
*   **API Communication**: `axios` is used for making HTTP requests to the backend. The primary Axios instance and interceptors are configured in `src/api.js`.
*   **Styling**: Styling primarily uses global CSS in `src/assets/Styles/styles.css`, Bootstrap v5 (via `bootstrap` and `bootstrap-vue-next` packages), and Font Awesome icons (via `@fortawesome/fontawesome-free`). Components may also use scoped styles.

## 4. Key Directories and Files

Refer to the "Project Structure" section in the main [README.md](../README.md) for a general overview. Key areas for developers include:

*   **`src/`**: Contains all the core application code.
    *   **`main.js`**: The entry point of the Vue application.
    *   **`App.vue`**: The root Vue component.
    *   **`api.js`**: Axios configuration for backend API calls. This is where the runtime API URL configuration (see `DEPLOYMENT.md`) is primarily consumed.
    *   **`router/index.js`**: Defines all application routes.
    *   **`store/store.js`**: Contains a commented-out Vuex store setup.
    *   **`components/`**: Contains reusable UI components, organized into:
        *   `Admin/`: Components specific to the admin interface.
        *   `Main/`: Components for the main user-facing application.
    *   **`assets/`**: Static assets like images, global stylesheets.
*   **`public/`**: Static assets that are copied directly to the build output. `index.html` and `config.js` (generated at runtime in Docker) are key files here.
*   **`configs/`**: Contains configuration files used by other services (e.g., Nginx).
*   **`docker/`**: Contains Docker-related files (`Dockerfile`, `docker-compose*.yml`).
*   **`docs/`**: Project documentation.

## 5. Development Workflow

### 5.1. Running the Development Server
```bash
npm run dev
```
This will start the Vite development server, usually on `http://localhost:5173` (check your `vite.config.js` or terminal output). It supports Hot Module Replacement (HMR) for a fast development experience.

### 5.2. Linting and Formatting
*   The project does not have explicit linting (e.g., ESLint) or formatting (e.g., Prettier) scripts or dependencies configured in `package.json`.
*   Developers should manually adhere to the existing code style and conventions found in the codebase.
*   Consider setting up these tools if a more consistent code style is desired.

### 5.3. Creating New Components/Routes/Store Modules
*   Follow the existing patterns in `src/components/`, `src/router/`.
*   If Vuex is to be implemented, uncomment and complete the setup in `src/store/store.js` and register it in `src/main.js`.

## 6. API Integration

*   The frontend communicates with the backend via a RESTful API.
*   The `axios` instance is configured in `src/api.js`. This file handles setting the `baseURL` and any interceptors (e.g., for adding auth tokens, error handling).
*   For local development, the API base URL is set via the `VITE_API_BASE_URL` variable in `env/.env.development`.
*   In deployed environments (Docker), the API URL is injected at runtime via `public/config.js`. Refer to [Deployment Guide](DEPLOYMENT.md) for details.

## 7. State Management

*   Vuex is a dependency (`vuex: ^4.1.0`), and a basic store structure is present in `src/store/store.js`, but its contents are commented out and it's not currently integrated with the Vue application in `src/main.js`.
*   If global state management is needed, the Vuex setup in `src/store/store.js` can be completed and registered with the Vue app.

## 8. Routing

*   `vue-router` handles client-side navigation.
*   Route definitions are located in `src/router/index.js` and potentially broken into multiple files within `src/router/`.
*   When adding new pages or views, define new routes here.
*   Navigation guards (if used) for authentication or other purposes are also configured in the router setup.

## 9. Styling

*   Global styles are defined in `src/assets/Styles/styles.css`.
*   The project uses Bootstrap v5 (`bootstrap`, `bootstrap-vue-next`) for UI components and styling.
*   Font Awesome (`@fortawesome/fontawesome-free`) is used for icons.
*   Components typically use scoped CSS within their `<style scoped>` tags to avoid style conflicts.

## 10. Testing

*   Currently, there is no formal testing suite (e.g., Vitest, Jest, Cypress) set up for this project, and no testing-related dependencies or scripts are found in `package.json`.
*   Contributions in this area, such as setting up a testing framework and writing tests, are welcome.

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
*   Follow the existing code style apparent in the codebase.
*   As there is no automated linting/formatting, pay close attention to consistency.

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
