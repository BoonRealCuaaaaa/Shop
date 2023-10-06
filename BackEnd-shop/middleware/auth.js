import jwt from "jsonwebtoken";

const isAuth = (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    req.isAuth = false;
    return next();
  }
  const token = authHeader.split(" ")[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, "somesupersecretsecret");
  } catch {
    (err) => {
      req.isAuth = false;
      return next();
    };
  }
  //Un verify
  if (!decodedToken) {
    req.isAuth = false;
    return next();
  }

  //Valid token
  req.userId = decodedToken.userId;
  req.isAuth = true;
  console.log("Success");
  next();
};

export default isAuth;
