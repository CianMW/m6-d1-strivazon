import fs from "fs-extra";
import multer from "multer";
import { fileURLToPath } from "url"
import { dirname, join } from "path"

const { readJSON, writeJSON, writeFile } = fs

const dataFolderPath = join(dirname(fileURLToPath(import.meta.url)), "../data") // gets the current url, then the directory (folder) address, then goes out a level and adds the folder address "data"
console.log(dataFolderPath)
const reviewsJSONPath = join(dataFolderPath, "/reviews.json")
const productsJSONPath = join(dataFolderPath, "/products.json")
const publicFolderPath = join(process.cwd(), "./public/images") // process.cwd() gets the address for the root


export const writeReviewsToFile = (input) => {fs.writeJSON(reviewsJSONPath, input)} 
export const writeProductsToFile = (input) => {fs.writeJSON(productsJSONPath, input)} 

//export const getPosts = () => fs.readJSON(postsJSONPath)

export const getReviews = () => fs.readJSON(reviewsJSONPath)
export const getProducts = () => fs.readJSON(productsJSONPath)

export const saveImages = (fileName, contentAsBuffer) => writeFile(join(publicFolderPath, fileName), contentAsBuffer) // writes the picture to the destination