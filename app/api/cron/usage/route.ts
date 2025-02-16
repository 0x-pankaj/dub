import { log } from "#/lib/utils";
import { updateUsage } from "./utils";
import { NextResponse } from "next/server";
import { receiver } from "#/lib/cron";

/**
 * Cron to update the usage stats of each project.
 * Runs once every day at 7AM PST.
 **/

export async function POST(req: Request) {
  if (process.env.VERCEL === "1") {
    const body = await req.json();
    const isValid = await receiver.verify({
      signature: req.headers.get("Upstash-Signature") || "",
      body: JSON.stringify(body),
    });
    if (!isValid) {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  try {
    const results = await updateUsage();
    return NextResponse.json(results);
  } catch (error) {
    await log({
      message: "Usage cron failed. Error: " + error.message,
      type: "cron",
      mention: true,
    });
    return NextResponse.json({ error: error.message });
  }
}
