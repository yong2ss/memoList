const express = require('express');
const app = express();
const https = require('https');
const fs = require('fs');
const path = require('path');           
const api = require('./routes/index');
const bodyParser = require('body-parser');
const mysql = require('./db/db_config');
const port = 1001;

// 폴더 경로 설정.
const view_dist = path.join(__dirname, '..', './client/views');
const public = path.join(__dirname, '..', './client');


// 서버가 읽을 수 있도록 HTML 의 위치를 정의해줍니다.  
app.set('views', view_dist);
app.use(express.static(public));

// 서버가 HTML 렌더링을 할 때, EJS엔진을 사용하도록 설정합니다. 
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

// Json Body Parser
app.use(bodyParser.urlencoded({ extended: true })); // 웹에서 API Call
app.use(express.json());                            // 나중에 앱에서 API Call 할때.
app.use('/', api);                                  // 라우터 경로 세팅

// DB 세팅.
mysql.open(mysql.init());

/* use session */
// app.use(session({
//     secret: 'CodeLab1$1$234',
//     resave: false,
//     saveUninitialized: true
// }));


// Handle Error
// app.use(function (err, req, res, next) {
//     console.error(err.stack);
//     res.status(500).send('Something broke!');
// });


// Server Start.. && SSL 세팅.
https.createServer({
    key: fs.readFileSync('./ssl/privkey.pem'),
    cert: fs.readFileSync('./ssl/cert.pem'),
    ca: fs.readFileSync('./ssl/chain.pem')
},app).listen(port,() => {
    console.log('Https Server Start, Port: ' + port);
});

// redirect http -> https
const http = require('http');
const httpApp = express();
const httpPort = 100;
httpApp.all('*',(req,res,next) => {
    res.redirect('https://' + req.hostname + ':' + port);
});
http.createServer(httpApp).listen(httpPort,() => {
    console.log('Http Server Start, Port: ' + httpPort);
});
