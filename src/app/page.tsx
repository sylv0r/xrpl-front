"use client"
import Image from "next/image";
import {  Client,  NFTokenMint,  Wallet }  from "xrpl" 


export default function Home() {
  const client = new Client("wss://s.altnet.rippletest.net:51233")
  const xrpl = require("xrpl")
  

  const wallet = Wallet.fromSeed("sEdVScRQAjdDTtkzWv93Gq6JF9WdEGr")

  const json = {
    "TransactionType": "NFTokenMint",
    "Account": wallet.classicAddress,
    "URI": "697066733A2F2F62616679626569676479727A74357366703775646D37687537367568377932366E6634646675796C71616266336F636C67747179353566627A6469",
    "Flags": 8,
    "TransferFee": 1,
    "NFTokenTaxon": 0,
  }

  async function ratio() {
    console.log("lets get started...");
    await client.connect();

    const tx = await client.submitAndWait(json as NFTokenMint, { wallet });
   
    await client.disconnect();
    console.log(JSON.stringify(tx.result.meta));
    console.log("all done!");
  }

  

  return (
    <div><button onClick={() => ratio()}>ratio</button></div>
  );
}
