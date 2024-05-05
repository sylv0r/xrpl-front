"use client";
import xrplClient from "@/auth/Xrp";
import xumm from "@/auth/Xumm";
import { pinFileToIPFS } from "@/helpers/sendFileToPinata";
import { useEffect, useState } from "react";
import { Path, useForm, UseFormRegister, SubmitHandler } from "react-hook-form";
import { convertStringToHex } from "xrpl";
import { useRouter } from "next/navigation";

type IFormValues = {
  title: string;
  description: string;
  image: string;
  price: number;
};

type InputProps = {
  type?: string;
  label: string;
  name: Path<IFormValues>;
  register: UseFormRegister<IFormValues>;
  required: boolean;
};

const Input = ({ label, register, required, type, name }: InputProps) => (
  <div className={"flex flex-col gap-2"}>
    <label>{label}</label>
    <input
      className={"border border-gray-300 rounded p-2"}
      type={type ?? "text"}
      {...register(name, { required })}
    />
  </div>
);

export default function CreateOffer() {
  const { push, replace } = useRouter();
  const { register, handleSubmit } = useForm<IFormValues>();
  const [account, setAccount] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [qrCode, setQrCode] = useState<string>("");
  xumm.user.account.then((a) => setAccount(a ?? ""));

  useEffect(() => {
    if (!account) {
      replace("/");
    }
  }, [account, replace]);

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
          xrplClient
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
                  Amount: data.price,
                },
                async (eventMessage) => {
                  if (Object.keys(eventMessage.data).indexOf("opened") > -1) {
                    // Update the UI? The payload was opened.
                  }
                  if (Object.keys(eventMessage.data).indexOf("signed") > -1) {
                    // The `signed` property is present, true (signed) / false (rejected)
                    return eventMessage;
                  }
                  if (eventMessage.payload.payload.origintype) {
                    // @ts-ignore
                    push(`/offer/${res?.result?.meta?.nftoken_id}/buy`);
                  }
                }
              );
            });
        });
      }
    );
  };

  return (
    <>
      {isOpen && (
        <dialog
          open={isOpen}
          className="bg-gray-500 bg-opacity-50 w-screen h-screen bg-transparent flex items-center justify-center"
        >
          <div className="bg-white w-fit p-10 rounded">
            <h3>Confirm the offer creation</h3>
            <p>Creating offer...</p>
            <img src={qrCode} />
          </div>
        </dialog>
      )}
      <div className={"flex flex-1 items-center justify-center p-10"}>
        <form
          className={
            "p-8 border shadow rounded-xl flex flex-1 flex-col max-w-screen-md gap-4"
          }
          onSubmit={handleSubmit(onSubmit)}
        >
          <Input name="title" label={"Title"} register={register} required />
          <Input
            name="description"
            label={"Description"}
            register={register}
            required
          />
          <Input name="image" label={"Image"} register={register} required />
          <Input
            name="price"
            label={"Price (1000000 = 1 XRP)"}
            register={register}
            type="number"
            required
          />
          <button
            className={"bg-blue-500 text-white rounded p-2 mt-6"}
            type="submit"
          >
            Submit
          </button>
        </form>
      </div>
    </>
  );
}
