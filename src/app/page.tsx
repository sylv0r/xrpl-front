"use client";
import { useState } from "react";
import { Client } from "xrpl";
import xumm from "@/auth/Xumm";

const xrplClient = new Client("wss://s.altnet.rippletest.net:51233");

export default function Home() {
  const [account, setAccount] = useState("");
  const [appName, setAppName] = useState("");
  xumm.user.account.then((a) => setAccount(a ?? ""));
  xumm.environment.jwt?.then((j) => setAppName(j?.app_name ?? ""));

  console.log(account);
  const logout = () => {
    xumm.logout();
    setAccount("");
  };

  const createNft = () => {
    xumm.payload
      ?.createAndSubscribe(
        {
          TransactionType: "NFTokenMint",
          Account: account,
          URI: "697066733A2F2F62616679626569676479727A74357366703775646D37687537367568377932366E6634646675796C71616266336F636C67747179353566627A6469",
          Flags: 8,
          TransferFee: 1,
          NFTokenTaxon: 0,
        },
        (eventMessage) => {
          console.log("test", eventMessage);
          if (Object.keys(eventMessage.data).indexOf("opened") > -1) {
            // Update the UI? The payload was opened.
            console.log("Payload opened:", eventMessage.data.opened);
          }
          if (Object.keys(eventMessage.data).indexOf("signed") > -1) {
            // The `signed` property is present, true (signed) / false (rejected)
            return eventMessage;
          }
        }
      )
      .then((resolved) => {
        console.log("test2", resolved);

        return resolved; // Return payload promise for the next `then`
      })
      .then(({ created, resolved }) => {
        console.log("Payload URL:", created.next.always);
        console.log("Payload QR:", created.refs.qr_png);

        return resolved; // Return payload promise for the next `then`
      })
      .then((payload) => {
        console.log("Payload resolved", payload);
        xrplClient.connect().then(() => {
          xrplClient
            // @ts-ignore
            .request({ command: "tx", transaction: payload.data.txid })
            .then(() => {
              xrplClient.disconnect();
            });
        });
      });
  };
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {account === "" && !xumm.runtime.xapp ? (
        <button onClick={xumm.authorize}>Sign in</button>
      ) : (
        ""
      )}
      {account !== "" ? (
        <>
          <button onClick={createNft}>Make a payment</button>
          &nbsp;- or -&nbsp;
          <button onClick={logout}>Sign Out</button>
        </>
      ) : (
        ""
      )}
    </main>
  );
}
