const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  role: { type: String, enum: ["ADMIN", "MEMBER"], default: "MEMBER" },
  joinedAt: { type: Date, default: Date.now },
  permissions: {
    canViewTasks: { type: Boolean, default: true },
    canCreateTasks: { type: Boolean, default: false },
    canAssignTasks: { type: Boolean, default: false },
    canViewAnalytics: { type: Boolean, default: false },
    canManageMembers: { type: Boolean, default: false }
  }
});

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 3, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 500 },
    status: {
      type: String,
      enum: ["ACTIVE", "COMPLETED", "ARCHIVED"],
      default: "ACTIVE",
    },
    deadline: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    members: [memberSchema],
    // Educational content management
    courseCode: { type: String, trim: true },
    semester: { type: String, trim: true },
    academicYear: { type: String, trim: true },
    // Access control settings
    isPublic: { type: Boolean, default: false },
    allowSelfEnrollment: { type: Boolean, default: false },
    enrollmentCode: { type: String, trim: true, unique: true, sparse: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
