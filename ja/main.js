// 1. Klockan i realtid
function updateClock() {
    const now = new Date();
    // Formaterar tiden till svensk standard (ex. 15:30)
    const timeString = now.toLocaleTimeString('sv-SE', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    document.getElementById('clock').textContent = timeString;
}

// Uppdatera klockan varje sekund
setInterval(updateClock, 1000);
updateClock(); // Kör direkt vid laddning

// 2. Fönsterhantering (Öppna & Stäng)
function openWindow(windowId) {
    const win = document.getElementById(windowId);
    if (win) {
        win.style.display = 'block';
    }
}

function closeWindow(windowId) {
    const win = document.getElementById(windowId);
    if (win) {
        win.style.display = 'none';
    }
}

// 3. Det hemliga Backstage-låset
const secretTrigger = document.getElementById('secret-trigger');

secretTrigger.addEventListener('click', () => {
    // Klassisk Windows-prompt
    const password = prompt("AUTENTISERING KRÄVS\nAnge administratörslösenord:");
    
    if (password === "bambuu") {
        // Om rätt lösenord, skicka till den privata sidan
        // Du behöver skapa en fil som heter 'private.html' för att detta ska fungera
        window.location.href = "private.html";
    } else if (password !== null && password !== "") {
        // Om fel lösenord (och användaren inte klickade Avbryt)
        alert("ÅTKOMST NEKAD\nFelaktigt lösenord.");
    }
});
