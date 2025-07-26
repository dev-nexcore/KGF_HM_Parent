export default function Documents() {
  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Heading */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold border-l-4 border-red-600 pl-2">
          Student Details
        </h2>
      </div>

      {/* Profile & Basic Info */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        {/* Profile Card */}
        <div className="bg-[#d6dccc] w-full lg:w-1/3 p-4 sm:p-6 rounded-xl shadow-md flex flex-col items-center justify-center min-h-[200px] sm:min-h-[250px]">
          <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 bg-white rounded-full mb-3 sm:mb-4" />
          <h3 className="text-base sm:text-lg font-bold text-center">Nouman Khan</h3>
          <p className="text-xs sm:text-sm text-center">ID: HFL-001</p>
        </div>

        {/* Basic Info Card */}
        <div className="bg-white w-full lg:w-2/3 rounded-xl shadow-md overflow-hidden">
          <div className="bg-[#9CAD8F] px-4 py-2 sm:py-3 font-bold text-white text-sm sm:text-base">
            Basic Information
          </div>
          <div className="p-3 sm:p-4 text-xs sm:text-sm">
            {/* Mobile: Single column, Tablet+: Two columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 sm:gap-y-3 gap-x-4">
              <div className="flex flex-col sm:contents">
                <p className="text-gray-500">First Name:</p>
                <p className="font-bold mb-2 sm:mb-0">Chinmay</p>
              </div>
              <div className="flex flex-col sm:contents">
                <p className="text-gray-500">Middle Name:</p>
                <p className="font-bold mb-2 sm:mb-0">Pravin</p>
              </div>
              <div className="flex flex-col sm:contents">
                <p className="text-gray-500">Last Name:</p>
                <p className="font-bold mb-2 sm:mb-0">Gawade</p>
              </div>
              <div className="flex flex-col sm:contents">
                <p className="text-gray-500">Email Address:</p>
                <p className="font-bold break-all sm:break-normal mb-2 sm:mb-0">gawadechinmay01@gmail.com</p>
              </div>
              <div className="flex flex-col sm:contents">
                <p className="text-gray-500">Date Of Birth:</p>
                <p className="font-bold mb-2 sm:mb-0">30-03-2006</p>
              </div>
              <div className="flex flex-col sm:contents">
                <p className="text-gray-500">Admission Date:</p>
                <p className="font-bold mb-2 sm:mb-0">15th Aug, 2025</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Uploaded Documents */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl shadow-2xl">
        <h3 className="font-bold mb-3 sm:mb-4 text-sm sm:text-base">Uploaded Documents</h3>
        
        {/* Desktop/Tablet Table View */}
        <div className="hidden sm:block border rounded-xl overflow-hidden">
          <div className="grid grid-cols-2 bg-[#f9f9f9] p-3 font-semibold border-b text-sm">
            <p>Documents</p>
            <p className="text-right">Action</p>
          </div>
          {[
            "Birth Certificate.pdf",
            "Adhar Card.pdf",
            "Previous School LC.pdf",
            "Medical records.pdf"
          ].map((doc, index) => (
            <div key={index} className="grid grid-cols-2 font-bold items-center border-t px-3 py-3 text-sm">
              <p>{doc}</p>
              <div className="flex justify-end">
                <button className="bg-[#9CAD8F] text-black px-4 py-2 rounded-md hover:opacity-90 transition-opacity">
                  View
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Card View */}
        <div className="sm:hidden space-y-3">
          {[
            "Birth Certificate.pdf",
            "Adhar Card.pdf",
            "Previous School LC.pdf",
            "Medical records.pdf"
          ].map((doc, index) => (
            <div key={index} className="border rounded-lg p-3 bg-[#f9f9f9]">
              <div className="flex flex-col space-y-2">
                <p className="font-bold text-sm break-all">{doc}</p>
                <button className="bg-[#9CAD8F] text-black px-4 py-2 rounded-md hover:opacity-90 transition-opacity text-sm font-medium self-start">
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
