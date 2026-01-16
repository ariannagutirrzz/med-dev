import jwt from "jsonwebtoken"

type UserPayload = {
	id: string
}

const secret = process.env.JWT_SECRET

if (!secret) {
	throw new Error("JWT_SECRET is not defined in environment variables")
}

export function generateJWT(payload: UserPayload) {
	if (!secret) {
		throw new Error("JWT_SECRET is not defined in environment variables")
	}

	const token = jwt.sign(payload, secret, {
		expiresIn: "180d",
	})
	return token
}
