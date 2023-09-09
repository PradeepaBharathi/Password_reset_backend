import jwt from "jsonwebtoken"
import { getUserById } from "../userController.js";

export async function isAuthenticated (req, res, next) {
    try {
        const token = req.headers["x-auth-token"]

    if (!token){
        return res.status(400).json({message:"Invalid Authorization"})
    }
    console.log(token)
    const decode = jwt.verify(token, process.env.SECRET_KEY);
    const rootUser = await getUserById({ id: decode.id })
    console.log(rootUser)
    if (!rootUser) {
        throw new error("user not found");
    }
    req.token = token
    req.rootUser = rootUser
        req.userId = rootUser._id
        
    next()
    } catch (error) {
        res.status(401).json({status:401,message:"unauthorized user"})
    }
}

