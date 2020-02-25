export function initPlayer() {

  // 创建音频播放器
  let player = wx.getBackgroundAudioManager();

  // 读取本地缓存的歌单
  let list = wx.getStorageSync('list') || [];

  // 正在播放的歌曲索引
  let current_index = -1;

  // 当前音乐的歌词 Object
  let _lrcs = [];

  // 当前正在演唱的歌词 index
  let _lrc_index = -1;

  // 初始化曾经的状态
  function initialize() {
    // 定位到上一次播放到的歌曲
    if (list.length) {
      let song = wx.getStorageSync('music') || {};
      current_index = findSong(song);
      setSong();
    }
  }

  function setSong() {
    let song = list[current_index]
    player.title = song.name;
    player.epname = song.albumname;
    player.singer = song.artist
    player.coverImgUrl = song.cover;
    // 设置了 src 之后会自动播放 
    player.src = song.url;

    if (song.lrc) {
      initLrc(song.lrc)
    }
    songChanged()
  }

  function songChanged() {
    wx.setStorageSync('music', list[current_index])

    if (typeof player.onSongChanged === "function") {
      player.onSongChanged(list[current_index]);
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
    try {
      for (let index in list) {
        if (list[index].idforres === song.idforres) {
          // index is string
          return parseInt(index)
        }
      };
    } catch (error) {
      return -1
    }
    return -1
  }

  function initLrc(url) {
    wx.request({
      url,
      method: 'GET',
      success: (result) => {
        // console.log(result);
        _lrcs = createLrcObj(result.data)
      },
      fail: (err) => {
        console.log('获取歌词失败');
      }
    })
  }

  function createLrcObj(lrc) {
    if (lrc.length == 0) return [{
      t: 0,
      c: '没有歌词 (。・∀・)ノ'
    }];

    var lrcList = [];
    var offset = 0;
    var lrcs = lrc.split('\n'); //用回车拆分成数组

    for (var i in lrcs) { //遍历歌词数组
      lrcs[i] = lrcs[i].replace(/(^\s*)|(\s*$)/g, ""); //去除前后空格
      var t = lrcs[i].substring(lrcs[i].indexOf("[") + 1, lrcs[i].indexOf("]")); //取[]间的内容
      var s = t.split(":"); // 分离:前后文字

      // 获取时间偏移
      if (isNaN(parseInt(s[0]))) {
        if (s[0].toLowerCase() === "offset")
          offset = s[1];
      }
      // 提取歌词
      else {
        // 提取时间字段，可能有多个
        var arr = lrcs[i].match(/\[(\d+:.+?)\]/g);
        var start = 0;
        for (var k in arr) {
          // 计算歌词位置
          start += arr[k].length;
        }

        // 获取歌词内容
        var content = lrcs[i].substring(start);
        if (content) {
          for (var k in arr) {
            // 取[]间的内容
            var t = arr[k].substring(1, arr[k].length - 1);
            // 分离:前后文字
            var s = t.split(":");
            // 对象{t:时间,c:歌词}加入ms数组
            lrcList.push({
              t: (parseFloat(s[0]) * 60 + parseFloat(s[1]) + parseFloat(offset)).toFixed(3),
              c: content
            });
          }
        }
      }
    }
    // 按时间顺序排序
    lrcList.sort(function (a, b) {
      return a.t - b.t;
    });

    return lrcList;
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
      if (current_index > -1) {
        return {
          index: current_index,
          song: list[current_index],
          lrc: _lrc_index > -1 ? _lrcs[_lrc_index].c : ""
        }
      }
      return null;
    }

    // 获取歌词数组
    player.lyric = () => {
      return _lrcs.map(lrc => {
        return lrc.c
      })
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

        if (index != current_index) {
          // 更新正在播放的歌曲
          current_index = index;
          setSong();
        }
      } else {
        player.stop();
        current_index = -1;
      }
    }

    // 上一首
    player.last = function () {
      player.switch(current_index - 1);
    }

    // 下一首
    player.next = function () {
      player.switch(current_index + 1);
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
        player.switch(current_index > -1 ? current_index : 0)
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
      if (index === current_index) {
        player.next();
      }
      // 更新当前索引
      else if (index < current_index) {
        current_index--;
      }
      listChanged();
    }

    // 自动播放下一首
    player.onEnded(player.next);

    // 系统音乐播放面板上一首/下一首
    player.onPrev(player.last);
    player.onNext(player.next);

    // 删除出错歌曲
    player.onError(() => {
      wx.showToast({
        title: '版权限制，播放失败',
        icon: 'none',
        duration: 1000
      })
      player.delSong(current_index);
    })

    // 正在播放时
    player.onTimeUpdate(() => {
      let now = player.currentTime;

      if (typeof player.onProgressChanged === "function") {
        player.onProgressChanged(now / player.duration);
      }

      if (typeof player.onLyricLineChanged === "function") {
        // 从第一句开始
        let id = 0;

        for (let index in _lrcs) {
          if (_lrcs[index].t < now) id = index
          else break;
        };

        if (_lrc_index != id) {
          player.onLyricLineChanged(_lrcs[id].c, id);
          _lrc_index = id;
        }
      }
    })

    // 当前播放的歌曲发生变化时，调用此函数，传参 song，index
    player.onSongChanged = null;

    // 当播放列表发生增删时，调用此函数，传参 list
    player.onListChanged = null;

    // 播放进度改变时，调用此函数，传参 百分率
    player.onProgressChanged = null;

    // 当前播放的歌词改变时，调用此函数，传参 歌词内容
    player.onLyricLineChanged = null;

    return player;
  }

  initialize();
  return myPlayer();
}