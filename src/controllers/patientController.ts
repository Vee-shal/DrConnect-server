import { Request, Response } from "express";

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getPatients = async (
  req: Request,
  res: Response
) => {
res.json({
    name : "manoj"
})
}