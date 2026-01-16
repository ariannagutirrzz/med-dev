import type { NextFunction, Request, Response } from "express"

export const isMedic = (req: Request, res: Response, next: NextFunction) => {
	// Access the user object attached by your 'authenticate' middleware
	const user = req.user
	console.log(user)

	// 1. Check if user exists (Safety check)
	if (!user) {
		return res.status(401).json({ error: "Unauthorized: No user found" })
	}

	// 2. Strict check for the "Medicos" role
	if (user.role === "Médico") {
		next() // User has the role, proceed to the controller
	} else {
		res.status(403).json({
			error: "Forbidden: This area is restricted to Medical staff only",
		})
	}
}
