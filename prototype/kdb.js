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
 
    //TODO: Read server data from persistent storage - and add auth stuff etc
    const serverItemComponent = await require('./components/ServerItem');
    
    const app = Vue.createApp({
        data() {
          return {
            query: '',
            servers: 
                //  _getServersFromStorage(),
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
                    },
                    {
                        id: 1,
                        name: 'another',
                        host: 'notahost',
                        port: '8443',
                        username: '',
                        password: '', 
                        colorScheme: '',                  
                    },               
                ],
            selectServer: 0,
            toggleServers: false,
            resultJSON: '',
            resultHTML: '',
          };
        },
        methods: {
          async connect() {
            // const server = this.servers.find( ({name}) => name === this.selectServer);
            const server = this.servers[this.selectServer];
            // let [host, port] = server.connStr.split(':');
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
          },
          async saveServer(cs) {
            console.log("We're going to save server details: " + JSON.stringify(cs));
            const key = String('server.' + cs.id.toString());
              storage.set(key, cs, (error) => {
                  if (error) throw error;
              });
          }   
        },
        components: {
            'server-item': serverItemComponent,
        }
    });

    
    app.mount('#v-app');

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

    ///TODO: get this working - may need to use preload module
    function _getServersFromStorage() {
        const allKeys = storage.keys((error, allKeys) => {
            if (error) throw error;
            for (let key of allKeys) {
                console.log('key ' + key);
            }          
        });
        console.log(allKeys);
        for (let key of allKeys) {
            console.log('key ' + key);
        }
        // Get server keys
        const serverKeys = allKeys.filter(k => String(k).startsWith('server.'));
        const allServers = storage.getMany(serverKeys, (error) => {
            if (error) throw error;
        });
        return allServers;
    }
})()