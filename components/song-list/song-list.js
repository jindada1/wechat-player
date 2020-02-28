// components/song-list.js
const app = getApp();
const player = app.globalData.musicPlayer;

Component({
  properties: {
    songs: Array
  },
  data: {
    height: "500px",
    page: Number,
    pageLength: 20,
    waiting: false,
    timeout: 3000,
    timeout_id: Number,
    filter: false
  },
  ready: function () {},
  methods: {
    setHeight(height) {
      this.setData({
        height: height
      })
    },
    add: function (list) {
      if (this.properties.songs.length) {
        clearTimeout(this.data.timeout_id)
        let songs = this.properties.songs.concat(list);
        this.setData({
          songs: songs,
          page: list.length === this.data.pageLength ? this.data.page + 1 : -1,
          waiting: false
        })
      } else
        this.set(list)
    },
    set: function (list) {
      this.setData({
        songs: list,
        page: list.length === this.data.pageLength ? 0 : -1,
        waiting: false
      })
    },
    nextPage: function () {
      if (this.data.page > -1 && !this.data.waiting) {

        // 设置超时
        let id = setTimeout(() => {
          this.setData({
            waiting: false
          });
        }, this.data.timeout);

        // 不重复请求
        this.setData({
          waiting: true,
          timeout_id: id
        });

        // 获取下一页
        this.triggerEvent('nextpage', {
          type: 'songs',
          page: this.data.page + 1
        });
      }
      if (this.data.page === -1) {
        wx.showToast({
          title: '没有下一页',
          icon: 'none',
          duration: 2000
        })
      }
    },
    play(e) {
      let song = e.currentTarget.dataset.item;

      if (song.playable) {
        player.playSong(song);
      } else {
        wx.showToast({
          title: '版权限制',
          icon: 'none',
          duration: 1000
        })
      }
    },
    addToList(e) {
      let song = e.currentTarget.dataset.song;
      if (song.playable) {
        song.lrc = song.lrc;
        song.url = song.url;
        player.addSong(song);
      } else {
        wx.showToast({
          title: '版权限制',
          icon: 'none',
          duration: 1000
        })
      }
    },
    playMV(e) {
      let mv = e.currentTarget.dataset.song;
      mv.idforcomments = mv.mvid;

      wx.navigateTo({
        url: '/pages/mv/mv?id=1',
        success: function (res) {
          // 通过eventChannel向被打开页面传送数据
          res.eventChannel.emit('playMV', mv)
        }
      })
    },
    love(e) {
      let song = e.currentTarget.dataset.song;
      console.log('love')
      console.log(song)
    },
    playlist() {
      player.list(this.data.songs)
    },
    filtercr() {
      this.setData({
        filter: !this.data.filter
      })
    }
  }
})