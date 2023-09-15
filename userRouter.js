import express from "express"
import bcrypt from "bcryptjs"
import nodemailer from "nodemailer";

import jwt from "jsonwebtoken"
import { addUser,generateToken,getUser, getUserByEmail, getUserById,  getUserByIdandToken,  getuserTokenbyId, resetPassword } from "./userController.js";
import { isAuthenticated } from "./Authentication/user_auth.js";
const router = express.Router()

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "resetpass634@gmail.com",
    pass: process.env.PASSWORD
  }
})


router.get("/getUser", async (req,res) => {
  try{
    console.log("get a user"); 
  
    const user = await getUser(req.body);
    
    if(!user){
      return res.status(404).json({message:"User does not exist"})
    }
    res.status(200).json({data:user})

  }
  catch(err){
    console.log(err);
      res.status(500).json({ message: "Internal server error" });
  }
})


router.get("/getUserById", isAuthenticated, async (req, res) => {
try {
  const ValiduserOne = await getUserById(req.userId)
  res.status(201).json({status:201,ValiduserOne})
} catch (error) {
  res.status(401).json({status:401,error})
}
})


router.post("/signup", async (req, res) => {

  const { fname, email, password, cpassword } = req.body;
  const salt = await bcrypt.genSalt(10)
  console.log(salt)
  const hashedPassword = await bcrypt.hash(req.body.password, salt)
   const hashedCPassword = await bcrypt.hash(req.body.cpassword, salt)
  console.log(hashedPassword)
   console.log(hashedCPassword)
  if (!fname || !email || !password || !cpassword) {
    res.status(400).json({error:"Fill all the details"})
  }
  try {

    const preuser = await getUserByEmail(email)
   
    if (preuser) {
      return res.status(400).json({error:"Email already exists"})
    }
   if (password !== cpassword) {
      return   res.status(400).json({error:"Password doesn't match"})
    }
    else {
      const result = await addUser({fname,email,password:hashedPassword,cpassword:hashedCPassword})
     if (result.acknowledged) {
       return res.status(201).json({status:201,fname,email,password:hashedPassword,cpassword:hashedCPassword });
     }
     else {
        return res.status(404).json({error:"Error while uploading user information"})
     }
      
    }
     
  } catch (error) {
    console.log(error)
    return res.status(500).json({ error: "Internal server error" });
  }
  });



//login to check credentials
router.post("/login", async (req, res) => {
  const {  email, password,  } = req.body;
  if (!email || !password ) {
    res.status(400).json({error:"Fill all the details"})
  }

  try {
    const Validuser = await getUserByEmail(email)
    if (!Validuser) {
      return res.status(404).json({error:"Invalid user or password"})
    }
    if (Validuser) {
      const isMatch = await bcrypt.compare(password, Validuser.password)
      if (!isMatch) {
        return res.status(400).json({ error: "Invalid Credentials" })
      
      }
      else {
        const token = generateToken(Validuser._id);
        console.log(token)
        res.send({ status:201,data: Validuser, token: token });
        // console.log(Validuser)
        

      }
    }


  }
  catch (error) {
    console.log(error)
  }
});

router.get("/getUser", async (req,res) => {
  try{
 
  
    const { fname, email, password, cpassword } = req.body;
    
    if(!fname || !email ||!password || !cpassword) {
      return res.status(404).json({message:"User does not exist"})
    }
    res.status(200).json({ fname, email, password, cpassword })

  }
  catch(err){
    console.log(err);
      res.status(500).json({ message: "Internal server error" });
  }
})

// send email link for reset password
router.post("/sendpasswordlink", async (req, res) => {
  console.log(req.body)

  const { email } = req.body
  if (!email) {
    res.status(401).json({ status: 401, message: "Enter your email" })
  }
  try {
    const userFind = await getUserByEmail(email)
    // token generate for reset password

    const token = generateToken(userFind._id)
    console.log(token)
    const setToken = await getuserTokenbyId(userFind._id,token)
   
    if (setToken) {
      const mailOptions = {
        from: "resetpass634@gmail.com",
        to: email,
        subject: "Link for password reset",
        text:`This Link Valid for 2minutes https://password-7woa.onrender.com/forgot-password/${userFind._id}/${userFind.verifytoken}`
      }
      console.log(mailOptions)
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log("error", error)
          res.status(401).json({status:401,message:"email not sent"})
        }
        else {
          console.log("Email sent", info.response)
          res.status(201).json({status:201,message:"email sent successfully"})
        }
      })
    }
  } catch (error) {
    console.log("error", error)
          res.status(401).json({status:401,message:"Invalid user"})
  }
})


/// verify user for forgot password time
router.get("/forgot-password/:id/:token", async (req, res) => {
  const { id, token } = req.params;
  try {
    console.log(`ID: ${id}, Token: ${token}`);
    
    const user = await getUserById(id)
    if (!user) {
      return res.status(404).json({message:"user not exists"})
    }
    try {
      const decode = jwt.verify(token, process.env.SECRET_KEY)
      if (decode._id) {
        res.status(200).json({decode:decode})
      }
    }
    catch (err) {
      console.log(err);
          res.status(500).json({ message: "Token error", error:err });
    }
  } catch (error) {
    res.status(401).json({status:401,error})
  }
})

////////change password
router.post("/resetPassword/:id", async (req, res) => {
  try {
    const { id } = req.params;
  const { password } = req.body;

    const user = await getUserById(id)
    console.log(user)
  const salt = await bcrypt.genSalt(10)
  if (!user) {
    return res.status(404).json({message:"user doesn't exists"})
  }
    const hashPassword = await bcrypt.hash(password, salt)
      console.log(hashPassword)
  const result = await resetPassword(id,{password: hashPassword})
  console.log("result",result)
  if (!result) {
    return res.status(400).json({message:"error while updating"})
  }
  return res.status(200).send({ status:200,result:result, user:user}); 
  } catch (error) {
    console.log(error);
     res.status(500).json({ message: "Internal server error" });
  }
})
export const user_router = router;