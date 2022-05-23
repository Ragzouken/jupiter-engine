document.addEventListener("DOMContentLoaded", start);

const sounds = {
    music: {},
    click: new Howl({ src: ['assets/click.mp3'] }),
    move: new Howl({ src: ['assets/buzz-grain.mp3'], volume: 1 }),
    notification: new Howl({ src: ['assets/notification.mp3'] }),
}

ADD_MUSIC("mundane", "assets/info-loop.mp3", .1);
ADD_MUSIC("mystery", "assets/sssm-tapes.mp3", .1);
ADD_MUSIC("discovery", "assets/sssm-warfare.mp3", .1);
ADD_MUSIC("evolution", "assets/sssm-flesh.mp3", .1);
ADD_MUSIC("credits", "assets/credits-loop.mp3", .1);

function ADD_MUSIC(id, src, volume=1, loop=true) {
    sounds.music[id] = new Howl({ src: [src], volume, loop });
}

async function start() {
    document.body.addEventListener("selectstart", (event) => {
        if (event.target != event.currentTarget) return; 
        event.preventDefault();
        // event.stopPropagation();
    });

    confineWindows();

    ADD_EVENT("chapter-1-begin", async () => {
        await showTitle(document.getElementById("session-1").dataset.title);
        setMusic(sounds.music.mundane);
        await loadWindows("session-1");
    });

    ADD_EVENT("chapter-1-solved", async () => {
        await sleep(3000);
        const inbox = document.getElementById("inbox");
        replaceWindow("inbox", "inbox-update-2");
        sounds.notification.play();
        attentionWindow(inbox);
    });

    ADD_EVENT("chapter-1-silence", async () => {
        fadeMusicOut(1);
    });

    ADD_EVENT("chapter-1-ending", async () => {
        setMusic(sounds.music.mystery);
        const lost = document.getElementById("shuttle-five-lost");
        exclusiveWindow(lost);
        await sleep(1000);
        closeAll(lost);
        hideScreen();
    });

    RUN_EVENT_AFTER_SEEN("chapter-1-solved", ["inteltrax-homepage", "deep-space-psychometrics-info"]);
    RUN_EVENT_AFTER_SEEN("chapter-1-silence", ["email-3"]);
    RUN_EVENT_AFTER_SEEN("chapter-1-ending", ["shuttle-five-lost"]);

    ADD_EVENT("chapter-2-begin", async () => {
        setMusic(sounds.music.mystery);
        await showTitle(document.getElementById("session-2").dataset.title);
        await loadWindows("session-2");
    });

    RUN_EVENT_AFTER_CLOSED("chapter-2-begin", ["shuttle-five-lost"]);

    ADD_EVENT("chapter-2-approval", async () => {
        await sleep(2000 + 2000 * Math.random());
        const inbox = document.getElementById("inbox-lab");
        replaceWindow("inbox-lab", "inbox-lab-update-1");
        sounds.notification.play();
        attentionWindow(inbox);
    });

    ADD_EVENT("chapter-2-breakthrough", async () => {
        await sleep(2000 + 2000 * Math.random());
        const inbox = document.getElementById("inbox-lab");
        replaceWindow("inbox-lab", "inbox-lab-update-2");
        sounds.notification.play();
        attentionWindow(inbox);
    });

    ADD_EVENT("chapter-2-silence", async () => {
        fadeMusicOut(1);
    });

    ADD_EVENT("chapter-2-ending", async () => {
        setMusic(sounds.music.evolution);
        const email = document.getElementById("inhibitor-found");
        exclusiveWindow(email);
        await sleep(1000);
        closeAll(email);
        hideScreen();
    });

    RUN_EVENT_AFTER_SEEN("chapter-2-approval", ["news-shuttle-hope"]);
    RUN_EVENT_AFTER_SEEN("chapter-2-breakthrough", ["lab-status", "lab-specimen", "lab-vocal", "nerve-analysis"]);
    RUN_EVENT_AFTER_SEEN("chapter-2-silence", ["lab-email-3"]);
    RUN_EVENT_AFTER_SEEN("chapter-2-ending", ["inhibitor-found"]);

    ADD_EVENT("chapter-3-begin", async () => {
        setMusic(sounds.music.evolution);
        await showTitle(document.getElementById("session-3").dataset.title);
        await loadWindows("session-3");
    });

    RUN_EVENT_AFTER_CLOSED("chapter-3-begin", ["inhibitor-found"]);

    ADD_EVENT("chapter-3-trending", async () => {
        await sleep(2000 + 2000 * Math.random());
        const inbox = document.getElementById("inbox-3");
        replaceWindow("inbox-3", "inbox-3-update-1");
        sounds.notification.play();
        attentionWindow(inbox);
    });

    ADD_EVENT("chapter-3-silence", async () => {
        fadeMusicOut(1);
    });

    ADD_EVENT("chapter-3-ending", async () => {
        setMusic(sounds.music.credits);
        const email = document.getElementById("rumour-3-shuttle-five-truth");
        exclusiveWindow(email);
        await sleep(1000);
        closeAll(email);
        hideScreen();
    });

    RUN_EVENT_AFTER_SEEN("chapter-3-trending", ["inteltrax-3-euphoron-control", "rumour-3-spatial-pinch"]);
    RUN_EVENT_AFTER_SEEN("chapter-3-silence", ["email-3-end"]);
    RUN_EVENT_AFTER_SEEN("chapter-3-ending", ["rumour-3-shuttle-five-truth"]);

    ADD_EVENT("credits-sequence", async () => {
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
    });

    RUN_EVENT_AFTER_CLOSED("credits-sequence", ["rumour-3-shuttle-five-truth"]);

    await RUN_EVENT("chapter-1-begin");
}
