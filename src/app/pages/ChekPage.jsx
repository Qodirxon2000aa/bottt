export default function ChekPage() {
  return (
    <div className="p-4">
      <div className="rounded-xl border border-dashed border-orange-400 bg-orange-50 p-4">
        <h2 className="text-lg font-semibold text-orange-600">
          quuuuuuuuuuuuuuuuuuuv
        </h2>

        <p className="mt-2 text-sm text-gray-700">
           <b>chek</b> 
        </p>

        <div className="mt-4 rounded-lg bg-white p-3 shadow-sm">
          <div className="flex justify-between text-sm">
            <span>Holat:</span>
            <span className="font-medium text-green-600"></span>
          </div>

          <div className="flex justify-between text-sm mt-1">
            <span>Summa:</span>
            <span className="font-medium">0 UZS</span>
          </div>

          <div className="flex justify-between text-sm mt-1">
            <span>Buyurtma:</span>
            <span className="font-medium">TEST-CHEK</span>
          </div>
        </div>
      </div>
    </div>
  );
}
