// Hanterar den dolda inloggningen längst ner på sidan
(function () {
    const loginBtn = document.getElementById('loginBtn');
    const overlay = document.getElementById('modalOverlay');
    const closeBtn = document.getElementById('modalClose');
    const form = document.getElementById('loginForm');
    const input = document.getElementById('pinInput');
    const errorMsg = document.getElementById('modalError');

    function openModal() {
        overlay.classList.add('active');
        errorMsg.classList.remove('show');
        input.value = '';
        setTimeout(() => input.focus(), 100);
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    loginBtn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('active')) closeModal();
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const inputVal = input.value;
        errorMsg.classList.remove('show');

        try {
            // Hämtar lösenordet från password.txt
            const response = await fetch('password.txt');
            if (!response.ok) {
                throw new Error("Could not load password.txt");
            }
            const realPass = await response.text();

            // Jämför inmatningen med filen
            if (inputVal.trim() === realPass.trim()) {
                // Skickar dig till private-sidan om det är rätt
                window.location.href = 'private.html';
            } else {
                errorMsg.classList.add('show');
                input.value = '';
                input.focus();
                const modal = document.querySelector('.modal');
                modal.classList.remove('shake');
                void modal.offsetWidth; // restart animation
                modal.classList.add('shake');
            }
        } catch (error) {
            console.error(error);
            errorMsg.textContent = 'Systemfel: kunde inte verifiera.';
            errorMsg.classList.add('show');
        }
    });
})();