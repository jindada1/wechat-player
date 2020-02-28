import {
  fetch
} from './fetch.js'


export function search(platform, type, keyword, page = 0) {
  return fetch({
    url: `/${platform}/${type}`,
    method: 'get',
    data: {
      keyword,
      page
    }
  })
}


export function getMV(platform, mvid) {
  return fetch({
    url: `/${platform}/uri/mv`,
    method: 'GET',
    data: {
      mvid
    }
  })
}

export function getComment(platform, idforcomments, type, page = 0) {
  return fetch({
    url: `/${platform}/comments/${type}`,
    method: 'GET',
    data: {
      idforcomments,
      page
    }
  })
}

export function userLists(platform, user) {
  return fetch({
    url: `/${platform}/user/songlists`,
    method: 'get',
    data: {
      user
    }
  })
}

export function userLoved(username) {
  return fetch({
    url: '/user/loved/songs',
    method: 'get',
    data: {
      username
    }
  })
}

export function songsInList(platform, dissid, page) {
  return fetch({
    url: `/${platform}/songs/songlist`,
    method: 'get',
    data: {
      dissid,
      page
    }
  })
}

export function getSongUrl(platform, idforres) {
  return fetch({
    url: `/${platform}/uri/song`,
    method: 'GET',
    data: {
      idforres
    }
  })
}

export function extractAudio(data) {
  return fetch({
    url: '/extract',
    method: 'POST',
    data
  })
}

export function startdownload(data) {
  return fetch({
    url: '/download',
    method: 'POST',
    data
  })
}

export function downloadProgress(re_path) {
  return fetch({
    url: '/download/progress',
    method: 'GET',
    data: {
      re_path
    }
  })
}

export function findAudio(name) {
  return fetch({
    url: '/audio',
    method: 'GET',
    data: {
      name
    }
  })
}

export function signIn(data) {
  return fetch({
    url: '/login',
    method: 'POST',
    data
  })
}

export function signUp(data) {
  return fetch({
    url: '/sign',
    method: 'POST',
    data
  })
}

export function updateUser(data) {
  return fetch({
    url: '/user/info/update',
    method: 'POST',
    data
  })
}

/**
 * data = {
 *     username: this.loginsign.name,
 *     songid: song.platform + song.idforres,
 *     info_str: JSON.stringify(song),
 * }
 */
export function loveSong(data) {
  return fetch({
    url: '/user/love/song',
    method: 'POST',
    data
  })
}

/**
 * data = {
 *     username: this.loginsign.name,
 *     songid: song.platform + song.idforres
 * }
 */
export function hateSong(data) {
  return fetch({
    url: '/user/hate/song',
    method: 'POST',
    data
  })
}

export function getLyric(url) {
  return fetch({
    url,
    method: 'GET'
  })
}