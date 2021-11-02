import express from "express"
import uniqid from "uniqid"
import { validationResult } from "express-validator"
import createHttpError from "http-errors"
import { getReviews, writeReviewsToFile } from "../../lib/functions.js"
import { reviewValidation } from "./validation.js"


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
      const errorList = validationResult(req)

      if(!errorList.isEmpty()){
          next(createHttpError(400, { errorsList })) //fires the error response
      } else {

          console.log(req.body)

  
  const arrayOfReviews = await getReviews()

  res.send(arrayOfReviews)
  }
  }catch(error){next(error)}
})

reviewsRouter.post("/", reviewValidation , async (req, res, next) => {
    try{
        const errorList = validationResult(req)
        console.log(errorList)

        if(!errorList.isEmpty()){
            next(createHttpError(400, { errorList })) //fires the error response
        } else {

            console.log(req.body)
  
    const newReview = { ...req.body, _id: uniqid(),  createdAt: new Date}
    const reviews = await getReviews()
    reviews.push(newReview)
    await writeReviewsToFile(reviews)
 
    res.send({id: newReview._id})
    }
    }catch(error){next(error)}

  })

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













