"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMedicineStockController = createMedicineStockController;
exports.getMedicineStocksController = getMedicineStocksController;
exports.getMedicineStockByIdController = getMedicineStockByIdController;
exports.updateMedicineStockController = updateMedicineStockController;
const mds_service_1 = require("./mds.service");
const aud_service_1 = require("../audit-log/aud.service");
async function createMedicineStockController(req, res) {
    try {
        const body = req.body ?? {};
        const { hospitalId, medicineId, batchNumber, expiryDate, purchasePrice, sellingPrice, quantityAvailable, } = body;
        if (!hospitalId ||
            !medicineId ||
            !batchNumber ||
            !expiryDate ||
            purchasePrice === undefined ||
            sellingPrice === undefined ||
            quantityAvailable === undefined) {
            return res.status(400).json({
                success: false,
                message: "Hospital ID, medicine ID, batch number, expiry date, prices and quantity are required",
            });
        }
        const stock = await (0, mds_service_1.createMedicineStock)(body);
        await (0, aud_service_1.createAuditLog)({
            userId: req.user?.id,
            hospitalId: stock.hospitalId,
            action: "CREATE",
            entityType: "MEDICINE_STOCK",
            entityId: stock.id,
            metadata: {
                medicineId: stock.medicineId,
                batchNumber: stock.batchNumber,
                quantityAvailable: stock.quantityAvailable,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(201).json({
            success: true,
            message: "Medicine stock created successfully",
            data: stock,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            const errors = {
                HOSPITAL_NOT_FOUND: [
                    404,
                    "Hospital not found",
                ],
                MEDICINE_NOT_FOUND: [
                    404,
                    "Medicine not found",
                ],
                SUPPLIER_NOT_FOUND: [
                    404,
                    "Supplier not found",
                ],
                STOCK_ALREADY_EXISTS: [
                    409,
                    "Medicine stock with this batch already exists",
                ],
                INVALID_QUANTITY: [
                    400,
                    "Quantity cannot be negative",
                ],
                INVALID_PRICE: [
                    400,
                    "Price cannot be negative",
                ],
            };
            const response = errors[error.message];
            if (response) {
                return res.status(response[0]).json({
                    success: false,
                    message: response[1],
                });
            }
        }
        console.error("Create medicine stock error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getMedicineStocksController(_req, res) {
    try {
        const stocks = await (0, mds_service_1.getMedicineStocks)();
        return res.status(200).json({
            success: true,
            data: stocks,
        });
    }
    catch (error) {
        console.error("Get medicine stocks error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getMedicineStockByIdController(req, res) {
    try {
        const stock = await (0, mds_service_1.getMedicineStockById)(req.params.id);
        return res.status(200).json({
            success: true,
            data: stock,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "STOCK_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Medicine stock not found",
            });
        }
        console.error("Get medicine stock error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function updateMedicineStockController(req, res) {
    try {
        const stock = await (0, mds_service_1.updateMedicineStock)(req.params.id, req.body ?? {});
        await (0, aud_service_1.createAuditLog)({
            userId: req.user?.id,
            hospitalId: stock.hospitalId,
            action: "UPDATE",
            entityType: "MEDICINE_STOCK",
            entityId: stock.id,
            metadata: {
                medicineId: stock.medicineId,
                batchNumber: stock.batchNumber,
                quantityAvailable: stock.quantityAvailable,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(200).json({
            success: true,
            message: "Medicine stock updated successfully",
            data: stock,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message === "STOCK_NOT_FOUND") {
                return res.status(404).json({
                    success: false,
                    message: "Medicine stock not found",
                });
            }
            if (error.message === "SUPPLIER_NOT_FOUND") {
                return res.status(404).json({
                    success: false,
                    message: "Supplier not found",
                });
            }
            if (error.message === "INVALID_QUANTITY") {
                return res.status(400).json({
                    success: false,
                    message: "Quantity cannot be negative",
                });
            }
            if (error.message === "INVALID_PRICE") {
                return res.status(400).json({
                    success: false,
                    message: "Price cannot be negative",
                });
            }
        }
        console.error("Update medicine stock error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
