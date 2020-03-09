export function initPlayer() {

  // 创建音频播放器
  let player = wx.getBackgroundAudioManager();

  // 读取本地缓存的歌单
  let list = wx.getStorageSync('list') || [];

  // 播放列表里最多的歌曲数
  let MAX_NUM = 80;

  // 正在播放的歌曲索引
  let current_index = -1;

  // 当前音乐的歌词 Object
  let _lrcs = [];

  // 当前正在演唱的歌词 index
  let _lrc_index = -1;

  // 小程序规范：不能自动播放
  let canplay = false;

  // 初始化曾经的状态
  function initialize() {
    // 定位到上一次播放到的歌曲
    if (list.length) {
      let song = wx.getStorageSync('music') || {};
      var index = findSong(song);
      player.switch(index);
    }
  }

  function setSong() {
    let song = list[current_index]
    player.title = song.name;
    player.epname = song.albumname;
    player.singer = song.artist
    player.coverImgUrl = song.cover;
    // 设置了 src 之后会自动播放
    // console.log(canplay)
    if (canplay) {
      player.src = song.url;
    }

    if (song.lrc) {
      // 清空上一首歌的歌词
      _lrcs = [];
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
        wx.showToast({
          title: '获取歌词失败，请检查网络连接',
          icon: 'none',
          duration: 2000
        })
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
              c: content.replace(/&apos;/g, "'")
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

  function _listadd(song) {
    let backend = 'https://goldenproud.cn';
    let keys = ['url', 'cover', 'lrc'];

    keys.forEach((key) => {
      if (song[key][0] === '/') {
        song[key] = backend + song[key];
      }
    });
    if (list.length >= MAX_NUM) {
      wx.showToast({
        title: '播放列表超过上限，替换了【' + list[0].name + '】',
        icon: 'none',
        duration: 2000
      })
      player.delSong(0);
    }
    list.push(song);
    listChanged();
  }

  function waitForLyric(callback, trytime = 5) {
    // 没有歌词就再等一段时间，有 5 次重试的机会
    if (_lrcs.length === 0 && trytime > 0) {
      // 前三次都是等待 400ms，后两次等待 1600 和 2000 ms，一共允许等待 4.8 秒
      var wait = trytime > 2 ? 400 : (6 - trytime) * 400;
      setTimeout(() => {
        waitForLyric(callback, trytime - 1)
      }, wait);
    }
    // 有歌词或者超过等待时间就回调
    else
      callback(_lrcs)
  }

  function myPlayer() {

    // 获取播放列表 / 设置新列表
    player.list = function (newlist = null) {
      if (newlist) {
        list = [];
        newlist = newlist.slice(0, MAX_NUM);
        for (let id in newlist) {
          if (newlist[id].playable) _listadd(newlist[id]);
        }
        canplay = true;
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

      let now = player.currentTime;
      let id = 0;

      for (let index in _lrcs) {
        if (_lrcs[index].t < now) id = index
        else break;
      };

      if (current_index > -1) {
        return {
          index: current_index,
          song: list[current_index],
          lrc: _lrc_index > -1 ? _lrcs[_lrc_index].c : "",
          lrc_id: parseInt(id),
          percent: (now / player.duration).toFixed(3)
        }
      }
      return null;
    }

    // 获取歌词数组，歌词请求过程是异步的，可能界面调用这个函数但是歌词还没有解析完毕，所以要传入一个回调等待
    player.lyric = (callback = null) => {
      if (typeof callback === 'function') {
        if (_lrcs.length > 0) {
          callback(_lrcs);
        } else
          waitForLyric(callback);
      } else
        return _lrcs;
    }

    player.isPlaying = () => {
      if (player.paused === undefined) {
        return false
      }
      return !player.paused;
    }

    // 根据索引播放指定歌曲
    player.switch = function (index) {
      // console.log(canplay)
      // 重复点击的时候不会重新播放
      if (index === current_index) return;

      let length = list.length;
      if (length) {
        // 制造一个双向循环列表
        if (index < 0) {
          index = length + index % length;
        }
        index = index % length

        // 更新索引
        current_index = index;
        setSong();

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
      // no src, first try to play history
      else if (current_index > -1) {
        canplay = true;
        player.src = list[current_index].url;
      }
      // then try to play first song in list
      else if (list.length) {
        canplay = true;
        player.switch(0)
      }
      // list 为空, 也没有历史缓存
      else {
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
        _listadd(song);
        wx.showToast({
          title: '添加成功',
          icon: 'success',
          duration: 1000
        })
      }
    }

    // 播放指定音乐（列表里没有就添加进去再播放）
    player.playSong = function (song) {
      let index = findSong(song);
      if (index === -1) {
        _listadd(song);
        index = list.length - 1;
      }
      canplay = true;
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
        index = findSong(index);
      }
      // 移除
      list.splice(index, 1);
      listChanged();

      if (index === current_index) {
        player.next();
      }
      // 更新当前索引
      else if (index < current_index) {
        current_index--;
      }
    }

    // 自动播放下一首
    player.onEnded(player.next);

    // 系统音乐播放面板上一首/下一首
    player.onPrev(player.last);
    player.onNext(player.next);

    // 删除出错歌曲
    player.onError(() => {
      if (player.currentTime > 0) {
        wx.showToast({
          title: '卡喽~',
          icon: 'none',
          duration: 1000
        })
      } else {
        wx.showToast({
          title: '版权限制，播放失败',
          icon: 'none',
          duration: 1000
        })
        player.delSong(current_index);
      }
    })

    // 正在播放时
    player.onTimeUpdate(() => {
      let now = player.currentTime;

      if (typeof player.onProgressChanged === "function") {
        player.onProgressChanged(now / player.duration, now);
      }

      if (typeof player.onLyricLineChanged === "function" && _lrcs.length > 0) {
        // 从第一句开始
        let id = 0;

        for (let index in _lrcs) {
          if (_lrcs[index].t < now) id = parseInt(index)
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

    initialize();
    return player;
  }

  return myPlayer();
}