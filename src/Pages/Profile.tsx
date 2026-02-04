import { useAuthStore } from "@/stores/auth";

const Profile = () => {
  const { user } = useAuthStore();

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-lg">
          {user?.full_name?.charAt(0).toUpperCase() ||
            user?.name?.charAt(0).toUpperCase() ||
            user?.username?.charAt(0).toUpperCase() ||
            "U"}
        </div>
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            {user?.full_name || user?.name || user?.username}
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            @{user?.username}
          </p>
          {user?.role && (
            <span className="inline-block px-3 py-1 text-xs sm:text-sm text-emerald-700 bg-emerald-50 rounded-full font-medium capitalize mt-2">
              {user.role}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              value={user?.username || ""}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm sm:text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm sm:text-base break-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={user?.full_name || user?.name || ""}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm sm:text-base"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <input
              type="text"
              value={user?.role || "User"}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 capitalize text-sm sm:text-base"
            />
          </div>

          {user?.student_id && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Student ID
              </label>
              <input
                type="text"
                value={user.student_id}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm sm:text-base"
              />
            </div>
          )}

          {user?.employee_id && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee ID
              </label>
              <input
                type="text"
                value={user.employee_id}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm sm:text-base"
              />
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 sm:mt-8 pt-6 border-t border-gray-200">
        <button className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-sm sm:text-base">
          Edit Profile
        </button>
      </div>
    </div>
  );
};

export default Profile;
