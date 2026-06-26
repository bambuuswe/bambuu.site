function openLogin() {
    document.getElementById('login-modal').style.display = 'block';
}

async function checkPassword() {
    const input = document.getElementById('pass-input').value;
    
    // Vi hämtar lösenordet
    const response = await fetch('password.txt');
    const password = await response.text();

    if (input.trim() === password.trim()) {
        window.location.href = "private/index.html";
    } else {
        alert("Wrong password!");
    }
}