// components/nav-bar/nav-bar.js
const app = getApp();
const player = app.globalData.musicPlayer;

Component({
  properties: {

  },
  data: {
    progress: Number,
    lrc: "♩♪ ♫♬♫ ♪♪ ♫",
    music: Object
  },

  methods: {
    play() {
      player.toggle();
    }
  },
  lifetimes: {
    attached() {
      this.setData({
        height: app.globalData.nav.height,
        top: app.globalData.nav.top,
        strip: app.globalData.nav.strip,
        left: app.globalData.nav.left,
        right: app.globalData.nav.right,
        width: app.globalData.nav.width
      })
    }
  },
  pageLifetimes: {
    // 所在页面被展示的时候
    show() {
      let current = player.current()
      if (current != null) {
        this.setData({
          music: current.song,
          lrc: current.lrc,
          progress: parseInt(current.percent * this.data.width)
        })
      }

      // 更新当前音乐
      player.onSongChanged = (song) => {
        this.setData({
          music: song
        })
      }

      // 更新播放进度
      player.onProgressChanged = (rate) => {
        this.setData({
          progress: parseInt(rate * this.data.width)
        })
      }

      // 更新歌词
      player.onLyricLineChanged = (lrc) => {
        this.setData({
          lrc: lrc
        })
      }
    }
  }
})