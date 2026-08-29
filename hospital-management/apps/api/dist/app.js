"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = require("./config/swagger");
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const aud_routes_1 = __importDefault(require("./modules/audit-log/aud.routes"));
const hs_routes_1 = __importDefault(require("./modules/hospital/hs.routes"));
const dpt_routes_1 = __importDefault(require("./modules/department/dpt.routes"));
const spc_routes_1 = __importDefault(require("./modules/specialization/spc.routes"));
const doc_routes_1 = __importDefault(require("./modules/doctor/doc.routes"));
const pat_routes_1 = __importDefault(require("./modules/patient/pat.routes"));
const apt_routes_1 = __importDefault(require("./modules/appointment/apt.routes"));
const dh_routes_1 = __importDefault(require("./modules/doctorHospital/dh.routes"));
const dda_routes_1 = __importDefault(require("./modules/doctorDepartmentAssignment/dda.routes"));
const enc_routes_1 = __importDefault(require("./modules/encounter/enc.routes"));
const vit_routes_1 = __importDefault(require("./modules/vitals/vit.routes"));
const dia_routes_1 = __importDefault(require("./modules/diagnosis/dia.routes"));
const cn_routes_1 = __importDefault(require("./modules/clinical-note/cn.routes"));
const psc_routes_1 = __importDefault(require("./modules/prescription/psc.routes"));
const med_routes_1 = __importDefault(require("./modules/medicine/med.routes"));
const dgo_routes_1 = __importDefault(require("./modules/diagnostic-order/dgo.routes"));
const dgt_routes_1 = __importDefault(require("./modules/diagnostictest/dgt.routes"));
const lbr_routes_1 = __importDefault(require("./modules/lab-result/lbr.routes"));
const imr_routes_1 = __importDefault(require("./modules/imaging-report/imr.routes"));
const pmd_routes_1 = __importDefault(require("./modules/medicine-dispense/pmd.routes"));
const mds_routes_1 = __importDefault(require("./modules/medicine-stock/mds.routes"));
const bil_routes_1 = __importDefault(require("./modules/billing/bil.routes"));
const pay_routes_1 = __importDefault(require("./modules/payment/pay.routes"));
const ur_routes_1 = __importDefault(require("./modules/user-role/ur.routes"));
const role_routes_1 = __importDefault(require("./modules/role/role.routes"));
const rp_routes_1 = __importDefault(require("./modules/role-permission/rp.routes"));
const per_routes_1 = __importDefault(require("./modules/permission/per.routes"));
const ward_routes_1 = __importDefault(require("./modules/ward/ward.routes"));
const room_routes_1 = __importDefault(require("./modules/room/room.routes"));
const bed_routes_1 = __importDefault(require("./modules/bed/bed.routes"));
const adm_routes_1 = __importDefault(require("./modules/admission/adm.routes"));
const ba_routes_1 = __importDefault(require("./modules/bed-allocation/ba.routes"));
const pcd_routes_1 = __importDefault(require("./modules/procedure/pcd.routes"));
const hpcd_routes_1 = __importDefault(require("./modules/hospital-procedure/hpcd.routes"));
const pod_routes_1 = __importDefault(require("./modules/procedure-order/pod.routes"));
const psa_routes_1 = __importDefault(require("./modules/procedure-staff-assignment/psa.routes"));
const ds_routes_1 = __importDefault(require("./modules/discharge-summary/ds.routes"));
const ds_routes_2 = __importDefault(require("./modules/doctor-schedule/ds.routes"));
const dl_routes_1 = __importDefault(require("./modules/doctor-leave/dl.routes"));
const tp_routes_1 = __importDefault(require("./modules/treatment-plan/tp.routes"));
const alg_routes_1 = __importDefault(require("./modules/allergy/alg.routes"));
const mth_routes_1 = __importDefault(require("./modules/medication-history/mth.routes"));
const vac_routes_1 = __importDefault(require("./modules/vaccination/vac.routes"));
const fh_routes_1 = __importDefault(require("./modules/family-history/fh.routes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/uploads", express_1.default.static(path_1.default.join(process.cwd(), "uploads")));
app.use(express_1.default.urlencoded({ extended: true }));
// Health Check
app.get("/health", (_req, res) => {
    res.status(200).json({
        success: true,
        message: "Hospital API is running",
    });
});
// Swagger API Documentation
app.use("/api/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec, {
    explorer: true,
    customSiteTitle: "MedCore Hospital API Docs",
}));
// Routes
app.use("/api/v1/auth", auth_routes_1.default);
app.use("/api/v1/audit-logs", aud_routes_1.default);
app.use("/api/v1/hospitals", hs_routes_1.default);
app.use("/api/v1", dpt_routes_1.default);
app.use("/api/v1", spc_routes_1.default);
app.use("/api/v1", doc_routes_1.default);
app.use("/api/v1", pat_routes_1.default);
app.use("/api/v1", apt_routes_1.default);
app.use("/api/v1", dh_routes_1.default);
app.use("/api/v1", dda_routes_1.default);
app.use("/api/v1", enc_routes_1.default);
app.use("/api/v1", vit_routes_1.default);
app.use("/api/v1", dia_routes_1.default);
app.use("/api/v1", cn_routes_1.default);
app.use("/api/v1", psc_routes_1.default);
app.use("/api/v1", med_routes_1.default);
app.use("/api/v1", dgt_routes_1.default);
app.use("/api/v1", dgo_routes_1.default);
app.use("/api/v1", lbr_routes_1.default);
app.use("/api/v1", imr_routes_1.default);
app.use("/api/v1", pmd_routes_1.default);
app.use("/api/v1", mds_routes_1.default);
app.use("/api/v1", bil_routes_1.default);
app.use("/api/v1", pay_routes_1.default);
app.use("/api/v1/user-roles", ur_routes_1.default);
app.use("/api/v1/roles", role_routes_1.default);
app.use("/api/v1/role-permissions", rp_routes_1.default);
app.use("/api/v1/permissions", per_routes_1.default);
app.use("/api/v1/wards", ward_routes_1.default);
app.use("/api/v1/rooms", room_routes_1.default);
app.use("/api/v1/beds", bed_routes_1.default);
app.use("/api/v1/admissions", adm_routes_1.default);
app.use("/api/v1/bed-allocations", ba_routes_1.default);
app.use("/api/v1/procedures", pcd_routes_1.default);
app.use("/api/v1/hospital-procedures", hpcd_routes_1.default);
app.use("/api/v1", pod_routes_1.default);
app.use("/api/v1", psa_routes_1.default);
app.use("/api/v1/discharge-summaries", ds_routes_1.default);
app.use("/api/v1/doctor-schedules", ds_routes_2.default);
app.use("/api/v1/doctor-leaves", dl_routes_1.default);
app.use("/api/v1/treatment-plans", tp_routes_1.default);
app.use("/api/v1", alg_routes_1.default);
app.use("/api/v1", mth_routes_1.default);
app.use("/api/v1", vac_routes_1.default);
app.use("/api/v1", fh_routes_1.default);
exports.default = app;
