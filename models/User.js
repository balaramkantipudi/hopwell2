// Update the User model to include fields for Google authentication
const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ],
  },
  password: {
    type: String,
    minlength: 6,
    select: false,
  },
  image: {
    type: String,
  },
  resetToken: String,
  resetTokenExpiry: Date,
  googleId: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
// import mongoose from 'mongoose';

// const UserSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: [true, 'Please provide a name'],
//     trim: true,
//   },
//   email: {
//     type: String,
//     required: [true, 'Please provide an email'],
//     unique: true,
//     trim: true,
//     lowercase: true,
//     match: [
//       /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
//       'Please provide a valid email'
//     ],
//   },
//   password: {
//     type: String,
//     required: [true, 'Please provide a password'],
//     minlength: 6,
//     select: false,
//   },
//   image: {
//     type: String,
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
//   trips: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Trip'
//   }]
// });

// // If the User model is already defined, don't redefine it
// const User = mongoose.models.User || mongoose.model('User', UserSchema);

// export default User;