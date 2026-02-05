const SOUNDS = new Map();

/** @type {Howl} */
let CURR_MUSIC;

function PLAY_CLIP(id) {
  SOUNDS.get(id).play();
}

function PLAY_MUSIC(id) {
  const NEXT_MUSIC = SOUNDS.get(id);
  
  if (NEXT_MUSIC == CURR_MUSIC) 
    return;

  CURR_MUSIC?.stop();
  NEXT_MUSIC?.play();
  NEXT_MUSIC?.fade(0, 0.1, 1000);

  CURR_MUSIC = NEXT_MUSIC;
}

async function FADE_MUSIC(duration) {
  CURR_MUSIC?.fade(CURR_MUSIC._volume, 0, duration * 1000);
  return DELAY(duration);
}

const LOAD_AUDIO_DATA = (element) => new Howl({
  src: element.getAttribute("src"),
  volume: parseFloat(element.getAttribute("volume") ?? "1"),
  loop: element.hasAttribute("loop"),
});

LOAD_MACROS.set("sounds", (element) => {
  for (const audio of ALL("audio[id]", element))
    SOUNDS.set(audio.id, LOAD_AUDIO_DATA(audio));
});
