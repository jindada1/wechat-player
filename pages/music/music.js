// pages/music/music.js
const app = getApp();
const player = app.globalData.musicPlayer;

Page({
  data: {
    index: 0
  },
  onLoad: function () {
    player.songChanged = (song, index) => {
      console.log('changed');
      console.log(song);
      console.log(index);
    }
  },
  onReady: function () {},
  play(){
    player.tryPlay();
  },
  stop(){
    player.pause();
  }
})