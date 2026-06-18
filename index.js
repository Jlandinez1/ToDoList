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
                <span class="tarea-nombre">${tarea.task}</span>
            </label>
        `;

        contenedor.appendChild(item);
    });
}

document.addEventListener('DOMContentLoaded', cargarTareas);

cargarTareas();