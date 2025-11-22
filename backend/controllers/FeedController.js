// controllers/uploadController.js
const imagekit = require("../configs/imagekit");
const db = require('../dbConnection');
const uploadPost = async (req, res) => {
    try {
        // 1. Extract ALL text data from req.body
        const { 
        title, 
        description, 
        posted_by, 
        profile_link 
    } = req.body;

        const date_posted = new Date().toISOString().slice(0, 19).replace('T', ' ');

        let post_photo_link = ""; 

        // 3. Handle the Post Photo Upload
        const file = req.file;

        // Note: For a post, the photo is usually required, so we put the upload logic here.
        const result = await imagekit.upload({
            file: file.buffer, 
            fileName: `${posted_by}-${Date.now()}-${file.originalname}`, // Ensures a unique name
            folder: "/Post_Photos" // Organize your posts here
        });
        post_photo_link = result.url;

        // 4. Save EVERYTHING to your Database (Pseudocode)
        const values = [
            title, 
            description, 
            date_posted,
            posted_by, 
            profile_link, 
            post_photo_link // 👈 The URL goes here!
        ];
        console.log(values);
        const insertQuerry ='call postFeed(?,?,?,?,?,?)'
        await db.execute(insertQuerry, values);

        // 5. Send Success Response
        return res.status(201).json({
            success: true,
            message: "Post created successfully and photo uploaded.",
            data: {
                title,
                posted_by,
                post_photo_link
            }
        });

    } catch (error) {
        console.error("Post Creation Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error during post creation."
        });
    }
};

// controllers/uploadController.js
// ... (other imports and the createFeedPost function)
// const db = require("../config/mysqlConnection"); // Your MySQL connection

const getPosts = async (req, res) => {
    try {
        // 1. Define the SQL query
        // CRITICAL: We select the post_photo_link column along with all other data!
        const getPostsql = `
            SELECT * 
            FROM feed
            ORDER BY date_posted DESC
        `;
        
        // 2. Execute the query using your MySQL driver
        const [posts] = await db.execute(getPostsql);

        // 3. Send the entire array of post objects back to the frontend
        return res.status(200).json({
            success: true,
            count: posts.length,
            data: posts
        });

    } catch (error) {
        console.error("Fetch Posts Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve posts."
        });
    }
};

module.exports = { uploadPost, getPosts };