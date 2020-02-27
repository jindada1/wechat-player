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
        
        // 自定义导航栏的高度
        global.nav.height = menuButton.height + 2 * (menuButtonTop - statusBarHeight);
        // 导航栏上下边界与胶囊按钮的缝隙
        global.nav.strip = menuButtonTop - statusBarHeight;
        // 状态栏的高度，即导航栏与屏幕上方的距离
        global.nav.top = statusBarHeight;
        // 导航栏内容距离左侧屏幕的距离，此处与胶囊按钮距离右侧的距离相同
        global.nav.left = res.windowWidth - menuButton.right;
        // 导航栏内容距离右侧屏幕的距离，保证不会与胶囊按钮重叠
        global.nav.right = menuButton.width + global.nav.left;
        // 导航栏本身的最大宽度
        global.nav.width = res.safeArea.width;

        // 包括导航栏在内的整个窗口的高度
        global.window.height = res.windowHeight;
        // 导航栏下方用于显示内容的窗口高度
        global.window.contentHeight = res.windowHeight - statusBarHeight - global.nav.height;
      },
    })
  },
  globalData: {
    userInfo: null,
    musicPlayer: null,
    nav: {
      height: 40,
      top: 20,
      strip: 4,
      left: 10,
      right: 10,
      width: 320
    },
    window: {
      contentHeight: 460,
      height: 520
    }
  }
})