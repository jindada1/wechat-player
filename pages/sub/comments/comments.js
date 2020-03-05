// pages/sub/comments/comments.js
import {
  getComment
} from '../../../utils/api.js'

const global = getApp().globalData;

Page({
  data: {
    src: String,
    waiting: false,
    timeout: 3000,
    timeout_id: Number,
    navHeight: 40,
    navTop: 20,
    cmtPage: 0
  },
  onLoad: function () {

    this.setData({
      navHeight: global.nav.height,
      navTop: global.nav.top
    })

    const eventChannel = this.getOpenerEventChannel()

    let _this = this;
    eventChannel.on('viewcmt', function (song) {
      getComment(song.platform, song.idforcomments, 'song').then((response) => {
        let cmts = response.data.hot.comments.concat(response.data.normal.comments)
        _this.setData({
          comments: cmts,
          cmtPage: 0,
          song
        })
      })
    })

    global.musicPlayer.pause();
  },
  backward() {
    var pages = getCurrentPages(); //当前页面
    var beforePage = pages[pages.length - 2]; //前一页
    wx.navigateBack({
      success: function () {
        beforePage.onLoad(); // 执行前一个页面的onLoad方法
      }
    });
  },
  nextCmtPage() {
    if (this.data.comments) {
      let song = this.data.song;

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

      getComment(song.platform, song.idforcomments, 'song', this.data.cmtPage + 1).then((response) => {
        let cmts = response.data.hot.comments.concat(response.data.normal.comments)
        clearTimeout(this.data.timeout_id)
        this.setData({
          comments: this.data.comments.concat(cmts),
          cmtPage: this.data.cmtPage + 1,
          waiting: false
        })
      })
    }
  }
})