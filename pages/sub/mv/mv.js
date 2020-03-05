// pages/sub/mv/mv.js
import {
  getMV,
  getComment
} from '../../../utils/api.js'

const global = getApp().globalData;

Page({
  data: {
    src: String,
    navTop: 20,
    waiting: false,
    timeout: 3000,
    timeout_id: Number,
    navHeight: 40,
    navTop: 20
  },
  onLoad: function () {
    let _this = this;
    const query = this.createSelectorQuery();
    query.select('#video').boundingClientRect(function (rect) {
      // 高度 = 内容高度 - 播放器高度
      _this.setData({
        navHeight: global.nav.height,
        navTop: global.nav.top,
        cmtTop: global.nav.height + global.nav.top + rect.height
      })
    })
    query.exec()

    const eventChannel = this.getOpenerEventChannel()

    eventChannel.on('playMV', function (mv) {
      getMV(mv.platform, mv.mvid).then(response => {
        if (response.data.error) {
          wx.showToast({
            title: '这个平台没有版权哦＞﹏＜',
            icon: 'none',
            duration: 1000
          })
        }
        mv.src = response.data.uri;
        _this.setData({
          mv: mv,
          cmtPage: 0
        })
      })
      getComment(mv.platform, mv.idforcomments, 'mv').then((response) => {
        let cmts = response.data.hot.comments.concat(response.data.normal.comments)
        _this.setData({
          comments: cmts
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
      let mv = this.data.mv;

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

      getComment(mv.platform, mv.idforcomments, 'mv', this.data.cmtPage + 1).then((response) => {
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