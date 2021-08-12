# KDB Studio 2.

A GUI for KDB+/q database built with React on Electron.

## Getting Started

To run this project.

- Install the dependencies

```bash
  npm install
```

- Now run these two commands in separate consoles.

```bash
  npm run dev:react
```

```bash
  npm run dev:electron
```

## Testing

To test the project you'll need a q server running on port 5001. Then run:

```bash
  npm run build:test
  npm test
```

## What We've Used

- [React](https://reactjs.org/): The main app structure is built using React Functional Components
- [Electron](https://www.electronjs.org/): We're using electron to wrap everything as a desktop app
- [Typescript](https://www.typescriptlang.org/): Everything is written in Typescript for extra safety
- [FluentUI](https://developer.microsoft.com/en-us/fluentui#/controls/web): We're using FluentUI and it's built React components for layout and trying to follow their design language where possible.
- [Playwright](https://playwright.dev/docs/api/class-electron): We're using Playwright to run our automated integration tests.

## What's KDB+ and q?

KDB is a database and q is the programming language used to interact with it. To learn more go [here](https://code.kx.com/q/learn/)

## What needs doing?

Check out our Issues list for what's still outstanding. You can also make suggestions for new features/improvements here which will then be approved by one of the core team. Once something is approved feel free to pick it up and implement it. Be sure to work on a feature branch and submit a pull request when ready.
