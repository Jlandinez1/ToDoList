const diasNombres = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

async function cargarTareas() {

    console.log('1. Cargando tareas...');
    console.log('2. electronAPI:', window.electronAPI);

    const resultado = await window.electronAPI.obtenerTareas();
    console.log('3. Resultado:', resultado);

    if (!resultado.ok) {
        console.error('Error al cargar tareas:', resultado.error);
        return;
    }

    const contenedor = document.getElementById('lista-tareas');
    console.log('4. Contenedor:', contenedor);
    contenedor.innerHTML = '';

    if (resultado.tareas.length === 0) {
        contenedor.innerHTML = '<p>No hay tareas todavía.</p>';
        return;
    }

    resultado.tareas.forEach(tarea => {
        const item = document.createElement('div');
        item.classList.add('tarea-item');

        // Días en los que se repite
        const diasHtml = tarea.repeatDays.length > 0
            ? `<span class="repeat-days">${tarea.repeatDays.map(d => diasNombres[d]).join(', ')}</span>`
            : '';

        item.innerHTML = `
            <label class="tarea-label">
                <input type="checkbox" class="tarea-check">
                <span class="tarea-nombre">${tarea.task}</span>
            </label>
            ${diasHtml}
        `;

        contenedor.appendChild(item);
    });
}

cargarTareas();