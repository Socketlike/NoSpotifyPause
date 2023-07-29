import { Logger, types } from 'replugged';

const logger = Logger.plugin('NoSpotifyPause');

const watcherFunctionMatch = /function (.{1,3})\((.{1,3})\){(.+isCurrentClientInVoiceChannel\(\))/;
const autoPauseFunctionMatch = /function (.{1,3})\(\){.*"Playback auto paused"\)}+/;

export default [
  {
    find: /"Playback auto paused"/,
    replacements: [
      (source) => {
        const watcherFunctionKey = source.match(watcherFunctionMatch)?.[1];

        const autoPauseFunctionKey = source.match(autoPauseFunctionMatch)?.[1];

        if (!watcherFunctionKey || !autoPauseFunctionKey)
          logger.error('Cannot get VC watcher / auto pause function key');
        else {
          // Replace VC watcher calls in any function in the SpotifyStore class with nothing
          source = source.replace(
            new RegExp(`return ${watcherFunctionKey}\\([a-zA-Z0-9.,_()]+\\)`, 'g'),
            'return !0',
          );
          source = source.replace(
            new RegExp(`${watcherFunctionKey}\\([a-zA-Z0-9.,_()]+\\);`, 'g'),
            '(void 0);',
          );

          // Removes the VC state listener
          source = source.replace(/VOICE_STATE_UPDATES:function\([a-zA-Z0-9_,]+\){.*!1\)},/, '');

          // Remove any setTimeout calls that calls the auto pause function
          source = source.replace(
            new RegExp(
              `([=()a-zA-Z0-9,_.]+)\\.start\\([a-zA-Z0-9,_.\\s()]+${autoPauseFunctionKey}(,!1|)\\)`,
              'g',
            ),
            '$1',
          );
        }

        return source;
      },
      {
        match: autoPauseFunctionMatch,
        replace: 'function $1(){}',
      },
      {
        match: watcherFunctionMatch,
        replace: 'function $1($2){return !1;$3',
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
