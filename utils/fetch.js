
export const fetch = (params) => {
  const baseUrl = "https://krishuang.top/relaxion"
  params.url = baseUrl + params.url;
  
  return new Promise((resolve, reject)=>{
    wx.request({
      ...params,
      success:(result)=>{
        resolve(result);
      },
      fail:(err)=>{
        reject(err);
      }
    })
  })
}