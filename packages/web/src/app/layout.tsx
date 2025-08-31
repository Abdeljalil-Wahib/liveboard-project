import { Orbitron } from "next/font/google";
import Image from "next/image";
import "./globals.css";

const orbitron = Orbitron({ subsets: ["latin"] });

export const metadata = {
  title: "Liveboard - Collaborative Whiteboard",
  description: "A real-time collaborative whiteboard built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={orbitron.className}>
        <div className="fixed h-screen w-screen -z-10">
          <Image
            src="/images/hero-bg.png"
            alt="Holographic whiteboard background"
            fill
            style={{
              objectFit: "cover",
              objectPosition: "center 40%",
            }}
          />
          <div className="absolute inset-0 bg-background/70" />
        </div>

        {children}
      </body>
    </html>
  );
}
