"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export default function Home() {
  const [email, setEmail] = useState("");

  return (
    <>
      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 pt-24 pb-16">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-6xl font-bold max-w-3xl leading-tight"
        >
          AI-powered job suggestions tailored for your future career
        </motion.h2>

        <p className="mt-6 text-gray-400 max-w-xl">
          HireNova analyzes your skills and instantly matches you with the best
          opportunities using advanced AI.
        </p>

        <div className="mt-8 flex gap-3 w-full max-w-md">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:border-blue-500"
          />
          <button className="px-5 py-3 bg-blue-600 rounded-lg hover:bg-blue-700">
            Join
          </button>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-8 py-20 grid md:grid-cols-3 gap-8">
        {[
          {
            title: "AI Job Matching",
            desc: "Get jobs recommended based on your skills and experience.",
          },
          {
            title: "Smart Resume Analysis",
            desc: "Upload your resume and let AI optimize your profile.",
          },
          {
            title: "Real-time Alerts",
            desc: "Never miss a job opportunity with instant notifications.",
          },
        ].map((f, i) => (
          <div
            key={i}
            className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
          >
            <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
            <p className="text-gray-400 text-sm">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* How it works */}
      <section id="how" className="px-8 py-20 text-center">
        <h2 className="text-3xl font-bold mb-10">How HireNova Works</h2>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {["Create Profile", "AI Analysis", "Get Hired"].map((step, i) => (
            <div
              key={i}
              className="p-6 rounded-xl bg-white/5 border border-white/10"
            >
              <div className="text-blue-500 text-2xl font-bold mb-2">
                0{i + 1}
              </div>
              <h3 className="font-semibold">{step}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-8 py-24 text-center from-blue-600/20 to-purple-600/20 border-t border-white/10">
        <h2 className="text-3xl font-bold">
          Start your AI career journey today
        </h2>
        <p className="text-gray-300 mt-3">
          Join thousands of candidates using HireNova
        </p>

        <button className="mt-6 px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700">
          Get Started Free
        </button>
      </section>
    </>
  );
}
