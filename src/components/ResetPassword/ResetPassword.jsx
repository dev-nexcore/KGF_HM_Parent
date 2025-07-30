'use client';

export default function ResetPassword() {
  return (
    <div className="min-h-screen bg-[#a1ad92] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-md w-full max-w-4xl px-16 py-14 min-h-[500px] flex flex-col justify-center">
        <h1 className="text-3xl font-bold text-center mb-10 text-black">Reset Password</h1>

        <form className="space-y-6 max-w-md mx-auto w-full">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold mb-2 text-left text-black">
              OTP
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter OTP"
              className="w-full px-4 py-3 rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.2)] focus:outline-none text-[#000000]"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-semibold mb-2 text-left text-black">
              New Password
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter New Password"
              className="w-full px-4 py-3 rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.2)] focus:outline-none text-[#000000]"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-semibold mb-2 text-left text-black">
              Confirm New Password
            </label>
            <input
              id="email"
              type="email"
              placeholder="Confirm New Password"
              className="w-full px-4 py-3 rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.2)] focus:outline-none text-[#000000]"
            />
          </div>

          <div className="text-center">
            <button
              type="submit"
              className="bg-[#b8bfa5] text-black font-semibold px-15 py-1.5 rounded-lg shadow-md hover:opacity-90 transition-all duration-200"
            >
              Reset Password
            </button>
          </div>
        </form>

        <div className="text-center mt-6">
          <a href="/" className="text-sm text-gray-700 hover:underline cursor-pointer">Back To Login</a>
        </div>
      </div>
    </div>
  );
}