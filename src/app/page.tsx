"use client";
import "instantsearch.css/themes/satellite.css";
import { useState } from "react";
import algoliasearch from "algoliasearch/lite";
import { Hits, InstantSearch, SearchBox } from "react-instantsearch";
import Link from "next/link";
import xumm from "@/auth/Xumm";
import Image from "next/image";

const searchClient = algoliasearch(
  "YR1HTDHWAY",
  "677584de4b445a1e0690d2b1c8ca8505",
);

function Hit({ hit }: { hit: any }) {
  return (
    <Link href={`/offer/${hit.objectID}/buy`} className="flex flex-1 flex-row ">
      <Image
        width={160}
        height={160}
        className={"rounded-sm"}
        src={hit.image}
        alt={hit.title}
      />
      <div className={"flex flex-col p-4"}>
        <h1 className={"text-lg font-semibold"}>{hit.title}</h1>
        <p>price: {hit.price}</p>
        <p>description: {hit.description}</p>
      </div>
    </Link>
  );
}

export default function Home() {
  const [account, setAccount] = useState("");
  xumm.user.account.then((a) => setAccount(a ?? ""));

  console.log(account);
  const logout = () => {
    xumm.logout();
    setAccount("");
  };
  return (
    <main className="flex flex-col items-center justify-between p-24 gap-8">
      {account === "" && !xumm.runtime.xapp ? (
        <button onClick={xumm.authorize}>Sign in</button>
      ) : (
        ""
      )}
      {account !== "" ? (
          <div className="flex flex-col items-center justify-between">
            <Link href={"/offer/create"}>Create an offer</Link>
            &nbsp;- or -&nbsp;
            <button onClick={logout}>Sign Out</button>
          </div>
      ) : (
        ""
      )}
        <InstantSearch indexName="beyond_beyond" searchClient={searchClient}>
            <SearchBox />
            <Hits hitComponent={Hit} />
        </InstantSearch>
    </main>
  );
}
