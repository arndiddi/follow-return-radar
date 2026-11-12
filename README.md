# Unrequited

See who doesn't follow you back on Instagram, privately.

**Live app:** https://follow-return-radar.lovable.app

## What it does

Drop in your Instagram data export and Unrequited sorts everyone into three lists:

* **Not following you back:** you follow them, they don't follow you
* **You don't follow back:** they follow you, you don't follow them
* **Mutuals:** you follow each other

You can sort each list by oldest, most recent, or A to Z, and download any list as a CSV file.

## Privacy

* No Instagram login or password needed
* Your file is opened and compared inside your browser tab and is never uploaded to a server
* The code is open, so you can check this yourself

## How to use it

1. In Instagram, open your profile, tap the menu (☰), then Accounts Center, then Your information and permissions.
2. Tap Export your information, then Create export, and choose your account.
3. Choose Device as the destination.
4. Select Some of your information, tick Followers and following, set Date range to All time and Format to JSON.
5. When Instagram tells you the export is ready, download the .zip (the download link lasts four days).
6. Open the app and drop in the .zip, or the followers_1 and following files.

Want to try it first? Click **Try sample data** in the app.

## Run it locally

You need [Bun](https://bun.sh) installed.

```
git clone https://github.com/arndiddi/follow-return-radar.git
cd follow-return-radar
bun install
bun run dev
```

Run the tests with `bun run test`.

## Built with

React, TanStack Start, and Tailwind CSS, made with [Lovable](https://lovable.dev).

## License

MIT. See the LICENSE file.
