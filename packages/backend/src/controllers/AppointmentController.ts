import type { Request, Response } from "express";
import { query } from "../db";

const allowedStatuses = ["pending", "scheduled", "cancelled", "completed"];

export class AppointmentController {
  // 1. Create a new appointment
  static createAppointment = async (req: Request, res: Response) => {
    const {
      patient_id: bodyPatientId,
      doctor_id: bodyDoctorId,
      appointment_date,
      status,
      notes,
    } = req.body;
    const { document_id: userId, role } = req.user!;

    let patient_id: string;
    let doctor_id: string;

    // Logic to switch ID assignment based on Role
    if (role === "Médico") {
      doctor_id = userId;
      patient_id = bodyPatientId; // Doctor must specify which patient this is for
      if (!patient_id)
        return res
          .status(400)
          .json({ error: "patient_id is required for doctors." });
    } else {
      patient_id = userId;
      doctor_id = bodyDoctorId; // Patient must specify which doctor they are booking
      if (!doctor_id)
        return res
          .status(400)
          .json({ error: "doctor_id is required for patients." });
    }

    if (!appointment_date || !status) {
      return res.status(400).json({
        error:
          "Missing required fields: appointment_date and status are mandatory.",
      });
    }

    if (!allowedStatuses.includes(status.toLowerCase())) {
      return res.status(400).json({
        error: `Invalid status. Allowed: ${allowedStatuses.join(", ")}`,
      });
    }

    const parsedDate = new Date(appointment_date);
    if (isNaN(parsedDate.getTime())) {
      return res
        .status(400)
        .json({ error: "Invalid date-time format. Use YYYY-MM-DD HH:MM:SS" });
    }

    try {
      const result = await query(
        `INSERT INTO appointments (patient_id, doctor_id, appointment_date, status, notes) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING *,
         TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at, 
         TO_CHAR(updated_at, 'YYYY-MM-DD HH24:MI:SS') as updated_at`,
        [
          patient_id,
          doctor_id,
          appointment_date,
          status.toLowerCase(),
          notes || null,
        ]
      );

      res.status(201).json({
        appointment: result.rows[0],
        message: "Appointment created successfully",
      });
    } catch (error) {
      console.error("Error making appointment:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  // 2. Get all appointments (Filtered by whichever role the user has)
  static getAllAppointments = async (req: Request, res: Response) => {
    const { document_id: userId, role } = req.user!;

    // If I'm a doctor, filter by doctor_id. If I'm a patient, filter by patient_id.
    const filterColumn = role === "Médico" ? "a.doctor_id" : "a.patient_id";
    const joinTable =
      role === "Médico" ? "u.name as patient_name" : "u.name as doctor_name";
    const joinOn =
      role === "Médico"
        ? "a.patient_id = u.document_id"
        : "a.doctor_id = u.document_id";

    try {
      const result = await query(
        `SELECT a.*, ${joinTable}
         FROM appointments a
         LEFT JOIN users u ON ${joinOn}
         WHERE ${filterColumn} = $1 
         ORDER BY a.appointment_date DESC`,
        [userId]
      );

      res.json({
        appointments: result.rows,
        message: "Appointments fetched successfully",
      });
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  // 3. Get a specific appointment by ID (Secured for both roles)
  static getAppointmentById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { document_id: userId, role } = req.user!;

    // Determine if we should check the ID against the doctor_id or patient_id column
    const roleConstraint = role === "Médico" ? "doctor_id" : "patient_id";

    try {
      const result = await query(
        `SELECT a.* 
       FROM appointments a
       LEFT JOIN users u ON (
         CASE 
           WHEN $2 = 'Médico' THEN a.patient_id = u.document_id 
           ELSE a.doctor_id = u.document_id 
         END
       )
       WHERE a.id = $1 AND a.${roleConstraint} = $3`,
        [id, role, userId]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({
          error:
            "Appointment not found or you do not have permission to view it.",
        });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error fetching appointment:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  // 4. Update an appointment
  static updateAppointment = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { document_id: userId, role } = req.user!;
    const updates = req.body;

    const allowedFields = ["appointment_date", "status", "notes"];
    const allowedStatuses = ["pending", "scheduled", "cancelled", "completed"];

    // 1. Identify which fields the user is trying to update
    const keys = Object.keys(updates).filter((key) =>
      allowedFields.includes(key)
    );

    if (keys.length === 0)
      return res.status(400).json({ error: "No valid fields provided" });

    // 2. NEW LOGIC: Field-Level Authorization
    // Check if 'status' is being updated by someone who is NOT a Médico
    if (keys.includes("status") && role !== "Médico") {
      return res.status(403).json({
        error:
          "Only doctors (Médicos) are authorized to update the appointment status.",
      });
    }

    // 3. Validation Loop
    for (const key of keys) {
      const value = updates[key];

      // Prevent empty mandatory fields
      if (key !== "notes" && (value === "" || value === null)) {
        return res
          .status(400)
          .json({ error: `Field '${key}' cannot be empty.` });
      }
      // Validate timedate value
      if (key === "appointment_date") {
        if (isNaN(new Date(value).getTime())) {
          return res.status(400).json({ error: "Invalid date-time format." });
        }
      }

      // Validate status values
      if (key === "status") {
        if (!allowedStatuses.includes(value.toLowerCase())) {
          return res.status(400).json({ error: "Invalid status value." });
        }
      }
    }

    // 4. Prepare SQL Query
    const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(", ");
    const values = keys.map((key) =>
      key === "status" ? updates[key].toLowerCase() : updates[key]
    );

    const idPos = values.length + 1;
    const userIdPos = values.length + 2;
    values.push(id, userId);

    // Security constraint to ensure users only edit their OWN appointments
    const roleConstraint = role === "Médico" ? "doctor_id" : "patient_id";

    try {
      const result = await query(
        `UPDATE appointments 
       SET ${setClause}
       WHERE id = $${idPos} AND ${roleConstraint} = $${userIdPos}
       RETURNING *,
       TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at, 
       TO_CHAR(updated_at, 'YYYY-MM-DD HH24:MI:SS') as updated_at`,
        values
      );

      if (result.rowCount === 0)
        return res
          .status(404)
          .json({ error: "Appointment not found or unauthorized" });

      res.json({
        appointment: result.rows[0],
        message: "Appointment updated successfully",
      });
    } catch (error) {
      console.error("Error updating appointment:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  // 5. Delete remains restricted to Doctors (as per your request)
  static deleteAppointment = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { document_id: userId, role } = req.user!;

    if (role !== "Médico") {
      return res
        .status(403)
        .json({ error: "Only doctors are authorized to delete appointments." });
    }

    try {
      const result = await query(
        `DELETE FROM appointments WHERE id = $1 AND doctor_id = $2`,
        [id, userId]
      );

      if (result.rowCount === 0)
        return res.status(404).json({ error: "Appointment not found" });
      res.json({ message: "Appointment deleted successfully" });
    } catch (error) {
      console.error("Error deleting appointment:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
}
