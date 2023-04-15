import { Logger, types } from 'replugged';

const logger = Logger.plugin('NoSpotifyPause');

export default [
  {
    find: /"Playback auto paused"/,
    replacements: [
      (source) => {
        const watcherFuncKey = source.match(
          /function ([a-zA-Z0-9_]+)\([a-zA-Z0-9_,]+\){.*isCurrentClientInVoiceChannel.*[a-zA-Z0-9_]+\.start\(.*return!1}/,
        )?.[1];

        const autoPauseFuncKey = source.match(
          /function ([a-zA-Z0-9_]+)\(\){.*"Playback auto paused"\)}+/,
        )?.[1];

        if (!watcherFuncKey || !autoPauseFuncKey)
          logger.error('Cannot get VC watcher / auto pause function key');
        else {
          // Replace VC watcher calls in any function in the SpotifyStore class with nothing
          source = source.replace(
            new RegExp(`return ${watcherFuncKey}\\([a-zA-Z0-9.,_()]+\\)`, 'g'),
            'return !0',
          );
          source = source.replace(
            new RegExp(`${watcherFuncKey}\\([a-zA-Z0-9.,_()]+\\);`, 'g'),
            '(void 0);',
          );

          // Removes the VC state listener
          source = source.replace(/VOICE_STATE_UPDATES:function\([a-zA-Z0-9_,]+\){.*!1\)},/, '');

          // Remove any setTimeout calls that calls the auto pause function
          source = source.replace(
            new RegExp(
              `([=()a-zA-Z0-9,_.]+)\\.start\\([a-zA-Z0-9,_.\\s()]+${autoPauseFuncKey}(,!1|)\\)`,
              'g',
            ),
            '$1',
          );
        }

        return source;
      },
      {
        match: /function ([a-zA-Z0-9_]+)\(\){.*"Playback auto paused"\)}+/,
        replace: 'function $1(){}',
      },
      /*
        The plaintext patch in the comment below replaces the entire mess above, with only one downside:
          The autopause function will trigger after 24.85 days even if you're:
           - not using Spotify anymore
           - is out of VC
      */
      /* {
        match: /,([a-zA-Z0-9_]+)=3e4/,
        replace: ',$1=2147483647',
      }, */
    ],
  },
] as types.PlaintextPatch[];
