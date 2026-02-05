import { useEffect, useState, useRef } from "react";
import { useTelegram } from "../context/TelegramContext";

export default function Ton() {
  const { user } = useTelegram();

  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentStatus, setCurrentStatus] = useState("pending");
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);

  const paymentIdRef = useRef(null);
  const intervalRef = useRef(null);

  // keyframes bir marta qo'shilishi uchun
  useEffect(() => {
    if (document.getElementById("success-anim-styles")) return;

    const style = document.createElement("style");
    style.id = "success-anim-styles";
    style.textContent = `
      @keyframes successPop {
        0%   { transform: scale(0.4); opacity: 0; }
        60%  { transform: scale(1.15); opacity: 1; }
        100% { transform: scale(1); }
      }
      @keyframes checkmarkAppear {
        0%   { transform: scale(0) rotate(-45deg); opacity: 0; }
        50%  { transform: scale(1.3) rotate(15deg); }
        100% { transform: scale(1) rotate(0deg); opacity: 1; }
      }
      @keyframes fadeInUp {
        0%   { opacity: 0; transform: translateY(30px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      @keyframes fadeOutSlow {
        0%   { opacity: 1; }
        100% { opacity: 0; }
      }
    `;
    document.head.appendChild(style);

    return () => {
      const el = document.getElementById("success-anim-styles");
      if (el) el.remove();
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const userId    = params.get("user_id");
    const amount    = params.get("amount");
    const paymentId = params.get("payment_id");
    const sum       = params.get("sum");
    const ton       = params.get("ton");
    const link      = params.get("link");

    if (!userId || !amount || !paymentId) {
      setError("Noto'g'ri ma'lumotlar");
      setLoading(false);
      return;
    }

    paymentIdRef.current = paymentId;

    const currentDate = new Date().toLocaleString("uz-UZ", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

    const tonAmount = parseFloat(ton || "0");
    const sumAmount = parseFloat(sum || amount);
    const stars = Math.floor(sumAmount / 100);

    const senderUsername = user?.username || "@noma'lum";

    setOrderData({
      orderId: `${paymentId}`,
      paymentId,
      stars,
      amount: sumAmount,
      ton: tonAmount,
      date: currentDate,
      receiver: "Starsbot",
      status: "Kutilmoqda",
      senderUsername,
      paymentLink: link || "",
    });

    setLoading(false);

    const checkStatus = async () => {
      if (!paymentIdRef.current) return;

      const now = new Date().toLocaleTimeString("uz-UZ");
      console.log(`[${now}] 🔍 tekshiruv → payment_id: ${paymentIdRef.current}`);

      try {
        const url = `https://m4746.myxvest.ru/webapp/payments/ton_status.php?payment_id=${paymentIdRef.current}`;
        const res = await fetch(url, { cache: "no-store" });
        const data = await res.json();

        console.log(`[${now}] → `, data);

        if (data.ok && data.status) {
          setCurrentStatus(data.status);

          if (data.status === "paid") {
            console.log(`[${now}] TO‘LOV TASDIQLANDI`);

            setOrderData(prev => ({ ...prev, status: "Tasdiqlangan" }));
            setShowSuccessOverlay(true);

            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
              console.log(`Polling to‘xtatildi`);
            }

            // 3 sekunddan keyin yashirinadi va redirect
            setTimeout(() => {
              const overlay = document.getElementById("success-overlay");
              if (overlay) overlay.style.animation = "fadeOutSlow 0.8s forwards";

              setTimeout(() => {
                setShowSuccessOverlay(false);
                window.location.href = "/payment";
              }, 900);
            }, 3200);
          }
        }
      } catch (err) {
        console.error(`[${now}] xato:`, err);
      }
    };

    checkStatus();
    intervalRef.current = setInterval(checkStatus, 4000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [user]);

  const handlePayment = () => {
    if (orderData?.paymentLink) {
      window.location.href = orderData.paymentLink;
    } else {
      alert("To'lov havolasi topilmadi");
    }
  };

  if (loading) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.card}>
          <div style={styles.loading}>Yuklanmoqda...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.card}>
          <div style={styles.error}>{error}</div>
        </div>
      </div>
    );
  }

  const isConfirmed = currentStatus === "paid" || orderData?.status === "Tasdiqlangan";

  return (
    <div style={styles.wrapper}>
      <div style={styles.card} id="chekCard">
        <div style={styles.user}>
          <div style={styles.avatar}>S</div>
          <h2 style={styles.name}>Ton orqali to’lov</h2>
          <p style={styles.username}>Tonkeeper</p>

          <div
            style={{
              ...styles.verified,
              background: isConfirmed ? "rgba(34,197,94,0.15)" : "rgba(245,158,11,0.15)",
              color: isConfirmed ? "#22c55e" : "#f59e0b",
            }}
          >
            <span>{isConfirmed ? "✔" : "⏳"}</span>
            {isConfirmed ? "Tasdiqlangan" : "Kutilmoqda"}
          </div>
        </div>

        <div style={styles.info}>
          <div style={styles.row}>
            <span>Buyurtma ID</span>
            <strong>{orderData?.orderId}</strong>
          </div>

          <div style={styles.row}>
            <span>Summa</span>
            <strong>{orderData?.amount.toLocaleString()} UZS</strong>
          </div>

          <div style={styles.row}>
            <span>TON miqdori</span>
            <strong style={styles.ton}>{orderData?.ton} TON</strong>
          </div>

          <div style={styles.row}>
            <span>Sana</span>
            <strong>{orderData?.date}</strong>
          </div>

          <div style={styles.row}>
            <span>Status</span>
            <strong style={isConfirmed ? styles.success : styles.pending}>
              {isConfirmed ? "Tasdiqlangan" : "Kutilmoqda"}
            </strong>
          </div>

          <div style={styles.row}>
            <span>Yuboruvchi Username</span>
            <strong>{orderData?.senderUsername}</strong>
          </div>
        </div>

        {!isConfirmed && (
          <button style={styles.paymentButton} onClick={handlePayment}>
            💎 To'lov qilish
          </button>
        )}
      </div>

      {/* Muvaffaqiyatli to‘lov overlay */}
      {showSuccessOverlay && (
        <div
          id="success-overlay"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(34,197,94,0.96)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            opacity: 1,
            transition: "opacity 0.8s ease",
          }}
        >
          <div
            style={{
              textAlign: "center",
              color: "white",
              animation: "successPop 0.9s ease-out forwards",
            }}
          >
            <div
              style={{
                fontSize: "140px",
                marginBottom: "20px",
                fontWeight: "bold",
                animation: "checkmarkAppear 1.1s ease-out forwards",
              }}
            >
              ✓
            </div>
            <h2
              style={{
                fontSize: "34px",
                margin: "0 0 12px 0",
                fontWeight: 700,
                animation: "fadeInUp 0.9s ease-out forwards 0.4s",
                opacity: 0,
              }}
            >
              To'lov tasdiqlandi!
            </h2>
            <p
              style={{
                fontSize: "18px",
                opacity: 0.9,
                animation: "fadeInUp 1s ease-out forwards 0.7s",
                opacity: 0,
              }}
            >
              Starsbot hisobingizga qo‘shildi
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
    background: "#0f0f10",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: "#ffffff",
    lineHeight: "1.5",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    background: "#17181c",
    borderRadius: "22px",
    padding: "24px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
  },
  user: {
    textAlign: "center",
  },
  avatar: {
    width: "64px",
    height: "64px",
    margin: "0 auto 12px",
    borderRadius: "50%",
    background: "#3b82f6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "26px",
    fontWeight: "700",
    color: "white",
  },
  name: {
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "4px",
  },
  username: {
    fontSize: "14px",
    color: "#8b8e99",
    marginBottom: "8px",
  },
  verified: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 14px",
    borderRadius: "999px",
    fontSize: "14px",
    fontWeight: "500",
  },
  info: {
    margin: "24px 0",
    background: "#1f2126",
    borderRadius: "16px",
    padding: "14px 16px",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    fontSize: "14px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  ton: {
    color: "#0098ea",
    fontWeight: "700",
  },
  pending: {
    color: "#f59e0b",
    fontWeight: "600",
  },
  success: {
    color: "#22c55e",
    fontWeight: "700",
  },
  paymentButton: {
    width: "100%",
    padding: "16px",
    fontSize: "17px",
    fontWeight: "600",
    color: "#ffffff",
    background: "linear-gradient(135deg, #0098ea 0%, #0066cc 100%)",
    border: "none",
    borderRadius: "16px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 4px 12px rgba(0,152,234,0.3)",
  },
  loading: {
    textAlign: "center",
    marginTop: "16px",
    fontSize: "14px",
    color: "#9ca3af",
  },
  error: {
    textAlign: "center",
    marginTop: "16px",
    fontSize: "14px",
    color: "#ef4444",
  },
};