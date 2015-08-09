#!/usr/bin/env node

var prompt = require('prompt')
var GitHubApi = require('github')

prompt.start()

var github = new GitHubApi({
  version: '3.0.0',
  timeout: 5000
})

function getAllFollowing (user, callback) {
  var users = []
  function traverse (err, res) {
    if (err) return callback(err)
    users = users.concat(res)

    if (github.hasNextPage(res)) {
      github.getNextPage(res, traverse)
    } else {
      callback(null, users)
    }
  }
  github.user.getFollowingFromUser({ user: user }, traverse)
}

prompt.get([{
  name: 'username',
  message: 'Your username'
}, {
  name: 'password',
  message: 'Your password (will be hidden)',
  hidden: true
}], function (err, credentials) {
  if (err) throw err

  github.authenticate({
    type: 'basic',
    username: credentials.username,
    password: credentials.password
  })

  getAllFollowing(credentials.username, function (err, following) {
    if (err) {
      console.error('Could not fetch the users that you are following')
      throw err
    }
    following.map(function (user) {
      return user.login
    }).forEach(function (username, i, usernames) {
      github.user.unFollowUser({ user: username }, function (err, resp) {
        if (err) {
          return console.error('Failed to unfollow', username, err)
        }
        console.log('Unfollowed', username)
      })
    })
  })
})
