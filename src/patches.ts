import { types } from 'replugged';

export default [
  {
    replacements: [
      {
        match:
          /\(0,[a-zA-Z0-9]+\.[a-zA-Z0-9]+\)\([a-zA-Z0-9]+\.accountId,[a-zA-Z0-9]+\.accessToken\);[a-zA-Z0-9]+\.[a-zA-Z0-9]+\.track\([a-zA-Z0-9]+\.[a-zA-Z0-9]+\.SPOTIFY_AUTO_PAUSED\);[a-zA-Z0-9]+\.info\(\"Playback auto paused\"\)/,
        replace: '',
      },
    ],
  },
] as types.PlaintextPatch[];
