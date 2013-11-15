/**
 * HTTP
 * 
 * @author furuya_kaoru
 */
var log4js = require('log4js');
var logger = log4js.getLogger();
var express = require('express');

var store = require('../store/memory.js');

function HttpInterface() {
    
}

module.exports = new HttpInterface();

HttpInterface.prototype.setup = function(option, callback) {
    var app = express();
    app.configure(function() {
        app.use(express.bodyParser());
    });
    
    //Controller �o�^
    app.get('/data', function(req, res){
        store.list('', function(err, data) {
            if (err) {
                res.json(500, {
                    'errorCode' : 'serverError',
                    'message' : err
                });
                return;
            }
            res.json(200, data);
        })
    });
    app.get('/data/:dataName', function(req, res){
        store.list(store.createKey(req.params.dataName), function(err, data) {
            if (err) {
                res.json(500, {
                    'errorCode' : 'serverError',
                    'message' : err
                });
                return;
            }
            res.json(200, data);
        })
    });
    app.get('/data/:dataName/:key', function(req, res){
        switch (req.query.type) {
        case 'startWith':
            store.list(store.createKey(req.params.dataName, req.params.key), function(err, data) {
                if (err) {
                    res.json(500, {
                        'errorCode' : 'serverError',
                        'message' : err
                    });
                    return;
                }
                res.json(200, data);
            });
            break;
        default:
            store.get(store.createKey(req.params.dataName, req.params.key), function(err, data) {
                if (err) {
                    res.json(500, {
                        'errorCode' : 'serverError',
                        'message' : err
                    });
                    return;
                }
                if (!data) {
                    res.json(404, {
                        'errorCode' : 'notFound',
                        'message' : 'data is not found. dataName = ' + req.params.dataName + ' key = ' + req.params.key
                    });
                    return;
                }
                res.json(200, data);
            });
            break;
        }
    });
    app.post('/data/:dataName/:key', function(req, res){
        var json = req.body.json;
        if (!json || !req.params.dataName || !req.params.key) {
            res.json(400, {
                'errorCode' : 'badRequest',
                'message' : 'request params is invalid. dataName = ' + req.params.dataName + ' key = ' + req.params.key + ' json = ' + json
            });
        }
        
        store.set(store.createKey(req.params.dataName, req.params.key), json);
        res.json(200, { 'status' : 'ok'});
    });
    app.delete('/data/:dataName/:key', function(req, res){
        if (!req.params.dataName || !req.params.key) {
            res.json(400, {
                'errorCode' : 'badRequest',
                'message' : 'request params is invalid. dataName = ' + req.params.dataName + ' key = ' + req.params.key
            });
        }
        
        store.del(store.createKey(req.params.dataName, req.params.key));
        res.json(200, { 'status' : 'ok'});
    });

    app.listen(8080);
    callback && callback();
    
    logger.info('HttpInterface is setuped.');
}
