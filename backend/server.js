const express = require('express');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const db = require('./dbConnection');

const app = express();
app.use(express.json()); // Middleware to parse JSON bodies

// Serve static files (HTML, JS, CSS) from the project root directory
const public= path.resolve(__dirname, './public');
app.use(express.static(public));

// Routes mapping to your HTML files
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
    const { email, password } = req.body;
    const [rows] = await db.execute(
        'SELECT * FROM students WHERE email = ? AND password = ? LIMIT 1', 
        [email, password]);
            
    if (rows.length === 0) {
        return res.status(401).json({ error: 'Invalid email or password' });
    }else{
    delete rows[0].password; 
    return res.status(200).json({ message: 'Login successful',email });
    }

});

// Get all users (for testing purposes)
app.get('/app/users', (_req, res) => {
  res.json(users.map(u => ({
    id: u.id,
    email: u.email,
    id_number: u.id_number,
    year: u.year,
    program: u.program,
    gender: u.gender
  })));
});



// 404 handler for unmatched routes
app.use((_req, res) => {
  res.status(404).send('Not Found');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
