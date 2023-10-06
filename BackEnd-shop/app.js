import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { v4 as uuidv4 } from "uuid";
import multer from "multer";
import { graphqlHTTP } from "express-graphql";
import auth from "./middleware/auth.js";
import fs from "fs";
import cors from "cors";
import fileHelper from "./util/file.js";

import graphqlSchema from "./graphql/schema.js";
import graphqlResolver from "./graphql/resolvers.js";

const MONGODB_URI =
  "mongodb+srv://NKHoang:tuilaemga@cluster0.afijb8i.mongodb.net/messages?retryWrites=true";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const fileStorege = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: function (req, file, cb) {
    cb(null, uuidv4());
  },
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const corsOptions = {
  origin: "http://localhost:3000",
};
const app = express();

app.use(cors(corsOptions))
// app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(
  multer({ storage: fileStorege, fileFilter: fileFilter }).single("image")
);
app.use("/images", express.static(path.join(__dirname, "images")));

//CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(auth);

app.put("/post-image", (req, res, next) => {
  if (!req.isAuth) {
    throw new Error("Not authenticated");
  }
  if (!req.file) {
    return res.status(200).json({ message: "No file provided!" });
  }
  if (req.body.oldPath) {
    fileHelper.clearImage(req.body.oldPath);
  }
  return res
    .status(201)
    .json({ message: "File stored.", filePath: req.file.path });
});


app.use(
  "/graphql",
  graphqlHTTP({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true,
    //error handler
    customFormatErrorFn(err) {
      //Technical error (syntax,...)
      if (!err.originalError) {
        return err;
      }
      //Error defined by dev
      const data = err.originalError.data;
      const message = err.message || 'An error occurred.';
      const code = err.originalError.code || 500;
      console.log(message)
      return { message: message, status: code, data: data };
    },
  })
);

//Handling error
app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});
mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    app.listen(8080);
  })
  .catch((err) => console.log(err));
