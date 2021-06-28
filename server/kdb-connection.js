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
    try {
      const data = await qSend(this.#connection, message);
      return {
        type: "success",
        data,
      };
    } catch (e) {
      return {
        type: "error",
        data: e.toString(),
      };
    }
  }
}

module.exports = KdbConnection;
