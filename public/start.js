async function start() {
    await RUN_EVENT("chapter-1-begin");
}

ADD_CLIP("click", "assets/click.mp3");
ADD_CLIP("move", "assets/buzz-grain.mp3");
ADD_CLIP("notification", "assets/notification.mp3");

ADD_MUSIC("mundane", "assets/info-loop.mp3", .1);
ADD_MUSIC("mystery", "assets/sssm-tapes.mp3", .1);
ADD_MUSIC("discovery", "assets/sssm-warfare.mp3", .1);
ADD_MUSIC("evolution", "assets/sssm-flesh.mp3", .1);
ADD_MUSIC("credits", "assets/credits-loop.mp3", .1);

const chapter1Title = "in the shadow of jupiter";
const chapter2Title = "the blood of the gods";
const chapter3Title = "ideation";

ADD_EVENT("chapter-1-begin", async () => {
    await SHOW_TITLE(chapter1Title);
    PLAY_MUSIC("mundane");
    OPEN_WINDOW("inbox");
});

ADD_EVENT("chapter-1-solved", async () => {
    await DELAY(3);
    REPLACE_WINDOW("inbox", "inbox-update-2");
    PING_WINDOW("inbox");
});

ADD_EVENT("silence", async () => {
    FADE_MUSIC(1);
});

ADD_EVENT("chapter-1-ending", async () => {
    PLAY_MUSIC("mystery");
    await FADE_ALL_EXCEPT("shuttle-five-lost");
});

RUN_EVENT_AFTER_SEEN("chapter-1-solved", ["inteltrax-homepage", "deep-space-psychometrics-info"]);
RUN_EVENT_AFTER_SEEN("silence", ["email-3"]);
RUN_EVENT_AFTER_SEEN("chapter-1-ending", ["shuttle-five-lost"]);

ADD_EVENT("chapter-2-begin", async () => {
    PLAY_MUSIC("mystery");
    await SHOW_TITLE(chapter2Title);
    OPEN_WINDOW("inbox-lab");
});

RUN_EVENT_AFTER_CLOSED("chapter-2-begin", ["shuttle-five-lost"]);

ADD_EVENT("chapter-2-approval", async () => {
    await DELAY(randFloat(2, 4));
    REPLACE_WINDOW("inbox-lab", "inbox-lab-update-1");
    PING_WINDOW("inbox-lab");
});

ADD_EVENT("chapter-2-breakthrough", async () => {
    await DELAY(randFloat(2, 4));
    REPLACE_WINDOW("inbox-lab", "inbox-lab-update-2");
    PING_WINDOW("inbox-lab");
});

ADD_EVENT("chapter-2-ending", async () => {
    PLAY_MUSIC("evolution");
    await FADE_ALL_EXCEPT("inhibitor-found");
});

RUN_EVENT_AFTER_SEEN("chapter-2-approval", ["news-shuttle-hope"]);
RUN_EVENT_AFTER_SEEN("chapter-2-breakthrough", ["lab-status", "lab-specimen", "lab-vocal", "nerve-analysis"]);
RUN_EVENT_AFTER_SEEN("silence", ["lab-email-3"]);
RUN_EVENT_AFTER_SEEN("chapter-2-ending", ["inhibitor-found"]);

ADD_EVENT("chapter-3-begin", async () => {
    PLAY_MUSIC("evolution");
    await SHOW_TITLE(chapter3Title);
    OPEN_WINDOW("inbox-3");
});

RUN_EVENT_AFTER_CLOSED("chapter-3-begin", ["inhibitor-found"]);

ADD_EVENT("chapter-3-trending", async () => {
    await DELAY(randFloat(2, 4));
    REPLACE_WINDOW("inbox-3", "inbox-3-update-1");
    PING_WINDOW("inbox-3");
});

ADD_EVENT("chapter-3-ending", async () => {
    PLAY_MUSIC("credits");
    await FADE_ALL_EXCEPT("rumour-3-shuttle-five-truth");
});

RUN_EVENT_AFTER_SEEN("chapter-3-trending", ["inteltrax-3-euphoron-control", "rumour-3-spatial-pinch"]);
RUN_EVENT_AFTER_SEEN("silence", ["email-3-end"]);
RUN_EVENT_AFTER_SEEN("chapter-3-ending", ["rumour-3-shuttle-five-truth"]);

ADD_EVENT("credits-sequence", async () => {
    PLAY_MUSIC("credits");
    await DELAY(5);
    OPEN_WINDOW("credits-1");
    await DELAY(2.5);
    OPEN_WINDOW("credits-2");
    await DELAY(2.5);
    OPEN_WINDOW("credits-3");
    await DELAY(2.5);
    OPEN_WINDOW("credits-4");
    await DELAY(2.5);
    OPEN_WINDOW("credits-5");
    await DELAY(1.5);
    OPEN_WINDOW("credits-6");
    await DELAY(5);
    OPEN_WINDOW("credits-music");
    await DELAY(1);
    OPEN_WINDOW("credits-sounds");
    await DELAY(2);
    OPEN_WINDOW("credits-thanks");
});

RUN_EVENT_AFTER_CLOSED("credits-sequence", ["rumour-3-shuttle-five-truth"]);
