export default function ChekPage() {
  const handleClose = () => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.close(); // ✅ WebApp yopiladi
    } else {
      window.close(); // fallback (oddiy brauzer)
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f10] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-[#17181c] p-6 shadow-xl">

        {/* USER */}
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-2xl font-bold text-white">
            S
          </div>

          <h2 className="mt-3 text-lg font-semibold text-white">
            saviyali_bola
          </h2>
          <p className="text-sm text-gray-400">@saviyali_bola</p>

          <div className="mt-3 rounded-full bg-green-500/10 px-4 py-1 text-sm font-medium text-green-500">
            ✔ Tasdiqlangan
          </div>
        </div>

        {/* CHEK INFO */}
        <div className="mt-6 rounded-xl bg-[#1f2126] p-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Buyurtma ID</span>
            <span className="text-white font-medium">38</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Stars</span>
            <span className="text-yellow-400 font-semibold">✨ 100</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Summa</span>
            <span className="text-white font-semibold">22 000 UZS</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Sana</span>
            <span className="text-white">03 Feb 2026 · 18:19</span>
          </div>
        </div>

        {/* 🔘 YOPISH */}
        <button
          onClick={handleClose}
          className="mt-6 w-full rounded-xl border border-blue-500 py-3 text-blue-400 font-medium hover:bg-blue-500/10 transition"
        >
          Yopish
        </button>
      </div>
    </div>
  );
}
