import express from "express";
import dotenv from "dotenv"
import cors from 'cors'
import { user_router } from "./userRouter.js";




dotenv.config()
const PORT = process.env.PORT;

const app = express();


app.use(cors())
app.use(express.json())
app.use("/user",user_router)


app.get('/', (req, res) => {
    res.send("first")
})

app.listen(PORT, () => {
    console.log(`Server connceted to PORT ${PORT}`)
})


