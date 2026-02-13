const EVENTS = new Map();

const DELAY = (seconds) => sleep(seconds * 1000);

function RUN_EVENT(id) {
  const event = EVENTS.get(id);

  if (event === undefined) {
    console.trace(`NO EVENT "${id}"`);
  } else {
    try {
      return event();
    } catch (error) {
      console.log(`ERROR IN EVENT "${id}"`);
      throw error;
    }
  }
}

const LOAD_EVENT_DATA = (element) => 
  new AsyncFunction("", element.textContent);

LOAD_MACROS.set("events", (element) => {
  for (const script of ALL("script[id]", element)) 
    EVENTS.set(script.id, LOAD_EVENT_DATA(script));
});
