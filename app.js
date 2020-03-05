import {
  initPlayer
} from "utils/player.js";
import {
  initDB
} from "utils/database.js";

//app.js
App({
  onLaunch: function () {
    let global = this.globalData;

    //云开发初始化
    wx.cloud.init({
      env: 'relaxion-v1vxd',
      traceUser: true
    })
    
    // 数据库
    global.DB = initDB();


    // 获取 openId
    wx.cloud.callFunction({
      name: 'get_openid',
      complete: res => {
        global.openid = res.result.openid
        if (this.openidReady) {
          this.openidReady(res)
        }
        global.DB.initid(res.result.openid)
      }
    })

    // 创建音乐播放器
    global.musicPlayer = initPlayer();

    // 获取导航栏相关信息
    let menuButton = wx.getMenuButtonBoundingClientRect();

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