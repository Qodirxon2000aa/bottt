import "./CheckPage.css";

export default function ChekPage() {
  const handleClose = () => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.close();
    } else {
      window.close();
    }
  };

  return (
    <div className="check-wrapper">
      <div className="check-card">

        {/* USER */}
        <div className="check-user">
          <div className="check-avatar">S</div>

          <h2 className="check-name">saviyali_bola</h2>
          <p className="check-username">@saviyali_bola</p>

          <div className="check-verified">
            <span className="check-dot">✔</span>
            Tasdiqlangan
          </div>
        </div>

        {/* INFO */}
        <div className="check-info">
          <div className="check-row">
            <span>Buyurtma id</span>
            <strong>38</strong>
          </div>
        
          <div className="check-row">
            <span>Stars</span>
            <strong className="stars">✨ 100</strong>
          </div>

          <div className="check-row">
            <span>Summa</span>
            <strong>22 000 UZS</strong>
          </div>

          <div className="check-row">
            <span>Sana</span>
            <strong>03 Feb 2026 · 18:19</strong>
          </div>
        </div>

        <button onClick={handleClose} className="check-close">
          Yopish
        </button>
      </div>
    </div>
  );
}
