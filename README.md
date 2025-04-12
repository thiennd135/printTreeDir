A cross-platform desktop application to visualize your directory structure with customizable depth.

## Features

* **Easy Directory Browsing:** Select any directory on your system.
* **Customizable Depth:** Set the depth limit to control the level of detail.
* **Save Output:** Export the directory tree to a text file for saving or sharing.
* **Remembers Last Used Directory:** The application automatically remembers your previously selected directory.

## Installation

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd printTreeDir
    ```
2.  **Install dependencies:**

    ```bash
    npm install
    ```
3. **Build CSS:**

    ```bash
    npm run build:css
    ```

4.  **Run the application:**

    ```bash
    npm start
    ```

## Usage

1.  Click the "Browse" button to select a directory.
2.  Enter the desired depth (minimum is 1).
3.  Ensure "Print to Output" is checked to view the results.
4.  Click "Generate Tree" to process the directory.
5.  Use "Save to File" to save the tree to a text file.
6.  Click "Clear Output" to clear the displayed output.

## Technologies

* Electron
* Node.js
* Bootstrap 5

## License

MIT
