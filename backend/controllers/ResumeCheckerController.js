
const db = require('../configs/dbConnection');
const imagekit = require("../configs/imagekit");
const uploadresume = async (req, res) => {
    
    try {
        const{ student_id: paramID} = req.params;
        student_id = paramID;
        console.log(student_id);
        if(!student_id){
            return res.status(400).json({ error: 'Student ID is required' });
        }
        const file = req.file;
        const result = await imagekit.upload({
            file: file.buffer,
            fileName: `resume-id:${student_id}-${Date.now()}-${file.originalname}`,
            folder: "/Resumes"
        });
        const document_link = result.url;
        const filename = file.originalname;
        const values = [
            student_id,
            document_link,
            filename
        ]
        console.log(values);
        const insertQuerry = 'call uploadResume(?,?,?)'
        await db.execute(insertQuerry, values);
        return res.status(201).json({ message: 'Resume uploaded successfully', document_link: document_link });

    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error during resume upload.'});
        console.log(error);
        

    }


}

const getmyresume = async (req, res) => {
    try {
        const{ student_id: paramID} = req.params;
        student_id = paramID;
        console.log(student_id);
        const getmyresumeQuery = 'SELECT * FROM resume WHERE student_id = ? order by created_at DESC';
        const [rows] = await db.execute(getmyresumeQuery, [student_id]);
        return res.status(200).json({ message: 'Resume fetched successfully', resume: rows });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error during resume upload.'});
    }
}

module.exports = {
    uploadresume,
    getmyresume
};