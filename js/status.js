// Live Discord status via Lanyard
(function () {
    const USER_ID = '1032996748798480525';
    const API = `https://api.lanyard.rest/v1/users/${USER_ID}`;

    const el = {
        avatar: document.getElementById('statusAvatar'),
        name: document.getElementById('statusName'),
        line: document.getElementById('statusLine'),
        dot: document.getElementById('statusDot'),
        list: document.getElementById('statusList')
    };

    const STATUS_LABEL = { online: 'Online', idle: 'Idle', dnd: 'Do Not Disturb', offline: 'Offline' };
    const STATUS_COLOR = { online: '#3ba55d', idle: '#faa61a', dnd: '#ed4245', offline: '#747f8d' };

    function render(data) {
        const user = data.discord_user || {};
        const status = data.discord_status || 'offline';
        const color = STATUS_COLOR[status] || STATUS_COLOR.offline;

        el.dot.style.background = color;
        el.dot.style.boxShadow = `0 0 10px ${color}`;
        el.name.textContent = user.display_name || user.global_name || user.username || 'Bambuu';

        const hash = user.avatar;
        if (hash) {
            el.avatar.src = `https://cdn.discordapp.com/avatars/${USER_ID}/${hash}.png?size=128`;
        } else {
            const idx = Number(BigInt(USER_ID) >> 22n) % 6;
            el.avatar.src = `https://cdn.discordapp.com/embed/avatars/${idx}.png`;
        }

        const activities = data.activities || [];
        const custom = activities.find(a => a.type === 4);
        const game = activities.find(a => a.type === 0 && a.name !== 'Custom Status');
        const spotify = data.spotify;

        if (spotify && spotify.song) {
            el.line.textContent = 'Listening to Spotify';
        } else if (custom && custom.state) {
            el.line.textContent = custom.state;
        } else if (game) {
            el.line.textContent = game.name;
        } else {
            el.line.textContent = STATUS_LABEL[status] || 'Offline';
        }

        el.list.innerHTML = '';
        if (status === 'offline') {
            addItem('💤', 'Offline right now');
        } else {
            if (custom && custom.state) addItem(emoji(custom.emoji), custom.state);
            if (spotify && spotify.song) addSpotify(spotify);
            if (game) addItem('🎮', game.name, game.state || '');
            activities.forEach(a => {
                if (a.type === 1 || a.type === 3 || a.type === 5) addItem('📌', a.name, a.details || a.state || '');
            });
        }
        if (!el.list.children.length) addItem('💤', 'Nothing right now');
    }

    function emoji(e) {
        if (!e) return '<span class="status-pop-icon">💬</span>';
        if (e.id) {
            const ext = e.animated ? '.gif' : '.png';
            return `<img class="status-emoji" src="https://cdn.discordapp.com/emojis/${e.id}${ext}" alt="">`;
        }
        return `<span class="status-pop-icon">${escapeHtml(e.name || '💬')}</span>`;
    }

    function addSpotify(sp) {
        const li = document.createElement('li');
        li.className = 'status-spotify';
        li.innerHTML = `
            <img class="status-album" src="${escapeHtml(sp.album_art_url || '')}" alt="">
            <div>
                <strong>${escapeHtml(sp.song)}</strong>
                <br><small>${escapeHtml(sp.artist)} — Spotify</small>
            </div>`;
        el.list.appendChild(li);
    }

    function addItem(icon, text, sub) {
        const li = document.createElement('li');
        const iconHtml = icon.trim().startsWith('<') ? icon : `<span class="status-pop-icon">${icon}</span>`;
        li.innerHTML = `${iconHtml}<div><strong>${escapeHtml(text)}</strong>${sub ? `<br><small>${escapeHtml(sub)}</small>` : ''}</div>`;
        el.list.appendChild(li);
    }

    function escapeHtml(s) {
        const div = document.createElement('div');
        div.textContent = s == null ? '' : String(s);
        return div.innerHTML;
    }

    function load() {
        fetch(API)
            .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
            .then(j => {
                if (j.success && j.data) render(j.data);
                else throw new Error('no data');
            })
            .catch(() => {
                el.line.textContent = 'Unavailable';
                el.dot.style.background = STATUS_COLOR.offline;
            });
    }

    load();
    setInterval(load, 15000);
})();
