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
		return res.status(401).json({ error: "No Autorizado" })
	}

	const token = bearer.split(" ")[1]
	if (!token) {
		return res.status(401).json({ error: "Token no proporcionado" })
	}

	const secret = process.env.JWT_SECRET
	if (!secret) {
		throw new Error("JWT_SECRET is not defined in environment variables")
	}

	try {
		const decoded = jwt.verify(token, secret)

		if (typeof decoded !== "object" || !decoded || !("id" in decoded)) {
			return res.status(401).json({ error: "Token no válido" })
		}

		const idValue = (decoded as { id: string | number }).id
		if (!idValue) {
			return res.status(401).json({ error: "Token no válido" })
		}

		const idString = String(idValue)
		const parsedId = parseInt(idString, 10)
		const isNumeric = !Number.isNaN(parsedId) && parsedId > 0 && String(parsedId) === idString
		
		let result: { rows: User[] }
		if (isNumeric) {
			result = await query(
				`SELECT id, email, name, role, document_id 
                FROM users
                WHERE id = $1`,
				[parsedId]
			)
		} else {
			result = await query(
				`SELECT id, email, name, role, document_id 
                FROM users
                WHERE document_id = $1`,
				[idString]
			)
		}
		
		const user: User = result.rows[0]
		if (user) {
			req.user = user
			next()
		} else {
			return res.status(401).json({ error: "Token no válido" })
		}
	} catch (error: unknown) {
		if (error instanceof Error) {
			if (error.name === "JsonWebTokenError") {
				return res.status(401).json({ error: "Token no válido" })
			}
			if (error.name === "TokenExpiredError") {
				return res.status(401).json({ error: "Token expirado" })
			}
		}
		return res.status(401).json({ error: "Token no válido" })
	}
}
