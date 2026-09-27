const express = require('express');
const router = express.Router();
const { askCopilot, getConversations } = require('../controllers/copilotController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', askCopilot);
router.get('/conversations', getConversations);

module.exports = router;
