import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";

export default function ChekListener() {
  const navigate = useNavigate();
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;

    const tg = window.Telegram?.WebApp;
    const startParam = tg?.initDataUnsafe?.start_param;
    const rawInit = tg?.initData; 

    console.log("START_PARAM:", startParam);
    console.log("RAW initData:", rawInit);

    if (!startParam && !rawInit) return;
    handledRef.current = true;

    // ⁉️ format1
    if (startParam === "chek") {
      navigate("/chek");
      return;
    }

    // ⁉️ order_
    if (startParam?.startsWith("order_")) {
      const id = startParam.replace("order_", "");
      navigate(`/order/${id}`);
      return;
    }

    // 🎯 YANGI: chek_id=39
    if (startParam?.startsWith("chek_id=")) {
      const id = startParam.replace("chek_id=", "");
      navigate(`/chek?id=${id}`);
      return;
    }

    // 📌 IF IT COMES WITHOUT = (check alternate)
    const maybe = startParam?.split("_");
    if (maybe?.length === 2 && maybe[0] === "chek") {
      navigate(`/chek?id=${maybe[1]}`);
      return;
    }

  }, [navigate]);

  return null;
}
