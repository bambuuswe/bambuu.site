// 1. Fade out the Boot Screen after simulation ends
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const bootScreen = document.getElementById('boot-screen');
        bootScreen.style.transition = 'opacity 0.4s ease';
        bootScreen.style.opacity = '0';
        setTimeout(() => {
            bootScreen.style.display = 'none';
        }, 400);
    }, 2000); // Gives loading bar time to finish
});

// 2. Real-Time Clock 
function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // Handle midnight (0 hours)
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    
    document.getElementById('clock').textContent = `${hours}:${minutesStr} ${ampm}`;
}
setInterval(updateClock, 1000);
updateClock();

// 3. Window Visibility Controls
function openWindow(id) {
    const win = document.getElementById(id);
    if (win) {
        win.style.display = 'block';
        document.getElementById('task-win-bio').style.display = 'block';
    }
}

function closeWindow(id) {
    const win = document.getElementById(id);
    if (win) {
        win.style.display = 'none';
        document.getElementById('task-win-bio').style.display = 'none';
    }
}

// 4. Secret Admin Backstage Portal (English Prompts)
document.getElementById('secret-trigger').addEventListener('click', () => {
    const password = prompt("AUTHENTICATION REQUIRED\nEnter administrator password:");
    
    if (password === "bambuu") {
        window.location.href = "private.html";
    } else if (password !== null && password !== "") {
        alert("ACCESS DENIED\nIncorrect system password.");
    }
});

// 5. Native Drag & Drop Logic for Desktop Windows
dragElement(document.getElementById("win-bio"));

function dragElement(elmnt) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    const header = document.getElementById(elmnt.id + "-header");
    
    if (header) {
        // Drag from the title-bar header if it exists
        header.onmousedown = dragMouseDown;
    } else {
        // Fallback to the whole element
        elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // Get mouse cursor position at start
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // Calculate new cursor position delta
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // Adjust element offset position
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        // Stop moving when mouse button is released
        document.onmouseup = null;
        document.onmousemove = null;
    }
}
