// Handles the hidden login at the bottom of the page
(function () {
    // SHA-256 hash of the PIN (so the plaintext isn't in a downloadable file)
    // To change the PIN, hash the new code, e.g. with:
    //   echo -n "newcode" | sha256sum
    const PIN_HASH = '72d1b5da6eeaf1789df86487da50ad5e9dadb5ffaecb56b6de592aa286c9c1b8';

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

    input.addEventListener('input', () => errorMsg.classList.remove('show'));

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const inputVal = input.value;
        errorMsg.classList.remove('show');

        try {
            // Hash the input and compare it with PIN_HASH (SHA-256)
            const data = new TextEncoder().encode(inputVal.trim());
            const digest = await crypto.subtle.digest('SHA-256', data);
            const hash = [...new Uint8Array(digest)]
                .map((b) => b.toString(16).padStart(2, '0'))
                .join('');

            if (hash === PIN_HASH) {
                // Redirect to the private page if correct
                window.location.href = 'private/index.html';
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
                errorMsg.textContent = 'System error: could not verify.';
            errorMsg.classList.add('show');
        }
    });
})();