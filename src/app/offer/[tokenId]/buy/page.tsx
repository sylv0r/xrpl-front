'use client'
import xrplClient from "@/auth/Xrp";
import xumm from "@/auth/Xumm";
import { useEffect, useState } from "react";
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
                    xrpValue((parseInt(res.result.offers[0].amount.toString())/1000000).toString());
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

    useEffect(() => {
        getNfTokenInfo();
    },[]);

    return (
        <div className={"flex flex-col p-2 h-screen text-black"}>
            <div className={"flex flex-row w-full"}>
                <div className={"flex flex-col "}>
                    <div className={"border-solid border-2 border-gray-200 p-10 rounded bg-slate-200 max-h-[80vh] flex items-center mb-4"}>
                        <img src={metadata?.image} className={"object-contain h-150 w-150"} />
                    </div>
                    <div className={"block w-full p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 bg-gray-200"}>
                        <h5 className={"mb-2 text-2xl font-bold tracking-tight text-black"}>Description :</h5>
                        <p className={"font-normal text-gray-700 text-black"}>{metadata?.description}</p>
                    </div>
                </div>
                <div className={"flex flex-col p-2"}>
                    <div className={"block w-full p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 bg-gray-200 mb-5"}>
                        <h1 className={"mb-2 text-2xl font-bold tracking-tight text-black"}>Title :</h1>
                        <p className={"font-normal text-gray-700 text-black"}>{metadata?.title}</p>
                    </div>
                    <div className={"block w-full p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 bg-gray-200 mb-5"}>
                        <h1 className={"mb-2 text-2xl font-bold tracking-tight text-black"}>Token ID:</h1>
                        <p className={"font-normal text-gray-700 text-black"}>{nftTokenInfo?.data.result.nft_id}</p>
                    </div>
                    <div className={"block w-full p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 bg-gray-200 mb-5"}>
                        <h5 className={"mb-2 text-2xl font-bold tracking-tight text-black"}>Users infos :</h5>
                        <p className={"font-normal text-gray-700 text-black"}>Issuer: {nftTokenInfo?.data.result.issuer}</p>
                        <p className={"font-normal text-gray-700 text-black"}>Owner: {nftTokenInfo?.data.result.owner}</p>
                    </div>
                    <div className={"block w-full p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 bg-gray-200 mb-5"}>
                        <h5 className={"mb-2 text-2xl font-bold tracking-tight text-black"}>Price :</h5>
                        <p className={"font-normal text-gray-700 text-black"}>curent price</p>
                        <h6 className={"mb-2 text-1xl font-bold tracking-tight text-black"}>{parseInt(nftOfferInfo?.amount)/1000000} XRP  ${xrpInDollar}</h6>
                        <button onClick={buyNft} className={"bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"}>Buy the NFT</button>
                    </div>
                </div>
            </div>
        </div>
    );
}