export function initDB() {

  // 初始化数据库
  let db = wx.cloud.database();

  // 当前用户 id
  let openid = false;

  // 收藏的音乐
  let mylovesongs = [];

  function get_id(song) {
    for (let index in mylovesongs) {
      if (mylovesongs[index].song.idforres === song.idforres) {
        // index is string
        return {
          _id: mylovesongs[index]._id,
          index
        };
      }
    };
    return {
      index: -1
    };
  }

  function warn() {
    wx.showToast({
      title: '请等待',
      icon: 'loading',
      duration: 2000
    })
  }

  function success(info) {
    wx.showToast({
      title: info,
      icon: 'success',
      duration: 1000
    })
  }

  function myDatabase() {

    db.initid = function (_id) {
      openid = _id;
    }

    // 注册
    db.register = function (callback) {
      db.collection('users').add({
          data: {
            _id: openid,
            accounts: {}
          }
        })
        .then(res => {
          if (typeof callback === 'function')
            callback(res)
        })
    }

    // 收藏一首歌
    db.love = function (song, callback) {
      if (get_id(song).index > -1) return
      db.collection('love').add({
          data: {
            song
          }
        })
        .then(res => {
          if (typeof callback === 'function')
            callback(res)
          if (res._id) {
            mylovesongs.push({
              _id: res._id,
              song
            });
            success("收藏成功");
          }
        })
    }

    // 收藏的歌曲
    db.loved = function (callback) {
      if (!openid) {
        warn()
        return
      }
      // 缓存
      if (mylovesongs) {
        if (typeof callback === 'function') {
          callback(mylovesongs)
        }
      }
      // 获取 歌单
      db.collection('love').where({
          _openid: openid
        })
        .field({
          song: true,
        })
        .get()
        .then(res => {
          if (typeof callback === 'function') {
            mylovesongs = res.data;
            callback(mylovesongs.map(item => {
              return item.song;
            }))
          }
        })
    }

    // 移除歌曲
    db.hate = function (song, callback) {
      let s = get_id(song)
      db.collection('love').doc(s._id).remove({
        success: function (res) {
          success('成功讨厌了它');
          mylovesongs.splice(s.index, 1)
          if (typeof callback === 'function') {
            callback(mylovesongs.map(item => {
              return item.song;
            }))
          }
        }
      })
    }

    db.doIlove = function (song) {
      if (mylovesongs.length == 0 && openid) {
        db.loved(() => {
          return get_id(song).index != -1;
        })
      } else
        return get_id(song).index != -1;
    }

    return db;
  }

  return myDatabase();
}