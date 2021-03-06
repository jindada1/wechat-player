// pages/search/search.js
import {
  search
} from '../../utils/api.js'

const global = getApp().globalData;

Page({
  data: {
    platform: 'wangyi',
    platforms: [{
        text: 'QQ',
        value: 'qq'
      },
      {
        text: '网易',
        value: 'wangyi'
      },
      {
        text: '酷狗',
        value: 'kugou'
      },
      {
        text: '咪咕',
        value: 'migu'
      },
      {
        text: '酷我',
        value: 'kuwo'
      }
    ],
    searchKey: "",
    searchType: "songs",
    inputing: true,
    wowHeight: 450
  },
  onReady() {
    this.song_list = this.selectComponent("#song-list");
    this.mv_list = this.selectComponent("#mv-list");

    let _this = this;
    const query = this.createSelectorQuery();
    query.select('#tab-content').boundingClientRect(function (rect) {

      // 到底部的距离 = 屏幕高度 - 控件 top
      let scroller_height = global.window.height - rect.top;

      _this.song_list.setHeight(scroller_height.toString() + 'px');
      _this.mv_list.setHeight(scroller_height.toString() + 'px');
    })
    // query.select('#wow').boundingClientRect(function (rect) {
    //   _this.setData({
    //     wowHeight: global.window.height - rect.top
    //   })
    // })
    query.exec()
  },
  platformChange(event) {
    this.setData({
      platform: event.detail
    });
    // 平台切换，自动搜索
    if (this.data.searchKey) {
      this.Search({
        detail: this.data.searchKey
      })
    }
  },
  typeChange(event) {

    let key = this.data.searchKey;
    let type = event.detail.name;

    this.setData({
      searchType: type
    });

    // 搜索种类切换，尝试搜索
    if (key) {
      // 没有结果就创建结果
      if (!this.result) this.result = {};

      // 已经有结果了
      else if (this.result[type] == key) return

      // 记录已经搜索过的种类
      this.result[type] = key;
      this.Search({
        detail: this.data.searchKey
      })
    }
  },
  inputChange(event) {
    // console.log(event.detail)
  },
  Search(event) {
    let key = event.detail;
    let platform = this.data.platform;
    let type = this.data.searchType;

    if (key === null) return;

    // loading display
    switch (type) {
      case "songs":
        this.setData({
          searchingSong: true
        })
        break;
      case "mv":
        this.setData({
          searchingMV: true
        })
        break;
    }
    search(platform, type, key).then(response => {
      this.setData({
        searchKey: key
      })
      switch (type) {
        case "songs":
          this.song_list.set(response.data.songs || []);
          this.setData({
            searchingSong: false
          })
          break;
        case "mv":
          this.mv_list.set(response.data.videos || []);
          this.setData({
            searchingMV: false
          })
          break;
      }
    });
  },
  getNext(event) {
    let platform = this.data.platform;
    let key = this.data.searchKey;
    let type = event.detail.type;
    let page = event.detail.page;

    search(platform, type, key, page).then(response => {
      switch (type) {
        case "songs":
          this.song_list.add(response.data.songs || []);
          break;
        case "mv":
          this.mv_list.add(response.data.videos || []);
          break;
      }
    });
  },
  searchFocused() {
    this.setData({
      inputing: true
    })
  },
  searchBlur() {
    this.setData({
      inputing: false
    })
  }
})