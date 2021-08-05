export default interface Server {
  name: string;
  host: string;
  port: number;
  id?: string;
  username?:string;
  password?:string;
}

export const SERVER_PREFIX = "server-"