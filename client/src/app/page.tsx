import OrderManager from "../components/OrderManager";

export default async function Home() {
  let menu = [];
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const res = await fetch(`${apiUrl}/menu`, { cache: "no-store" });
    if (res.ok) {
      menu = await res.json();
    }
  } catch (error) {
    console.error("Failed to fetch menu:", error);
  }

  return (
    <div className="page-wrapper">
      {/* Hero Banner */}
      <div className="hero animate-fade-in">
        <h1>Hungry? We've got you.</h1>
        <p>Fresh food, real-time tracking, delivered to your door.</p>
      </div>

      {/* Main App */}
      <OrderManager initialMenu={menu} />
    </div>
  );
}
