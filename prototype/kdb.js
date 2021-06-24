
(async () => {

    const nodeq = require("node-q");
    const promisify = require('util').promisify;

    // Deal with persisting server data
    const os = require('os');
    const path = require('path');
    const fs = require('fs');
    const storage = require('electron-json-storage');
    //TODO: at the moment this is WINDOWS ONLY
    const storageDir = path.join(os.homedir(), 'AppData','Local', 'kdb studio 2' );
    if (! fs.existsSync(storageDir)) {
        fs.mkdirSync(storageDir);
    }
    storage.setDataPath(storageDir);
    console.log('storage path: ' + storageDir);

    let conn;
 
    //TODO: add auth stuff etc
    const {serverItemComponent, serverEditComponent } = await require('./components/ServerItem');

    const app = Vue.createApp({
        data() {

          return {
            query: '',
            servers: // Needs to be initialised with valid dummy data or else render won't work
                [
                    {
                        id: 0,
                        name: 'local',
                        host: 'localhost',
                        port: '5005',
                        username: '',
                        password: '', //TODO: work out how to store password
                        connType: 'standard',
                        colorScheme: '',
                    }               
                ],
            nextServerId: 1,
            selectServer: 0,
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
            const server = this.servers[this.selectServer];
            console.log(server.host, server.port);
            await _connect(server.host, parseInt(server.port));
          },
          async send() {
            const res = await _send();
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
 
    // not sure why util.promisify doesn't work here?
    const qSend = (conn, value) => new Promise((resolve, reject) => {
        conn.k(value, function(err, res) {
            if (err) reject(err);
            resolve(res);
        });
    })

    async function _connect(h, p) {
        conn = await promisify(nodeq.connect)({host: h, port: p});
    }

    async function _send() {
        console.log(editor.getValue());
        const data = await qSend(conn, editor.getValue());
        const resultJSON = JSON.stringify(data, null, 2);

        let outputHTML;
            
        if (data !== null) {
            if (typeof data == "object") {
                /* if an object, then message must be a table or a dictionary */
                if (data.length) {
                    /*if object has a length then it is a table OR an array*/
                    if (typeof data[0] == "object") {
                        const table = new Tabulator("#txtResult", {
                            data:data,
                            autoColumns:true
                        });
                    }
                    else {
                        outputHTML = generateTableHTML(data);
                    }
                } else {
                    /* 
                        if object has no length, it is a dictionary, 
                        in this case we will iterate over the keys to print 
                        the key|value pairs as would be displayed in a q console
                    */
                    for (let x in data) {
                        outputHTML += x + " | " + data[x] + "<br />";
                    }
                }

            } else {
                /* if not an object, then message must have simple data structure*/
                outputHTML = data;
            };
            // if (outputHTML) {
            //     result.innerHTML = outputHTML;
            // }

        }
        console.log(resultJSON);
        console.log(outputHTML);
        return {j: resultJSON, h: outputHTML};
    }

    function generateTableHTML(data){
        /* we will iterate through the object wrapping it in the HTML table tags */
        let tableHTML = '<table border="1"><tr>';
        if (typeof data[0] == "object") {
            tableHTML += data[0].map(x => `<th>${x}</th>`);
            tableHTML += '</tr>';
            tableHTML += data.map(row => data[0].map(col => `<td>${row[col]}</td>`));
        }
        else {
            tableHTML += data.map(x => `<td>${x}</td>`).join('');
        }
        tableHTML += '</table>';
        return tableHTML;
    }
})()