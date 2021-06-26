const {
  serverItemComponent,
  serverEditComponent,
} = require("./components/server-item.js");
const { queryResults } = require("./components/query-results.js");
const KdbConnection = require("./kdb-connection.js");
const storage = require("./storage");
const editor = require("./editor/editor");

storage.init();

let connection;

const app = Vue.createApp({
  data() {
    return {
      query: "",
      servers: [],
      selectServer: -1,
      toggleServers: false,
      toggleAddServer: false,
      queryResult: "",
    };
  },
  methods: {
    async connect() {
      const server = this.servers[this.selectServer];
      console.log(server.host, server.port);

      try {
        connection = await KdbConnection.connect(
          server.host,
          parseInt(server.port)
        );
      } catch (e) {
        connection = undefined;
        console.error("server connection error", e);
      }
    },
    async send() {
      if (!connection) return;
      const input = await editor.then((e) => e.getValue());
      this.queryResult = await connection.send(input);
    },
    async addServer() {
      toggleAddServer = true;
    },
    async saveServer(cs) {
      const isNew = !cs.id;
      storage.saveServer(cs);
      if (isNew) {
        this.servers.push(cs);
      } else {
        this.servers.splice(
          this.servers.findIndex((item) => item.id === cs.id),
          1,
          cs
        );
      }
    },
    async deleteServer(cs) {
      if (this.servers.length <= 1) {
        console.log("Don't delete server if only one");
        return;
      }
      storage.deleteServer(cs.id);
      this.servers.splice(
        this.servers.findIndex((item) => item.id === cs.id),
        1
      );
    },
    async handleDoneNew(cs) {
      this.toggleAddServer = false;
      if (cs !== null) {
        await this.saveServer(cs);
      }
    },
  },
  async mounted() {
    this.servers = await storage.getServers();
    // automatically connect to the first server in the list
    if (this.servers.length) {
      this.selectServer = 0;
      await this.connect();
    }
  },
  components: {
    "server-item": serverItemComponent,
    "server-edit": serverEditComponent,
    "query-results": queryResults,
  },
});

app.mount("#v-app");
