import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "/public/temp");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

export const upload = multer({ storage: storage });

// used to store unique file names
// const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
