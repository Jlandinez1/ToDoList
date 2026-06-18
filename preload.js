const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    guardarTarea: (datos) => ipcRenderer.invoke('guardar-tarea', datos),
    obtenerTareas: () => ipcRenderer.invoke('obtener-tareas')
});
