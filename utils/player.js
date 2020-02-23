export function initPlayer() {

  // 初始化音频播放器
  let player = wx.getBackgroundAudioManager();

  // 读取本地缓存的歌单
  let list = wx.getStorageSync('list') || [];

  // 正在播放的歌曲索引
  let current = -1;


  function setSong(song) {
    player.title = song.name;
    player.epname = song.albumname;
    player.singer = song.artist
    player.coverImgUrl = song.cover;
    // 设置了 src 之后会自动播放
    player.src = song.url;

    if (typeof player.onSongChanged === "function") {
      player.onSongChanged(song, current);
    }
  }

  function listChanged() {
    wx.setStorageSync('list', list)

    // callback
    if (typeof player.onListChanged === "function") {
      player.onListChanged(list);
    }
  }

  function findSong(song) {
    for (let index in list) {
      if (list[index].idforres === song.idforres) {
        return index
      }
    };
    return -1
  }

  function myPlayer() {

    // 获取播放列表 / 设置新列表
    player.list = function (newlist = null) {
      if (newlist) {
        list = newlist;
        player.switch(0);

        listChanged();
      }
      return list
    }

    // 获取列表里的歌曲数目
    player.songNum = () => {
      return list.length;
    }

    // 获取当前正在播放的音乐
    player.current = () => {
      if (current > -1) {
        return {
          index: current,
          song: list[current]
        }
      }
    }

    // 根据索引播放指定歌曲
    player.switch = function (index) {
      let length = list.length;
      if (length) {
        // 制造一个双向循环列表
        if (index < 0) {
          index = length + index % length;
        }
        index = index % length

        if (index != current) {
          // 更新正在播放的歌曲
          current = index;
          let song = list[index]
          setSong(song);
        }
      } else {
        player.stop();
        current = -1;
      }
    }

    // 上一首
    player.last = function () {
      player.switch(current - 1);
    }

    // 下一首
    player.next = function () {
      player.switch(current + 1);
    }

    // 播放/暂停
    player.toggle = function () {
      // has src, try toggle
      if (player.src) {
        if (player.paused) {
          player.play();
        } else {
          player.pause();
        }
      }
      // no src, try play list
      else if (list.length) {
        player.switch(0)
      } else {
        wx.showToast({
          title: '没有音乐',
          icon: 'none',
          duration: 2000
        })
      }
    }

    // 添加新歌到歌单，但不立即播放
    player.addSong = function (song) {
      if (findSong(song) > -1) {
        wx.showToast({
          title: '已在歌单里',
          icon: 'none',
          duration: 1000
        })
      } else {
        list.push(song);

        wx.showToast({
          title: '添加成功',
          icon: 'success',
          duration: 1000
        })
        listChanged();
      }
    }

    // 播放指定音乐（列表里没有就添加进去再播放）
    player.playSong = function (song) {
      let index = findSong(song);
      if (index === -1) {
        list.push(song);
        index = list.length - 1;

        listChanged();
      }
      player.switch(index);
    }

    // 从播放列表中移除歌曲，参数： index 或 song
    player.delSong = function (index) {
      if (index < 0 || index > list.length) {
        return
      }
      // index = null 或 undefined 时，设置默认值 0
      if (index === null || index === undefined) {
        index = 0
      }
      // 参数时 song 时
      if (typeof (index) === "object") {
        index = list.indexOf(index);
      }
      // 移除
      list.splice(index, 1);
      if (index === current) {
        player.next();
      }
      // 更新当前索引
      else if (index < current) {
        current--;
        if (typeof player.onSongChanged === "function") {
          player.onSongChanged(list[current], current);
        }
      }
      listChanged();
    }

    // 自动播放下一首
    player.onEnded(player.next);

    // IOS 系统音乐播放面板上一首/下一首
    player.onPrev(player.last);
    player.onNext(player.next);

    // 删除出错歌曲
    player.onError(() => {
      wx.showToast({
        title: '版权限制，播放失败',
        icon: 'none',
        duration: 1000
      })
      player.delSong(current);
    })

    // 当前播放的歌曲发生变化时，调用此函数，传参 song，index
    player.onSongChanged = null;

    // 当播放列表发生增删时，调用此函数，传参 list
    player.onListChanged = null;

    return player;
  }

  return myPlayer();
}