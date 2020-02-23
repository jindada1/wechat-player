// pages/mv/mv.js
import {
  getMV
} from '../../utils/api.js'

Page({
  data: {
    src:String
  },
  onLoad: function () {
      const eventChannel = this.getOpenerEventChannel()
      let _this = this
      eventChannel.on('playMV', function(mv) {
        getMV(mv.platform, mv.mvid).then(response => {
          _this.setData({
            src: response.data.uri
          })
        })
      })
  },
})