import { createContext, useContext, useEffect, useState, useRef } from "react";

const TelegramContext = createContext(null);

export const TelegramProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [apiUser, setApiUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);

  /* ========================= 👤 USER FETCH ========================= */
  const fetchUserFromApi = async (telegramId) => {
    try {
      setLoading(true);
      const url = `https://tezpremium.uz/SherifZakaz/webapp/get_user.php?user_id=${telegramId}`;
      console.log("📡 Fetching user from API:", url);
      
      const res = await fetch(url, {
        headers: { Accept: "application/json" },
        cache: "no-cache",
      });
      
      if (!res.ok) throw new Error("User fetch error");
      
      const text = await res.text();
      const data = JSON.parse(text);
      
      console.log("📡 API Response:", data);
      
      const userData = data.ok
        ? { balance: data.data?.balance || "0", ...data.data }
        : { balance: "0" };
        
      setApiUser(userData);
      console.log("✅ User data loaded:", userData);
      return userData;
    } catch (err) {
      console.error("❌ fetchUserFromApi:", err.message);
      const fallback = { balance: "0" };
      setApiUser(fallback);
      return fallback;
    } finally {
      setLoading(false);
    }
  };

  /* ========================= 📦 ORDERS ========================= */
  const fetchOrders = async (telegramId) => {
    try {
      const url = `https://tezpremium.uz/SherifZakaz/webapp/history.php?user_id=${telegramId}`;
      console.log("📦 Fetching orders from:", url);
      
      const res = await fetch(url);
      const data = await res.json();
      console.log("📦 Orders response:", data);
      
      setOrders(data.ok && Array.isArray(data.orders) ? data.orders : []);
    } catch (err) {
      console.error("❌ fetchOrders error:", err);
      setOrders([]);
    }
  };

  /* ========================= 💳 PAYMENTS ========================= */
  const fetchPayments = async (telegramId) => {
    try {
      const url = `https://tezpremium.uz/SherifZakaz/webapp/payments.php?user_id=${telegramId}`;
      console.log("💳 Fetching payments from:", url);
      
      const res = await fetch(url);
      const data = await res.json();
      console.log("💳 Payments response:", data);
      
      setPayments(data.ok && Array.isArray(data.payments) ? data.payments : []);
    } catch (err) {
      console.error("❌ fetchPayments error:", err);
      setPayments([]);
    }
  };

  /* ========================= ⭐ ORDER ========================= */
  const createOrder = async ({ amount, sent, type, overall }) => {
    try {
      if (!user?.id) throw new Error("User topilmadi");
      
      const url =
        `https://tezpremium.uz/SherifZakaz/webapp/order.php` +
        `?user_id=${user.id}&amount=${amount}&sent=@${sent.replace("@", "")}` +
        `&type=${type}&overall=${overall}`;
        
      console.log("⭐ Creating order:", url);
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.ok) {
        await fetchUserFromApi(user.id);
        await fetchOrders(user.id);
        return { ok: true };
      }
      return { ok: false };
    } catch (err) {
      console.error("❌ createOrder error:", err);
      return { ok: false };
    }
  };

  /* ========================= 💎 PREMIUM ========================= */
  const createPremiumOrder = async ({ months, sent, overall }) => {
    try {
      if (!user?.id) throw new Error("User topilmadi");
      
      const url =
        `https://tezpremium.uz/SherifZakaz/webapp/premium.php` +
        `?user_id=${user.id}&amount=${months}&sent=${sent.replace("@", "")}` +
        `&overall=${overall}`;
        
      console.log("💎 Creating premium order:", url);
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.ok) {
        await fetchUserFromApi(user.id);
        await fetchOrders(user.id);
        return { ok: true, ...data };
      }
      return { ok: false, message: data.message };
    } catch (e) {
      console.error("❌ createPremiumOrder error:", e);
      return { ok: false, message: e.message };
    }
  };

  /* ========================= 🎁 GIFT ORDER ========================= */
  const createGiftOrder = async ({ giftId, sent, price }) => {
    try {
      if (!user?.id) throw new Error("User topilmadi");
      
      const balance = Number(apiUser?.balance || 0);
      if (balance < price) {
        return { ok: false, message: "Balans yetarli emas" };
      }
      
      const cleanUsername = sent.startsWith("@") ? sent : `@${sent}`;
      const url =
        `https://tezpremium.uz/SherifZakaz/webapp/gifting.php` +
        `?user_id=${user.id}` +
        `&gift_id=${giftId}` +
        `&sent=${encodeURIComponent(cleanUsername)}`;
        
      console.log("🎁 Creating gift order:", url);
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (!data?.ok) {
        return { ok: false, message: data?.message || "Gift xatosi" };
      }
      
      await fetchUserFromApi(user.id);
      await fetchOrders(user.id);
      return { ok: true, data };
    } catch (e) {
      console.error("❌ createGiftOrder error:", e);
      return { ok: false, message: e.message };
    }
  };

  /* ========================= 🔄 REFRESH ========================= */
  const refreshUser = async () => {
    if (user?.id) {
      console.log("🔄 Refreshing data for user:", user.id);
      await fetchUserFromApi(user.id);
      await fetchOrders(user.id);
      await fetchPayments(user.id);
    }
  };

  /* ========================= 🚀 INIT ========================= */
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const telegram = window.Telegram?.WebApp;
    
    // Telegram Web App mavjudligini tekshirish
    if (telegram) {
      telegram.ready();
      telegram.expand();
      console.log("📱 Telegram WebApp initialized");
    }

    const tgUser = telegram?.initDataUnsafe?.user;
    
    // ============================================
    // TELEGRAM WEB APP ORQALI KIRILSA
    // ============================================
    if (tgUser?.id) {
      console.log("✅ Real Telegram user detected:");
      console.log("   - Telegram ID:", tgUser.id);
      console.log("   - First Name:", tgUser.first_name);
      console.log("   - Username:", tgUser.username);
      
      // 1️⃣ Telegram user ma'lumotlarini saqlash
      const userData = {
        id: String(tgUser.id), // Telegram ID
        first_name: tgUser.first_name || "",
        last_name: tgUser.last_name || "",
        username: tgUser.username ? `@${tgUser.username}` : "",
        photo_url: tgUser.photo_url || null,
        isTelegram: true,
      };
      
      setUser(userData);
      
      // 2️⃣ Telegram ID orqali API dan ma'lumotlarni olish
      (async () => {
        console.log(`🔍 Fetching data for Telegram ID: ${tgUser.id}`);
        await fetchUserFromApi(tgUser.id);  // ✅ Telegram ID
        await fetchOrders(tgUser.id);        // ✅ Telegram ID
        await fetchPayments(tgUser.id);      // ✅ Telegram ID
        console.log("✅ All data loaded successfully!");
      })();
    } 
    // ============================================
    // BRAUZERDA OCHILSA - FAKE DATA
    // ============================================
    else {
      console.log("⚠️ Not in Telegram - Using dev mode");
      console.log("   - Using fake ID: 7521806735");
      
      const devUser = {
        id: "7521806735",
        first_name: "Qodirxon",
        last_name: "Dev",
        username: "@qiyossiz",
        photo_url: null,
        isTelegram: false,
      };
      
      setUser(devUser);
      
      // Fake user ID bilan ma'lumotlarni yuklash
      (async () => {
        await fetchUserFromApi("7521806735");
        await fetchOrders("7521806735");
        await fetchPayments("7521806735");
      })();
    }
  }, []);

  return (
    <TelegramContext.Provider
      value={{
        user,
        apiUser,
        orders,
        payments,
        loading,
        createOrder,
        createPremiumOrder,
        createGiftOrder,
        refreshUser,
      }}
    >
      {children}
    </TelegramContext.Provider>
  );
};

export const useTelegram = () => {
  const ctx = useContext(TelegramContext);
  if (!ctx) throw new Error("useTelegram must be used inside provider");
  return ctx;
};