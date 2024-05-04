import { Xumm } from "xumm";

const xumm = new Xumm(process.env.NEXT_PUBLIC_XUMM_API_TOKEN ?? ""); // Some API Key UUID

export default xumm;
