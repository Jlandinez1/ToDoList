const diasNombres = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

async function cargarTareas() {
    const resultado = await window.electronAPI.obtenerTareas();

    if (!resultado.ok) {
        console.error('Error al cargar tareas:', resultado.error);
        return;
    }

    const hoy = new Date().getDay(); // 0=Dom, 1=Lun ... 6=Sáb
    console.log('Día de hoy:', diasNombres[hoy]);

    const contenedor = document.getElementById('lista-tareas');
    contenedor.innerHTML = '';

    // Filtra: muestra la tarea si no tiene días (tarea normal)
    // o si el día de hoy está en sus repeatDays
    const tareasFiltradas = resultado.tareas.filter(tarea => {
        if (tarea.repeatDays.length === 0) return true; // sin repetición, siempre se muestra
        return tarea.repeatDays.includes(hoy);          // solo si toca hoy
    });

    if (tareasFiltradas.length === 0) {
        contenedor.innerHTML = '<p>No hay tareas para hoy.</p>';
        return;
    }

    tareasFiltradas.forEach(tarea => {
        const item = document.createElement('div');
        item.classList.add('tarea-item');

        item.innerHTML = `
            <label class="tarea-label">
                <input type="checkbox" class="tarea-check">
                <span class="tarea-nombre ${tarea.completada ? 'completada' : ''}">${tarea.task}</span>
            </label>
        `;

        // Escucha el cambio del checkbox
        const checkbox = item.querySelector('.tarea-check');
        checkbox.checked = tarea.completada;
        checkbox.addEventListener('change', async () => {
            console.log('1. Checkbox cambiado:', checkbox.checked);
            console.log('2. ID de la tarea:', tarea._id);
            const resultado = await window.electronAPI.actualizarTarea({
                id: tarea._id,
                completada: checkbox.checked
            });
        if (resultado.ok) {
                // Tacha o quita el tachado visualmente
                item.querySelector('.tarea-nombre').classList.toggle('completada', checkbox.checked);
            } else {
                console.error('Error al actualizar:', resultado.error);
                checkbox.checked = !checkbox.checked; // revierte si hubo error
            }
        });

        contenedor.appendChild(item);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Escucha cuando Mongo esté listo
    window.electronAPI.onMongoListo(() => {
        cargarTareas();
    });

    // Por si Mongo ya estaba conectado antes de que cargara la página
    window.electronAPI.onNuevoDia(() => {
    console.log('Nuevo día — recargando tareas...');
    
    const audio = new Audio('zAssets/mp3/GoodMorning.mp3');
    audio.play();
    
    cargarTareas();
});

    cargarTareas();
});


// Hacer que la app sea draggable
// Crear boton de cerrar app y minimizar
// Crear fondo para el body de la app