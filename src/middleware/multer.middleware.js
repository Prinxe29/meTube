import multer from 'multer';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/temp')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)          
    //keeping file.originalname isn't a good practice as the client can send any file name and it can overwrite existing files. A better approach is to generate a unique name for each file.
  }
});

const upload = multer({ 
    storage,
})
export { upload };