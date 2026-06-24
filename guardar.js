const selectedDays = new Set();

document.querySelectorAll('.day-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const day = parseInt(btn.dataset.day);
        if (selectedDays.has(day)) {
            selectedDays.delete(day);
            btn.classList.remove('active');
        } else {
            selectedDays.add(day);
            btn.classList.add('active');
        }
    });
});

document.getElementById('AddTask').addEventListener('submit', async (e) => {
    e.preventDefault();
    //console.log('1. Submit ejecutado');

    // Verifica que electronAPI existe
    //console.log('2. electronAPI:', window.electronAPI);

    const datos = {
        task: document.getElementById('task').value,
        repeatDays: [...selectedDays].sort(),
        categoria: document.getElementById('categoria').value
    };
    //console.log('3. Datos a enviar:', datos);

    const resultado = await window.electronAPI.guardarTarea(datos);
    //console.log('4. Resultado:', resultado);

    if (resultado.ok) {
        window.location.href = 'index.html';
    } else {
        console.error('Error:', resultado.error);
    }
});