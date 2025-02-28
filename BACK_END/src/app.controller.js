import userController from "./modules/user/user.controller.js";
import authController from "./modules/auth/auth.controller.js";
import companyController from "./modules/company/company.controller.js";
import jobController from "./modules/jobs/job.controller.js";
import chatController from "./modules/socket/chat/chat.controller.js";
import { connectDB } from "./DB/connection.js";
import { globalErrorHandling } from "./utils/response/error/error.handling.js";
import cors from "cors";

//🔥==========================Social Login==========================================🔥
import passport from "passport";
import session from "express-session";
import { setupPassportStrategies } from "./utils/passportSocialLogin/passportConfig.js";
//🔥==========================Graphql import==========================================🔥
import path from "node:path";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import chalk from "chalk";
//🔥==========================Graphql import==========================================🔥
import { createHandler } from "graphql-http/lib/use/express";
import expressPlayground from "graphql-playground-middleware-express";
import { schema } from "./modules/modules.schema.js";
//===========================delete all expired otb==============================================

//🔥==================================================================🔥
const limiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  limit: 500, // Limit each IP to 5 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-8", // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  message: { err: "many request on the server" },
  statusCode: 429,
  handler: (req, res, next) => {
    return next(new Error("many request on the server", { cause: 429 }));
  },
  // store: ... , // Redis, Memcached, etc. See below.
});

const bootstrap = (app, express) => {

  app.use(
    session({
      secret: "your_secret_key", // Replace with a strong secret key
      resave: false, // Avoid re-saving session if it hasn't changed
      saveUninitialized: false, // Avoid saving empty sessions
      cookie: { secure: false }, // Set `true` in production with HTTPS
      cookie: {
        //  secure: true,
        //  httpOnly: true, sameSite: "strict"
         },
    })
  );

  app.use(morgan("dev")); // Logs requests to the console in a readable format
  app.use(helmet()); //يمنع المتصفح من تخمين نوع الملف MIME and  يمنع Clickjacking (منع تضمين موقعك في iframe)
  // Apply the rate limiting middleware to all requests.
  app.use(limiter);
  //allows you to enable CORS (Cross-Origin Resource Sharing).
  let whitelist = process.env.ORIGIN ? process.env.ORIGIN.split(",") : [];
  // console.log(whitelist);
  let corsOptions = {
    origin: function (origin, callback) {
     
      if (!origin || whitelist.includes(origin) || origin.startsWith("http://127.0.0.1") || origin.startsWith("http://localhost")||/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin))  {
       
        callback(null, true);
      } else {
        
        callback(new Error("Not allowed by CORS"));
      }
    },
    // origin: "*", //to allow postman
    methods: ["GET", "POST", "PUT", "DELETE", "HEAD", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept-Language"],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  };
  app.use(cors(corsOptions));
  // 👇 حل مشكلة Preflight request
app.options("*", cors(corsOptions));
   

  //if backend is local and frontend are online server or العكس
  //we implement our private core for this case

  // app.use(async (req, res, next) => {
   // const origin = req.header("origin");
  //   if (!whitelist.includes(origin)) {
  //     return next(new Error("not allowed by cors",{cause:403}))
  //   }
  //   await res.header("Access-Control-Allow-Origin", origin);
  //   await res.header("Access-Control-Allow-Headers", "*");
  //   await res.header("Access-Control-Allow-Private-Network", true);
  //   // await res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, HEAD");
  //   await res.header("Access-Control-Allow-Methods", "*");
  //    next();
  // })
  //🔥==========================Initialize Passport Social login==========================================🔥
  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());
  //🔥=========================Social login==========================================🔥
  //Social login
  setupPassportStrategies(); // for social logins
  //🔥==========================DB CONNECTION==========================================🔥
  // DB CONNECTION
  connectDB();
  //🔥==========================Social Login==========================================🔥
  //_____________middle ware___________________
  app.use(express.json()); //convert buffer json data

  //__________static file enable________but use cloudinary in site
  app.use("/uploads", express.static(path.resolve("./src/uploads")));
  //_________________________________
  //___________ROUTS__________________
  app.get("/", (req, res, next) =>
    res.status(200).json({ message: "Hello in my Search Job App [MERN]" })
  );

  //_____________sup express routing____________
  //____________graphQl__________________________
  app.get("/playground", expressPlayground.default({ endpoint: "/graphql" }));
  app.use("/graphql", createHandler({ schema }));
  //🔥==========================ROUTS=========================================🔥
  //🔥==========================ROUTS========================================🔥
  app.use("/auth", authController);
  app.use("/users", userController);
  app.use("/company", companyController);
  app.use("/job", jobController);
  app.use("/chat", chatController);
  //🔥==========================ROUTS==========================================🔥
  app.all("*", (req, res, next) => {
    return res
      .status(404)
      .json({ message: "page not found .... In-valid routing" });
  });
  //🔥==========================global error handling=======================================🔥
  //____________global error handling middleware throw next_________________
  app.use(globalErrorHandling);
  //🔥==========================Social Login==========================================🔥
};

export default bootstrap;
