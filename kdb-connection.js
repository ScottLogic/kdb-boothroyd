const nodeq = require("node-q");
const promisify = require("util").promisify;

// not sure why util.promisify doesn't work here?
const qSend = (conn, value) =>
  new Promise((resolve, reject) => {
    conn.k(value, function (err, res) {
      if (err) reject(err);
      resolve(res);
    });
  });

class KdbConnection {
  #connection;

  constructor(connection) {
    this.#connection = connection;
  }

  static async connect(host, port) {
    const connection = await promisify(nodeq.connect)({ host, port });
    return new KdbConnection(connection);
  }

  async send(message) {
    const data = await qSend(this.#connection, message);
    const resultJSON = JSON.stringify(data, null, 2);

    let outputHTML;

    if (data !== null) {
      if (typeof data == "object") {
        /* if an object, then message must be a table or a dictionary */
        if (data.length) {
          /*if object has a length then it is a table OR an array*/
          if (typeof data[0] == "object") {
            const table = new Tabulator("#txtResult", {
              data: data,
              autoColumns: true,
            });
          } else {
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
      }
    }
    return { j: resultJSON, h: outputHTML };
  }
}

function generateTableHTML(data) {
  /* we will iterate through the object wrapping it in the HTML table tags */
  let tableHTML = '<table border="1"><tr>';
  if (typeof data[0] == "object") {
    tableHTML += data[0].map((x) => `<th>${x}</th>`);
    tableHTML += "</tr>";
    tableHTML += data.map((row) =>
      data[0].map((col) => `<td>${row[col]}</td>`)
    );
  } else {
    tableHTML += data.map((x) => `<td>${x}</td>`).join("");
  }
  tableHTML += "</table>";
  return tableHTML;
}

module.exports = KdbConnection;
