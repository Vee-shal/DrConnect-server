import { Request, Response } from "express";
import prisma from "../config/db.js";

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { offlinePrice, onlinePrice, email } = req.body;

    const existingUser = await prisma.user.findFirst({ where: { email } });
       if (!existingUser) {
      return res.status(400).json({
        success: false,
        message: "User not found with the given email",
      });
    }

    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        ...existingUser,
        offlinePrice,
        onlinePrice,
      },
    });

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: { updatedUser },
      status: 200,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Something went wrong", error });
  }
};
