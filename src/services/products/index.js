import express from "express";
import uniqid from "uniqid";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { productValidation  } from "./validation.js";
import { getProducts, getReviews, writeProductsToFile, saveImages } from "../../lib/functions.js";
import multer from "multer";
import { validationResult } from "express-validator";
import pool from "../../db/connect.js";
// import { parseFile, uploadFile } from "../utils/upload/index.js";




const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const productsFilePath = path.join(__dirname, "products.json");
const productsRouter = express.Router();

// Post Product
productsRouter.post("/", productValidation, async (req, res, next) => {
  try {
    const errorsList = validationResult(req);
    if (!errorsList.isEmpty()) {
      next(createHttpError(400, { errorsList }));
    } else {
      try {
        const { name, description, brand, price, category } = req.body;
        const data = await pool.query(
          "INSERT INTO products(name,description,brand,price, category) VALUES($1,$2,$3,$4,$5) RETURNING *;",
          [ name, description, brand, price, category]
        );
    
        res.send(data.rows[0]);
      } catch (error) {
        res.status(400).send(error.message);
      }

    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// Post Product Image

productsRouter.post(
  "/:id/upload",
  multer().single("image"),
  async (req, res, next) => {
    try {
      if (req.file) {

        
        console.log(req.file);
        console.log("This is the id: ", req.params.id);
        const newFileName = req.params.id + req.file.originalname;
        await saveImages(newFileName, req.file.buffer);
        const products =  await getProducts();
        const index = await products.findIndex(
          (prod) => prod._id === req.params.id
        );
        let fileLinkDeclaration = "";
        if (index !== -1) {
          const productPreEdit = products[index];
          const editedProduct = {
            ...products[index],
            cover: `http://localhost:3001/images/${newFileName}`,
          };

          products[index] = editedProduct;

          await writeProductsToFile(products);
          console.log("this is the product pre edit", productPreEdit);
          console.log("this is the product post-edit", editedProduct);
          console.log("These are the products", products);
          console.log("Here is the index", index);

          fileLinkDeclaration = "file uploaded and connection made to product";
          res.status(200).send(fileLinkDeclaration);
        } else {
          res.status(404).send("not found");
        }
      } else {
        next(createHttpError(400));
      }
    } catch (error) {
      next(error);
    }
  }
);


productsRouter.get("/", async (req, res, next) => {
  try {
    const data = await pool.query("SELECT * FROM products ORDER BY id ASC;");
    //gets all the products and orders them numerically by ID 
    res.send(data.rows);
    //sends all data (each row together)
  } catch (error) {
    res.send(500).send({ message: error.message });
  }
});

//*BELOW gets all the reviews for a specific product*/


productsRouter.get("/:id/reviews", async (req, res, next) =>{
    try{
      console.log(req)
      const reviews  = await getReviews()
      const findReviews = reviews.find(rev => rev.productId === req.params.id)
      if(findReviews){
        res.send({findReviews})
      } else {
        next(createHttpError(404, `Reviews with the id ${req.params.id} don't exist` ))
      }
    }catch(error){
      next(error)
    }

  })


productsRouter.get("/:id", async (req, res, next) => {
  try {
    const products = await getProducts();

    // const fileAsString = fileAsBuffer.toString();

    // const fileAsJSONArray = JSON.parse(fileAsString);

    const product = products.find(
      (product) => product._id === req.params.id
    );
    if (!product) {
      res
        .status(404)
        .send({ message: `Product with ${req.params.id} is not found!` });
    }

    res.status(200).send(product);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

productsRouter.put("/:id", async (req, res, next) => {
  try {

    const { name, description, brand, price, category } = req.body;
    const data = await pool.query(
    `UPDATE products SET name=$1,description=$2,brand=$3,price=$4,category=$5 WHERE id=${req.params.id} RETURNING *;`,
    [name, description, brand, price, category]
    

    );
    res.status(200).send(data.rows[0])
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});


// const parseFile = multer()
// productsRouter.put(
//   "/:id/avatar",
//   parseFile.single("avatar"),
//   uploadFile,
//   async (req, res, next) => {
//     try {
//       const products =  await getProducts();

//     //   const fileAsString = fileAsBuffer.toString();

//     //   let fileAsJSONArray = JSON.parse(fileAsString);

//       const productIndex = products.findIndex(
//         (product) => product.id === req.params.id
//       );
//       if (!productIndex === -1) {
//         res
//           .status(404)
//           .send({ message: `Product with ${req.params.id} is not found!` });
//       }
//       const previousProductData = products[productIndex];
//       const changedProduct = {
//         ...previousProductData,
//         ...req.body,
//         updatedAt: new Date(),
//         id: req.params.id,
//       };
//       products[productIndex] = changedProduct;

//       writeProductsToFile(products)
//       //fs.writeFileSync(productsFilePath, JSON.stringify(fileAsJSONArray));
//       res.status(200).send(changedProduct);
//     } catch (error) {
//       res.status(500).send({ message: error.message });
//     }
//   }
// );




productsRouter.delete("/:id", async (req, res, next) => {
  try {
    await pool.query(`DELETE FROM products WHERE id=${req.params.id}`);
    res.status(204).send(`content with the id: ${req.params.id}  has been deleted`);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

export default productsRouter;
