import { body } from "express-validator";

export const reviewValidation = [
    body("comment").exists().withMessage("Comment is a Required Field!"),
    body("rate").exists().withMessage("Rate is a Required Field!"),
    body("productId").exists().withMessage("ProductId is a Required Field!")
]