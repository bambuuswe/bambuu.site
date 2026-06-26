/* =========================================
   1. BOOT SEQUENCE LOGIC
   ========================================= */
window.addEventListener('DOMContentLoaded', () => {
    const bootScreen = document.getElementById('boot-screen');
    const bootStatus = document.getElementById('boot-status');
    
    // Uppdatera texten strax innan laddningen är klar
    setTimeout(() => {
        if(bootStatus) bootStatus.innerText = "Welcome to Bambuu.OS... Launching GUI";
    }, 1500);

    // Tona ut och göm boot-skärmen
    setTimeout(() => {
        if(bootScreen) {
            bootScreen.style.transition = 'opacity 0.4s ease';
            bootScreen.style.opacity = '0';
            setTimeout(() => {
                bootScreen.style.display = 'none';
            }, 400);
        }
    }, 2200);
});

/* =========================================
   2. REAL-TIME SYSTEM CLOCK
   ========================================= */
function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // Hantera midnatt (0 blir 12)
    minutes = minutes < 10 ? '0' + minutes : minutes;
    
    const clockEl = document.getElementById('clock');
    if (clockEl) clockEl.textContent = `${hours}:${minutes} ${ampm}`;
}
setInterval(updateClock, 1000);
updateClock();

/* =========================================
   3. START MENU LOGIC
   ========================================= */
const startBtn = document.getElementById('start-btn');
const startMenu = document.getElementById('start-menu');

if (startBtn && startMenu) {
    // Öppna/stäng Startmenyn vid klick på Start-knappen
    startBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Hindrar klicket från att bubbla upp
        startMenu.classList.toggle('hidden');
        startBtn.classList.toggle('active');
    });

    // Stäng Startmenyn om användaren klickar någon annanstans på skrivbordet
    document.addEventListener('click', (e) => {
        if (!startMenu.classList.contains('hidden') && 
            !startBtn.contains(e.target) && 
            !startMenu.contains(e.target)) {
            
            startMenu.classList.add('hidden');
            startBtn.classList.remove('active');
        }
    });
}

/* =========================================
   4. WINDOW MANAGEMENT (Open, Close, Focus)
   ========================================= */
window.toggleWindow = function(id) {
    const win = document.getElementById(id);
    const taskItem = document.getElementById('task-' + id);
    
    if (win) {
        // Om fönstret är dolt, visa det
        if (win.style.display === 'none' || win.style.display === '') {
            win.style.display = 'block';
            if(taskItem) taskItem.style.display = 'flex';
            
            // Lägg fönstret överst
            document.querySelectorAll('.window').forEach(w => w.style.zIndex = 10);
            win.style.zIndex = 100;
        } 
        // Om fönstret är synligt, göm det
        else {
            win.style.display = 'none';
            if(taskItem) taskItem.style.display = 'none';
        }
    }
    
    // Göm startmenyn automatiskt om ett fönster klickas fram från menyn
    if (startMenu && !startMenu.classList.contains('hidden')) {
        startMenu.classList.add('hidden');
        startBtn.classList.remove('active');
    }
};

/* =========================================
   5. SECRET SYSTEM LOCK (Admin)
   ========================================= */
const secretTrigger = document.getElementById('secret-trigger');
if (secretTrigger) {
    secretTrigger.addEventListener('click', () => {
        const password = prompt("SYSTEM LOCKED\nEnter administrator password:");
        if (password === "bambuu") {
            // Skicka till backstage (se till att skapa private.html sen)
            window.location.href = "private.html";
        } else if (password !== null && password !== "") {
            alert("ACCESS DENIED\nInvalid credentials.");
        }
    });
}

/* =========================================
   6. UNIVERSAL DRAG & DROP (Mouse & Touch)
   ========================================= */
const makeDraggable = (elmnt) => {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    const header = document.getElementById(elmnt.id + "-header");
    
    if (header) {
        header.onmousedown = dragStart;
        header.ontouchstart = dragStart;
    } else {
        elmnt.onmousedown = dragStart;
        elmnt.ontouchstart = dragStart;
    }

    function dragStart(e) {
        e = e || window.event;
        
        // Lägg det aktiva fönstret överst
        document.querySelectorAll('.window').forEach(w => w.style.zIndex = 10);
        elmnt.style.zIndex = 100;
        
        // Ta bort CSS-centreringen så fönstret inte "hoppar" när man drar det
        elmnt.style.transform = "none";
        
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        pos3 = clientX;
        pos4 = clientY;
        
        document.onmouseup = dragEnd;
        document.ontouchend = dragEnd;
        
        document.onmousemove = drag;
        document.ontouchmove = drag;
    }

    function drag(e) {
        e = e || window.event;
        // Förhindra default scrolling på touch
        if (e.touches) e.preventDefault();
        
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        pos1 = pos3 - clientX;
        pos2 = pos4 - clientY;
        pos3 = clientX;
        pos4 = clientY;
        
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function dragEnd() {
        // Släpp taget
        document.onmouseup = null;
        document.ontouchend = null;
        document.onmousemove = null;
        document.ontouchmove = null;
    }
};

// Applicera drag-and-drop på alla element med klassen "draggable"
document.querySelectorAll('.draggable').forEach(makeDraggable);