// pages/search/search.js
import { search } from '../../utils/api.js'
import { fetch } from '../../utils/fetch.js'

Page({
  data: {
    logs: ['123']
  },
  onReady: function () {

  },
  Search(){
    search('qq', 'songs', '周杰伦', 0).then(response => {
      this.setData({
        logs: (response.data.songs || []).map(song => {
          return song.name
        })
      })
    });
  }
})