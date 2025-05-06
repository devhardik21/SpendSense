// multer.middleware.js 
import multer from "multer";
import path from "path" ;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.resolve("uploads"));
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
})
const fileFilter = (req,file,cb)=>{
        const allowed = ['application/pdf','text/csv'] ;
        if (allowed.includes(file.mimetype)) {
            cb(null,true);
        }
        else{
            cb(new Error("Only PDF/CSV files are allowed")) ;
        }
    }
const upload = multer({storage,fileFilter}) ; 

export {upload} ;