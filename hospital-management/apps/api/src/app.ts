import express from "express";
import cors from "cors";
import path from "path";

import authRoutes from "./modules/auth/auth.routes";
import auditRoutes from "./modules/audit-log/aud.routes";
import hospitalRoutes from "./modules/hospital/hs.routes";
import departmentRoutes from "./modules/department/dpt.routes";
import specializationRoutes from "./modules/specialization/spc.routes";
import doctorRoutes from "./modules/doctor/doc.routes";
import patientRoutes from "./modules/patient/pat.routes";
import appointmentRoutes from "./modules/appointment/apt.routes";
import doctorHospitalRoutes from "./modules/doctorHospital/dh.routes";
import doctorDepartmentAssignmentRoutes from "./modules/doctorDepartmentAssignment/dda.routes";
import encounterRoutes from "./modules/encounter/enc.routes";
import vitalRoutes from "./modules/vitals/vit.routes";
import diagnosisRoutes from "./modules/diagnosis/dia.routes";
import clinicalNoteRoutes from "./modules/clinical-note/cn.routes";
import prescriptionRoutes from "./modules/prescription/psc.routes";
import medicineRoutes from "./modules/medicine/med.routes";
import diagnosticOrderRoutes from "./modules/diagnostic-order/dgo.routes";
import diagnosticTestRoutes from "./modules/diagnostictest/dgt.routes";
import labResultRoutes from "./modules/lab-result/lbr.routes";
import imagingReportRoutes from "./modules/imaging-report/imr.routes";
import medicineDispenseRoutes from "./modules/medicine-dispense/pmd.routes";
import medicineStockRoutes from "./modules/medicine-stock/mds.routes";
import billingRoutes from "./modules/billing/bil.routes";
import paymentRoutes from "./modules/payment/pay.routes";
import userRoleRoutes from "./modules/user-role/ur.routes";
import roleRoutes from "./modules/role/role.routes";
import rolePermissionRoutes from "./modules/role-permission/rp.routes";
import permissionRoutes from "./modules/permission/per.routes";
import wardRoutes from "./modules/ward/ward.routes";
import roomRoutes from "./modules/room/room.routes";
import bedRoutes from "./modules/bed/bed.routes";
import admissionRoutes from "./modules/admission/adm.routes";
import bedAllocationRoutes from "./modules/bed-allocation/ba.routes";
import procedureRoutes from "./modules/procedure/pcd.routes";
import hospitalProcedureRoutes from "./modules/hospital-procedure/hpcd.routes";
import procedureOrderRoutes from "./modules/procedure-order/pod.routes";
import procedureStaffAssignmentRoutes from "./modules/procedure-staff-assignment/psa.routes";
import dischargeSummaryRoutes from "./modules/discharge-summary/ds.routes";
import doctorScheduleRoutes from "./modules/doctor-schedule/ds.routes";
import doctorLeaveRoutes from "./modules/doctor-leave/dl.routes";
import treatmentPlanRoutes from "./modules/treatment-plan/tp.routes";
import allergyRoutes from "./modules/allergy/alg.routes";
import medicationHistoryRoutes from "./modules/medication-history/mth.routes";
import vaccinationRoutes from "./modules/vaccination/vac.routes";
import familyHistoryRoutes from "./modules/family-history/fh.routes";

const app = express();

app.use(cors());
app.use(express.json());
app.use(
  "/uploads",
  express.static(
    path.join(process.cwd(), "uploads")
  )
);
app.use(express.urlencoded({ extended: true }));


app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Hospital API is running",
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/audit-logs", auditRoutes);
app.use("/api/v1/hospitals", hospitalRoutes);
app.use("/api/v1", departmentRoutes);
app.use("/api/v1", specializationRoutes);
app.use("/api/v1", doctorRoutes);
app.use("/api/v1", patientRoutes);
app.use("/api/v1", appointmentRoutes);
app.use("/api/v1", doctorHospitalRoutes);
app.use("/api/v1",doctorDepartmentAssignmentRoutes);
app.use("/api/v1", encounterRoutes);
app.use("/api/v1", vitalRoutes);
app.use("/api/v1", diagnosisRoutes);
app.use("/api/v1", clinicalNoteRoutes);
app.use("/api/v1", prescriptionRoutes);
app.use("/api/v1", medicineRoutes);
app.use("/api/v1", diagnosticTestRoutes);
app.use("/api/v1", diagnosticOrderRoutes);
app.use("/api/v1", labResultRoutes);
app.use("/api/v1", imagingReportRoutes);
app.use("/api/v1", medicineDispenseRoutes);
app.use("/api/v1", medicineStockRoutes);
app.use("/api/v1", billingRoutes);
app.use("/api/v1", paymentRoutes);
app.use("/api/v1/user-roles", userRoleRoutes);
app.use("/api/v1/roles", roleRoutes);
app.use("/api/v1/role-permissions", rolePermissionRoutes);
app.use("/api/v1/permissions", permissionRoutes);
app.use("/api/v1/wards", wardRoutes);
app.use("/api/v1/rooms", roomRoutes);
app.use("/api/v1/beds", bedRoutes);
app.use("/api/v1/admissions", admissionRoutes);
app.use("/api/v1/bed-allocations", bedAllocationRoutes);
app.use("/api/v1/procedures", procedureRoutes);
app.use("/api/v1/hospital-procedures", hospitalProcedureRoutes);
app.use("/api/v1", procedureOrderRoutes);
app.use("/api/v1", procedureStaffAssignmentRoutes);
app.use("/api/v1/discharge-summaries", dischargeSummaryRoutes);
app.use("/api/v1/doctor-schedules", doctorScheduleRoutes);
app.use("/api/v1/doctor-leaves", doctorLeaveRoutes);
app.use("/api/v1/treatment-plans", treatmentPlanRoutes);
app.use("/api/v1", allergyRoutes);
app.use("/api/v1", medicationHistoryRoutes);
app.use("/api/v1", vaccinationRoutes);
app.use("/api/v1", familyHistoryRoutes);

export default app;