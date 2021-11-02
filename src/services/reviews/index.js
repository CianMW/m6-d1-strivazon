import express from "express"
import uniqid from "uniqid"
import { validationResult } from "express-validator"
import createHttpError from "http-errors"
import { getReviews, writeReviewsToFile } from "../../lib/functions.js"
import { reviewValidation } from "./validation.js"
import pool from "../../db/connect.js"


const reviewsRouter = express.Router()

//Need to create a function for the reviews


/*REVIEWS LOOK LIKE THIS:
     {
        "_id": "123455", //SERVER GENERATED
        "comment": "A good book but definitely I don't like many parts of the plot", //REQUIRED
        "rate": 3, //REQUIRED, max 5
        "productId": "5d318e1a8541744830bef139", //REQUIRED
        "createdAt": "2019-08-01T12:46:45.895Z" // SERVER GENERATED
    }
    
    */



reviewsRouter.get("/", async (req, res, next) => {
    try{
        console.log(req.body)
      const data = await pool.query("SELECT * FROM reviews ORDER BY id ASC;");
      res.send(data.rows);
  }
   catch(error) {
    next(error)
  }
})

reviewsRouter.post("/", async (req, res, next) => {

        console.log(req.body)
        const {comment, rate, product_id} = req.body;
        const data = await pool.query(
          "INSERT INTO reviews(comment, rate, product_id) VALUES($1, $2, $3) RETURNING *;",
            [comment, rate, product_id]
            );
        
            res.send(data.rows[0]);
    }


  )

  //GET /authors/123 => returns a single author
  reviewsRouter.get("/:id", async (req, res, next) =>{
    try{
      console.log(req)
      const data = await pool.query(`SELECT * FROM reviews WHERE id=${req.params.id}`);
      if (data.rows.length === 0) {
        res.status(400).send("User not found");
      } else {
        res.send(data.rows[0]);
      }
    }catch(error){
      next(error)
    }

  })

  reviewsRouter.put("/:id", async (req, res, next) =>{
    try{
      const { comment, product_id, rate} = req.body;
      const data = await pool.query(
      `UPDATE reviews SET comment=$1,product_id=$2,rate=$3 WHERE id=${req.params.id} RETURNING *;`,
      [ comment, product_id, rate]
      );
      res.status(200).send(data.rows[0])
      
    }catch(error){
      next(error)
    }

  })
// DELETE /authors/123 => delete the author with the given id
reviewsRouter.delete("/:id", async (req, res, next) =>{
  try {
    await pool.query(`DELETE FROM REVIEWS WHERE id=${req.params.id}`);
    res.status(204).send(`content with the id: ${req.params.id} has been deleted`);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});


export default reviewsRouter













