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
    current: Object,
    currentPage: 0,
    lrcHeight: 40,
    notouch: true
  },
  onLoad: function () {

    let _this = this;
    const query = this.createSelectorQuery();
    query.select('#controls').boundingClientRect(function (rect) {
      // 高度 = 屏幕高度 - 控制区高度
      let window_height = app.globalData.window.contentHeight - rect.height;
      _this.setData({
        navHeight: app.globalData.nav.height,
        navTop: app.globalData.nav.top,
        cmtHeight: app.globalData.window.contentHeight,
        displayHeight: window_height
      })
    })
    query.exec()

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
  initUI(song) {
    player.lyric((lrcs) => {
      this.setData({
        lrcs: lrcs
      })
    })
    this.getComments(song);
  },
  onShow: function () {

    let current = player.current()
    if (current) {
      this.setData({
        current: current.song,
        playlist: player.list(),
        paused: player.paused
      })

      this.initUI(current.song);
    }


    player.onListChanged = (list) => {
      this.setData({
        playlist: list
      })
    }

    player.onSongChanged = (song) => {
      console.log('onSongChanged')
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
  getComments(song) {
    if (song) {
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
  },
  swiperChange(e) {
    if (e.detail.source) {
      this.setData({
        currentPage: e.detail.current
      })
    }
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
  drag(dragging) {
    this.slideValue = dragging.detail.value;

  },
  playMV(e) {
    let mv = this.data.current;
    mv.idforcomments = mv.mvid;

    wx.navigateTo({
      url: '/pages/mv/mv?id=1',
      success: function (res) {
        // 通过eventChannel向被打开页面传送数据
        res.eventChannel.emit('playMV', mv)
      }
    })
  },
  download() {
    console.log(this.data.current.url)
    const downloadTask = wx.downloadFile({
      url: this.data.current.url,
      complete: (res) => {
        console.log('complete')
      },
      success: (result) => {
        var filePath = result.tempFilePath;
        console.log(filePath)
      },
    })
    downloadTask.onProgressUpdate((res) => {
      console.log(res.progress);
    })
  }
})