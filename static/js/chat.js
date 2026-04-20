async function sendMessage() {
    const input = document.getElementById('user-input');
    const chatBox = document.getElementById('chat-box');
    const sendButton = document.querySelector('#chat-input-area button');
    const message = input.value.trim();

    // 1. Validaciones iniciales
    if (!message || input.disabled) return;

    // 2. Bloquear interfaz para evitar spam y errores de cuota
    input.value = '';
    input.disabled = true;
    sendButton.disabled = true;

    // 3. Mostrar mensaje del usuario en la burbuja derecha
    chatBox.innerHTML += `<div class="msg user">${message}</div>`;

    // 4. Crear indicador de carga (Escribiendo...)
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'msg bot';
    loadingDiv.innerHTML = '<i>Escribiendo...</i>';
    chatBox.appendChild(loadingDiv);

    // Scroll automático al final
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mensaje: message })
        });

        if (!response.ok) throw new Error('Error en la respuesta del servidor');

        const data = await response.json();

        // 5. Reemplazar el "Escribiendo..." con la respuesta real de tu IA
        loadingDiv.innerText = data.respuesta;

    } catch (error) {
        console.error("Error técnico:", error);
        loadingDiv.innerHTML = `<span style="color: #ffcccc;">Lo siento, mi conexión cerebral en Shibuya tuvo un hipo. Intenta de nuevo en unos segundos.</span>`;
    } finally {
        // 6. Desbloquear interfaz
        input.disabled = false;
        sendButton.disabled = false;
        input.focus();
        chatBox.scrollTop = chatBox.scrollHeight;
    }
}

// 7. Event Listener para enviar con la tecla Enter
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('user-input');
    if (input) {
        input.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
});