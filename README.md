# kdb-studio-2 prototype

KDB Studio is an execution environment for the q language, which is used by kdb+, a column-based relational time-series database. This project is a prototype re-implementation of KDB Studio using JavaScript and Electron.

![screenshot](screenshot.png)

This project uses:

- The [monaco editor](https://microsoft.github.io/monaco-editor/), and adds q syntax support
- [Electron](https://www.electronjs.org/) to allow the application to run on the desktop
- [Vue](https://vuejs.org/) and [Element](https://element-plus.org/#/en-US) for the UI layer
- [node-q](https://github.com/michaelwittig/node-q) for the communication layer

The current functionality is quite basic:

- Add / edit / delete servers
- Query editing (with syntax highlighting)
- Query execution, with results displayed as a simple HTML table

## Development

To develop, or run, this prototype, simply install dependencies and run:

```
npm install
npm start
```
