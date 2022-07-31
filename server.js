const mongoose =  require('mongoose');
const dotenv = require('dotenv');
dotenv.config({path:'./config.env'});

process.on('uncaughtException', err=> {
  process.exit(1);
})

const app = require('./app')

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
  //'123'
);

mongoose
  .connect(DB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false
  })
  .then(() =>  console.log('DB connection successful'));



// Start server
const port = process.env.PORT || 8000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

process.on('unhandledRejection', err => {
  // console.log("Error occured");
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION! Shutting down...!');

  // Abrupt way of shutting down
  // Closed Immediately
  // process.exit(1);

  // Lets shutdown gracefully
  server.close(()=>{
    process.exit(1);
  })
})




//console.log(x);






