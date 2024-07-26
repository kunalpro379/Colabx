import multer from "multer"; // Importing multer for file uploads

const storage=multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, "uploads/");
    },
    filename: function(req, file, cb){
        let fileExtension="";
        if (file.originalname.split(".").length > 1) {
            fileExtension = file.originalname.substring(
              file.originalname.lastIndexOf(".")
            );
          }
          const filenameWithoutExtension=file.originalname
          .toLowerCase()
          .split(" ")
          .join(" ")
          ?.split(".")[0];

          cb(
            null,
            filenameWithoutExtension+
            Date.now()+
            Math.ceil(Math.random()* 1e5)+
            fileExtension
          );
    },
});
export const upload = multer({
    storage, // Use the defined storage configuration
    limits: {
      fileSize: 1 * 1000 * 1000, // Set the file size limit to 1 MB
    },
  });