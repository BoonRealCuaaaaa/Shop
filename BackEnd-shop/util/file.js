import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const clearImage = (filePath) => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, (err) => console.log(err));
};

export default { clearImage };
