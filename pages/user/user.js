// pages/user/user.js
const global = getApp().globalData;

const app = getApp()

Page({
  data: {
    userInfo: null,
    openid: 'openid'
  },
  onLoad: function () {
    // 试着获取曾经登录过的用户信息
    this.getUserInfo();
    this.getUserData();
  },
  getUserData: function () {
    if (app.globalData.openid) {
      this.setData({
        openid: app.globalData.openid
      })
    } else {
      app.openidReady = res => {
        this.setData({
          openid: res.result.openid,
        })
      }
    }
  },
  getUserInfo() {
    wx.getUserInfo({
      success: res => {
        this.setData({
          userInfo: res.userInfo
        })
      }
    })
  },
  login() {
    wx.login({
      success: res => {
        wx.getSetting({
          success: res => {
            if (res.authSetting['scope.userInfo']) {
              // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
              this.getUserInfo();
            }
          }
        })
      }
    })
  },
  mylove() {
    wx.navigateTo({
      url: '/pages/playlist/playlist',
      success: function (res) {
        // 通过eventChannel向被打开页面传送数据
        res.eventChannel.emit('getList', 0)
      }
    })
  }
})