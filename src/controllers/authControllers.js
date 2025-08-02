import prisma from "../config/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

export const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phone_number,
      specialization,
      experience,
      licence,
      certificate,
    } = req.body;

    //Validation
    if (!name || !email || !phone_number || !password || !role) {
      return res.status(400).json({ message: "Required Fields are missing!" });
    }

    //check user exist or not
    const existingUser = await prisma.User.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ message: "User Already Exist." });
    }
    ///hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create User in DB
    const user = await prisma.User.create({
      data: {
        name,
        email,
        phone_number,
        password: hashedPassword,
        role,
        specialization: role === "doctor" ? specialization : null,
        experience: role === "doctor" ? experience : null,
        licence: role === "doctor" ? licence : null,
        certificate: role === "doctor" ? certificate : null,
      },
    });

    //JWT Token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expires: "7d" }
    );
    //success message

    res.status(200).json({
      message: "User Registered Successfully!",
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        email: user.email,
        phone_number: user.phone_number,
        specialization: user.specialization,
        experience: user.experience,
        licence: user.licence,
        certificate: user.certificate,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};
