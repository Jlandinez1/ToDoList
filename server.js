const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());
app.use(express.static('.')); // sirve tu HTML/CSS/JS

// Conexión a MongoDB
mongoose.connect("mongodb+srv://juan:123@juan.8w7hjpx.mongodb.net/ToDoList");

// Schema y Model
const taskSchema = new mongoose.Schema({
    task: { type: String, required: true },
    repeatDays: { type: [Number], default: [] }
});
const Task = mongoose.model('Task', taskSchema);

// Ruta que recibe el fetch de guardar.js
app.post('/tasks', async (req, res) => {
    try {
        const newTask = new Task({
            task: req.body.task,
            repeatDays: req.body.repeatDays
        });
        await newTask.save();
        res.status(201).json(newTask);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.listen(3000, () => console.log('Servidor en http://localhost:3000'));