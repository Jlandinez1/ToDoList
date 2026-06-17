const selectedDays = new Set();

// Lógica de los botones de días
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

// Submit del formulario
document.getElementById('AddTask').addEventListener('submit', async (e) => {
    e.preventDefault();  // evita que recargue la página

    const body = {
        task: document.getElementById('task').value,
        repeatDays: [...selectedDays].sort()
    };

    try {
        const res = await fetch('/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (res.ok) {
            window.location.href = 'index.html';  // redirige al guardar
        } else {
            const error = await res.json();
            console.error('Error:', error);
        }

    } catch (error) {
        console.error('Error de red:', error);
    }
});