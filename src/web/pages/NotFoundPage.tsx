import { Link } from "wouter";

export default function NotFoundPage() {
  return (
    <div className="not-found-page">
      {/* Floating stars background */}
      <div className="stars-bg" aria-hidden="true">
        {[...Array(12)].map((_, i) => (
          <span key={i} className={`star star-${i + 1}`}>✦</span>
        ))}
      </div>

      <div className="not-found-card">
        {/* Rainbow arc */}
        <div className="rainbow-wrap" aria-hidden="true">
          <svg viewBox="0 0 260 100" width="260" height="100" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="rainbow404" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="#F25990"/>
                <stop offset="20%"  stopColor="#FF8C42"/>
                <stop offset="40%"  stopColor="#FFD600"/>
                <stop offset="60%"  stopColor="#4DC9A0"/>
                <stop offset="80%"  stopColor="#4A90D9"/>
                <stop offset="100%" stopColor="#9B59E8"/>
              </linearGradient>
              <linearGradient id="rainbow404b" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="#FF85B3"/>
                <stop offset="20%"  stopColor="#FFB347"/>
                <stop offset="40%"  stopColor="#FFE44D"/>
                <stop offset="60%"  stopColor="#7DDFC4"/>
                <stop offset="80%"  stopColor="#74B3F0"/>
                <stop offset="100%" stopColor="#BC8AF5"/>
              </linearGradient>
              <linearGradient id="rainbow404c" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="#FFB3D4"/>
                <stop offset="20%"  stopColor="#FFD0A0"/>
                <stop offset="40%"  stopColor="#FFF0A0"/>
                <stop offset="60%"  stopColor="#B0EEE0"/>
                <stop offset="80%"  stopColor="#B0D8FF"/>
                <stop offset="100%" stopColor="#DCC8FF"/>
              </linearGradient>
            </defs>
            <path d="M 10 90 A 120 120 0 0 1 250 90" stroke="url(#rainbow404)"  strokeWidth="11" fill="none" strokeLinecap="round"/>
            <path d="M 24 90 A 106 106 0 0 1 236 90" stroke="url(#rainbow404b)" strokeWidth="11" fill="none" strokeLinecap="round"/>
            <path d="M 38 90 A 92 92  0 0 1 222 90" stroke="url(#rainbow404c)" strokeWidth="11" fill="none" strokeLinecap="round"/>
            {/* Stars under arc */}
            <g fill="#FFD700">
              <polygon points="100,78 101.8,83 107,83 102.8,86 104.3,91 100,88 95.7,91 97.2,86 93,83 98.2,83" transform="scale(0.85) translate(18,0)"/>
              <polygon points="120,72 121.8,77 127,77 122.8,80 124.3,85 120,82 115.7,85 117.2,80 113,77 118.2,77" transform="scale(0.85) translate(14,0)"/>
              <polygon points="130,78 131.8,83 137,83 132.8,86 134.3,91 130,88 125.7,91 127.2,86 123,83 128.2,83" transform="scale(0.9)"/>
              <polygon points="150,72 151.8,77 157,77 152.8,80 154.3,85 150,82 145.7,85 147.2,80 143,77 148.2,77" transform="scale(0.85) translate(-14,0)"/>
              <polygon points="170,78 171.8,83 177,83 172.8,86 174.3,91 170,88 165.7,91 167.2,86 163,83 168.2,83" transform="scale(0.85) translate(-28,0)"/>
            </g>
          </svg>
        </div>

        {/* 404 number */}
        <p className="error-code">404</p>

        <h1 className="error-title">
          Dieser Wunsch scheint<br />schon erfüllt worden zu sein ✨
        </h1>

        <p className="error-body">
          Die Seite, die du suchst, gibt es leider nicht – vielleicht wurde
          die Wunschliste gelöscht oder der Link ist nicht mehr gültig.
        </p>

        <div className="error-actions">
          <Link href="/" className="btn-primary">
            Zur Startseite
          </Link>
          <Link href="/dashboard" className="btn-ghost">
            Meine Listen
          </Link>
        </div>
      </div>

      <style>{`
        .not-found-page {
          min-height: 100vh;
          background: #FDF8FC;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          position: relative;
          overflow: hidden;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        /* Floating stars */
        .stars-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .star {
          position: absolute;
          color: #FFD700;
          opacity: 0.25;
          animation: drift 6s ease-in-out infinite;
        }
        .star-1  { top: 8%;  left: 7%;  font-size: 18px; animation-delay: 0s; }
        .star-2  { top: 15%; left: 85%; font-size: 12px; animation-delay: 0.8s; }
        .star-3  { top: 30%; left: 92%; font-size: 20px; animation-delay: 1.6s; }
        .star-4  { top: 60%; left: 5%;  font-size: 10px; animation-delay: 2.4s; }
        .star-5  { top: 75%; left: 88%; font-size: 16px; animation-delay: 0.4s; }
        .star-6  { top: 88%; left: 15%; font-size: 14px; animation-delay: 3.2s; }
        .star-7  { top: 5%;  left: 45%; font-size: 10px; animation-delay: 1.2s; }
        .star-8  { top: 45%; left: 2%;  font-size: 22px; animation-delay: 2.0s; }
        .star-9  { top: 92%; left: 60%; font-size: 12px; animation-delay: 0.6s; }
        .star-10 { top: 20%; left: 30%; font-size: 8px;  animation-delay: 3.8s; }
        .star-11 { top: 70%; left: 72%; font-size: 18px; animation-delay: 1.4s; }
        .star-12 { top: 50%; left: 96%; font-size: 10px; animation-delay: 2.8s; }

        @keyframes drift {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.25; }
          50%       { transform: translateY(-8px) rotate(15deg); opacity: 0.45; }
        }

        /* Card */
        .not-found-card {
          position: relative;
          background: white;
          border: 1px solid #F0D5E5;
          border-radius: 24px;
          box-shadow: 0 8px 40px rgba(210, 59, 114, 0.10);
          padding: 48px 40px 44px;
          max-width: 480px;
          width: 100%;
          text-align: center;
        }

        .rainbow-wrap {
          display: flex;
          justify-content: center;
          margin-bottom: 4px;
        }

        .error-code {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 72px;
          font-weight: 700;
          line-height: 1;
          margin: 0 0 8px;
          background: linear-gradient(135deg, #F25990, #B02558);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .error-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 22px;
          font-weight: 700;
          color: #122050;
          line-height: 1.4;
          margin: 0 0 16px;
        }

        .error-body {
          font-size: 15px;
          color: #5A3A4A;
          line-height: 1.7;
          margin: 0 0 32px;
        }

        .error-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn-primary {
          display: inline-block;
          background: linear-gradient(135deg, #F25990, #B02558);
          color: white;
          border-radius: 50px;
          padding: 12px 28px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
          box-shadow: 0 4px 16px rgba(210, 59, 114, 0.30);
          transition: opacity 0.15s, transform 0.15s;
        }
        .btn-primary:hover {
          opacity: 0.90;
          transform: translateY(-1px);
        }

        .btn-ghost {
          display: inline-block;
          background: #FFF0F5;
          border: 1px solid #FFB3D1;
          color: #B02558;
          border-radius: 50px;
          padding: 12px 28px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
          transition: background 0.15s, transform 0.15s;
        }
        .btn-ghost:hover {
          background: #FFD6E7;
          transform: translateY(-1px);
        }

        @media (max-width: 480px) {
          .not-found-card {
            padding: 36px 24px 32px;
          }
          .error-code {
            font-size: 56px;
          }
          .error-title {
            font-size: 19px;
          }
          .error-actions {
            flex-direction: column;
            align-items: center;
          }
          .btn-primary, .btn-ghost {
            width: 100%;
            text-align: center;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .star { animation: none; }
        }
      `}</style>
    </div>
  );
}
