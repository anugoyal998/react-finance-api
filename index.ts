import express, { Application, Request, Response, NextFunction } from "express"
import router from "./src/router"
import cors from "cors"
import errorHandler from "./src/middleware/errorHandler"

const app: Application = express()
const PORT = process.env.PORT || 3000

app.get("/",(req: Request,res: Response, next: NextFunction) => {
    res.send("<h1>Welcome!</h1>")
})
app.use(cors())
app.use(errorHandler)
app.use("/api",router)

app.listen(PORT,() => {
    console.log(`listening on port ${PORT}`)
})