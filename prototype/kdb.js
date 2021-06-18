(async () => {

    const nodeq = require("node-q");
    const promisify = require('util').promisify;
    let conn;

    const app = Vue.createApp({
        data() {
          return {
            query: '',
            servers: [
                {
                    id: 0,
                    name: 'local',
                    connStr: 'localhost:5005'
                },
                {
                    id: 1,
                    name: 'another',
                    connStr: 'notahost:8443'
                },               
            ],
            selectServer: 0,
            toggleServers: false,
            toggleEditServer: false,
            resultJSON: '',
            resultHTML: '',
          };
        },
        methods: {
          async connect() {
            // const server = this.servers.find( ({name}) => name === this.selectServer);
            const server = this.servers[this.selectServer];
            let [host, port] = server.connStr.split(':');
            console.log(host, port);
            await _connect(host, parseInt(port));
          },
          async send() {
            const res = await _send();
            this.resultJSON = res.j;
            this.resultHTML = res.h;
          },
          async editServer(serverName) {
            console.log("We're going to edit " + serverName);
            this.toggleEditServer = true;
          },
          async deleteServer(serverName) {
            console.log("We're going to delete " + serverName);
          },         
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
})()