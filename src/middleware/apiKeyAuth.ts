import { Request, Response, NextFunction } from "express"
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
    url: process.env.REDIS_URL || "",
    token: process.env.REDIS_SECRET || "",
});
  
const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(50, "1 h"),
});

const apiKeyAuth = async (req: Request,res: Response,next: NextFunction) => {
    const ip = req.ip ?? "127.0.0.1";
    try {
        const { success } = await ratelimit.limit(ip);
        if(!success){
            return res.status(400).json({ error: 'Too many requests' })
        }
        next()
    } catch (err) {
        return next(err)
    }
}

export default apiKeyAuth