const { serverItemComponent, serverEditComponent } = require('./components/ServerItem');
const KdbConnection = require("./kdb-connection.js");
const storage = require("./storage");

(async () => {

    storage.init();
    let connection;
    
    const app = Vue.createApp({
        data() {
          return {
            query: '',
            servers: [],
            selectServer: -1,
            toggleServers: false,
            toggleAddServer: false,
            resultJSON: '',
            resultHTML: '',
          };
        },
        methods: {
          async loadServers() {
              let servers = await storage.getServers();
              if (servers) {
                console.log(JSON.stringify(servers));        
                this.servers = servers;
              }  
          },
          async connect() {
            const server = this.servers[this.selectServer];
            console.log(server.host, server.port);
            connection = await  KdbConnection.connect(server.host, parseInt(server.port));
          },
          async send() {
            const res = await connection.send(editor.getValue());
            this.resultJSON = res.j;
            this.resultHTML = res.h;
          }, 
          async addServer() {
              console.log("We're going to add a server");
              toggleAddServer = true;
          },
          async saveServer(cs) {
            const isNew = !cs.id;
            storage.saveServer(cs);
            if (isNew) {
                this.servers.push(cs);
            }
            else {
                this.servers.splice(this.servers.findIndex(item => item.id === cs.id), 1, cs)
            }
          },
          async deleteServer(cs) {
            if (this.servers.length <= 1) {
                console.log("Don't delete server if only one");
                return;
            }
            storage.deleteServer(cs.id);
            this.servers.splice(this.servers.findIndex(item => item.id === cs.id), 1);
             
          },
          async handleDoneNew(cs) {
            this.toggleAddServer = false;
            if (cs !== null) {
                await this.saveServer(cs);
            }
        }   
        },
        mounted() {
                this.loadServers();
        },
        components: {
            'server-item': serverItemComponent,
            'server-edit': serverEditComponent,
        }
    });

    
    app.mount('#v-app');



    const editor = await require("./editor/editor");
 

})()