// pages/mv/mv.js
import {
  getMV,
  getComment
} from '../../utils/api.js'

const app = getApp();

Page({
  data: {
    src: String
  },
  onLoad: function () {
    console.log('load mv')
    let _this = this;
    const query = this.createSelectorQuery();
    query.select('#video').boundingClientRect(function (rect) {
      // 高度 = 内容高度 - 播放器高度
      _this.setData({
        navHeight: app.globalData.nav.height,
        navTop: app.globalData.nav.top,
        cmtTop: app.globalData.nav.height + app.globalData.nav.top + rect.height
      })
    })
    query.exec()

    const eventChannel = this.getOpenerEventChannel()
    
    eventChannel.on('playMV', function (mv) {
      getMV(mv.platform, mv.mvid).then(response => {
        mv.src = response.data.uri;
        _this.setData({
          mv: mv
        })
      })
      getComment(mv.platform, mv.idforcomments, 'mv').then((response) => {
        _this.setData({
          comments: response.data.hot.comments
        })
      })
    })

    app.globalData.musicPlayer.pause();
  },
  backward() {
    var pages = getCurrentPages(); //当前页面
    var beforePage = pages[pages.length - 2]; //前一页
    wx.navigateBack({
      success: function () {
        beforePage.onLoad(); // 执行前一个页面的onLoad方法
      }
    });
  }
})