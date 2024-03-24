# iRAP-Minirescue-GUI Example 

## Installation

1. First, install Node.js version greater than 20:

    ```bash
    cd ~
    curl -sL https://deb.nodesource.com/setup_20.x -o /tmp/nodesource_setup.sh
    sudo bash /tmp/nodesource_setup.sh
    sudo apt install nodejs
    ```

2. Next, install Yarn:
    ```bash
    sudo npm install --global yarn
    ```
3. Clone the repository:
    ```bash
    git clone https://github.com/NonStopBle/iRAP-Minirescue-GUI.git
    ```

4. Change directory to the project folder:
    ```bash
    cd iRAP-Minirescue-GUI/
    ```
5. Open the project in Visual Studio Code in current directory:
    ```bash
    code .
    ```

6. Inside Visual Studio Code, install all project dependencies:
    ```bash
    yarn install
    ```

7. Once all dependencies are installed, start the project:
    ```bash
    yarn start
    ```
