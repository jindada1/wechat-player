// pages/music/music.js
const app = getApp();
const player = app.globalData.musicPlayer;
const db = app.globalData.DB;

Page({
  data: {
    playlist_show: false,
    playlist: Array,
    current: Object,
    notouch: true,
    navHeight: 40,
    navTop: 20,
    lyric_area_height: '',
    lrc_line_height: 40,
    isDraging: false
  },
  onLoad: function () {
    this.setData({
      navHeight: app.globalData.nav.height,
      navTop: app.globalData.nav.top
    })
  },
  onReady() {
    this.getHeight()
  },
  getHeight() {
    const query = this.createSelectorQuery();
    let _this = this;
    query.select('#lyric-area').boundingClientRect()
    query.exec(function (rect) {
      if (rect[0].height === 0) {
        setTimeout(() => {
          _this.getHeight()
        }, 1000);
      } else
        _this.setData({
          lyric_area_height: rect[0].height
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
      if (!this.data.isDraging) {
        this.setData({
          progress: parseInt(rate * 100)
        })
      }
    }

    // 更新歌词
    player.onLyricLineChanged = (lrc, id) => {
      this.setData({
        currentLrc: id
      })
      if (this.data.notouch) {
        this.setData({
          scrollTop: (id + 1) * this.data.lrc_line_height
        })
      }
    }
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
    // console.log('cmts')
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
  draging(dragging) {
    if (!this.data.isDraging)
      this.setData({
        isDraging: true
      })
  },
  dragchange(change) {
    this.setData({
      isDraging: false
    })
    if (!this.data.playing) {
      player.toggle();
    }
    player.seek((change.detail / 100) * this.data.current.interval);
  }
})