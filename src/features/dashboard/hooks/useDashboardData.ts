import { useCallback, useEffect, useState } from "react"
import { toast } from "react-toastify"
import { useAuth } from "../../auth"
import { fetchDashboardData } from "../services/dashboardDataService"
import type { DashboardDataResult } from "../services/dashboardDataService"

export const useDashboardData = () => {
	const { user } = useAuth()
	const [loading, setLoading] = useState(true)
	const [data, setData] = useState<DashboardDataResult | null>(null)

	const loadData = useCallback(async () => {
		setLoading(true)
		try {
			const result = await fetchDashboardData(
				user?.role,
				user?.document_id,
			)
			setData(result)
		} catch (error) {
			console.error("Error cargando datos del dashboard:", error)
			toast.error("Error al cargar los datos del dashboard")
		} finally {
			setLoading(false)
		}
	}, [user?.role, user?.document_id])

	useEffect(() => {
		loadData()
	}, [loadData])

	return {
		data,
		loading,
		refetch: loadData,
	}
}
