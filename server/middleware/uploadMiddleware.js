
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const name = Date.now() + path.extname(file.originalname);
    cb(null, name);
  }
});
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024
  },

  fileFilter: (req, file, cb) => {
    const type = file.mimetype;
    if (
      type === "application/pdf" ||
      type.startsWith("image/") ||
      type.startsWith("text/")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  }
});
module.exports = upload;
