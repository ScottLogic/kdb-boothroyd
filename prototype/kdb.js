var nodeq = require("node-q");
var promisify = require('util').promisify;

// not sure why util.promisify doesn't work here?
const qSend = (conn, value) => new Promise((resolve, reject) => {
    conn.k(value, function(err, res) {
        if (err) reject(err);
        resolve(res);
    });
})

var input=document.getElementById("txtInput");
var output=document.getElementById("txtOutput");
var result=document.getElementById("txtResult");

var conn;

async function connect() {
    conn = await promisify(nodeq.connect)({host: "localhost", port: 5005});
}

async function send() {
    const data = await qSend(conn, input.value);
    output.innerHTML = JSON.stringify(data, null, 2);

    var outputHTML;
        
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
                for (var x in data) {
                    outputHTML += x + " | " + data[x] + "<br />";
                }
            }

        } else {
            /* if not an object, then message must have simple data structure*/
            outputHTML = data;
        };
        if (outputHTML) {
            result.innerHTML = outputHTML;
        }

    }
}

function generateTableHTML(data){
    /* we will iterate through the object wrapping it in the HTML table tags */
    var tableHTML = '<table border="1"><tr>';
    if (typeof data[0] == "object") {
        for (var x in data[0]) {
            /* loop through the keys to create the table headers */
            tableHTML += '<th>' + x + '</th>';
        }
        tableHTML += '</tr>';
        for (var i = 0; i < data.length; i++) {
            /* loop through the rows, putting tags around each col value */
            tableHTML += '<tr>';
            for (var x in data[0]) {
                tableHTML += '<td>' + data[i][x] + '</td>';
            }
            tableHTML += '</tr>';
        }
    }
    else {
        data.forEach((elem) => {
            tableHTML += '<td>' + elem + '</td>';
        })
    }
    tableHTML += '</table>';
    return tableHTML;
}