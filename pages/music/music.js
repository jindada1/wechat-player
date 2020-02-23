// pages/music/music.js
const app = getApp();
const player = app.globalData.musicPlayer;

Page({
  data: {
    index: 0
  },
  onLoad: function () {
    let num = player.songNum();
    console.log(num);
    player.onSongChanged = (song, index) => {
      console.log(player.current());
    }
  },
  onReady: function () {},
  control(e) {
    let cmd = e.currentTarget.dataset.cmd;
    let commands = {
      last: player.last,
      toggle: player.toggle,
      pause: player.pause,
      next: player.next,
      changetime: () => {
        player.seek(params);
      },
      switchsong: () => {
        player.switch(params);
      },
      remove: () => {
        player.delSong(params)
      }
    };
    commands[cmd]();
  },
})