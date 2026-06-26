// Boot-logik
window.onload = () => {
    setTimeout(() => {
        document.getElementById('boot-screen').style.display = 'none';
        document.getElementById('desktop').style.display = 'block';
    }, 2000); // Boot-tid 2 sekunder
};

// Login-logik
const loginWindow = document.getElementById('login-window');
function openLogin() { loginWindow.style.display = 'block'; }
function closeLogin() { loginWindow.style.display = 'none'; }

document.getElementById('start-btn').addEventListener('click', openLogin);
document.getElementById('system-trigger').addEventListener('click', openLogin);

async function checkPassword() {
    const input = document.getElementById('pass-input').value;
    const response = await fetch('../password.txt'); 
    const correctPassword = await response.text();

    if (input.trim() === correctPassword.trim()) {
        window.location.href = "private/index.html";
    } else {
        alert("ACCESS DENIED");
    }
}