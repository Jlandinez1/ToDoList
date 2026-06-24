const diasNombres = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];


let todasLasTareas = []; // guarda todas para filtrar sin pedir a la BD de nuevo
let filtroActivo = 'todos';

async function cargarTareas() {
    const resultado = await window.electronAPI.obtenerTareas();
    if (!resultado.ok) { console.error('Error:', resultado.error); return; }

    const hoy = new Date().getDay();
    todasLasTareas = resultado.tareas.filter(tarea => {
        if (tarea.repeatDays.length === 0) return true;
        return tarea.repeatDays.includes(hoy);
    });

    renderizarTareas();
}

function renderizarTareas() {
    const contenedor = document.getElementById('lista-tareas');
    contenedor.innerHTML = '';

    const tareasFiltradas = filtroActivo === 'todos'
        ? todasLasTareas
        : todasLasTareas.filter(t => t.categoria === filtroActivo);

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

        const checkbox = item.querySelector('.tarea-check');
        checkbox.checked = tarea.completada;

        checkbox.addEventListener('change', async () => {
            const resultado = await window.electronAPI.actualizarTarea({
                id: tarea._id,
                completada: checkbox.checked
            });
            if (resultado.ok) {
                item.querySelector('.tarea-nombre').classList.toggle('completada', checkbox.checked);
                tarea.completada = checkbox.checked; // actualiza el estado local
            } else {
                console.error('Error:', resultado.error);
                checkbox.checked = !checkbox.checked;
            }
        });

        contenedor.appendChild(item);
    });
}

// Lógica de los botones de filtro
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.btn-filtro').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.btn-filtro').forEach(b => b.classList.remove('activo'));
            btn.classList.add('activo');
            filtroActivo = btn.dataset.filtro;
            renderizarTareas();
        });
    });

    window.electronAPI.onMongoListo(() => cargarTareas());
    window.electronAPI.onNuevoDia(() => {
        const audio = new Audio('zAssets/mp3/GoodMorning.mp3');
        audio.play();
        cargarTareas();
    });

    cargarTareas();
});


// Hacer que la app sea draggable
// Crear boton de cerrar app y minimizar
// Crear fondo para el body de la app