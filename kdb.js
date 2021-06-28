const serverEdit = require("./components/server-edit.js");
const { queryResults } = require("./components/query-results.js");
const KdbConnection = require("./kdb-connection.js");
const storage = require("./storage");
const editor = require("./editor/editor");
const ElementUI = require("element-ui");

storage.init();

let connection;

Vue.use(ElementUI);

new Vue({
  el: "#v-app",
  data() {
    return {
      query: "",
      servers: new Map(),
      selectServer: -1,
      queryResult: undefined,
      dialog: {
        visible: false,
        server: undefined,
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
      if (!connection) return;
      const input = await editor.then((e) => e.getValue());
      this.queryResult = await connection.send(input);
    },
    async saveServer(cs) {
      storage.saveServer(cs);
      this.servers.set(cs.id, cs);
    },
    async deleteServer(cs) {
      if (this.servers.length <= 1) {
        console.log("Don't delete server if only one");
        return;
      }
      storage.deleteServer(cs.id);
      this.servers.delete(cs.id);
    },
    editServer() {
      this.dialog.server = { ...this.servers.get(this.selectServer) };
      this.dialog.visible = true;
    },
    async confirm() {
      this.servers.set(this.dialog.id, this.dialog.server);
      await this.saveServer(this.dialog.server);
      this.dialog.visible = false;
    },
    async cancel() {
      this.dialog.server = undefined;
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
  components: {
    "server-edit": serverEdit,
    "query-results": queryResults,
  },
});
