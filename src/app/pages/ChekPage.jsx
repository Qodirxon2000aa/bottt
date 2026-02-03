import "./CheckPage.css";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";

export default function ChekPage() {
  const [searchParams] = useSearchParams();
  const chekId = searchParams.get("id");

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.close();
    } else {
      window.close();
    }
  };

  /* ===================== 🧾 CHEK FETCH ===================== */
  useEffect(() => {
    if (!chekId) return;

    const fetchOrderById = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `https://m4746.myxvest.ru/webapp/get_order.php?order_id=${chekId}`,
          { cache: "no-cache" }
        );

        const data = await res.json();
        if (data?.ok) {
          setOrder(data.order);
        }
      } catch (e) {
        console.error("Chek fetch error:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderById();
  }, [chekId]);

  return (
    <div className="check-wrapper">
      <div className="check-card">

        {/* USER */}
        <div className="check-user">
          <div className="check-avatar">
            {order?.sent?.charAt(1)?.toUpperCase() || "S"}
          </div>

          <h2 className="check-name">Stars Xaridi</h2>
          <p className="check-username">{order?.sent || "-"}</p>

          <div className="check-verified">
            <span className="check-dot">✔</span>
            Tasdiqlangan
          </div>
        </div>

        {/* INFO */}
        <div className="check-info">
          <div className="check-row">
            <span>Buyurtma ID</span>
            <strong>{order?.id || "-"}</strong>
          </div>

          <div className="check-row">
            <span>Stars</span>
            <strong className="stars">✨ {order?.amount || 0}</strong>
          </div>

          <div className="check-row">
            <span>Summa</span>
            <strong>{order?.umumiy || 0} UZS</strong>
          </div>

          <div className="check-row">
            <span>Sana</span>
            <strong>{order?.date || "-"}</strong>
          </div>

          <div className="check-row">
            <span>Yuboruvchi</span>
            <strong>{order?.sent || "-"}</strong>
          </div>

          <div className="check-row">
            <span>Status</span>
            <strong>{order?.status || "-"}</strong>
          </div>
        </div>

        <button onClick={handleClose} className="check-close">
          Yopish
        </button>

        {loading && (
          <p style={{ textAlign: "center", marginTop: 10 }}>
            Yuklanmoqda...
          </p>
        )}
      </div>
    </div>
  );
}
