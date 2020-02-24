import {
  initPlayer
} from "utils/player.js";

//app.js
App({
  onLaunch: function () {
    let global = this.globalData;
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              global.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })

    // 创建音乐播放器
    global.musicPlayer = initPlayer();

    // 获取导航栏相关信息
    let menuButton = wx.getMenuButtonBoundingClientRect();
    // console.log(menuButton);

    wx.getSystemInfo({
      complete: (res) => {
        let statusBarHeight = res.statusBarHeight;
        let menuButtonTop = menuButton.top;
        global.nav.height = menuButton.height + 2 * (menuButtonTop - statusBarHeight);
        global.nav.strip = menuButtonTop - statusBarHeight;
        global.nav.top = statusBarHeight;
        global.nav.left = res.windowWidth - menuButton.right;
        global.nav.right = menuButton.width + global.nav.left;
        global.nav.width = res.safeArea.width;
      },
    })
  },
  globalData: {
    userInfo: null,
    musicPlayer: null,
    nav: {
      height: 60,
      top: 20,
      strip: 4,
      left: 10,
      right: 10,
      width: 320
    }
  }
})