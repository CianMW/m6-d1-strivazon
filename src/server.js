import express from "express";
import cors from "cors";
import dotenv from 'dotenv/config';
import listEndpoints from "express-list-endpoints";
import productsRouter from "./services/products/index.js";
import reviewsRouter from "./services/reviews/index.js";
import { join } from "path";
import createDefaultTables from "./db/createTables.js";
//install the package "pg" for working with postgres
const server = express();

server.use(cors("*"));
server.use(express.json());

const publicFolderPath = join(process.cwd(), "public");


server.use(express.static(publicFolderPath));
server.use("/products", productsRouter);
server.use("/reviews", reviewsRouter);

const port = 3001;

console.table(listEndpoints(server));
console.log(process.env.PGPASSWORD)

server.listen(port, async () => {
    console.log("server on port:", port);
    await createDefaultTables()
  });