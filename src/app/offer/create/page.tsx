"use client";
import xrplClient from "@/auth/Xrp";
import xumm from "@/auth/Xumm";
import { pinFileToIPFS } from "@/helpers/sendFileToPinata";
import { useState } from "react";
import { Path, useForm, UseFormRegister, SubmitHandler } from "react-hook-form";
import { convertStringToHex } from "xrpl";

type IFormValues = {
  title: string;
  description: string;
  image: string;
  price: number;
};

type InputProps = {
  label: Path<IFormValues>;
  register: UseFormRegister<IFormValues>;
  required: boolean;
};

const Input = ({ label, register, required }: InputProps) => (
  <div className={"flex flex-col gap-2"}>
    <label>{label}</label>
    <input
      className={"border border-gray-300 rounded p-2"}
      {...register(label, { required })}
    />
  </div>
);

export default function CreateOffer() {
  const { register, handleSubmit } = useForm<IFormValues>();
  const [account, setAccount] = useState("");
  xumm.user.account.then((a) => setAccount(a ?? ""));

  const onSubmit: SubmitHandler<IFormValues> = async (data) => {
    const returned = await pinFileToIPFS(
      data as unknown as Record<string, string>
    );
    xumm.payload?.createAndSubscribe(
      {
        TransactionType: "NFTokenMint",
        Account: account,
        URI: convertStringToHex(
          [process.env.NEXT_PUBLIC_PINATA_GATEWAY_BASE_URL, returned].join("")
        ),
        Flags: 8,
        TransferFee: 1,
        NFTokenTaxon: 0,
      },
      async (eventMessage) => {
        if (Object.keys(eventMessage.data).indexOf("opened") > -1) {
          // Update the UI? The payload was opened.
        }
        if (Object.keys(eventMessage.data).indexOf("signed") > -1) {
          // The `signed` property is present, true (signed) / false (rejected)
          return eventMessage;
        }
        xrplClient.connect().then(() => {
          if (!eventMessage.payload.response.txid) return;
          const test = xrplClient
            .request({
              command: "tx",
              transaction: eventMessage.payload.response.txid,
            })
            .then((res) => {
              xrplClient.disconnect();
              xumm.payload?.createAndSubscribe(
                {
                  TransactionType: "NFTokenCreateOffer",
                  Account: account,
                  // @ts-ignore
                  NFTokenID: res.result.meta.nftoken_id,
                  Flags: 1,
                  Amount: "1",
                },
                async (eventMessage) => {
                  if (Object.keys(eventMessage.data).indexOf("opened") > -1) {
                    // Update the UI? The payload was opened.
                  }
                  if (Object.keys(eventMessage.data).indexOf("signed") > -1) {
                    // The `signed` property is present, true (signed) / false (rejected)
                    return eventMessage;
                  }
                }
              );
            });
        });
      }
    );
  };

  return (
    <div className={"flex flex-1 items-center justify-center p-10"}>
      <form
        className={
          "p-8 border shadow rounded-xl flex flex-1 flex-col max-w-screen-md gap-4"
        }
        onSubmit={handleSubmit(onSubmit)}
      >
        <Input label={"title"} register={register} required />
        <Input label={"description"} register={register} required />
        <Input label={"image"} register={register} required />
        <Input label={"price"} register={register} required />
        <button
          className={"bg-blue-500 text-white rounded p-2 mt-6"}
          type="submit"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
