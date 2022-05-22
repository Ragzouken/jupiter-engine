document.addEventListener("DOMContentLoaded", start);

const sounds = {
    music: {
        "mundane": new Howl({ src: ['assets/info-loop.mp3'], volume: .1, loop: true }),
        "mystery": new Howl({ src: ['assets/sssm-tapes.mp3'], volume: .1, loop: true }),
        "discovery": new Howl({ src: ['assets/sssm-warfare.mp3'], volume: .1, loop: true }),
        "evolution": new Howl({ src: ['assets/sssm-flesh.mp3'], volume: .1, loop: true }),
        "credits": new Howl({ src: ['assets/credits-loop.mp3'], volume: .1 }),
    },

    click: new Howl({ src: ['assets/click.mp3'] }),
    move: new Howl({ src: ['assets/buzz-grain.mp3'], volume: 1 }),
    notification: new Howl({ src: ['assets/notification.mp3'] }),
}

async function start() {
    document.addEventListener("selectstart", (event) => {
        if (event.target === document.body) {
            event.preventDefault();
            event.stopPropagation();
        }
    });

    confineWindows();

    openedTrigger("email-3").then(() => fadeMusicOut(1));
    openedTrigger("shuttle-five-lost").then(() => setMusic(sounds.music.mystery));

    openedTrigger("lab-email-3").then(() => fadeMusicOut(1));
    openedTrigger("inhibitor-found").then(() => setMusic(sounds.music.evolution));

    openedTrigger("email-3-end").then(() => fadeMusicOut(1));
    openedTrigger("rumour-3-shuttle-five-truth").then(() => setMusic(sounds.music.credits));

    openedTrigger(
        "inteltrax-homepage",
        "deep-space-psychometrics-info",
    ).then(async () => {
        await sleep(3000);
        const inbox = document.getElementById("inbox");
        // replaceWindow("inbox", "inbox-update-1");
        replaceWindow("inbox", "inbox-update-2");
        sounds.notification.play();
        attentionWindow(inbox);
    });

    openedTrigger(
        "shuttle-five-lost",
    ).then(async () => {
        const lost = document.getElementById("shuttle-five-lost");
        exclusiveWindow(lost);
        await sleep(1000);
        closeAll(lost);
        hideScreen();
    });

    openedTrigger(
        "dh-s5-financing-report", 
        "dh-s5-mission-brief", 
        "dh-s5-crew-profiles",
    ).then(async () => {
        await sleep(2000 + 2000 * Math.random());
        const inbox = document.getElementById("inbox");
        replaceWindow("inbox", "inbox-update-2");
        sounds.notification.play();
        attentionWindow(inbox);
    });

    openedTrigger(
        "news-shuttle-hope",
    ).then(async () => {
        await sleep(2000 + 2000 * Math.random());
        const inbox = document.getElementById("inbox-lab");
        replaceWindow("inbox-lab", "inbox-lab-update-1");
        sounds.notification.play();
        attentionWindow(inbox);
    });

    openedTrigger(
        "news-shuttle-hope",
        "lab-status",
        "lab-specimen",
        "lab-vocal",
        "nerve-analysis",
    ).then(async () => {
        await sleep(2000 + 2000 * Math.random());
        const inbox = document.getElementById("inbox-lab");
        replaceWindow("inbox-lab", "inbox-lab-update-2");
        sounds.notification.play();
        attentionWindow(inbox);
    });

    openedTrigger(
        "inhibitor-found",
    ).then(async () => {
        const email = document.getElementById("inhibitor-found");
        exclusiveWindow(email);
        await sleep(1000);
        closeAll(email);
        hideScreen();
    });

    openedTrigger(
        "inteltrax-3-euphoron-control",
        "rumour-3-spatial-pinch",
    ).then(async () => {
        await sleep(2000 + 2000 * Math.random());
        const inbox = document.getElementById("inbox-3");
        replaceWindow("inbox-3", "inbox-3-update-1");
        sounds.notification.play();
        attentionWindow(inbox);
    });

    openedTrigger(
        "rumour-3-shuttle-five-truth",
    ).then(async () => {
        const email = document.getElementById("rumour-3-shuttle-five-truth");
        exclusiveWindow(email);
        await sleep(1000);
        closeAll(email);
        hideScreen();
    });

    closedTrigger(
        "inhibitor-found",
    ).then(() => startSession3());    

    closedTrigger(
        "shuttle-five-lost",
    ).then(() => startSession2());    

    closedTrigger(
        "rumour-3-shuttle-five-truth",
    ).then(() => startCredits());

    async function startSession1(skip=false) {
        setMusic(sounds.music.mundane);
        if (!skip) await showTitle(document.getElementById("session-1").dataset.title);
        await loadWindows("session-1");
    }

    async function startSession2(skip=false) {
        setMusic(sounds.music.mystery);
        if (!skip) await showTitle(document.getElementById("session-2").dataset.title);
        await loadWindows("session-2");
    }

    async function startSession3(skip=false) {
        setMusic(sounds.music.evolution);
        if (!skip) await showTitle(document.getElementById("session-3").dataset.title);
        await loadWindows("session-3");
    }

    async function startCredits() {
        await sleep(500);
        openWindow("credits-1");
        await sleep(2500);
        openWindow("credits-2");
        await sleep(2500);
        openWindow("credits-3");
        await sleep(2500);
        openWindow("credits-4");
        await sleep(2000);
        openWindow("credits-5");
        await sleep(1500);
        openWindow("credits-6");
        await sleep(5000);
        openWindow("credits-music");
        await sleep(1000);
        openWindow("credits-sounds");
        await sleep(2000);
        openWindow("credits-thanks");
    }

    await startSession1();
}
