const { contextBridge, ipcRenderer } = require('electron');

//Se exponen las funciones (Es como el puente entre electron.js, node.js y MongoDB)
contextBridge.exposeInMainWorld('electronAPI', {
    guardarTarea: (datos) => ipcRenderer.invoke('guardar-tarea', datos),
    obtenerTareas: () => ipcRenderer.invoke('obtener-tareas'),
    actualizarTarea: (datos) => ipcRenderer.invoke('actualizar-tarea', datos),
    onMongoListo: (callback) => ipcRenderer.on('mongo-listo', callback),
    resetearTareas: () => ipcRenderer.invoke('resetear-tareas'),
    onNuevoDia: (callback) => ipcRenderer.on('nuevo-dia', callback),
    cerrarApp: () => ipcRenderer.invoke('cerrar-app')
});
