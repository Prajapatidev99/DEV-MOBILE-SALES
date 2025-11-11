import * as React from "react";

const BlogPage: React.FC = () => {
  return (
    <div className="animate-fade-in max-w-5xl mx-auto bg-white p-8 rounded-lg shadow-md border border-gray-200 mt-8">
      {/* ======================== BLOG 1 ======================== */}
      <h1 className="text-4xl font-bold mb-6 text-gray-900">
        📱 Top 10 Phones Under ₹20,000 in India (2025)
      </h1>

      <div className="space-y-6 text-gray-700 leading-relaxed">
        <p>
          Finding the best phone under ₹20,000 in 2025 isn’t easy. With so many
          brands launching new models, it’s hard to know which phone actually
          gives the best value.
        </p>

        <p>
          To make it simple, here’s a list of the{" "}
          <strong>Top 10 smartphones under ₹20,000 in India (2025)</strong> —
          based on performance, camera, battery, and features.
        </p>

        {/* ---------- PHONE LIST ---------- */}
        {[
          {
            name: "Redmi Note 14 Pro",
            details: [
              "Display: 6.67″ AMOLED, 120 Hz",
              "Processor: MediaTek Dimensity 7200 Ultra",
              "Camera: 200 MP OIS + 8 MP + 2 MP",
              "Battery: 5000 mAh, 67 W Fast Charging",
            ],
            note: "💬 Best overall value phone for camera lovers.",
          },
          {
            name: "Realme 13 Pro+",
            details: [
              "Display: Curved AMOLED 120 Hz",
              "Processor: Snapdragon 7s Gen 2",
              "Camera: 50 MP Sony IMX890 + 8 MP ultra-wide",
              "Battery: 5000 mAh, 80 W charging",
            ],
            note: "💬 Flagship feel under 20K with premium design.",
          },
          {
            name: "iQOO Z9 5G",
            details: [
              "Display: 6.67″ AMOLED 120 Hz",
              "Processor: MediaTek Dimensity 7200",
              "Camera: 50 MP Sony IMX882",
              "Battery: 5000 mAh, 44 W charging",
            ],
            note: "💬 Best performance phone for gaming and multitasking.",
          },
          {
            name: "Poco X6 Neo",
            details: [
              "Display: 120 Hz AMOLED",
              "Processor: Dimensity 6100+",
              "Camera: 108 MP AI camera",
              "Battery: 5000 mAh",
            ],
            note: "💬 Great looks + solid specs for the price.",
          },
          {
            name: "Samsung Galaxy M15 5G",
            details: [
              "Display: 6.6″ Super AMOLED, 90 Hz",
              "Processor: Exynos 1330",
              "Camera: 50 MP + 5 MP + 2 MP",
              "Battery: 6000 mAh",
            ],
            note: "💬 Samsung trust with best battery backup.",
          },
          {
            name: "Motorola G73 5G",
            details: [
              "Display: 6.5″ IPS LCD, 120 Hz",
              "Processor: Dimensity 930",
              "Camera: 50 MP + 8 MP",
              "Battery: 5000 mAh, 30 W charging",
            ],
            note: "💬 Clean software and stable performance.",
          },
          {
            name: "Vivo T3 5G",
            details: [
              "Display: AMOLED 120 Hz",
              "Processor: Dimensity 7200",
              "Camera: 64 MP OIS",
              "Battery: 5000 mAh",
            ],
            note: "💬 Stylish design + camera phone under 20K.",
          },
          {
            name: "Infinix Zero 30 5G",
            details: [
              "Display: Curved AMOLED, 144 Hz",
              "Processor: Dimensity 8020",
              "Camera: 108 MP triple camera",
              "Battery: 5000 mAh, 68 W charging",
            ],
            note:
              "💬 Best display under ₹20K, perfect for content creators.",
          },
          {
            name: "Tecno Camon 30 5G",
            details: [
              "Display: AMOLED 120 Hz",
              "Processor: Dimensity 7020",
              "Camera: 50 MP Sony sensor",
              "Battery: 5000 mAh",
            ],
            note: "💬 Good camera and stylish design for youth.",
          },
          {
            name: "Lava Blaze Curve 5G",
            details: [
              "Display: Curved AMOLED 120 Hz",
              "Processor: Dimensity 7050",
              "Camera: 64 MP + 8 MP + 2 MP",
              "Battery: 5000 mAh, 33 W charging",
            ],
            note: "💬 Made in India with premium features.",
          },
        ].map((phone, index) => (
          <div key={index}>
            <h2 className="text-2xl font-semibold text-gray-900">
              🏆 {index + 1}️⃣ {phone.name}
            </h2>
            <ul className="list-disc ml-6">
              {phone.details.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
            <p className="mt-1">{phone.note}</p>
          </div>
        ))}

        <hr className="my-6 border-gray-300" />

        <h2 className="text-2xl font-bold text-gray-900">🎯 Final Verdict</h2>
        <ul className="list-disc ml-6">
          <li>
            <strong>Best Camera:</strong> Redmi Note 14 Pro
          </li>
          <li>
            <strong>Best Gaming:</strong> iQOO Z9 5G
          </li>
          <li>
            <strong>Best Battery:</strong> Samsung M15 5G
          </li>
          <li>
            <strong>Best All-Rounder:</strong> Realme 13 Pro+
          </li>
        </ul>
        <p className="mt-3">
          All these phones deliver flagship-level experience under ₹20,000 — no
          compromises!
        </p>
      </div>

      {/* ======================== BLOG 2 ======================== */}
      <hr className="my-10 border-gray-400" />

      <h1 className="text-4xl font-bold mb-6 text-gray-900">
        🎮 Best Gaming Phones in India (2025)
      </h1>

      <div className="space-y-6 text-gray-700 leading-relaxed">
        <p>
          If you love mobile gaming, you need a phone with high refresh rate,
          strong processor, and long battery life. Here are the{" "}
          <strong>Top Gaming Phones in India (2025)</strong> that deliver
          powerful performance and smooth gameplay.
        </p>

        {[
          {
            name: "ASUS ROG Phone 8 Pro",
            details: [
              "Processor: Snapdragon 8 Gen 3",
              "Display: 6.78″ AMOLED 165 Hz",
              "RAM: 16 GB / 24 GB",
              "Battery: 5500 mAh, 65 W Fast Charging",
            ],
            note: "💬 The ultimate gaming beast with advanced cooling.",
          },
          {
            name: "iQOO 12 5G",
            details: [
              "Processor: Snapdragon 8 Gen 3",
              "Display: 6.78″ LTPO AMOLED 144 Hz",
              "Camera: 50 MP + 64 MP telephoto",
              "Battery: 5000 mAh, 120 W charging",
            ],
            note: "💬 Best value flagship for gamers.",
          },
          {
            name: "OnePlus 13",
            details: [
              "Processor: Snapdragon 8 Gen 3",
              "Display: 6.7″ AMOLED 120 Hz",
              "Battery: 5000 mAh, 100 W SUPERVOOC",
            ],
            note: "💬 Sleek flagship perfect for gaming + everyday use.",
          },
          {
            name: "Realme GT 6T",
            details: [
              "Processor: Snapdragon 7+ Gen 3",
              "Display: AMOLED 120 Hz",
              "Battery: 5500 mAh, 120 W charging",
            ],
            note: "💬 Crazy performance + fast charging under 30K.",
          },
          {
            name: "iPhone 15 Pro Max",
            details: [
              "Processor: A17 Pro Chip",
              "Display: 6.7″ Super Retina XDR 120 Hz",
              "Battery: 4400 mAh (optimized)",
            ],
            note: "💬 Best iPhone for gaming – buttery smooth graphics.",
          },
        ].map((phone, index) => (
          <div key={index}>
            <h2 className="text-2xl font-semibold text-gray-900">
              🏆 {index + 1}️⃣ {phone.name}
            </h2>
            <ul className="list-disc ml-6">
              {phone.details.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
            <p className="mt-1">{phone.note}</p>
          </div>
        ))}

        <hr className="my-6 border-gray-300" />

        <h2 className="text-2xl font-bold text-gray-900">🎯 Final Take</h2>
        <p>
          For pure gaming, go for the <strong>ASUS ROG Phone 8 Pro</strong> or 
          <strong>iQOO 12 5G</strong>. If you want both gaming and camera
          balance, the <strong>OnePlus 13</strong> or 
          <strong>Realme GT 6T</strong> offer amazing value for money.
        </p>
      </div>
    </div>
  );
};

export default BlogPage;
