export const Input = ({ label, type, placeholder, icon }) => (
  <div className="flex flex-col gap-1 w-full mb-4">
    <label className="text-sm font-bold text-gray-700">{label} <span className="text-red-500">*</span></label>
    <div className="relative">
      <input 
        type={type} 
        placeholder={placeholder}
        className="w-full p-3 bg-white border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
      />
      <span className="absolute right-3 top-3 text-gray-400">{icon}</span>
    </div>
  </div>
);