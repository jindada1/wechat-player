export function initPlayer() {

  // 初始化音频播放器
  let player = wx.getBackgroundAudioManager();

  // 读取本地歌单
  player.list = wx.getStorageSync('list') || [];

  // 正在播放的歌曲索引
  player.index = -1;

  // 当前播放的歌曲发生变化时，调用此函数，传参 song，index
  player.songChanged = null;

  // 当播放列表发生增删时，调用此函数，传参 list
  player.listChanged = null;

  /**
   * public methods
   */

  // 根据索引播放指定歌曲
  player.switch = function (index) {
    let length = player.list.length;
    if (length) {
      // 制造一个双向循环列表
      if (index < 0) {
        index = length + index % length;
      }
      index = index % length

      if (index != player.index) {
        // 更新正在播放的歌曲
        player.index = index;
        let song = player.list[index]
        setSong(song);
      }
    } else {
      player.stop();
    }
  }

  // 上一首
  player.last = function () {
    player.switch(player.index - 1);
  }

  // 下一首
  player.next = function () {
    player.switch(player.index + 1);
  }

  // 尝试播放
  player.tryPlay = function () {
    // have src but paused
    if (player.src) {
      player.play();
    }
    // no src, try play list
    else if (player.list.length) {
      player.switch(0)
    }
  }

  // 播放/暂停
  player.toggle = function () {
    if (player.paused) {
      player.play();
    } else if (player.src) {
      player.pause();
    }
  }

  // 添加新歌到歌单
  player.addSong = function (song) {
    if (player.list.indexOf(song) === -1) {
      player.list.push(song);

      // callback
      if (typeof player.listChanged === "function") {
        player.listChanged(player.list);
      }
    }
  }

  // 播放指定音乐（列表里没有就添加进去再播放）
  player.playSong = function (song) {
    let index = player.list.indexOf(song);
    if (index === -1) {
      player.list.push(song);
      index = play.list.length - 1;

      // callback
      if (typeof player.listChanged === "function") {
        player.listChanged(player.list);
      }
    }
    player.switch(index);
  }

  // 从播放列表中移除歌曲，参数： index 或 song
  player.delSong = function (index) {
    if (typeof (index) === "object") {
      index = player.list.indexOf(index);
    }
    player.list.splice(index, 1);
    if (index === player.index) {
      player.next();
    }
    // callback
    if (typeof player.listChanged === "function") {
      player.listChanged(player.list);
    }
  }

  /**
   * private methods
   */
  function setSong(song) {
    player.title = song.name;
    player.epname = song.albumname;
    player.singer = song.artist
    player.coverImgUrl = song.cover;
    // 设置了 src 之后会自动播放
    player.src = song.url;

    if (typeof player.songChanged === "function") {
      player.songChanged(song, player.index);
    }
  }

  /**
   * wx events
   */

  // 自动播放下一首
  player.onEnded(player.next);

  // 删除出错歌曲
  player.onError(() => {
    player.delSong(player.index);
  })

  return player
}