import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/Auth/auth";
import { useStudentProfileStore } from "@/stores/Profile/StudentProfile";
import { useTeacherProfileStore } from "@/stores/Profile/TeacherProfile";
import { useUserProfileStore } from "@/stores/Profile/UserProfile";
import { useUsersStore } from "@/stores/Auth/Users";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/Components/Toast";
import {
  User,
  Mail,
  Calendar,
  Heart,
  BookOpen,
  Award,
  Briefcase,
  Edit,
  Save,
  X,
  GraduationCap,
  Lock,
  Plus,
} from "lucide-react";

const MyProfile = () => {
  const { toasts, addToast, removeToast } = useToast();
  const { user: currentUser, self } = useAuthStore();
  const {
    profiles: studentProfiles,
    fetchProfiles: fetchStudentProfiles,
    updateProfile: updateStudentProfile,
  } = useStudentProfileStore();
  const {
    profiles: teacherProfiles,
    fetchProfiles: fetchTeacherProfiles,
    updateProfile: updateTeacherProfile,
  } = useTeacherProfileStore();
  const {
    profiles: userProfiles,
    fetchProfiles: fetchUserProfiles,
    updateProfile: updateUserProfile,
  } = useUserProfileStore();
  const { changePassword, loading: passwordLoading } = useUsersStore();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Student profile edit state
  const [studentEditData, setStudentEditData] = useState({
    grade_level: "",
    roll_number: "",
    admission_date: "",
    father_name: "",
    mother_name: "",
    guardian_name: "",
    guardian_phone: "",
    guardian_email: "",
    previous_school: "",
    medical_conditions: "",
    extracurricular_activities: "",
  });

  // Teacher profile edit state
  const [teacherEditData, setTeacherEditData] = useState({
    department: "",
    subject_specialization: "",
    qualification: "",
    experience_years: 0,
    classes_assigned: "",
    subjects_teaching: "",
    certifications: "",
    training_completed: "",
  });

  // User profile edit state
  const [userEditData, setUserEditData] = useState({
    bio: "",
    phone_number: "",
    address: "",
    emergency_contact: "",
    nationality: "",
    blood_group: "",
    facebook_url: "",
    linkedin_url: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        await self();
      } finally {
        setLoading(false);
      }
    };

    if (!currentUser) {
      loadProfile();
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadRoleProfile = async () => {
      if (currentUser?.role === "student") {
        await fetchStudentProfiles(1, 100);
      } else if (currentUser?.role === "teacher") {
        await fetchTeacherProfiles(1, 100);
      } else if (
        currentUser?.role === "admin" ||
        currentUser?.role === "superadmin"
      ) {
        await fetchUserProfiles(1, 100);
      }
    };

    if (currentUser) {
      loadRoleProfile();
    }
  }, [currentUser?.id, currentUser?.role]);

  // Get current user's profile
  const studentProfile =
    studentProfiles.find((p) => p.user === currentUser?.id) ||
    (currentUser?.role === "student" && studentProfiles.length === 1
      ? studentProfiles[0]
      : undefined);
  const teacherProfile =
    teacherProfiles.find((p) => p.user === currentUser?.id) ||
    (currentUser?.role === "teacher" && teacherProfiles.length === 1
      ? teacherProfiles[0]
      : undefined);
  const userProfile =
    userProfiles.find((p) => p.user === currentUser?.id) ||
    ((currentUser?.role === "admin" || currentUser?.role === "superadmin") &&
    userProfiles.length === 1
      ? userProfiles[0]
      : undefined);

  // Initialize edit data when profile loads
  useEffect(() => {
    if (studentProfile) {
      setStudentEditData({
        grade_level: studentProfile.grade_level || "",
        roll_number: studentProfile.roll_number || "",
        admission_date: studentProfile.admission_date || "",
        father_name: studentProfile.father_name || "",
        mother_name: studentProfile.mother_name || "",
        guardian_name: studentProfile.guardian_name || "",
        guardian_phone: studentProfile.guardian_phone || "",
        guardian_email: studentProfile.guardian_email || "",
        previous_school: studentProfile.previous_school || "",
        medical_conditions: studentProfile.medical_conditions || "",
        extracurricular_activities:
          studentProfile.extracurricular_activities || "",
      });
    }
  }, [studentProfile, currentUser]);

  useEffect(() => {
    if (teacherProfile) {
      setTeacherEditData({
        department: teacherProfile.department || "",
        subject_specialization: teacherProfile.subject_specialization || "",
        qualification: teacherProfile.qualification || "",
        experience_years: teacherProfile.experience_years || 0,
        classes_assigned: teacherProfile.classes_assigned || "",
        subjects_teaching: teacherProfile.subjects_teaching || "",
        certifications: teacherProfile.certifications || "",
        training_completed: teacherProfile.training_completed || "",
      });
    }
  }, [teacherProfile]);

  useEffect(() => {
    if (userProfile) {
      setUserEditData({
        bio: userProfile.bio || "",
        phone_number: userProfile.phone_number || "",
        address: userProfile.address || "",
        emergency_contact: userProfile.emergency_contact || "",
        nationality: userProfile.nationality || "",
        blood_group: userProfile.blood_group || "",
        facebook_url: userProfile.facebook_url || "",
        linkedin_url: userProfile.linkedin_url || "",
      });
    }
  }, [userProfile]);

  const handleSave = async () => {
    try {
      if (currentUser?.role === "student" && studentProfile) {
        await updateStudentProfile(studentProfile.id, studentEditData);
        addToast("success", "Profile updated successfully");
      } else if (currentUser?.role === "teacher" && teacherProfile) {
        await updateTeacherProfile(teacherProfile.id, teacherEditData);
        addToast("success", "Profile updated successfully");
      } else if (userProfile) {
        await updateUserProfile(userProfile.id, userEditData);
        addToast("success", "Profile updated successfully");
      }
      setIsEditing(false);
    } catch (err: any) {
      addToast(
        "error",
        err.response?.data?.message || "Failed to update profile",
      );
    }
  };

  const handleChangePassword = async () => {
    // Validation
    if (
      !passwordData.oldPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      addToast("error", "Please fill all password fields");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      addToast("error", "New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      addToast("error", "New password must be at least 6 characters");
      return;
    }

    try {
      await changePassword(passwordData.oldPassword, passwordData.newPassword);
      addToast("success", "Password changed successfully");
      setShowChangePassword(false);
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err: any) {
      addToast(
        "error",
        err.response?.data?.detail || "Failed to change password",
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading profile...</div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-500">Unable to load user data</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#1a365d] flex items-center gap-2">
              <User className="w-8 h-8" />
              My Profile
            </h1>
            <p className="text-gray-600 mt-1">
              View and manage your personal information
            </p>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-[#1a365d] text-white rounded-lg hover:bg-[#2d4a7c] flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setShowChangePassword(true)}
                  className="px-4 py-2 border border-[#1a365d] text-[#1a365d] rounded-lg hover:bg-[#1a365d] hover:text-white flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  Change Password
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-[#1a365d] text-white rounded-lg hover:bg-[#2d4a7c] flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </button>
              </>
            )}
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-[#1164A3] to-[#1A9641] p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-[#1164A3]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {currentUser.first_name} {currentUser.last_name}
                </h2>
                <p className="text-blue-100">
                  {currentUser.role
                    ? currentUser.role.charAt(0).toUpperCase() +
                      currentUser.role.slice(1)
                    : "User"}
                  {currentUser.student_id && ` • ${currentUser.student_id}`}
                  {currentUser.employee_id && ` • ${currentUser.employee_id}`}
                </p>
                {currentUser.branch && (
                  <p className="text-blue-100 text-sm mt-1">
                    📍 {currentUser.branch}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Basic Info Section */}
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Basic Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium">
                    {currentUser.email || "Not provided"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Username</p>
                  <p className="text-sm font-medium">{currentUser.username}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Student Profile Section */}
          {currentUser.role === "student" && (
            <>
              {studentProfile ? (
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    Academic Information
                  </h3>
                  <div className="space-y-4">
                    {/* Grade Level and Roll Number */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Grade Level
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={studentEditData.grade_level}
                            onChange={(e) =>
                              setStudentEditData({
                                ...studentEditData,
                                grade_level: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d]"
                          />
                        ) : (
                          <p className="text-sm text-gray-600 font-medium">
                            {studentProfile.grade_level}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Roll Number
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={studentEditData.roll_number}
                            onChange={(e) =>
                              setStudentEditData({
                                ...studentEditData,
                                roll_number: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d]"
                          />
                        ) : (
                          <p className="text-sm text-gray-600 font-medium">
                            {studentProfile.roll_number || "Not assigned"}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Admission Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Admission Date
                      </label>
                      {isEditing ? (
                        <input
                          type="date"
                          value={studentEditData.admission_date}
                          onChange={(e) =>
                            setStudentEditData({
                              ...studentEditData,
                              admission_date: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d]"
                        />
                      ) : (
                        <p className="text-sm text-gray-600">
                          {studentProfile.admission_date}
                        </p>
                      )}
                    </div>

                    {/* Previous School */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Previous School
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={studentEditData.previous_school}
                          onChange={(e) =>
                            setStudentEditData({
                              ...studentEditData,
                              previous_school: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d]"
                        />
                      ) : (
                        <p className="text-sm text-gray-600">
                          {studentProfile.previous_school || "Not provided"}
                        </p>
                      )}
                    </div>

                    {/* Medical Conditions */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                        <Heart className="w-4 h-4" />
                        Medical Conditions
                      </label>
                      {isEditing ? (
                        <textarea
                          value={studentEditData.medical_conditions}
                          onChange={(e) =>
                            setStudentEditData({
                              ...studentEditData,
                              medical_conditions: e.target.value,
                            })
                          }
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d]"
                          placeholder="Enter any medical conditions or allergies"
                        />
                      ) : (
                        <p className="text-sm text-gray-600">
                          {studentProfile.medical_conditions || "None"}
                        </p>
                      )}
                    </div>

                    {/* Extracurricular Activities */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        Extracurricular Activities
                      </label>
                      {isEditing ? (
                        <textarea
                          value={studentEditData.extracurricular_activities}
                          onChange={(e) =>
                            setStudentEditData({
                              ...studentEditData,
                              extracurricular_activities: e.target.value,
                            })
                          }
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d]"
                          placeholder="Enter your extracurricular activities and hobbies"
                        />
                      ) : (
                        <p className="text-sm text-gray-600">
                          {studentProfile.extracurricular_activities || "None"}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Guardian Information */}
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="text-md font-semibold text-gray-800 mb-4">
                      Guardian Information
                    </h4>
                    <div className="space-y-4">
                      {/* Father and Mother Name */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Father's Name
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={studentEditData.father_name}
                              onChange={(e) =>
                                setStudentEditData({
                                  ...studentEditData,
                                  father_name: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d]"
                            />
                          ) : (
                            <p className="text-sm text-gray-600 font-medium">
                              {studentProfile.father_name}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mother's Name
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={studentEditData.mother_name}
                              onChange={(e) =>
                                setStudentEditData({
                                  ...studentEditData,
                                  mother_name: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d]"
                            />
                          ) : (
                            <p className="text-sm text-gray-600 font-medium">
                              {studentProfile.mother_name}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Guardian Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Guardian Name
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={studentEditData.guardian_name}
                            onChange={(e) =>
                              setStudentEditData({
                                ...studentEditData,
                                guardian_name: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d]"
                            placeholder="If different from parents"
                          />
                        ) : (
                          <p className="text-sm text-gray-600">
                            {studentProfile.guardian_name || "Same as parents"}
                          </p>
                        )}
                      </div>

                      {/* Guardian Phone and Email */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Guardian Phone
                          </label>
                          {isEditing ? (
                            <input
                              type="tel"
                              value={studentEditData.guardian_phone}
                              onChange={(e) =>
                                setStudentEditData({
                                  ...studentEditData,
                                  guardian_phone: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d]"
                            />
                          ) : (
                            <p className="text-sm text-gray-600 font-medium">
                              {studentProfile.guardian_phone}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Guardian Email
                          </label>
                          {isEditing ? (
                            <input
                              type="email"
                              value={studentEditData.guardian_email}
                              onChange={(e) =>
                                setStudentEditData({
                                  ...studentEditData,
                                  guardian_email: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d]"
                              placeholder="guardian@example.com"
                            />
                          ) : (
                            <p className="text-sm text-gray-600">
                              {studentProfile.guardian_email || "Not provided"}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enrolled Courses */}
                  {currentUser.enrolled_courses &&
                    currentUser.enrolled_courses.length > 0 && (
                      <div className="mt-6 pt-6 border-t">
                        <h4 className="text-md font-semibold text-gray-800 mb-3">
                          Enrolled Courses
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {currentUser.enrolled_courses.map((course) => (
                            <span
                              key={course.id}
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                            >
                              {course.title}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              ) : (
                <div className="p-6 border-b">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800 text-sm mb-3">
                      Your student profile has not been created yet. Create your
                      profile to get started!
                    </p>
                    <button
                      onClick={async () => {
                        try {
                          // Create an empty profile - student can fill details later
                          await useStudentProfileStore
                            .getState()
                            .createOwnProfile({});
                          await fetchStudentProfiles(1, 100);
                          addToast(
                            "success",
                            "Profile created successfully! You can now edit your details.",
                          );
                        } catch (err: any) {
                          addToast(
                            "error",
                            err.response?.data?.message ||
                              "Failed to create profile",
                          );
                        }
                      }}
                      className="px-4 py-2 bg-[#1a365d] text-white rounded-lg hover:bg-[#2d4a7c] flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Create My Profile
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Teacher Profile Section */}
          {currentUser.role === "teacher" && (
            <>
              {teacherProfile ? (
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Professional Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Department
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={teacherEditData.department}
                          onChange={(e) =>
                            setTeacherEditData({
                              ...teacherEditData,
                              department: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d]"
                        />
                      ) : (
                        <p className="text-sm text-gray-600">
                          {teacherProfile.department}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subject Specialization
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={teacherEditData.subject_specialization}
                          onChange={(e) =>
                            setTeacherEditData({
                              ...teacherEditData,
                              subject_specialization: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d]"
                        />
                      ) : (
                        <p className="text-sm text-gray-600">
                          {teacherProfile.subject_specialization}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Qualification
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={teacherEditData.qualification}
                          onChange={(e) =>
                            setTeacherEditData({
                              ...teacherEditData,
                              qualification: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d]"
                        />
                      ) : (
                        <p className="text-sm text-gray-600">
                          {teacherProfile.qualification}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Experience (Years)
                      </label>
                      {isEditing ? (
                        <input
                          type="number"
                          value={teacherEditData.experience_years}
                          onChange={(e) =>
                            setTeacherEditData({
                              ...teacherEditData,
                              experience_years: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d]"
                        />
                      ) : (
                        <p className="text-sm text-gray-600">
                          {teacherProfile.experience_years} years
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Classes Assigned
                      </label>
                      {isEditing ? (
                        <textarea
                          value={teacherEditData.classes_assigned}
                          onChange={(e) =>
                            setTeacherEditData({
                              ...teacherEditData,
                              classes_assigned: e.target.value,
                            })
                          }
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d]"
                          placeholder="Enter classes you are assigned to"
                        />
                      ) : (
                        <p className="text-sm text-gray-600">
                          {teacherProfile.classes_assigned || "Not assigned"}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subjects Teaching
                      </label>
                      {isEditing ? (
                        <textarea
                          value={teacherEditData.subjects_teaching}
                          onChange={(e) =>
                            setTeacherEditData({
                              ...teacherEditData,
                              subjects_teaching: e.target.value,
                            })
                          }
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d]"
                          placeholder="Enter subjects you are teaching"
                        />
                      ) : (
                        <p className="text-sm text-gray-600">
                          {teacherProfile.subjects_teaching || "Not specified"}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Certifications
                      </label>
                      {isEditing ? (
                        <textarea
                          value={teacherEditData.certifications}
                          onChange={(e) =>
                            setTeacherEditData({
                              ...teacherEditData,
                              certifications: e.target.value,
                            })
                          }
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d]"
                          placeholder="Enter your certifications"
                        />
                      ) : (
                        <p className="text-sm text-gray-600">
                          {teacherProfile.certifications || "None"}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Training Completed
                      </label>
                      {isEditing ? (
                        <textarea
                          value={teacherEditData.training_completed}
                          onChange={(e) =>
                            setTeacherEditData({
                              ...teacherEditData,
                              training_completed: e.target.value,
                            })
                          }
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d]"
                          placeholder="Enter training programs you have completed"
                        />
                      ) : (
                        <p className="text-sm text-gray-600">
                          {teacherProfile.training_completed || "None"}
                        </p>
                      )}
                    </div>

                    {/* Read-only fields */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <p className="text-xs text-gray-500">Employee Code</p>
                        <p className="text-sm font-medium">
                          {teacherProfile.employee_code || "Not assigned"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Hire Date</p>
                        <p className="text-sm font-medium">
                          {teacherProfile.hire_date}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Employment Type</p>
                        <p className="text-sm font-medium capitalize">
                          {teacherProfile.employment_type.replace("_", " ")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 border-b">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800 text-sm mb-3">
                      Your teacher profile has not been created yet. Create your
                      profile to get started!
                    </p>
                    <button
                      onClick={async () => {
                        try {
                          // Create an empty profile - teacher can fill details later
                          await useTeacherProfileStore
                            .getState()
                            .createOwnProfile({});
                          await fetchTeacherProfiles(1, 100);
                          addToast(
                            "success",
                            "Profile created successfully! You can now edit your details.",
                          );
                        } catch (err: any) {
                          addToast(
                            "error",
                            err.response?.data?.message ||
                              "Failed to create profile",
                          );
                        }
                      }}
                      className="px-4 py-2 bg-[#1a365d] text-white rounded-lg hover:bg-[#2d4a7c] flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Create My Profile
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Admin/Superadmin Profile Section */}
          {(currentUser.role === "admin" ||
            currentUser.role === "superadmin") && (
            <>
              {userProfile ? (
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Additional Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bio
                      </label>
                      {isEditing ? (
                        <textarea
                          value={userEditData.bio}
                          onChange={(e) =>
                            setUserEditData({
                              ...userEditData,
                              bio: e.target.value,
                            })
                          }
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d]"
                        />
                      ) : (
                        <p className="text-sm text-gray-600">
                          {userProfile.bio || "Not provided"}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        {isEditing ? (
                          <input
                            type="tel"
                            value={userEditData.phone_number}
                            onChange={(e) =>
                              setUserEditData({
                                ...userEditData,
                                phone_number: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d]"
                          />
                        ) : (
                          <p className="text-sm text-gray-600">
                            {userProfile.phone_number || "Not provided"}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Emergency Contact
                        </label>
                        {isEditing ? (
                          <input
                            type="tel"
                            value={userEditData.emergency_contact}
                            onChange={(e) =>
                              setUserEditData({
                                ...userEditData,
                                emergency_contact: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d]"
                          />
                        ) : (
                          <p className="text-sm text-gray-600">
                            {userProfile.emergency_contact || "Not provided"}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      {isEditing ? (
                        <textarea
                          value={userEditData.address}
                          onChange={(e) =>
                            setUserEditData({
                              ...userEditData,
                              address: e.target.value,
                            })
                          }
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d]"
                        />
                      ) : (
                        <p className="text-sm text-gray-600">
                          {userProfile.address || "Not provided"}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nationality
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={userEditData.nationality}
                            onChange={(e) =>
                              setUserEditData({
                                ...userEditData,
                                nationality: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d]"
                          />
                        ) : (
                          <p className="text-sm text-gray-600">
                            {userProfile.nationality || "Not provided"}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Blood Group
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={userEditData.blood_group}
                            onChange={(e) =>
                              setUserEditData({
                                ...userEditData,
                                blood_group: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d]"
                          />
                        ) : (
                          <p className="text-sm text-gray-600">
                            {userProfile.blood_group || "Not provided"}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Facebook URL
                        </label>
                        {isEditing ? (
                          <input
                            type="url"
                            value={userEditData.facebook_url}
                            onChange={(e) =>
                              setUserEditData({
                                ...userEditData,
                                facebook_url: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d]"
                          />
                        ) : (
                          <p className="text-sm text-gray-600">
                            {userProfile.facebook_url || "Not provided"}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          LinkedIn URL
                        </label>
                        {isEditing ? (
                          <input
                            type="url"
                            value={userEditData.linkedin_url}
                            onChange={(e) =>
                              setUserEditData({
                                ...userEditData,
                                linkedin_url: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d]"
                          />
                        ) : (
                          <p className="text-sm text-gray-600">
                            {userProfile.linkedin_url || "Not provided"}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800 text-sm mb-3">
                      Your profile has not been created yet. Create your profile
                      to add additional information!
                    </p>
                    <button
                      onClick={async () => {
                        try {
                          // Create an empty profile - user can fill details later
                          await useUserProfileStore
                            .getState()
                            .createOwnProfile({});
                          await fetchUserProfiles(1, 100);
                          addToast(
                            "success",
                            "Profile created successfully! You can now edit your details.",
                          );
                        } catch (err: any) {
                          addToast(
                            "error",
                            err.response?.data?.message ||
                              "Failed to create profile",
                          );
                        }
                      }}
                      className="px-4 py-2 bg-[#1a365d] text-white rounded-lg hover:bg-[#2d4a7c] flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Create My Profile
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Change Password Modal */}
        {showChangePassword && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-[#1a365d] flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Change Password
                </h3>
                <button
                  onClick={() => {
                    setShowChangePassword(false);
                    setPasswordData({
                      oldPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.oldPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        oldPassword: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:outline-none"
                    placeholder="Enter current password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:outline-none"
                    placeholder="Enter new password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:outline-none"
                    placeholder="Confirm new password"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    onClick={() => {
                      setShowChangePassword(false);
                      setPasswordData({
                        oldPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      });
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleChangePassword}
                    disabled={passwordLoading}
                    className="flex-1 px-4 py-2 bg-[#1a365d] text-white rounded-lg hover:bg-[#2d4a7c] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {passwordLoading ? "Changing..." : "Change Password"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProfile;
