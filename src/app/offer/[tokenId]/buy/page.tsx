"use client";
import xrplClient from "@/auth/Xrp";
import xumm from "@/auth/Xumm";
import { useEffect, useState } from "react";

export default function Buy({
    params,
  }: {
    params: { tokenId: string };
  }) {
    
    const [nftTokenInfo, setNftTokenInfo] = useState() as any;
    const [nftOfferInfo, setNftOfferInfo] = useState() as any;
    
    const [account, setAccount] = useState("");
    xumm.user.account.then((a) => setAccount(a ?? ""));
    
    // get nft token info
    async function getNfTokenInfo() {

        xrplClient.connect().then(() => {
            console.log('connected');
            xrplClient
              .request({
                command: "nft_sell_offers",
                nft_id: params.tokenId,
                ledger_index: "validated"
              })
              .then((res) => {
                console.log(res);
                setNftOfferInfo(res.result.offers[0]);
                xrplClient.disconnect();
            });
        });
        await xumm.helpers?.getNftokenDetail(params.tokenId).then((res) => {
            setNftTokenInfo(res)
            console.log(res)
        });
    }

    // buy nft
    async function buyNft() {
        xumm.payload?.createAndSubscribe(
            {
                Account: account,
                Fee: "12",
                NFTokenSellOffer: nftOfferInfo.nft_offer_index,
                TransactionType: "NFTokenAcceptOffer"
            },
            async (eventMessage) => {
                console.log(eventMessage);
            }
        );
    }

    return (
            <div>
                <button onClick={getNfTokenInfo}>Get NFT Info</button>
                <h1>Buy NFT</h1>
                <h2>token id : {nftTokenInfo?.tokenId}</h2>
                <h2>description : {nftTokenInfo?.description}</h2>
                <h2>issuer : {nftTokenInfo?.issuer}</h2>
                <h2>image : {nftTokenInfo?.image}</h2>
                <h2>owner : {nftTokenInfo?.owner}</h2>
                <h2>price : {nftOfferInfo?.amount}</h2>
                <div>
                    <h2>buy the ntf :</h2>
                    <button onClick={buyNft}>Buy</button>
                </div>
            </div>
    );
}
// http://localhost:3000/offer/000800010E49CF800BCF613287428EA4BF2FF744CA54AEB419324B680005E4CD/buy
