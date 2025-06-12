const express = require('express');
const multer = require('multer');
const router = express.Router();

const { register, login, fetchAllUsers } = require('../controllers/authController');
const { uploadBulkUsers } = require('../controllers/authController');
const { authMiddleware, roleMiddleware } = require('../middleware/middleware');


// Upload files into memory as buffers
const upload = multer({ storage: multer.memoryStorage() });

router.post('/register', authMiddleware, roleMiddleware('admin'), register);
router.post('/login', login);
router.get('/users', authMiddleware, fetchAllUsers);
router.post('/upload-users', authMiddleware, roleMiddleware('admin'), upload.single('file'), uploadBulkUsers);

module.exports = router;
