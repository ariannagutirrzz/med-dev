import type { Request, Response } from "express";
import { query } from "../db";

export class UserController {
  static getAllUsers = async (req: Request, res: Response) => {
    try {
      const result = await query(
        `SELECT name, title, credentials, experience, description, image 
                    FROM users
                    ORDER BY name`
      );

      res.json({
        users: result.rows,
        message: "Users fetched successfully",
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  static getUsersByRole = async (req: Request, res: Response) => {
    try {
      const result = await query(
        `SELECT name, title, credentials, experience, description, image 
                    FROM users 
                    WHERE role = 'Médico' AND title IS NOT NULL
                    ORDER BY name`
      );

      res.json({
        medicos: result.rows,
        message: "Medicos fetched successfully",
      });
    } catch (error) {
      console.error("Error fetching medicos:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
}
