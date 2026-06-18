const { app, BrowserWindow, ipcMain } = require('electron');
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    task: { type: String, required: true },
    repeatDays: { type: [Number], default: [] }
});
const Task = mongoose.model('Task', taskSchema);

// 1. Registra el handler SIEMPRE, apenas arranca la app
ipcMain.handle('guardar-tarea', async (event, datos) => {
    console.log('5. Datos recibidos en main:', datos);
    try {
        const newTask = new Task({
            task: datos.task,
            repeatDays: datos.repeatDays
        });
        await newTask.save();
        console.log('6. Guardado exitoso');
        return { ok: true, tarea: newTask.toObject() };  // ← agrega .toObject()
    } catch (error) {
        console.log('7. Error al guardar:', error.message);
        return { ok: false, error: error.message };
    }
});

// 2. Conecta Mongo por separado — Mongoose hace buffer automático
mongoose.connect('mongodb://juan:123@ac-6bgr4cv-shard-00-00.8w7hjpx.mongodb.net:27017,ac-6bgr4cv-shard-00-01.8w7hjpx.mongodb.net:27017,ac-6bgr4cv-shard-00-02.8w7hjpx.mongodb.net:27017/?ssl=true&replicaSet=atlas-zqn0tk-shard-0&authSource=admin&appName=Juan', {
  dbName: 'ToDoList', 
  serverSelectionTimeoutMS: 30000,  // espera hasta 30 segundos
  socketTimeoutMS: 45000,
  bufferCommands: false             // falla rápido si no hay conexión
})
  .then(() => console.log('MongoDB conectado'))
  .catch(err => console.error('Error MongoDB:', err));

//mongoose.connection.on('connected', () => console.log('Estado: connected'));
//mongoose.connection.on('error', err => console.log('Estado: error -', err.message));
//mongoose.connection.on('disconnected', () => console.log('Estado: disconnected'));

ipcMain.handle('obtener-tareas', async () => {
    try {
        const tareas = await Task.find().lean(); // .lean() ya devuelve objetos planos
        return { ok: true, tareas };
    } catch (error) {
        return { ok: false, error: error.message };
    }
});

//Creacion de la ventana con electron.js
const createWindow = () => {
  const win = new BrowserWindow({
    width: 350,
    height: 450,
    frame: false,
    resizable: false,
    x: 1230,
    y: 390,
    webPreferences: {
      preload: 'C:/Users/Usuario/Documents/GitHub/ToDoList/preload.js' // <-- ruta a preload.js
    }
  })

  win.loadFile('index.html')
}

app.whenReady().then(() => {
  createWindow()
})

