import type { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"
import { query } from "../db"
import type { User } from "../types"

declare global {
	namespace Express {
		interface Request {
			user?: User
		}
	}
}

export const authenticate = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const bearer = req.headers.authorization
	if (!bearer) {
		const error = new Error("No Autorizado")
		return res.status(401).json({ error: error.message })
	}

	const token = bearer.split(" ")[1]

	const secret = process.env.JWT_SECRET

	if (!secret) {
		throw new Error("JWT_SECRET is not defined in environment variables")
	}

	try {
		const decoded = jwt.verify(token, secret)

		if (typeof decoded === "object" && decoded.id) {
			const result = await query(`SELECT email, name, role, document_id 
                    FROM users
                    WHERE document_id = '${decoded.id}'`)
			const user: User = result.rows[0]
			if (user) {
				req.user = user
				next()
			} else {
				res.status(500).json({ error: "Token no válido" })
			}
		}
	} catch (error) {
		console.error(error)
		return res.status(500).json({ error: "Token no válido" })
	}
}
