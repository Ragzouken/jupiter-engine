
      ██╗██╗   ██╗██████╗ ██╗████████╗███████╗██████╗                           
      ██║██║   ██║██╔══██╗██║╚══██╔══╝██╔════╝██╔══██╗                          
      ██║██║   ██║██████╔╝██║   ██║   █████╗  ██████╔╝                          
 ██╗  ██║██║   ██║██╔═══╝ ██║   ██║   ██╔══╝  ██╔══██╗                          
 ╚█████╔╝╚██████╔╝██║     ██║   ██║   ███████╗██║  ██║                          
  ╚════╝  ╚═════╝ ╚═╝     ╚═╝   ╚═╝   ╚══════╝╚═╝  ╚═╝                          
                                 ███████╗███╗  ██╗ ██████╗ ██╗███╗  ██╗███████╗ 
                                 ██╔════╝████╗ ██║██╔════╝ ██║████╗ ██║██╔════╝ 
                                 █████╗  ██╔██╗██║██║  ██╗ ██║██╔██╗██║█████╗   
                                 ██╔══╝  ██║╚████║██║  ╚██╗██║██║╚████║██╔══╝   
                                 ███████╗██║ ╚███║╚██████╔╝██║██║ ╚███║███████╗ 
                                 ╚══════╝╚═╝  ╚══╝ ╚═════╝ ╚═╝╚═╝  ╚══╝╚══════╝ 

## overview

* ctrl+q to open the debug menu

## audio data

example:
<audio id="audio/music/mundane" src="assets/info-loop.mp3" loop volume=".1">
</audio>

define a piece of audio to be used later. 

special sounds:
* audio/clips/click        -- button click sound
* audio/clips/move         -- window move/scroll sound
* audio/clips/notification -- ping window sound

## window data
 
example:
<div id="inbox" class="inbox" title="darkmail - inbox" data-pinned>
  <h1>inbox</h1>
  <ul>
    <li>[FOIA request declined|email-1]</li>
  </ul>
</div>

defined a window to be opened later. 

* id          -- used to identify window in scripts and event triggers
* class       -- css classes used to customise appearance
* title       -- text in titlebar of window
* data-pinned -- if present, the window's close button is hidden

## events

example:
<script id="events/ch2/approval">
  await DELAY(randFloat(2, 4));
  REPLACE_WINDOW("inbox-lab", "inbox-lab-update-1");
  PING_WINDOW("inbox-lab");
</script>

define a snippet of javascript code to run later via event triggers. the engine
starts by running the event with id "start".

* PLAY_MUSIC(id)
* FADE_MUSIC(seconds)
* PLAY_CLIP(id)

* await DELAY(seconds)
* await SHOW_TITLE(text)

* OPEN_WINDOW(id)
* CLOSE_WINDOW(id)
* REPLACE_WINDOW(target, source)
* PING_WINDOW(target)
* FADE_ALL_EXCEPT(id1, id2, id3, ...)

* RUN_EVENT(id)

## event triggers

example:
<event-trigger opened="window-id-1 window-id-2" closed="window-id-3">
</event-trigger>

define a trigger that will open a specific window at the first moment that all 
the listed window opens and closes have happened at least once.
