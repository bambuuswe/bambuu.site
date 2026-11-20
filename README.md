# bambuu.site

The bio page served at https://bambuu.site.

- `public/` is the website. Everything in it is copied to the web server.
- `deploy/setup-vps.sh` is the one-time setup for the VPS.
- `publish.bat` sends your changes to GitHub (double-click it on Windows).

## Updating the site

1. Change `public/index.html` (for example, download a new one from Bio Studio and put it there).
2. Double-click `publish.bat`, or run `git add -A`, `git commit -m "Update site"`, `git push`.
3. The VPS checks the repo every minute and copies the new files into the web root.

## One-time VPS setup

Copy the script to the VPS from this folder on your PC (use your own login and server address):

```
scp deploy/setup-vps.sh USER@SERVER:
```

Then log in to the VPS and run it:

```bash
sudo bash setup-vps.sh
```

Because this repo is private, the first run stops and prints a key. Add that key at
https://github.com/bambuuswe/bambuu.site/settings/keys/new (leave "Allow write access"
unticked), then run the same command again. The key only lets the VPS read this one repo.

The script finds the folder the web server serves. If it cannot tell, it lists the
candidates and you run it again with the right one: `sudo bash setup-vps.sh /var/www/bambuu.site`.

It clones this repo to `/opt/bambuu-site`, saves the files it replaces to
`/opt/bambuu-site-backup-<date>`, and installs a timer that runs
`/usr/local/bin/bambuu-site-deploy` every minute. It does not touch the web server's config.

To undo it: `sudo systemctl disable --now bambuu-site-deploy.timer`, then copy the backup back.
