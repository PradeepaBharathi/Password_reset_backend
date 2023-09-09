import {client} from "./db.js";
import dotenv from "dotenv"
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

dotenv.config()
export function addUser(data) {
    if(data){  return client
    .db("userData")
    .collection("users")
        .insertOne(data)
    }
    else {
        throw new Error("user data is null")
    }
  
}

export function getUser(data){
    return client
    .db("userData")
    .collection("users")
    .findOne(data)
} 

export function getUserByEmail(email){
    return client
    .db("userData")
    .collection("users")
    .findOne({email:email})
} 

export function getUserById(id){
    return client
    .db("userData")
    .collection("users")
    .findOne({_id: new ObjectId(id)})
} 

export function generateToken(id,secret){
    return jwt.sign(
        {id},
        process.env.SECRET_KEY,
        {expiresIn:"30d"}
    )
}

export function getuserTokenbyId(id, token) {
    return client
    .db("userData")
    .collection("users")
    .findOneAndUpdate({_id: new ObjectId(id)},  { $set: { verifytoken: token } },{new:true})
}

export function getUserByIdandToken(id){
    return client
    .db("userData")
    .collection("users")
    .findOne({_id: new ObjectId(id)})
} 

export function resetPassword(id, data){
    return client
    .db("userData")
    .collection("users")
    .findOneAndUpdate({_id: new ObjectId(id)}, {$set:data})
}