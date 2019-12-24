var client = require('./lib/oracle-client').connect('http://localhost:3000');

client
  .connect({
  	"user": "readonly",
  	"password": "readonly",
  	"host": "81.170.239.83",
  	"database": "RATOR"
  })
  .then(conn => conn.execute('SELECT * FROM USERS')
    .then(res => console.log(res.length) || conn))
  .then(conn => conn.execute('SELECT * FROM USERS', null, {maxRows: 1000})
    .then(res => console.log(res.length) || conn))
  .then(conn => conn.close())
  .then(() => {
    console.log('DONE');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
