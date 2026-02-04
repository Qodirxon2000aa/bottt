import { useState } from "react";
import "../../styles/Payment.css";

type PaymentMethod = "payme" | "uzcard" | "click" | "tonkeeper";

const PaymentImages = {
  payme: "https://api.logobank.uz/media/logos_preview/payme-01.png",
  uzcard: "https://i.ibb.co/Z1Wk441P/image-Photoroom.png",
  click: "https://api.logobank.uz/media/logos_preview/Click-01_0xvqWH8.png",
  tonkeeper: "https://i.ibb.co/jkLrSV3X/image-Photoroom-1.png",
};

export default function Payment() {
  const [method, setMethod] = useState<PaymentMethod>("click");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [loadedImages, setLoadedImages] = useState<Set<PaymentMethod>>(new Set());

  const handleImageLoad = (m: PaymentMethod) => {
    setLoadedImages((prev) => new Set(prev).add(m));
  };

  const isImageLoaded = (m: PaymentMethod) => loadedImages.has(m);

  // Input o'zgarishi uchun handler
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value);
    // Agar raqam bo'lsa, xatolikni o'chirib yuborish
    if (value === "" || !isNaN(parseFloat(value))) {
      setError("");
    }
  };

  const handleSubmit = () => {
    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum)) {
      setError("To'lov miqdorini kiriting");
      return;
    }
    if (amountNum < 1000) {
      setError("To'lov miqdori 1000 so'mdan kam bo'lmasligi kerak");
      return;
    }
    if (amountNum > 10000000) {
      setError("To'lov miqdori 10,000,000 so'mdan oshmasligi kerak");
      return;
    }

    setError("");
    console.log("To'lov usuli:", method);
    console.log("Summa:", amountNum);
    alert(`${method.toUpperCase()} orqali ${amount} so'm to'lov amalga oshirildi!`);
  };

  return (
    <div className="payment-wrapper">
      {/* Header */}
      <div className="payment-card">
        <div className="payment-row">
          <div className="payment-row-column">
            <span className="payment-label">Qabul qiluvchi</span>
            <span className="payment-receiver">Starsbot</span>
          </div>
          <div className="payment-row-column">
            <span className="payment-label">Chegirma</span>
            <span className="payment-price">0%</span>
          </div>
        </div>
      </div>

      {/* Shartlar */}
      <div className="payment-input-block" style={{ marginBottom: 20 }}>
        <p className="payment-info-text">
          ℹ️ To'lov miqdori 1000 so'mdan kam va 10,000,000 so'mdan oshmasligi kerak
        </p>
      </div>

      {/* To'lov tizimi */}
      <div style={{ marginBottom: 20 }}>
        <h3 className="payment-title">To'lov tizimini tanlang</h3>
        <div className="payment-methods">
          {(["payme", "uzcard", "click", "tonkeeper"] as PaymentMethod[]).map((m) => (
            <div
              key={m}
              onClick={() => setMethod(m)}
              className={`payment-method ${method === m ? "selected" : ""}`}
              style={{ cursor: "pointer" }}
            >
              {/* Skeleton Loader */}
              {!isImageLoaded(m) && <div className="payment-skeleton"></div>}

              {/* Image */}
              <img
                src={PaymentImages[m]}
                alt={m.charAt(0).toUpperCase() + m.slice(1)}
                className={`payment-logo ${isImageLoaded(m) ? "loaded" : ""}`}
                onLoad={() => handleImageLoad(m)}
                onError={(e) => {
                  handleImageLoad(m);
                  e.currentTarget.style.display = "none";
                  const fallback = {
                    payme: { letter: "P", color: "#6366f1" },
                    uzcard: { letter: "U", color: "#1e90ff" },
                    click: { letter: "C", color: "#fdb813" },
                    tonkeeper: { letter: "T", color: "#0098ea" },
                  }[m];
                  if (e.currentTarget.parentElement) {
                    e.currentTarget.parentElement.innerHTML = 
                      `<span style="font-size: 40px; font-weight: 700; color: ${fallback.color};">${fallback.letter}</span>`;
                  }
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Miqdor */}
      <div className="payment-input-block">
        <label htmlFor="amount-input" className="payment-input-label">
          To'lov miqdori (so'm)
        </label>
        <input
          id="amount-input"
          type="number"
          value={amount}
          onChange={handleAmountChange}
          placeholder="Masalan: 50000"
          className="payment-input"
          style={{
            cursor: "text",
            pointerEvents: "auto",
            opacity: 1,
          }}
          disabled={false}
        />
        {error && <p className="payment-error">⚠️ {error}</p>}
      </div>

      {/* Tugma */}
      <button 
        onClick={handleSubmit} 
        className="payment-button"
        style={{ cursor: "pointer" }}
      >
        ✓ Yuborish
      </button>
    </div>
  );
}