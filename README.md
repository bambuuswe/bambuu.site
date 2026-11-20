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

Log in to the VPS and run:

```bash
curl -fsSL https://raw.githubusercontent.com/bambuuswe/bambuu.site/main/deploy/setup-vps.sh -o setup-vps.sh
sudo bash setup-vps.sh
```

The script finds the folder the web server serves. If it cannot tell, it lists the
candidates and you run it again with the right one: `sudo bash setup-vps.sh /var/www/bambuu.site`.

It clones this repo to `/opt/bambuu-site`, saves the files it replaces to
`/opt/bambuu-site-backup-<date>`, and installs a timer that runs
`/usr/local/bin/bambuu-site-deploy` every minute. It does not touch the web server's config.

To undo it: `sudo systemctl disable --now bambuu-site-deploy.timer`, then copy the backup back.
