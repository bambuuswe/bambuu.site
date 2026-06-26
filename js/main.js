const loginWindow = document.getElementById('login-window');

function openLogin() { loginWindow.style.display = 'block'; }
function closeLogin() { loginWindow.style.display = 'none'; }

document.getElementById('start-btn').addEventListener('click', openLogin);
document.getElementById('system-trigger').addEventListener('click', openLogin);

async function checkPassword() {
    const input = document.getElementById('pass-input').value;
    
    try {
        const response = await fetch('../password.txt'); // Hämtar från roten
        const correctPassword = await response.text();

        if (input.trim() === correctPassword.trim()) {
            window.location.href = "private/index.html";
        } else {
            alert("ACCESS DENIED");
        }
    } catch (e) {
        alert("Error loading password file.");
    }
}