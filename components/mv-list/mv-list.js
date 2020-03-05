// components/mv-list.js
Component({
  properties: {
    list: Array
  },
  data: {
    height: "500px",
    page: Number,
    pageLength: 20,
    waiting: false,
    timeout: 3000,
    timeout_id: Number
  },
  ready: function () {

  },
  methods: {
    setHeight(height) {
      this.setData({
        height: height
      })
    },
    add: function (list) {
      if (this.properties.list.length) {
        clearTimeout(this.data.timeout_id)
        let newlist = this.properties.list.concat(list);
        this.setData({
          list: newlist,
          page: list.length === this.data.pageLength ? this.data.page + 1 : -1,
          waiting: false
        })
      } else
        this.set(list)
    },
    set: function (list) {
      this.setData({
        list: list,
        page: list.length === this.data.pageLength ? 0 : -1,
        waiting: false
      })
    },
    nextPage: function () {
      if (this.data.page > -1 && !this.data.waiting) {

        // 设置超时
        let id = setTimeout(() => {
          this.setData({
            waiting: false
          });
        }, this.data.timeout);

        // 不重复请求
        this.setData({
          waiting: true,
          timeout_id: id
        });

        // 获取下一页
        this.triggerEvent('nextpage', {
          type: 'mv',
          page: this.data.page + 1
        });
      }
      if (this.data.page === -1) {
        wx.showToast({
          title: '没有下一页',
          icon: 'none',
          duration: 2000
        })
      }
    },
    play(e) {
      let mv = e.currentTarget.dataset.item;
      
      wx.navigateTo({
        url: '/pages/sub/mv/mv?id=1',
        success: function (res) {
          // 通过eventChannel向被打开页面传送数据
          res.eventChannel.emit('playMV', mv)
        }
      })
    }
  }
})