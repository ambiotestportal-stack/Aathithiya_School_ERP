
const mongoose = require('mongoose');
const url = process.argv[2] === 'local' ? 'mongodb://localhost:27017/school-erp' : 'mongodb+srv://developerhariharan2002:X4TXX4oJvN1x7p2x@cluster0.3hif0.mongodb.net/school-erp?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(url)
  .then(async () => {
    const db = mongoose.connection.useDb('school-erp');
    const user = await db.collection('users').find({ $or: [{ name: /hariharank/i }, { username: /hariharank/i }] }).toArray();
    console.log(JSON.stringify(user, null, 2));
    process.exit(0);
  });

