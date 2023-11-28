import * as z from "zod";
import dayjs from 'dayjs';

export const addValidation = z.object({
    title: z.string().nonempty({ message: "Title is required" }),
    description: z.string().nonempty({ message: "Description is required" }),
    cost: z.string().nonempty({ message: "Cost is required" }),
    image: z.string().nonempty({ message: "Image is required" }),
    expireDate: z.any()
        .refine(val => val !== null, { message: "Expire date is required" })
        .refine(val => dayjs(val).isAfter(dayjs()), { message: "Expire date should be in the future" })
});

export const backValidation = z.object({
    amount: z.string().nonempty({ message: "Amount is required" }),
})