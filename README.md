<p align="center">
  <img src="/public/favicon.svg" width="150" alt="RoFocus Logo">
</p>

## RoFocus

A calm study app: choose your modules, tick tasks, set a focus time, run the timer and see your progress. Your work is saved in the browser.

## Set up in one go

### macOS & Linux
You need Node.js 20 or newer and Python 3. Copy the whole block below into a terminal, and press Enter:

```sh
git clone https://github.com/Reda3400/RoFocus.git 
cd RoFocus 
npm install --ignore-scripts
npm run build
sh scripts/install-shortcut.sh
```

That creates the RoFocus folder, puts the app inside it, builds it and adds a **RoFocus** icon to your Desktop and applications menu.

### Windows
You need Node.js 20 or newer and Python 3 (make sure Python is added to your PATH). Open **Command Prompt** or **PowerShell**, then copy and run:

```sh
git clone https://github.com/Reda3400/RoFocus.git
cd RoFocus
npm install --ignore-scripts
npm run build
scripts\install-shortcut.bat
```

That creates the RoFocus folder, builds the app, and adds a **RoFocus** shortcut to your Desktop and Start Menu.

## Open the app

Click the **RoFocus** icon. It opens the app in your browser. Close the browser tab to stop it. If you rebuild later, the icon serves the new build automatically.

To open it without the icon:

**macOS & Linux:**
```sh
sh scripts/launch.sh
```

**Windows (Command Prompt):**
```sh
scripts\launch.bat
```

**Windows (PowerShell):**
```sh
powershell -ExecutionPolicy Bypass -File scripts\launch.ps1
```

## Your data

Modules, tasks and sessions stay in this browser's local storage. The Task Manager can download and load a JSON file if you want to move them to another computer.
