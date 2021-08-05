import nodeq, { Connection } from "node-q";
import { promisify } from "util";

// not sure why util.promisify doesn't work here?
const qSend = (conn: Connection, value: string) =>
  new Promise((resolve, reject) => {
    try {
      conn
        .on("error", (e) => {
          reject(e);
        })
        .k(value, function (err, res) {
          if (err) reject(err);

          resolve(res);
        });
    } catch (e) {
      reject(e);
    }
  });

class KdbConnection {
  connection: Connection | undefined;
  host: string | undefined;
  port: number | undefined;
  username: string | undefined;
  password: string | undefined

  constructor(host: string, port: number, username?: string, password?: string) {
    this.host = host;
    this.port = port;
    this.username = username;
    this.password = password;
  }

  async connect() {
    // @ts-ignore - something strange going on with the types here
    this.connection = (await promisify(nodeq.connect)({
      host: this.host,
      port: this.port,
      user: this.username,
      password: this.password
    })) as Connection;

    this.connection!.on("error", (e) => {
      this.reset();
    });

    return this;
  }

  reset() {
    this.connection = undefined;
  }

  isConnected() {
    return this.connection !== undefined;
  }

  async send(message: string) {
    if (!this.connection) {
      // Implies connection has gone away - try to reconnect
      try {
        await this.connect();
      } catch (e) {
        throw "Unable to connect to server";
      }
    }
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
