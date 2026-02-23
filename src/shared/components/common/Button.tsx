import { Button as AntButton } from "antd"
import type { ButtonProps as AntButtonProps } from "antd"
import type { ReactNode } from "react"

export type ButtonVariant = "primary" | "default" | "dashed" | "link" | "text"
export type ButtonSize = "small" | "middle" | "large"

export interface ButtonProps extends Omit<AntButtonProps, "type"> {
	/** Button style variant (antd: primary, default, dashed, link, text) */
	variant?: ButtonVariant
	/** Legacy: use children instead. If provided, used as button content. */
	text?: string
	/** Content of the button (use this or `text`) */
	children?: ReactNode
	/** Size: small, middle, large */
	size?: ButtonSize
	/** Show loading spinner */
	loading?: boolean
	/** Destructive action (red) */
	danger?: boolean
	/** Disabled state */
	disabled?: boolean
	/** Icon before children */
	icon?: ReactNode
	/** Full width (e.g. for forms) */
	block?: boolean
	/** Native button type when used inside a form */
	type?: "button" | "submit" | "reset"
	/** Click handler */
	onClick?: (e: React.MouseEvent<HTMLElement>) => void
	/** Extra class names */
	className?: string
}

/**
 * Reusable app button. Uses Ant Design Button under the hood so it respects
 * ConfigProvider theme (e.g. colorPrimary). Use this everywhere for consistency.
 *
 * @example
 * <Button>Guardar</Button>
 * <Button variant="default" onClick={handleCancel}>Cancelar</Button>
 * <Button type="submit" loading={saving} block>Enviar</Button>
 * <Button variant="text" icon={<FaEdit />}>Editar</Button>
 */
const Button = ({
	text,
	children,
	variant = "primary",
	size = "large",
	loading = false,
	danger = false,
	disabled = false,
	block = false,
	type = "button",
	icon,
	className = "",
	...rest
}: ButtonProps) => {
	const content = text ?? children
	const isIconOnly = variant === "text" || variant === "link"
	const baseHeightClass = isIconOnly ? "" : "min-h-12"

	return (
		<AntButton
			type={variant}
			size={size}
			loading={loading}
			danger={danger}
			disabled={disabled}
			block={block}
			htmlType={type}
			icon={icon}
			className={baseHeightClass ? `${baseHeightClass} ${className}` : className}
			{...rest}
		>
			{content}
		</AntButton>
	)
}

export default Button
