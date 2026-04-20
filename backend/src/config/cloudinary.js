import multer from "multer";
 
 // MOCK MODE - Memory storage for demo (dotenv not needed)
 const storage = multer.memoryStorage();
 
 export const upload = multer({ 
   storage,
   limits: { fileSize: 5 * 1024 * 1024 } // 5MB
 });
