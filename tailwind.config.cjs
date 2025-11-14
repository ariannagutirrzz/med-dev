/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx,html}"],
	theme: {
		extend: {
			colors: {
				accent: "#789a61",
				"accent-2": "#6aa6b8",
				muted: "#7b8b87",
				bg: "#f6fbfb",
			},
			fontFamily: {
				sans: [
					"Inter",
					"system-ui",
					"-apple-system",
					"Segoe UI",
					"Roboto",
					"Helvetica Neue",
					"Arial",
				],
			},
		},
	},
	plugins: [],
}
