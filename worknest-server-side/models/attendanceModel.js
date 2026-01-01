const { Schema, model } = require("mongoose");

const AttendanceSchema = new Schema(
  {
    employeeId: {
      type: String,
      required: [true, "Employee ID is required"],
      index: true,
    },
    employeeName: {
      type: String,
      required: [true, "Employee name is required"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
      index: true,
    },
    checkInTime: {
      type: Date,
      default: null,
    },
    checkOutTime: {
      type: Date,
      default: null,
    },
    totalHours: {
      type: Number,
      default: 0,
      min: 0,
    },
    workMode: {
      type: String,
      enum: ["office", "remote"],
      required: [true, "Work mode is required"],
      default: "office",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Compound unique index to prevent duplicate check-ins
AttendanceSchema.index(
  { employeeId: 1, date: 1 },
  {
    unique: true,
    name: "employeeId_date_unique",
  }
);

// Additional indexes for queries
AttendanceSchema.index({ date: -1 });
AttendanceSchema.index({ employeeId: 1, date: -1 });

module.exports = model("attendance", AttendanceSchema);
