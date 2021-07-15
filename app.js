const serverEdit = require("./components/server-edit.js");
const queryResults = require("./components/query-results.js");
const KdbConnection = require("./server/kdb-connection.js");
const storage = require("./storage/storage");
const editor = require("./editor/editor");
const { Splitpanes, Pane } = require("splitpanes");
const { ipcRenderer } = require("electron");

let connection;

module.exports = {
  el: "#v-app",
  data() {
    return {
      filename: "",
      servers: new Map(),
      selectServer: undefined,
      queryResult: [],
      dialog: {
        editMode: true,
        visible: false,
        server: {},
      },
      resultsPaneSize: 50,
      resultsPaneHeight: 0,
    };
  },
  methods: {
    async connect() {
      const server = this.servers.get(this.selectServer);
      try {
        connection = await KdbConnection.connect(server.host, server.port);
        return connection;
      } catch (e) {
        connection = undefined;
        this.queryResult = {
          type: "error",
          data: "failed to connect to server",
        };
      }
    },
    async send() {
      if (connection && !connection.isConnected()) {
        // The connection has dropped
        connection = undefined;
      }
      if (!connection) {
        connection = await this.connect();
      }
      if (connection) {
        const input = await editor.then((e) => e.getValue());
        try {
          this.queryResult = await connection.send(input);
        } catch (e) {
          this.queryResult = {
            type: "error",
            data: "failed to get results from server",
          };
        }
      }
    },
    addServer() {
      this.dialog.editMode = false;
      this.dialog.server = {};
      this.dialog.visible = true;
    },
    editServer() {
      this.dialog.editMode = true;
      this.dialog.server = { ...this.servers.get(this.selectServer) };
      this.dialog.visible = true;
    },
    deleteServer() {
      const server = this.servers.get(this.selectServer);
      this.servers.delete(this.selectServer);
      storage.deleteServer(server.id);
      this.selectServer = undefined;
    },
    async confirm() {
      await storage.saveServer(this.dialog.server);
      this.servers.set(this.dialog.server.id, this.dialog.server);
      this.dialog.visible = false;
    },
    cancel() {
      this.dialog.server = {};
      this.dialog.visible = false;
    },
    handlePaneResize(e) {
      this.resultsPaneSize = e[1].size;
      this.resultsPaneHeight =
        (this.$refs.mainArea.clientHeight * this.resultsPaneSize) / 100;
    },
    async saveAs() {
      const input = await editor.then((e) => e.getValue());
      ipcRenderer.send("save-query", input);
    },
    async load() {
      const input = ipcRenderer.sendSync("load-query");
      await editor.then((e) => e.setValue(input));
    },
  },
  async mounted() {
    const servers = await storage.getServers();
    this.servers = servers.reduce((map, s) => {
      map.set(s.id, s);
      return map;
    }, new Map());

    // automatically connect to the first server in the list
    if (servers.length) {
      this.selectServer = servers[0].id;
      try {
        await this.connect();
      } catch (e) {
        this.queryResult = {
          type: "error",
          data: "failed to connect to server",
        };
      }
    }

    // Calculate required height of results pane
    this.resultsPaneHeight =
      (this.$refs.mainArea.clientHeight * this.resultsPaneSize) / 100;
  },
  computed: {
    dialogTitle: function () {
      return this.dialog.editMode ? "Edit server details" : "Add new server";
    },
  },
  components: {
    "server-edit": serverEdit,
    "query-results": queryResults,
    splitpanes: Splitpanes,
    pane: Pane,
  },
};
