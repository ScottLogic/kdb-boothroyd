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
      servers: new Map(),
      selectServer: -1,
      toggleServers: false,
      toggleAddServer: false,
      queryResult: "",
    };
  },
  methods: {
    async connect() {
      const server = this.servers.get(this.selectServer);
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
    async handleDoneNew(cs) {
      this.toggleAddServer = false;
      if (cs !== null) {
        await this.saveServer(cs);
      }
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
    "server-item": serverItemComponent,
    "server-edit": serverEditComponent,
    "query-results": queryResults,
  },
});

app.mount("#v-app");
