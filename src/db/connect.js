
//install "pg" to work with postgres
import dotenv from 'dotenv/config';
 import pg from "pg";

 /**
  
    - pool keeps idle connections
    - idle : connection is not in use, authenticated waiting for to be used ,
    - Handshake is not needed every time = faster load times
    - only done once

N.B. => ref : https://node-postgres.com/features/pooling
  */
 
 const pool = new pg.Pool();
 
 export default pool;