export default interface Server {
  name: string;
  host: string;
  port: number;
  id?: string;
  tables?: string[];
}

export const SERVER_PREFIX = "server-"