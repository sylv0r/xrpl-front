"use client";
import xrplClient from "@/auth/Xrp";
import xumm from "@/auth/Xumm";
import { useState } from "react";
import { Path, useForm, UseFormRegister, SubmitHandler } from "react-hook-form";

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
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<IFormValues>();
  const [account, setAccount] = useState("");
  xumm.user.account.then((a) => setAccount(a ?? ""));
  const onSubmit: SubmitHandler<IFormValues> = (data) => {
    xumm.payload?.createAndSubscribe(
      {
        TransactionType: "NFTokenMint",
        Account: account,
        URI: "697066733A2F2F62616679626569676479727A74357366703775646D37687537367568377932366E6634646675796C71616266336F636C67747179353566627A6469",
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
              // @ts-ignore
              console.log(res.result.meta.nftoken_id);
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
                  console.log(eventMessage);
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
