const { Schema, model } = require("mongoose");

const employerSchema = model(
  {
    name: {
      type: String,
      required: true,
      maxLength: 50,
      minLength: 3,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    },
    password: {
      type: String,
      required: true,
      minLength: 6,
      maxLength: 100,
    },
  },
  { timestamps: true }
);

const Employer = model("Employer", employerSchema);
module.exports = Employer;
