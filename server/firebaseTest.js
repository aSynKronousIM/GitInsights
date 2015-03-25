/**
 * Created by kate on 3/25/15.
 */
var Firebase = require('firebase');

var ref = new Firebase('https://gitinsights.firebaseio.com');

var list = ref.child("list");

list.set({
  candidate1: {
    github: 'barbbella',
    name: 'Kate Jefferson'
  },
  candidate2: {
    github: 'johnnygames',
    name: 'John Games'
  }
});