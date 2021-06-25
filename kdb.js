const os = require('os');
const path = require('path');
const fs = require('fs');
const storage = require('electron-json-storage');
const nodeq = require("node-q");
const promisify = require('util').promisify;

const { serverItemComponent, serverEditComponent } = require('./components/ServerItem');
const KdbConnection = require("./kdb-connection.js");

(async () => {

    
    // Deal with persisting server data
    const storageDir = path.join(os.homedir(), 'AppData','Local', 'kdb studio 2' );
    if (! fs.existsSync(storageDir)) {
        fs.mkdirSync(storageDir, { recursive: true });
    }
    storage.setDataPath(storageDir);
    console.log('storage path: ' + storageDir);

    //TODO: add auth stuff etc
    let connection;
    
    const app = Vue.createApp({
        data() {
          return {
            query: '',
            servers: [],
            nextServerId: 1,
            selectServer: -1,
            toggleServers: false,
            toggleAddServer: false,
            resultJSON: '',
            resultHTML: '',
          };
        },
        methods: {
          async loadServers() {
              let servers = await _getServersFromStorage();
              if (servers) {
                console.log(JSON.stringify(servers));        
                this.servers = servers;
              }  
              this.nextServerId = Math.max(...this.servers.map(s => s.id), 0) + 1;
          },
          async connect() {
            const server = this.servers[this.selectServer - 1];
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
            console.log("We're going to save server details: " + JSON.stringify(cs));
            const isNew = (! 'id' in cs || cs.id == undefined);
            if (isNew) {
                // We need to give new server an unused id
                cs.id = this.nextServerId;
            }
            const key = String('server.' + cs.id.toString());
            storage.set(key, cs, (error) => {
                if (error) throw error;
            });

            if (isNew) {
                this.servers.push(cs);
            }
            else {
                this.servers.splice(this.servers.findIndex(item => item.id === cs.id), 1, cs)
            }
          },
          async deleteServer(cs) {
              console.log("We're going to delete server: " + cs.id.toString());
              const key = String('server.' + cs.id.toString());

              // don't delete last entry
              if (this.servers.length <= 1) {
                console.log("Don't delete server if only one");
              }
              else {
                storage.remove(key, (error) => {
                    if (error) throw error;
                })
                this.servers.splice(this.servers.findIndex(item => item.id === cs.id), 1);
              }
          },
          async handleDoneNew(cs) {
            this.toggleAddServer = false;
            if (cs !== null) {
                await this.saveServer(cs);
            }
        }   
        },
        mounted() {
            this.$nextTick(function() { // Ensures all child components have been mounted 
                this.loadServers();
            })
        },
        components: {
            'server-item': serverItemComponent,
            'server-edit': serverEditComponent,
        }
    });

    
    app.mount('#v-app');

    const _getServersFromStorage = () => new Promise((resolve, reject) => {
        storage.keys((error, allKeys) => {
            if (error) reject(error);
            for (let key of allKeys) {
                console.log('key ' + key);             
            }   
            const serverKeys = allKeys.filter(k => String(k).startsWith('server.'));

            console.log(JSON.stringify(serverKeys));

            storage.getMany(serverKeys, (error, data) => {
                if (error) reject(error);
                console.log(JSON.stringify(data));
                if ('server' in data) {
                    resolve(data.server.filter(k => k !== null));  // For some reason we are getting an object {"server": [...]}
                }
            })
        });
    })

    const editor = await require("./editor/editor");
 

})()