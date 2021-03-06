import nodeq, { Connection } from "node-q";
import { promisify } from "util";

// not sure why util.promisify doesn't work here?
const qSend = (conn: Connection, value: string) =>
  new Promise((resolve, reject) => {
    try {
      conn.on("error", reject).k(value, function (err, res) {
        if (err) reject(err);

        conn.off("error", reject);
        resolve(res);
      });
    } catch (e) {
      reject(e);
    }
  });

type KdbConnectionOptions = {
  user?: string;
  password?: string;
  useTLS: boolean;
  key?: string;
};

class KdbConnection {
  connection: Connection | undefined;
  host: string | undefined;
  port: number | undefined;
  options: KdbConnectionOptions;

  constructor(
    host: string,
    port: number,
    options: KdbConnectionOptions = { useTLS: false }
  ) {
    this.host = host;
    this.port = port;
    this.options = options;
  }

  async connect() {
    // @ts-ignore - something strange going on with the types here
    this.connection = (await promisify(nodeq.connect)({
      host: this.host,
      port: this.port,
      ...this.options,
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
