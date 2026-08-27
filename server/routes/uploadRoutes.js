import express from 'express';
import multer from 'multer';
import { 
  handleUploadAvatar, 
  handleUploadChatFile, 
  handleUploadBackground 
} from '../controllers/uploadController.js';

const router = express.Router();

// Configure Multer for in-memory storage (up to 10MB)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

router.post('/avatar', upload.single('image'), handleUploadAvatar);
router.post('/chat-file', upload.single('file'), handleUploadChatFile);
router.post('/background', upload.single('image'), handleUploadBackground);

export default router;
