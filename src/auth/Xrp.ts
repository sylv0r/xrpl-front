import { Client } from "xrpl";

const xrplClient = new Client(process.env.NEXT_PUBLIC_XRP_CLIENT_URL ?? "");

export default xrplClient;
