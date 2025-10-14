const express = require('express');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const db = require('./dbConnection');

//middlewares
const app = express();
app.use(express.json()); 

// Serve static files
const public= path.resolve(__dirname, './public');
app.use(express.static(public));

// Routes map
app.get(['/', '/index', '/index.html'], (_req, res) => {
  res.sendFile(path.join(public, 'index.html'));
});

app.get(['/register', '/register.html'], (_req, res) => {
  res.sendFile(path.join(public, 'register.html'));
});

app.get(['/dashboard-s', '/dashboard_s.html'], (_req, res) => {
  res.sendFile(path.join(public, 'dashboard_s.html'));
});

// app Routes
// Register endpoint
app.post('/app/register', async (req, res) => {
    try{
        const { email, password, id_number, year, program, gender } = req.body;
       
        if (!email || !password || !id_number || !year || !program || !gender) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check if email or ID number already exists
        const [rows] = await db.execute(
            'SELECT * FROM students WHERE email = ? or ID_number = ? LIMIT 1', 
            [email, id_number]);
        if (rows.length > 0) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        // Insert new user into the database
        await db.execute(
            'INSERT INTO students (email, password, ID_number, year, program, gender) VALUES (?, ?, ?, ?, ?, ?)',
            [email,password,id_number,year,program,gender] ) 
        return res.status(201).json({ message: 'Registration successful' });      
    }catch(err){
        console.error('Registration Error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Login endpoint
app.post('/app/login', async(req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt for:', email); // Debug log
        
        const [rows] = await db.execute(
            'SELECT * FROM students WHERE email = ? AND password = ? LIMIT 1', 
            [email, password]);
        
        console.log('Query result:', rows); // Debug log
                
        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        } else {
            const user = rows[0];
            delete user.password; 
            console.log('Sending user data:', user); // Debug log
            return res.status(200).json({ 
                message: 'Login successful',
                user: user
            });
        }
    } catch (err) {
        console.error('Login Error:', err);
        return res.status(500).json({ error: 'Internal server error' });
        // Iser data, redirect to login
    }
});


// 404 handler for unmatched routes
app.use((_req, res) => {
  res.status(404).send('Not Found');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
