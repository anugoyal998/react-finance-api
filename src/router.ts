import express from "express"
const router = express.Router()


import summary from "./controller/summary"
import apiKeyAuth from "./middleware/apiKeyAuth"

router.get("/summary",summary)

export default router