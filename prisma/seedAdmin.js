import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const createAdmin = async () => {
  try {
    const hashedPassword = await bcrypt.hash("admin@1105", 10);

    const admin = await prisma.user.create({
      data: {
        name: "Super Admin",
        email: "razashoaib2133@gmail.com",
        password: hashedPassword,
        role: "admin",
        phoneNumber: "8824678556",
        verified: true,
      },
    });

    console.log("Admin created:", admin);
  } catch (error) {
    console.error("Error creating admin:", error);
  } finally {
    await prisma.$disconnect();
  }
};

createAdmin();
