import { Request, Response, NextFunction } from "express";
import { db } from "../db";
import * as cheerio from "cheerio";
import { YHF_URL } from "../../config";

const summary = async (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.query.apiKey as string;
  const query = req.query.query as string;

  if (!apiKey) {
    return next(new Error("API Key not provided"));
  }

  if (!query) {
    return next(new Error("Query parameter is required"));
  }

  let validApiKey;

  try {
    validApiKey = await db.apiKey.findFirst({
      where: {
        key: apiKey,
        enabled: true,
      },
    });

    if (!validApiKey) {
      return next(new Error(`Invalid API`));
    }
  } catch (err) {
    return next(err);
  }

  const start = new Date();

  const URL = `${YHF_URL}/quote/${query}`;
  /*@ts-ignore*/
  const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

  try {
    const response = await fetch(URL);
    const body = await response.text();
    const $ = cheerio.load(body);
    /**@ts-ignore */
    let obj = {
      companyName: $(
        "#YDC-Lead-Stack-Composite > div:nth-child(6) > div > div > div > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > h1"
      )
        .text()
        .trim(),
      currency: $(
        "#YDC-Lead-Stack-Composite > div:nth-child(6) > div > div > div > div:nth-child(2) > div:nth-child(1) > div:nth-child(2) > span"
      )
        .text()
        .trim()
        .split(" ")
        .slice(-1)?.[0],
      currentPrice: {
        price: Number(
          $(
            "#YDC-Lead-Stack-Composite > div:nth-child(6) > div > div > div > div:nth-child(3) > div:nth-child(1) > div > fin-streamer:nth-child(1)"
          )
            .text()
            .trim() ?? -1
        ),
        priceDifference: $(
          "#YDC-Lead-Stack-Composite > div:nth-child(6) > div > div > div > div:nth-child(3) > div:nth-child(1) > div > fin-streamer:nth-child(2) > span"
        )
          .text()
          .trim(),
        priceDifferencePercentage: $(
          "#YDC-Lead-Stack-Composite > div:nth-child(6) > div > div > div > div:nth-child(3) > div:nth-child(1) > div > fin-streamer:nth-child(3) > span"
        )
          .text()
          .trim(),
      },
    };
    const tables = $("#quote-summary > div");
    for (let i = 0; i < tables.length; i++) {
      let trs = $(tables[i]).find("table > tbody > tr");
      for (let j = 0; j < trs.length; j++) {
        let text = $(trs[j]).find("td:nth-child(1) > span").text().trim();
        let val = $(trs[j]).find("td:nth-child(2)").text().trim();
        /* @ts-ignore */
        obj[text] = val;
      }
    }
    const duration = new Date().getTime() - start.getTime();
    // Persist request
    await db.apiRequest.create({
      data: {
        duration,
        method: req.method as string,
        path: `/api${req.url}` as string,
        status: 200,
        apiKeyId: validApiKey.id,
        usedApiKey: validApiKey.key,
      },
    });

    return res.status(200).json(obj)
  } catch (err) {
    return next(err);
  }
};

export default summary;
