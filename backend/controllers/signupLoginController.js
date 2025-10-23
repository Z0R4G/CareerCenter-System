const db = require('../dbConnection');

const bcrypt = require('bcrypt');
const LoginUser = async (req, res) => {
    
    const { email, password } = req.body;
    try {
        console.log('Login attempt for:', email); // Debug log
        const [rows] = await db.execute(
            'SELECT * FROM students WHERE email = ?  LIMIT 1', 
            [email]);

            const user = rows[0];
        if (rows.length === 0) {
            console.log('No user found with email:', email)
            return res.status(401).json({ error: 'Invalid email or password' })};
         const verifyPassword = await bcrypt.compare(password, user.password);
         if(!verifyPassword){
            return req.status(401).json({ error: 'Invalid email or password' });
         }else{
            delete user.password
            return res.status(200).json({ message: 'Login successful', user: user });

         }
        
        
        

        

    } catch (err) {
        console.error('Login Error:', err);
        return res.status(500).json({ error: 'Internal server error' });
        // Iser data, redirect to login
    }
}

const RegisterUser = async (req, res) => {
    const { email, first_name, last_name, password, id_number, year, program, gender } = req.body;
    try{
        
            if (!email || !first_name|| !last_name || !password || !id_number || !year || !program || !gender) {
                return res.status(400).json({ error: 'All fields are required' });
            }
    
            // Check if email or ID number already exists
            const [rows] = await db.execute(
                'SELECT * FROM students WHERE email = ? or ID_number = ? LIMIT 1', 
                [email, id_number]);
            if (rows.length > 0) {
                return res.status(409).json({ error: 'Email or ID number already registered' });
            }

            const hashedPassword = await bcrypt.hash(password, parseInt(process.env.SALTS));
    
            // Insert new user into the database
            await db.execute(
                'INSERT INTO students (email, first_name, last_name, password, ID_number, year, program, gender) VALUES (?, ?, ?, ?, ?, ?, ?,?)',
                [email,first_name,last_name,hashedPassword,id_number,year,program,gender] ) 
            return res.status(201).json({ message: 'Registration successful' });      
        }catch(err){
            console.error('Registration Error:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
}


module.exports = {
    LoginUser,
    RegisterUser
};