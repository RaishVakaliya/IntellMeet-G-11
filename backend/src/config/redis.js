import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("error", (err) => console.log("Redis Client Error", err));

const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log(`Redis Connected Successfully`);
  } catch (error) {
    console.error(`Redis connection failed: ${error.message}`);
  }
};

export { redisClient, connectRedis };
export default redisClient;
