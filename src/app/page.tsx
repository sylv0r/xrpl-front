"use client";
import Image from "next/image";
import {Xumm} from 'xumm';
import {useState} from "react";

const xumm = new Xumm('5a37cd08-9b58-423f-8c08-7727892dfbe8') // Some API Key UUID

export default function Home() {
  const [account, setAccount] = useState('')
  const [appName, setAppName] = useState('')
  xumm.user.account.then(a => setAccount(a ?? ''))
  xumm.environment.jwt?.then(j => setAppName(j?.app_name ?? ''))
  console.log(account)
  const logout = () => {
    xumm.logout()
    setAccount('')
  }

  const createNft = () => {
    xumm.payload?.createAndSubscribe({
      "TransactionType": "NFTokenMint",
      "Account": account,
      "URI": "697066733A2F2F62616679626569676479727A74357366703775646D37687537367568377932366E6634646675796C71616266336F636C67747179353566627A6469",
      "Flags": 8,
      "TransferFee": 1,
      "NFTokenTaxon": 0,
    }, eventMessage => {
      console.log(eventMessage)
      if (Object.keys(eventMessage.data).indexOf('opened') > -1) {
        // Update the UI? The payload was opened.
      }
      if (Object.keys(eventMessage.data).indexOf('signed') > -1) {
        // The `signed` property is present, true (signed) / false (rejected)
        return eventMessage
      }
    })
        .then(resolved => {
            console.log('Payload resolved', resolved)

          return resolved // Return payload promise for the next `then`
        })
        .then(payload => console.log('Payload resolved', payload))
  }
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {
        account === '' && !xumm.runtime.xapp
            ? <button onClick={xumm.authorize}>Sign in</button>
            : ''
      }
      {
        account !== ''
            ? <>
              <button onClick={createNft}>Make a payment</button>
              &nbsp;- or -&nbsp;
              <button onClick={logout}>Sign Out</button>
            </>
            : ''
      }
    </main>
  );
}
