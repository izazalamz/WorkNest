const Attendance = require("../models/attendanceModel");

// Try to import User model
let User = null;
try {
  User = require("../models/User");
} catch (error) {
  console.log(
    "Note: User model not found. Active status will show basic employee info only."
  );
}

// Get today's active users
const getActiveTodayUsers = async (req, res) => {
  try {
    console.log("=== GET ACTIVE TODAY USERS REQUEST ===");

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const attendanceRecords = await Attendance.find({
      date: today,
    })
      .sort({ checkInTime: -1 })
      .lean();

    console.log(
      `Found ${attendanceRecords.length} attendance records for today`
    );

    const employeeIds = attendanceRecords.map((record) => record.employeeId);

    let usersMap = {};
    if (User) {
      try {
        const users = await User.find({ uid: { $in: employeeIds } }).lean();
        usersMap = users.reduce((map, user) => {
          map[user.uid] = user;
          return map;
        }, {});
        console.log(`Fetched ${users.length} user details`);
      } catch (error) {
        console.log("Could not fetch user details:", error.message);
      }
    }

    const activeUsers = attendanceRecords.map((record) => {
      const user = usersMap[record.employeeId];

      let activeTime = 0;
      let status = "inactive";

      if (record.checkInTime) {
        if (record.checkOutTime) {
          activeTime = record.totalHours || 0;
          status = "checked_out";
        } else {
          const now = new Date();
          const msDiff = now - new Date(record.checkInTime);
          activeTime = msDiff / (1000 * 60 * 60);
          status = "active";
        }
      }

      return {
        employeeId: record.employeeId,
        employeeName: record.employeeName || user?.name || "Unknown",
        email: user?.email || "N/A",
        department: user?.department || "N/A",
        checkInTime: record.checkInTime,
        checkOutTime: record.checkOutTime,
        totalHours: parseFloat(activeTime.toFixed(2)),
        status: status,
        isActive: status === "active",
        workMode: record.workMode || "office", // Include work mode
      };
    });

    const activeCount = activeUsers.filter((u) => u.isActive).length;

    console.log(
      ` Returning ${activeUsers.length} users (${activeCount} active)`
    );

    return res.status(200).json({
      success: true,
      count: activeUsers.length,
      activeCount: activeCount,
      data: activeUsers,
    });
  } catch (error) {
    console.error("=== GET ACTIVE TODAY USERS ERROR ===");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch active users",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Check-in with work mode
const checkIn = async (req, res) => {
  try {
    const { employeeId, employeeName, workMode } = req.body;

    console.log("=== CHECK-IN REQUEST ===");
    console.log("Body:", req.body);

    if (!employeeId || !employeeName) {
      console.error("❌ Missing required fields");
      return res.status(400).json({
        success: false,
        message: "Missing required fields: employeeId and employeeName",
      });
    }

    if (!workMode || !["office", "remote"].includes(workMode)) {
      console.error("❌ Invalid or missing work mode");
      return res.status(400).json({
        success: false,
        message: 'Work mode must be either "office" or "remote"',
      });
    }

    const day = new Date();
    day.setUTCHours(0, 0, 0, 0);

    console.log("📅 Checking for existing record on:", day.toISOString());

    const existingCheckIn = await Attendance.findOne({
      employeeId: employeeId,
      date: day,
    });

    if (existingCheckIn) {
      console.log("⚠️ Already checked in today:", existingCheckIn);
      return res.status(200).json({
        success: true,
        message: "Already checked in today",
        attendance: existingCheckIn,
      });
    }

    const attendance = new Attendance({
      employeeId: employeeId,
      employeeName: employeeName,
      date: day,
      checkInTime: new Date(),
      checkOutTime: null,
      totalHours: 0,
      workMode: workMode,
    });

    await attendance.save();

    console.log("✅ Check-in successful:", attendance);
    return res.status(201).json({
      success: true,
      message: "Check-in successful",
      attendance: attendance,
    });
  } catch (err) {
    console.error("=== CHECK-IN ERROR ===");
    console.error("Error name:", err.name);
    console.error("Error code:", err.code);
    console.error("Error message:", err.message);

    if (err.code === 11000) {
      console.log("⚠️ Duplicate key error → Fetching existing record");

      try {
        const day = new Date();
        day.setUTCHours(0, 0, 0, 0);

        const existingRecord = await Attendance.findOne({
          employeeId: req.body.employeeId,
          date: day,
        });

        if (existingRecord) {
          console.log("✅ Found existing record:", existingRecord);
          return res.status(200).json({
            success: true,
            message: "Already checked in today",
            attendance: existingRecord,
          });
        } else {
          console.error("❌ Duplicate error but record not found!");
          return res.status(500).json({
            success: false,
            message: "Database inconsistency detected",
          });
        }
      } catch (fetchErr) {
        console.error("❌ Error fetching existing record:", fetchErr);
        return res.status(500).json({
          success: false,
          message: "Error retrieving existing check-in record",
        });
      }
    }

    if (err.name === "ValidationError") {
      console.error("❌ Validation error:", err.message);
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error checking in",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// Check-out function (unchanged)
const checkOut = async (req, res) => {
  try {
    const { employeeId } = req.body;
    console.log("=== CHECK-OUT REQUEST ===");
    console.log("EmployeeId:", employeeId);

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: "Missing employeeId",
      });
    }

    const day = new Date();
    day.setUTCHours(0, 0, 0, 0);

    // Find today's check-in record using correct field names
    const attendance = await Attendance.findOne({
      employeeId: employeeId,
      date: day,
    });

    if (!attendance) {
      console.log("❌ No check-in record found for today");
      return res.status(404).json({
        success: false,
        message: "No check-in record found for today. Please check in first.",
      });
    }

    if (attendance.checkOutTime) {
      console.log("⚠️ Already checked out:", attendance);
      return res.status(200).json({
        success: true,
        message: "Already checked out",
        attendance: attendance,
      });
    }

    attendance.checkOutTime = new Date();
    const msDiff = attendance.checkOutTime - attendance.checkInTime;
    attendance.totalHours = Math.round((msDiff / (1000 * 60 * 60)) * 100) / 100;

    await attendance.save();

    console.log("✅ Check-out successful:", attendance);
    return res.status(200).json({
      success: true,
      message: "Check-out successful",
      attendance: attendance,
    });
  } catch (err) {
    console.error("=== CHECK-OUT ERROR ===");
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Error checking out",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// Get attendance function (unchanged)
const getAttendance = async (req, res) => {
  try {
    const { employeeId } = req.params;

    console.log("=== GET ATTENDANCE REQUEST ===");
    console.log("EmployeeId:", employeeId);

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: "Missing employeeId",
      });
    }

    const attendance = await Attendance.find({ employeeId: employeeId })
      .sort({ date: -1 })
      .lean();

    console.log(`✅ Found ${attendance.length} attendance records`);

    return res.status(200).json({
      success: true,
      attendance: attendance,
      count: attendance.length,
    });
  } catch (error) {
    console.error("=== GET ATTENDANCE ERROR ===");
    console.error("Error:", error);

    return res.status(500).json({
      success: false,
      message: "Error fetching attendance data",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get total hours function (unchanged)
const getTotalHours = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { startDate, endDate } = req.query;

    console.log("=== GET TOTAL HOURS REQUEST ===");
    console.log("EmployeeId:", employeeId);
    console.log("Date range:", { startDate, endDate });

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: "Missing employeeId",
      });
    }

    const query = { employeeId: employeeId };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        query.date.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const attendanceRecords = await Attendance.find(query).lean();

    const totalHours = attendanceRecords.reduce((sum, record) => {
      return sum + (record.totalHours || 0);
    }, 0);

    console.log(
      ` Total hours: ${totalHours.toFixed(2)} from ${
        attendanceRecords.length
      } records`
    );

    return res.status(200).json({
      success: true,
      totalHours: parseFloat(totalHours.toFixed(2)),
      recordCount: attendanceRecords.length,
      records: attendanceRecords,
    });
  } catch (error) {
    console.error("=== GET TOTAL HOURS ERROR ===");
    console.error("Error:", error);

    return res.status(500).json({
      success: false,
      message: "Error calculating total hours",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  checkIn,
  checkOut,
  getAttendance,
  getTotalHours,
  getActiveTodayUsers,
};
