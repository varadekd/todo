const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Update with your MySQL username
    password: 'password', // Update with your MySQL password
    database: 'todo_db'
});

// Connect to MySQL and create database and table if not exist
db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        process.exit(1); // Exit the process with failure code
    }
    console.log('MySQL connected...');

    // Create database if not exists
    db.query('CREATE DATABASE IF NOT EXISTS todo_db', err => {
        if (err) {
            console.error('Error creating database:', err);
            process.exit(1); // Exit the process with failure code
        }
        console.log('Database created or already exists.');

        // Use the database
        db.query('USE todo_db', err => {
            if (err) {
                console.error('Error using database:', err);
                process.exit(1); // Exit the process with failure code
            }

            // Create table if not exists
            const createTableQuery = `
                CREATE TABLE IF NOT EXISTS todos (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    completed BOOLEAN DEFAULT false
                )
            `;
            db.query(createTableQuery, err => {
                if (err) {
                    console.error('Error creating table:', err);
                    process.exit(1); // Exit the process with failure code
                }
                console.log('Table created or already exists.');
            });
        });
    });
});

// Create new todo
app.post('/api/todos', (req, res) => {
    const { title } = req.body;
    const sql = 'INSERT INTO todos (title) VALUES (?)';
    db.query(sql, [title], (err, result) => {
        if (err) {
            console.error('Error inserting new todo:', err);
            return res.status(500).json({ error: 'Failed to create TODO' });
        }
        res.status(201).json({ id: result.insertId, title, completed: false });
    });
});

// List all todos
app.get('/api/todos', (req, res) => {
    const sql = 'SELECT * FROM todos';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching todos:', err);
            return res.status(500).json({ error: 'Failed to fetch TODOs' });
        }
        res.status(200).json(results);
    });
});

// Update todo
app.put('/api/todos/:id', (req, res) => {
    const { id } = req.params;
    const { title, completed } = req.body;
    const sql = 'UPDATE todos SET title = ?, completed = ? WHERE id = ?';
    db.query(sql, [title, completed, id], (err, result) => {
        if (err) {
            console.error('Error updating todo:', err);
            return res.status(500).json({ error: 'Failed to update TODO' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'TODO not found' });
        }
        res.status(200).json({ message: 'TODO updated successfully' });
    });
});

// Delete todo
app.delete('/api/todos/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM todos WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error deleting todo:', err);
            return res.status(500).json({ error: 'Failed to delete TODO' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'TODO not found' });
        }
        res.status(200).json({ message: 'TODO deleted successfully' });
    });
});

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'An unexpected error occurred' });
    process.exit(1); // Exit the process with failure code
});

// Uncaught exception and unhandled rejection handling
process.on('uncaughtException', err => {
    console.error('Uncaught Exception:', err);
    process.exit(1); // Exit the process with failure code
});

process.on('unhandledRejection', err => {
    console.error('Unhandled Rejection:', err);
    process.exit(1); // Exit the process with failure code
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
