import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";

export default function ChekListener() {
  const navigate = useNavigate();
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;

    const tg = window.Telegram?.WebApp;
    const startParam = tg?.initDataUnsafe?.start_param;

    if (!startParam) return;

    handledRef.current = true;

    // ✅ endi payment emas, ALOHIDA PAGE
    if (startParam === "chek") {
      navigate("/chek");
      return;
    }

    if (startParam.startsWith("order_")) {
      const id = startParam.replace("order_", "");
      navigate(`/order/${id}`);
    }
  }, [navigate]);

  return null;
}
