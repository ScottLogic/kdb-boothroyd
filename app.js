const serverEdit = require("./components/server-edit.js");
const { queryResults } = require("./components/query-results.js");
const KdbConnection = require("./server/kdb-connection.js");
const storage = require("./storage/storage");
const editor = require("./editor/editor");
const { createReadStream } = require("original-fs");

let connection;

module.exports = {
  el: "#v-app",
  data() {
    return {
      servers: new Map(),
      selectServer: undefined,
      queryResult: undefined,
      dialog: {
        editMode: true,
        visible: false,
        server: {},
      },
    };
  },
  methods: {
    async connect() {
      const server = this.servers.get(this.selectServer);
      console.log(server.host, server.port);

      try {
        connection = await KdbConnection.connect(server.host, server.port);
      } catch (e) {
        connection = undefined;
        this.queryResult = {
          type: "error",
          data: "failed to connect to server",
        };
      }
    },
    async send() {
      if (!connection) {
        connection = await this.connect();
        if (!connection) {
          return;
        }
      }
      const input = await editor.then((e) => e.getValue());
      this.queryResult = await connection.send(input);
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
      await this.connect();
    }
  },
  computed: {
    dialogTitle: function () {
      return this.dialog.editMode ? "Edit server details" : "Add new server";
    },
  },
  components: {
    "server-edit": serverEdit,
    "query-results": queryResults,
  },
};
