import mongoose from 'mongoose';

const conn = await mongoose.connect('mongodb+srv://namansurana32_db_user:PMIq1uGFh8J3RehL@cluster0.afmsrhz.mongodb.net/habittracker?retryWrites=true&w=majority');

const userSchema = new mongoose.Schema({
  email: String,
  username: String,
  password: String,
  createdAt: Date,
  updatedAt: Date
}, {collection: 'users'});

const User = mongoose.model('User', userSchema);

// Delete the new account with username "naman" (lowercase)
const result = await User.deleteOne({username: 'naman'});
console.log('Deleted new account:', result);

// Show remaining accounts
const remaining = await User.find({email: 'namansurana32@gmail.com'}, {password: 0});
console.log('Remaining accounts:', remaining);

process.exit(0);
