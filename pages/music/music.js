// pages/music/music.js
import {
  getComment
} from '../../utils/api.js'

const app = getApp();
const player = app.globalData.musicPlayer;
const db = app.globalData.DB;

Page({
  data: {
    playlist_show: false,
    playlist: Array,
    current: Object,
    lrcHeight: 40,
    notouch: true,
    navHeight: 40,
    navTop: 20,
  },
  onLoad: function () {

    this.setData({
      navHeight: app.globalData.nav.height,
      navTop: app.globalData.nav.top
    })

    player.onPause(() => {
      this.setData({
        playing: false
      })
    })

    player.onPlay(() => {
      this.setData({
        playing: true
      })
    })
  },
  initUI(song) {
    player.lyric((lrcs) => {
      this.setData({
        lrcs: lrcs
      })
    })
    this.setData({
      lovethis: db.doIlove(song)
    })
  },
  onShow: function () {

    let current = player.current()
    if (current) {
      this.setData({
        current: current.song,
        playlist: player.list(),
        playing: player.isPlaying(),
        progress: parseInt(current.percent * 100)
      })
      this.initUI(current.song);
    }

    player.onListChanged = (list) => {
      this.setData({
        playlist: list
      })
    }
    player.onSongChanged = (song) => {
      this.setData({
        current: song,
      })
      this.initUI(song)
    }

    // 更新播放进度
    player.onProgressChanged = (rate) => {
      this.setData({
        progress: parseInt(rate * 100)
      })
    }

    // 更新歌词
    player.onLyricLineChanged = (lrc, id) => {
      this.setData({
        currentLrc: id
      })
      if (this.data.notouch) {
        this.setData({
          scrollTop: id * this.data.lrcHeight
        })
      }
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
  },
  startScroll() {
    // 当手指滚动歌词时，歌词就不必跟着进度自动滚动
    this.setData({
      notouch: false
    });

    // 清空上一个计时器
    if (this.id) {
      clearTimeout(this.id)
    }

    // 重新倒计时 2 秒
    this.id = setTimeout(() => {
      this.setData({
        notouch: true
      });
    }, 2000);
  },
  playMV() {
    // 深拷贝一个 mv ，否则会变动原来的 idforcomments
    let mv = JSON.parse(JSON.stringify(this.data.current));
    mv.idforcomments = mv.mvid;

    wx.navigateTo({
      url: '/pages/sub/mv/mv?id=1',
      success: function (res) {
        // 通过eventChannel向被打开页面传送数据
        res.eventChannel.emit('playMV', mv)
      }
    })
  },
  viewComments() {
    let song = this.data.current;
    wx.navigateTo({
      url: '/pages/sub/comments/comments',
      success: function (res) {
        // 通过eventChannel向被打开页面传送数据
        res.eventChannel.emit('viewcmt', song)
      }
    })
  },
  love() {
    db.love(this.data.current, (res) => {
      if (res._id) {
        this.setData({
          lovethis: true
        })
      }
    })
  },
  hate() {
    db.hate(this.data.current, () => {
      this.setData({
        lovethis: false
      })
    })
  },
  drag(dragging) {
    this.slideValue = dragging.detail.value;
  }
})