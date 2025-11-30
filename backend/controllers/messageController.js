const db = require('../configs/dbConnection');

const newConversation = async (req, res) => {
    try{
        const { student_id, councilor_id } = req.body;
        console.log(student_id, councilor_id);
        const newConversationQuery = 'INSERT INTO conversation (student_id, councilor_id) VALUES (?, ?)';
        const [rows] = await db.execute(newConversationQuery, [student_id, councilor_id]);
        return res.status(200).json({ message: 'Conversation created successfully', conversation: rows });
    }catch(err){
        console.error('Error creating conversation:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

const sendMessage = async (req, res) => {
    try{
        const { conversation_id, sender_id,  sender_type, content } = req.body;
        const sendate = new Date().toISOString().slice(0, 19).replace('T', ' ');
        console.log(conversation_id, sender_id, sender_type, content);
        const sendMessageQuery = 'INSERT INTO messages (conversation_id, sender_id, sender_type, content, sent_at) VALUES (?, ?, ?, ?, ?)';
        const [rows] = await db.execute(sendMessageQuery, [conversation_id,sender_id, sender_type, content, sendate]);
        console.log("Message sent:", rows);
        return res.status(200).json({ message: 'Message sent successfully', message: rows });
    }catch(err){
        console.error('Error sending message:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }


}

const loadMessages = async (req, res) => {
    try{
        const { conversation_id } = req.params;
        const loadMessagesQuery = 'SELECT * FROM messages WHERE conversation_id = ?';
        const [rows] = await db.execute(loadMessagesQuery, [conversation_id]);
        return res.status(200).json({ message: 'Messages loaded successfully', messages: rows });
    }catch(err){
        console.error('Error loading messages:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

const locadCounselorConversations = async (req, res) => {
    try{
        const { student_id } = req.params;
        const loadConversationsQuery = 'SELECT * FROM conversation WHERE student_id = ?';  
        const [rows] = await db.execute(loadConversationsQuery, [student_id]);
        return res.status(200).json({ message: 'Conversations loaded successfully', conversations: rows });      
    }catch(err){
        console.error('Error loading conversations:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

const loadStudentConversations = async (req, res) => {
    try{
        const { counselor_id } = req.params; 
        const loadConversationsQuery = 'SELECT * FROM conversation WHERE councilor_id = ?';  
        const [rows] = await db.execute(loadConversationsQuery, [counselor_id]);
        return res.status(200).json({ message: 'Conversations loaded successfully', conversations: rows });      
    }catch(err){
        console.error('Error loading conversations:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = {
    newConversation,
    sendMessage,
    loadMessages,
    locadCounselorConversations,
    loadStudentConversations
}