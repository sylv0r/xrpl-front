'use client';
import { Path, useForm, UseFormRegister, SubmitHandler } from "react-hook-form"

type IFormValues = {
    title: string
    description: string
    image: string
    price: number
}

type InputProps = {
    label: Path<IFormValues>
    register: UseFormRegister<IFormValues>
    required: boolean
}

const Input = ({ label, register, required }: InputProps) => (
    <div className={"flex flex-col gap-2"}>
        <label>{label}</label>
        <input className={
            "border border-gray-300 rounded p-2"
        } {...register(label, { required })} />
    </div>
)

export default function CreateOffer () {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<IFormValues>()
    const onSubmit: SubmitHandler<IFormValues> = (data) => console.log(data)

    return (
        <div className={"flex flex-1 items-center justify-center p-10"}>
            <form className={"p-8 border shadow rounded-xl flex flex-1 flex-col max-w-screen-md gap-4"} onSubmit={handleSubmit(onSubmit)}>
                <Input label={"title"} register={register} required />
                <Input label={"description"} register={register} required />
                <Input label={"image"} register={register} required />
                <Input label={"price"} register={register} required />
                <button className={
                    "bg-blue-500 text-white rounded p-2 mt-6"
                } type="submit">Submit</button>
            </form>
        </div>
    );
}
