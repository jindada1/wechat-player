// pages/playlist/playlist.js
const global = getApp().globalData;
const player = global.musicPlayer;
const db = global.DB;

import Dialog from "../../miniprogram_npm/@vant/weapp/dialog/dialog";

Page({
  data: {
    listinfo: {
      name: '我喜欢',
      pic: "../../../../icons/love.svg"
    },
    playlist: [],
    taplock: false
  },
  onLoad: function () {
    this.setData({
      navHeight: global.nav.height,
      navTop: global.nav.top,
    })

    const eventChannel = this.getOpenerEventChannel();

    let _this = this;
    eventChannel.on('getList', function (listid) {
      if (listid === 0) {
        db.loved((list) => {
          _this.setData({
            playlist: list,
            listid: 0,
            listinfo: {
              name: '我喜欢',
              pic: "../../../../icons/love.svg"
            }
          })
        })
      }
    })
  },
  onReady: function () {

  },
  onShow: function () {

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
  scrolling(e) {
    this.setData({
      navText: e.detail.isFixed ? this.data.listinfo.name : ""
    })
  },
  playall() {
    player.list(this.data.playlist)
  },
  hateSong(e) {
    if (this.data.listid === 0) { 
      //锁住
      this.setData({
        taplock: true
      });
      Dialog.confirm({
          message: '你真的不再爱它了吗',
          asyncClose: true
        })
        .then(() => {
          db.hate(e.currentTarget.dataset.item, (list) => {
            this.setData({
              playlist: list
            })
            Dialog.close();
          })
        })
        .catch(() => {
          Dialog.close();
        });
    }
  },
  touchend: function () {
    if (this.data.taplock) {
      //开锁
      setTimeout(() => {
        this.setData({
          taplock: false
        });
      }, 100);
    }
  },
  play(e) {
    //检查锁
    if (this.data.taplock) {
      return;
    }
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
  }
})