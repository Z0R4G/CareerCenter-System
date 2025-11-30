const express = require('express');
const router = express.Router();

const {
    newConversation,
    sendMessage,
    loadMessages,
    locadCounselorConversations,
    loadStudentConversations
} = require('../controllers/messageController');


// Define the route
router.post('/conversation', newConversation);
router.post('/message', sendMessage);
router.get('/messages/:conversation_id', loadMessages);
router.get('/counselor/conversation/:student_id', locadCounselorConversations);
router.get('/student/conversation/:counselor_id', loadStudentConversations);

module.exports = router;