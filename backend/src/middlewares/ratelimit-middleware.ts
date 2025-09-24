import rateLimit from "express-rate-limit";

export const apiLimiter = rateLimit({
  //windowMs: 15 * 60 * 1000, // 15 minutes
  windowMs: 10 * 1000,  //10 sec
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    status: 429,
    message: "Too many requests, please try again later.",
  },
  headers: true,
});

// stricter limiter for auth routes
export const authLimiter = rateLimit({
  //windowMs: 60 * 60 * 1000, // 1 hour
  windowMs: 10 * 1000,  //10 sec
  max: 20, // Limit each IP to 5 requests per windowMs
  message: {
    status: 429,
    message: "Too many requests, please try again later.",
  },
  headers: true,
});
