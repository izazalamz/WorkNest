require("dotenv").config();
const mongoose = require("mongoose");

const User = require("../models/userModel");
const Workspace = require("../models/workspaceModel");
const Booking = require("../models/bookingModel");
const Attendance = require("../models/attendanceModel");

// Make YYYY-MM-DD in a simple way
const dayKey = (d) => d.toISOString().slice(0, 10);

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Clean old demo data (only safe if you are okay wiping these collections)
    await Promise.all([
      User.deleteMany({}),
      Workspace.deleteMany({}),
      Booking.deleteMany({}),
      Attendance.deleteMany({}),
    ]);

    // Create demo users
    const users = await User.insertMany([
      {
        uid: "demo_admin_uid",
        email: "admin@demo.com",
        name: "Admin Demo",
        role: "admin",
        isActive: true,
      },
      {
        uid: "demo_emp_1",
        email: "emp1@demo.com",
        name: "Employee One",
        role: "employee",
        isActive: true,
      },
      {
        uid: "demo_emp_2",
        email: "emp2@demo.com",
        name: "Employee Two",
        role: "employee",
        isActive: true,
      },
      {
        uid: "demo_emp_3",
        email: "emp3@demo.com",
        name: "Employee Three",
        role: "employee",
        isActive: true,
      },
    ]);

    // Create demo workspaces
    const workspaces = await Workspace.insertMany([
      {
        name: "Desk A1",
        type: "desk",
        status: "active",
        location: {
          building: "HQ",
          floor: "5",
          zone: "A",
          description: "Near window",
        },
        capacity: 1,
        amenities: ["dual_monitor"],
      },
      {
        name: "Desk A2",
        type: "desk",
        status: "active",
        location: {
          building: "HQ",
          floor: "5",
          zone: "A",
          description: "Near window",
        },
        capacity: 1,
        amenities: ["dual_monitor"],
      },
      {
        name: "Desk B1",
        type: "desk",
        status: "active",
        location: {
          building: "HQ",
          floor: "5",
          zone: "B",
          description: "Near pantry",
        },
        capacity: 1,
        amenities: [],
      },
      {
        name: "Room 101",
        type: "meeting-room",
        status: "active",
        location: {
          building: "HQ",
          floor: "5",
          zone: "C",
          description: "Beside reception",
        },
        capacity: 6,
        amenities: ["projector", "whiteboard"],
      },
      {
        name: "Room 102",
        type: "meeting-room",
        status: "active",
        location: {
          building: "HQ",
          floor: "6",
          zone: "D",
          description: "Next to elevator",
        },
        capacity: 10,
        amenities: ["tv", "whiteboard"],
      },
    ]);

    // Helper arrays
    const desks = workspaces.filter((w) => w.type === "desk");
    const rooms = workspaces.filter((w) => w.type === "meeting-room");
    const employees = users.filter((u) => u.role === "employee");

    // Create last 7 days bookings + attendance
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const bookings = [];
    const attendance = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);

      // Attendance (some office, some remote)
      const officeCount = i % 2 === 0 ? 2 : 1; // just to vary
      employees.forEach((emp, idx) => {
        const mode = idx < officeCount ? "office" : "remote";
        attendance.push({
          userId: emp._id,
          day: dayKey(d),
          mode,
          checkInAt: new Date(d.getTime() + 9 * 60 * 60 * 1000),
          checkOutAt: new Date(d.getTime() + 17 * 60 * 60 * 1000),
          totalMinutes: 8 * 60,
        });
      });

      // Desk bookings (vary count per day)
      const deskBookingsToday = i % 3 === 0 ? 3 : 2;
      for (let b = 0; b < deskBookingsToday; b++) {
        const start = new Date(d.getTime() + (10 + b) * 60 * 60 * 1000);
        const end = new Date(d.getTime() + (11 + b) * 60 * 60 * 1000);

        bookings.push({
          userId: employees[b % employees.length]._id,
          workspaceId: desks[b % desks.length]._id,
          startAt: start,
          endAt: end,
          status: "confirmed",
        });
      }

      // Meeting bookings (vary count per day)
      const meetingsToday = i % 2 === 0 ? 2 : 1;
      for (let m = 0; m < meetingsToday; m++) {
        const start = new Date(d.getTime() + (14 + m) * 60 * 60 * 1000);
        const end = new Date(d.getTime() + (15 + m) * 60 * 60 * 1000);

        bookings.push({
          userId: employees[m % employees.length]._id,
          workspaceId: rooms[m % rooms.length]._id,
          startAt: start,
          endAt: end,
          status: "confirmed",
        });
      }
    }

    await Booking.insertMany(bookings);
    await Attendance.insertMany(attendance);

    console.log("Seed complete!");
    console.log(`Users: ${users.length}`);
    console.log(`Workspaces: ${workspaces.length}`);
    console.log(`Bookings: ${bookings.length}`);
    console.log(`Attendance: ${attendance.length}`);

    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exit(1);
  }
};

run();
