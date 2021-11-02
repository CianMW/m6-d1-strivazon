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
      const reviews  = await getReviews()
      const findReviews = reviews.find(rev => rev.id === req.params.id)
      if(findReviews){
        res.send({findReviews})
      } else {
        next(createHttpError(404, `Reviews with the id ${req.params.id} don't exist` ))
      }
    }catch(error){
      next(error)
    }

  })

  reviewsRouter.put("/:id", async (req, res, next) =>{
    try{
      const reviews  = await getReviews()
      const index = reviews.findIndex(rev => rev._id === req.params.id)
      
      if(index !== -1){
        const editedReview = {...reviews[index], ...req.body , updatedAt : new Date}

      reviews[index] = editedReview

      await writeReviewsToFile(reviews)
      res.send(editedReview)
    }else{
      next(createHttpError(404, `Reviews with the id ${req.params.id} don't exist` ))
    }
      
    }catch(error){
      next(error)
    }

  })
// DELETE /authors/123 => delete the author with the given id
reviewsRouter.delete("/:id", async (req, res, next) =>{
  try{
    const reviews  = await getReviews()
    const foundReview = reviews.find(rev => rev._id === req.params.id)
    
    if(foundReview){
      const afterDeletion = reviews.filter(rev => rev.id !== req.params.id)
      await writeReviewsToFile(afterDeletion)

      res.status(200).send({response: "deletion complete!"})


  }else{
    next(createHttpError(404, `Reviews with the id ${req.params.id} doesn't exist` ))
  }
    
  }catch(error){
    next(error)
  }

})



export default reviewsRouter













