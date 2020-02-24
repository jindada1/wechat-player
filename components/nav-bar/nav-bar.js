// components/nav-bar/nav-bar.js
const app = getApp();
const player = app.globalData.musicPlayer;

Component({
  properties: {

  },

  data: {
    percent: Number,
    lrc: String,
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
        strip: app.globalData.nav.strip
      })
    }
  },
  pageLifetimes: {
    // 所在页面被展示的时候
    show() {
      let music = player.current()
      if (music != null) {
        this.setData({
          music: music
        })
      }
      player.onProgressChanged = (rate) => {
        this.setData({
          percent: parseInt(rate)
        })
      }
      player.onLyricLineChanged = (lrc, index) => {
        this.setData({
          lrc: lrc
        })
      }
    }
  }
})