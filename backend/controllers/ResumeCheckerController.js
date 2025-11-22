
const db = require('../configs/dbConnection');
const imagekit = require("../configs/imagekit");
const uploadresume = async (req, res) => {
    
    try {
        const { student_id, } = req.body;
        console.log(student_id);
        const file = req.file;
        const studentQuery = 'SELECT * FROM students WHERE student_id = ?';
        const studentResult = await db.execute(studentQuery, [student_id]);
        const firstName = studentResult[0].first_name;

        const result = await imagekit.upload({
            file: file.buffer,
            fileName: `resume-id:${student_id}-${Date.now()}-${file.originalname}`,
            folder: "/Resumes"
        });
        const document_link = result.url;

        const values = [
            student_id,
            document_link
        ]
        console.log(values);
        const insertQuerry = 'call uploadResume(?,?)'
        await db.execute(insertQuerry, values);
        return res.status(201).json({ message: 'Resume uploaded successfully', document_link: document_link });

    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error during resume upload.'});
        console.log(error);
        

    }
    // Your existing code for handling resume uploadz

}

module.exports = {
    uploadresume
};