<p align="center">
  <img src="/public/favicon.svg" width="150" alt="RoFocus Logo">
</p>

## RoFocus

A calm study app: choose your modules, tick tasks, set a focus time, run the timer and see your progress. Your work is saved in the browser.

## Set up in one go

You need Node.js 20 or newer. Copy the whole block below into a terminal, and press Enter:

```sh
git clone https://github.com/Reda3400/RoFocus.git 
cd RoFocus 
npm install --ignore-scripts
npm run build
sh scripts/install-shortcut.sh
```

That creates the RoFocus folder, puts the app inside it, builds it and adds a **RoFocus** icon to your Desktop and applications menu.

## Open the app

Click the **RoFocus** icon. It opens the app in your browser. Close the browser tab to stop it. If you rebuild later, the icon serves the new build automatically.

To open it without the icon:

```sh
sh scripts/launch.sh
```

## Your data

Modules, tasks and sessions stay in this browser's local storage. The Task Manager can download and load a JSON file if you want to move them to another computer.
