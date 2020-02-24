// pages/music/music.js
const app = getApp();
const player = app.globalData.musicPlayer;

Page({
  data: {
    playlist_show: false,
    playlist: Array,
    current: Object
  },
  onLoad: function () {
    player.onListChanged = (list) => {
      this.setData({
        playlist: list
      })
    }
    player.onSongChanged = (song) => {
      this.setData({
        current: song
      })
    }

    this.setData({
      navHeight: app.globalData.nav.height,
      navTop: app.globalData.nav.top
    })
  },
  onReady: function () {
    this.setData({
      current: player.current().song,
      playlist: player.list()
    })
  },
  control(e) {
    let cmd = e.currentTarget.dataset.cmd;
    let params = e.currentTarget.dataset.params || null;
    console.log(cmd, params)
    let commands = {
      last: player.last,
      toggle: player.toggle,
      pause: player.pause,
      next: player.next,
      showlist: () => {
        this.setData({
          playlist_show: true
        })
      },
      closelist: () => {
        this.setData({
          playlist_show: false
        })
      },
      seek: () => {
        player.seek(params);
      },
      switch: () => {
        player.switch(params);
      },
      remove: () => {
        player.delSong(params)
      }
    };
    commands[cmd]();
  },
  play(e) {
    let song = e.currentTarget.dataset.song;
    player.playSong(song)
  }

})