import nodeq, { Connection } from "node-q";
import { promisify } from "util";

// not sure why util.promisify doesn't work here?
const qSend = (conn: Connection, value: string) =>
  new Promise((resolve, reject) => {
    conn.k(value, function (err, res) {
      if (err) reject(err);
      resolve(res);
    });
  });

class KdbConnection {
  connection: Connection | undefined;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  static async connect(host: string, port: number) {
    // @ts-ignore - something strange going on with the types here
    const connection = (await promisify(nodeq.connect)({
      host,
      port,
    })) as Connection;
    const kconn = new KdbConnection(connection);
    connection!.on("error", (e) => {
      console.log("Connection has gone away");
      kconn.reset();
    });

    return kconn;
  }

  reset() {
    this.connection = undefined;
  }

  isConnected() {
    return this.connection !== undefined;
  }

  async send(message: string) {
    try {
      const data = await qSend(this.connection!, message);
      if (data === null) {
        return {
          type: "success",
          data: message,
        };
      }
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

export default KdbConnection;
