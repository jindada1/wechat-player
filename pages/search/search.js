// pages/search/search.js
import {
  search
} from '../../utils/api.js'

Page({
  data: {
    platform: 'qq',
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
      }
    ],
    searchKey: "",
    searchType: "mv"
  },
  onReady() {
    this.song_list = this.selectComponent("#song-list");
    this.mv_list = this.selectComponent("#mv-list");

    let _this = this;
    const query = this.createSelectorQuery();
    query.select('#tab-content').boundingClientRect(function (rect) {
      wx.getSystemInfo({
        success: function (res) {
          // 获取可使用窗口宽度
          let clientHeight = res.windowHeight;
          // 到底部的距离
          let scroller_height = clientHeight - rect.top;

          _this.song_list.setHeight(scroller_height.toString() + 'px');
          _this.mv_list.setHeight(scroller_height.toString() + 'px');
        }
      })
    })
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
    this.setData({
      searchType: event.detail.name
    });
    // 搜索种类切换，自动搜索
    if (this.data.searchKey) {
      this.Search({
        detail: this.data.searchKey
      })
    }
  },
  inputChange(event) {
    console.log(event.detail)
  },
  Search(event) {
    let key = event.detail;
    let platform = this.data.platform;
    let type = this.data.searchType;

    search(platform, type, key).then(response => {
      this.setData({
        searchKey: event.detail
      })
      switch (type) {
        case "songs":
          this.song_list.set(response.data.songs || []);
          break;
        case "mv":
          this.mv_list.set(response.data.videos || []);
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
  }
})