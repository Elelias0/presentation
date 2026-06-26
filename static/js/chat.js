function appendMessage(text, type) {
    const chatBox = document.getElementById('chat-box');
    const div = document.createElement('div');
    div.className = `msg ${type}`;
    div.textContent = text;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
    return div;
}

function showInterviewForm() {
    // Evita mostrar el formulario muchas veces
    if (document.querySelector('.interview-form')) {
        return;
    }

    const chatBox = document.querySelector('.chat-messages'); 
    // Cambia ".chat-messages" por el nombre real del contenedor de tus mensajes

    const formDiv = document.createElement('div');
    formDiv.className = 'bot-message interview-form';

    formDiv.innerHTML = `
        <input id="interview-name" placeholder="Name" />
        <input id="interview-company" placeholder="Company" />
        <input id="interview-email" placeholder="Email" />
        <input id="interview-position" placeholder="Position" />
        <textarea id="interview-message" placeholder="Message / possible interview time"></textarea>
        <button type="button" onclick="sendInterviewRequest()">Send interview request</button>
    `;

    chatBox.appendChild(formDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendInterviewRequest() {
    const name = document.getElementById('interview-name').value.trim();
    const company = document.getElementById('interview-company').value.trim();
    const email = document.getElementById('interview-email').value.trim();
    const position = document.getElementById('interview-position').value.trim();
    const message = document.getElementById('interview-message').value.trim();

    try {
        const response = await fetch('/interview-request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name,
                company,
                email,
                position,
                message
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Could not send interview request.');
        }

        alert(data.message || 'Interview request sent successfully.');

    } catch (error) {
        console.error('Interview request error:', error);
        alert('Could not send the interview request. Please try again.');
    }
}

function toggleChat(forceOpen = null) {
    const widget = document.getElementById('chat-widget');
    const shouldOpen = forceOpen !== null
        ? forceOpen
        : widget.classList.contains('minimized');

    if (shouldOpen) {
        widget.classList.remove('minimized');
        localStorage.setItem('chatMinimized', 'false');
        setTimeout(() => {
            const input = document.getElementById('user-input');
            if (input) input.focus();
        }, 100);
    } else {
        widget.classList.add('minimized');
        localStorage.setItem('chatMinimized', 'true');
    }
}

async function sendMessage() {
    const input = document.getElementById('user-input');
    const sendButton = document.getElementById('send-btn');
    const message = input.value.trim();

    if (!message || input.disabled) return;

    input.value = '';
    input.disabled = true;
    sendButton.disabled = true;

    appendMessage(message, 'user');
    const loadingDiv = appendMessage('Writting...', 'bot');

    try {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mensaje: message })
        });

        if (!response.ok) {
            throw new Error('Error in the server response');
        }

        const data = await response.json();
        loadingDiv.textContent = data.respuesta || 'No se recibió respuesta.';
        if (data.action === "show_interview_form") {
            showInterviewForm();
        }
    } catch (error) {
        console.error('Error técnico:', error);
        loadingDiv.textContent = 'Sorry, I was disconnected. Try again in 10 seconds.';
    } finally {
        input.disabled = false;
        sendButton.disabled = false;
        input.focus();

        const chatBox = document.getElementById('chat-box');
        chatBox.scrollTop = chatBox.scrollHeight;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('user-input');
    const sendButton = document.getElementById('send-btn');
    const chatToggle = document.getElementById('chat-toggle');
    const chatHeader = document.getElementById('chat-header');
    const chatMinimize = document.getElementById('chat-minimize');

    // Restore miniminized status
    const savedState = localStorage.getItem('chatMinimized');
    if (savedState === 'false') {
        document.getElementById('chat-widget').classList.remove('minimized');
    }

    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
    }

    if (input) {
        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendMessage();
            }
        });
    }

    if (chatToggle) {
        chatToggle.addEventListener('click', () => toggleChat(true));
    }

    if (chatMinimize) {
        chatMinimize.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleChat(false);
        });
    }

    if (chatHeader) {
        chatHeader.addEventListener('click', () => toggleChat(false));
    }
});

const teaser = document.getElementById('chat-teaser');
const widget = document.getElementById('chat-widget');

// Show teaser
if (!localStorage.getItem('chatOpened')) {
    setTimeout(() => {
        if (widget.classList.contains('minimized')) {
            teaser.classList.add('show');
        }
    }, 3000);
}
// Hide teaser
function hideTeaser() {
    if (teaser) {
        teaser.classList.remove('show');
    }
}

// Modify toggle to hide it
const originalToggleChat = toggleChat;
toggleChat = function(forceOpen = null) {
    originalToggleChat(forceOpen);

    if (!widget.classList.contains('minimized')) {
        localStorage.setItem('chatOpened', 'true');
        hideTeaser();
    }
};

// Also hide if someone clicks the button
document.getElementById('chat-toggle').addEventListener('click', hideTeaser);
