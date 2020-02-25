// pages/music/music.js
import {
  getComment
} from '../../utils/api.js'

const app = getApp();
const player = app.globalData.musicPlayer;

Page({
  data: {
    playlist_show: false,
    playlist: Array,
    current: Object
  },
  onLoad: function () {
    this.setData({
      navHeight: app.globalData.nav.height,
      navTop: app.globalData.nav.top,
      cmtHeight: app.globalData.window.safeHeight
    })

    player.onPause(() => {
      this.setData({
        paused: true
      })
    })

    player.onPlay(() => {
      this.setData({
        paused: false
      })
    })
  },
  onShow: function () {

    let song = player.current().song
    this.setData({
      current: song,
      playlist: player.list(),
      paused: player.paused
    })

    this.getComments(song);

    player.onListChanged = (list) => {
      this.setData({
        playlist: list
      })
    }

    player.onSongChanged = (song) => {
      console.log('onSongChanged')
      this.setData({
        current: song
      })
      this.getComments(song)
    }

    // 更新播放进度
    player.onProgressChanged = (rate) => {
      this.setData({
        progress: parseInt(rate * 100)
      })
    }
  },
  getComments(song) {
    if (song) {
      let _this = this;
      getComment(song.platform, song.idforcomments, 'song').then((response) => {
        this.setData({
          comments: response.data.hot.comments
        })
      })
    }
  },
  control(e) {
    let cmd = e.currentTarget.dataset.cmd;
    let params = e.currentTarget.dataset.params || null;

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