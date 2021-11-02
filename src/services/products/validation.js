import { body } from "express-validator"

export const productValidation = [
    body("name").exists().withMessage("Name is a Required Field!"),
    body("description").exists().withMessage("Description is a Required Field!"),
    body("brand").exists().withMessage("Brand is a Required Field!"),
    body("price").exists().withMessage("price is a Required Field!"),
    body("category").exists().withMessage("Category is a Required Field!")
]