# OnTheGoRentalsFrontend

## Project Overview

OnTheGoRentals is a web application designed to streamline the car rental process. Its main purpose is to provide a user-friendly platform for customers to browse, book, and manage car rentals, while also offering administrators the tools to manage the vehicle fleet and rental operations.

Key features include:
* User registration and authentication
* Car browsing and filtering
* Real-time booking and availability checking
* User profile management for rentals
* Administrative dashboard for managing cars, bookings, and users

## Project Structure

The project is organized as follows:

*   `public/`: Contains static assets like `favicon.ico` and `index.html`. These are files that are directly served by the web server.
*   `src/`: This directory holds the main application source code.
    *   `assets/`: Stores static assets that are processed by Vite, such as images, custom fonts, and global stylesheets.
    *   `components/`: Contains all Vue.js components.
        *   `Admin/`: Components specific to the admin dashboard.
        *   `Main/`: Components used in the main user-facing application.
    *   `router/`: Includes the Vue Router configuration (`index.js`), defining the application's routes.
    *   `store/`: For state management using Pinia. Each file typically represents a module or store.
    *   `views/`: (Currently, view-specific components are often placed directly within `components/Main` or `components/Admin` and linked via the router. This structure can be adapted if dedicated view components become necessary.)
    *   `api.js`: Configures and exports an Axios instance for making HTTP requests to the backend API.
    *   `main.js`: The entry point for the Vue application. It initializes Vue, sets up plugins (like the router and Pinia), and mounts the root component.
*   `docs/`: Contains project documentation files, such as deployment guides and developer guidelines.
*   `docker/`: Includes Docker-related files, like `Dockerfile` and `docker-compose.yml`, for containerizing the application.
*   `.env.*`: Environment configuration files (e.g., `.env.development`, `.env.production`) for managing environment-specific variables.

## Getting Started

### Prerequisites

*   Node.js (latest LTS version recommended)
*   npm (comes bundled with Node.js)

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    ```
    (Replace `<repository-url>` with the actual URL of the repository)

2.  Navigate to the project directory:
    ```bash
    cd OnTheGoRentalsFrontend
    ```

3.  Install dependencies:
    ```sh
    npm install
    ```

## Usage (Development)

To run the application in development mode with hot-reloading:

```sh
npm run dev
```

Once the development server is running (typically indicated by a message in the console), open your browser and go to `http://localhost:5173` (this is the default Vite development server port; check your console output if it's different).

## Building for Production

To compile and minify the application for production:

```sh
npm run build
```

This command will generate a `dist/` folder in the project root, containing the optimized static assets (HTML, CSS, JavaScript) for deployment.

## Deployment

The application is designed to be deployed using Docker. This approach containerizes the application, ensuring consistency across different environments.

For detailed deployment instructions, see the [Deployment Guide](docs/DEPLOYMENT.md).

## Contributing

We welcome contributions to enhance OnTheGoRentals! If you'd like to contribute, please follow the standard fork, branch, and pull request workflow.

See our [Contributors](Contributions-README.md).

More detailed guidelines for developers can be found in the [Developer Guide](docs/DEVELOPER_GUIDE.md) (once created).

## License

This project is licensed under the MIT License. See the `LICENSE` file for details (if a `LICENSE` file is added later).

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).
