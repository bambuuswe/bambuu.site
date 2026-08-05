// Live Insanux Discord stats via invite API
(function () {
    const GUILD_ID = '737213060233822269';
    const INVITE = 'https://discord.com/api/v10/invites/insanux?with_counts=true';

    const el = {
        icon: document.getElementById('insanuxIcon'),
        line: document.getElementById('insanuxLine'),
        dot: document.getElementById('insanuxDot'),
        members: document.getElementById('insanuxMembers'),
        online: document.getElementById('insanuxOnline')
    };

    function fmt(n) {
        return n == null ? '–' : Number(n).toLocaleString('en-US');
    }

    function render(data) {
        const guild = data.guild || {};
        if (guild.icon) {
            const ext = guild.icon.startsWith('a_') ? '.gif' : '.png';
            el.icon.src = `https://cdn.discordapp.com/icons/${GUILD_ID}/${guild.icon}${ext}?size=128`;
        }
        el.line.textContent = (data.approximate_presence_count || 0) > 0 ? 'Live & thriving' : 'Community';
        el.members.textContent = fmt(data.approximate_member_count);
        el.online.textContent = fmt(data.approximate_presence_count);
        el.dot.classList.add('pulse');
        el.dot.style.background = '#3ba55d';
        el.dot.style.boxShadow = '0 0 10px #3ba55d';
    }

    function load() {
        fetch(INVITE)
            .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
            .then(j => {
                if (j.guild) render(j);
                else throw new Error('no data');
            })
            .catch(() => {
                el.line.textContent = 'Unavailable';
                el.members.textContent = '–';
                el.online.textContent = '–';
                el.dot.classList.remove('pulse');
                el.dot.style.background = '#747f8d';
                el.dot.style.boxShadow = 'none';
            });
    }

    load();
    setInterval(load, 60000);
})();
