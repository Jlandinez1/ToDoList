//Conexión electron y mongoose
const { app, BrowserWindow, ipcMain } = require('electron');
const mongoose = require('mongoose');
require('dotenv').config();


//Schema de mongoose para la BD
const taskSchema = new mongoose.Schema({
    task: { type: String, required: true },
    repeatDays: { type: [Number], default: [] },
    completada: { type: Boolean, default: false },
    ultimoReset: { type: Date, default: null },
    categoria: { type: String, enum:["casa","universidad","negocio", "otro"], default: "otro"}
});
//Creacion del modelo
const Task = mongoose.model('Task', taskSchema);

//Funcion para actualizar el checklist en la BD
ipcMain.handle('actualizar-tarea', async (event, { id, completada }) => {
    try {
        await Task.findByIdAndUpdate(id, { completada });
        return { ok: true };
    } catch (error) {
        return { ok: false, error: error.message };
    }
});

// Funcion para guardar las tareas del formulario a la BD
ipcMain.handle('guardar-tarea', async (event, datos) => {
    //console.log('5. Datos recibidos en main:', datos); LOGS POR ERRORES :P
    try {
        const newTask = new Task({
            task: datos.task,
            repeatDays: datos.repeatDays,
            categoria: datos.categoria
        });
        await newTask.save();
        //console.log('6. Guardado exitoso'); LOGS POR ERRORES :P
        return { ok: true, tarea: newTask.toObject() };  // ← agregar .toObject()
    } catch (error) {
        //console.log('7. Error al guardar:', error.message); LOGS POR ERRORES :P
        return { ok: false, error: error.message };
    }
});

async function verificarReset() {
    const ahora = new Date();
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // medianoche de hoy

    // Busca alguna tarea que no haya sido reseteada hoy
    const tareaDesactualizada = await Task.findOne({
        $or: [
            { ultimoReset: { $lt: hoy } }  // último reset fue antes de hoy
        ]
    });

    if (tareaDesactualizada) {
        console.log('Reseteando tareas del día anterior...');
        await Task.updateMany({}, { 
            completada: false,
            ultimoReset: ahora
        });
        return true; // hubo reset
    }

    return false; // no hubo reset
}

//Funcion del temporizador
function iniciarTimerMedianoche() {
  const ahora = new Date();
  const medianoche = new Date();
  medianoche.setHours(0, 0, 0, 0);

  const msHastaMedianoche = medianoche - ahora;

   if (msHastaMedianoche <= 0) {
        setTimeout(() => iniciarTimerMedianoche(), 60000);
        return;
    }

  console.log(`Reset en ${Math.round(msHastaMedianoche / 1000 / 60)} minutos`);

  setTimeout(async () => {
    console.log('Goood morniiiiiIIIIIING');

    await Task.updateMany({}, { 
      completada: false,
      ultimoReset: new Date()
    });
    BrowserWindow.getAllWindows().forEach(win => {
      win.webContents.send('nuevo-dia');
    });
      // Espera 1 minuto antes de reprogramar para evitar el bucle
    setTimeout(() => {
        iniciarTimerMedianoche();
    }, 60000);
  }, msHastaMedianoche);
}
// Conexion de MongoDB con MongoOSE
mongoose.connect(process.env.MONGODB_URI, {
  dbName: 'ToDoList', 
  serverSelectionTimeoutMS: 30000,  // espera hasta 30 segundos
  socketTimeoutMS: 45000,
  bufferCommands: false             // falla rápido si no hay conexión
})
  .then(async() => {
    //console.log('MongoDB conectado') LOGS POR ERRORES :P
    const huboReset = await verificarReset();
    iniciarTimerMedianoche();
    BrowserWindow.getAllWindows().forEach(win => {
      win.webContents.send('mongo-listo');
      if (huboReset) win.webContents.send('nuevo-dia');
    });
  })
  .catch(err => console.error('Error MongoDB:', err));

//mongoose.connection.on('connected', () => console.log('Estado: connected')); LOGS POR ERRORES :P
//mongoose.connection.on('error', err => console.log('Estado: error -', err.message)); LOGS POR ERRORES :P
//mongoose.connection.on('disconnected', () => console.log('Estado: disconnected')); LOGS POR ERRORES :P

//Función para que las tareas salgan en el index.html
ipcMain.handle('obtener-tareas', async () => {
    try {
        const tareas = await Task.find().lean();
        // Convierte _id a string antes de enviar al renderer
        const tareasLimpias = tareas.map(t => ({
            ...t,
            _id: t._id.toString()
        }));
        return { ok: true, tareas: tareasLimpias };
    } catch (error) {
        return { ok: false, error: error.message };
    }
});

//Función para que al finalizar el dia se reseteen las tareas
ipcMain.handle('resetear-tareas', async () => {
    try {
        await Task.updateMany({}, { completada: false });
        return { ok: true };
    } catch (error) {
        return { ok: false, error: error.message };
    }
});

ipcMain.handle('cerrar-app', () => {
    app.quit();
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
      preload: 'C:/Users/Usuario/Documents/GitHub/ToDoList/preload.js' // <-- ruta a preload.js (El puente)
    }
  })

  win.loadFile('index.html')
}

app.whenReady().then(() => {
  createWindow()
})