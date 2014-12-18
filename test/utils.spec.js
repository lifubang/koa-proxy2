var should = require('should');
var utils = require('../utils/utils.js');
var koa = require('koa');
var koaBody = require('koa-body');
var supertest = require('supertest');
var resolvePath = utils.resolvePath;

describe('resolvePath function', function () {
  var map;

  before(function () {
    map = {
      '/love': 'http://localhost',
      '=/nodejs': 'http://localhost',
      '~/story': 'http://localhost',
      '~*/article': 'http://localhost',
      '/swift': 'http://localhost/'
    };
  });

  it('should resolve normal style', function () {
    var path1 = '/love';
    var path2 = '/loves';
    var result1 = resolvePath(path1, map);
    var result2 = resolvePath(path2, map);
    result1.should.equal('http://localhost/love');
    result2.should.be.false;
  });

  it('should resolve equal sign style', function () {
    var path1 = '/nodejs';
    var path2 = '/nodejs/';
    var result1 = resolvePath(path1, map);
    var result2 = resolvePath(path2, map);
    result1.should.equal('http://localhost/nodejs');
    result2.should.be.false;
  });

  it('should resolve tilde style', function () {
    var path1 = '/story-is-colorful';
    var path2 = '/Story-is-colorful';
    var result1 = resolvePath(path1, map);
    var result2 = resolvePath(path2, map);
    result1.should.equal('http://localhost/story-is-colorful');
    result2.should.be.false;
  });

  it('should resolve tilde asterisk style', function () {
    var path1 = '/article-is-colorful';
    var path2 = '/ARTICLE-is-colorful';
    var result1 = resolvePath(path1, map);
    var result2 = resolvePath(path2, map);
    result1.should.equal('http://localhost/article-is-colorful');
    result2.should.equal('http://localhost/ARTICLE-is-colorful');
  });

  it('should resolve given slash style', function () {
    var path1 = '/swift';
    var result1 = resolvePath(path1, map);
    result1.should.equal('http://localhost/');
  });

  after(function () {
    map = null;
  });
});

describe('utils resolve body', function () {
  var app, request;
  beforeEach(function () {
    app = koa();
    app.use(koaBody());
    app.use(function *() {
      this.body = utils.resolveBody(this.request);
    })
  });

  beforeEach(function () {
    request = supertest(app.callback());
  });

  it('should resolve false related body', function (done) {
    request
      .post('/')
      .expect('')
      .end(done);
  });

  it('should resolve json body', function (done) {
    request
      .post('/')
      .send({title: 'story'})
      .expect({"title":"story"})
      .end(done);
  });

  it('should resolve form body', function (done) {
    request
      .post('/')
      .send('title=story&category=education')
      .expect('title=story&category=education')
      .end(done);
  });
});

describe('utils serialize', function () {
  var origin = {
    "title": "story",
    "category": "education"
  };
  var compare = ["hello"];

  it('should resolve object', function () {
    var result = utils.serialize(origin);
    result.should.equal('title=story&category=education');
  });

  it('should never resolve non-object', function() {
    var result = utils.serialize(compare);
    result.should.equal('');
  })
});