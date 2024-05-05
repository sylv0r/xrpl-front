'use client'
import xrplClient from "@/auth/Xrp";
import xumm from "@/auth/Xumm";
import { useState } from "react";
import axios from 'axios';
import { convertHexToString } from "xrpl";

export default function Buy({
    params,
}: {
    params: { tokenId: string };
}) {
    const [nftTokenInfo, setNftTokenInfo] = useState() as any;
    const [nftOfferInfo, setNftOfferInfo] = useState() as any;
    const [xrpInDollar, setXrpInDollar] = useState() as any;
    const [metadata, setMetadata] = useState() as any;

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
                    xrpValue(res.result.offers[0].amount.toString());
                    xrplClient.disconnect();
                });
        });

        axios.post('https://docs-demo.xrp-testnet.quiknode.pro/', {
            "method": "nft_info",
            "params": [
                {
                    "nft_id": params.tokenId,
                    "ledger_index": "validated"
                }
            ],
            "id": 1,
            "jsonrpc": "2.0"
        }).then((res) => {
            console.log(res);
            setNftTokenInfo(res)
            axios.get(convertHexToString(res.data.result.uri), {
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then((res) => {
                setMetadata(res.data);
                console.log(res);
            });
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

    // get xrp value and set the dollar value
    function xrpValue(xrpAmount: string): void {
        axios.get('https://api.coingecko.com/api/v3/simple/price', {
            params: {
                ids: 'ripple',
                vs_currencies: 'usd'
            }
        }).then((res) => {
            setXrpInDollar((res.data.ripple.usd * parseFloat(xrpAmount)).toFixed(3));
        });
    }

    return (
        <div className={"flex flex-col p-2 bg-gray-900 h-screen text-white"}>
            <button onClick={getNfTokenInfo} className={"bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"}>Get NFT infos</button>
            <div className={"flex flex-row w-full"}>
                <div className={"flex flex-col "}>
                    <div className={"border-solid border-2 border-gray-700 p-10 rounded bg-black max-h-[80vh] flex items-center mb-4"}>
                        <img src={metadata?.image} className={"object-contain h-150 w-150"} />
                    </div>
                    <div className={"block w-full p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"}>
                        <h5 className={"mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white"}>Description :</h5>
                        <p className={"font-normal text-gray-700 dark:text-gray-400"}>{metadata?.description}</p>
                    </div>
                </div>
                <div className={"flex flex-col p-2"}>
                    <div className={"block w-full p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 mb-5"}>
                        <h1 className={"mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white"}>Title :</h1>
                        <p className={"font-normal text-gray-700 dark:text-gray-400"}>{metadata?.title}</p>
                    </div>
                    <div className={"block w-full p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 mb-5"}>
                        <h1 className={"mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white"}>Token ID:</h1>
                        <p className={"font-normal text-gray-700 dark:text-gray-400"}>{nftTokenInfo?.data.result.nft_id}</p>
                    </div>
                    <div className={"block w-full p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 mb-5"}>
                        <h5 className={"mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white"}>Users infos :</h5>
                        <p className={"font-normal text-gray-700 dark:text-gray-400"}>Issuer: {nftTokenInfo?.data.result.issuer}</p>
                        <p className={"font-normal text-gray-700 dark:text-gray-400"}>Owner: {nftTokenInfo?.data.result.owner}</p>
                    </div>
                    <div className={"block w-full p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 mb-5"}>
                        <h5 className={"mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white"}>Price :</h5>
                        <p className={"font-normal text-gray-700 dark:text-gray-400"}>curent price</p>
                        <h6 className={"mb-2 text-1xl font-bold tracking-tight text-gray-900 dark:text-white"}>{nftOfferInfo?.amount} XRP  ${xrpInDollar}</h6>
                        <button onClick={buyNft} className={"bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"}>Buy the NFT</button>
                    </div>
                </div>
            </div>
        </div>
    );
}