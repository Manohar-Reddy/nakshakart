"use client";
import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
  };

  return (
    <>
      <Navbar />
      <main className="bg-slate-50 min-h-screen">

        {/* Header */}
        <section className="bg-gradient-to-br from-teal-700 to-teal-500 text-white py-10 px-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Contact Us</h1>
          <p className="text-teal-100">We'd love to hear from you!</p>
        </section>

        <section className="max-w-6xl mx-auto px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

            {/* Contact Info */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Get in Touch</h2>
              <p className="text-gray-500 mb-8 leading-relaxed">
                Have questions about our house plans? Want to join as an architect? Or just need help with your purchase? We're here to help!
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-teal-100 rounded-xl p-3 text-2xl">📧</div>
                  <div>
                    <p className="font-bold text-gray-800">Email Us</p>
                    <p className="text-gray-500 text-sm">support@nakshakart.com</p>
                    <p className="text-gray-400 text-xs mt-1">We reply within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-orange-100 rounded-xl p-3 text-2xl">📞</div>
                  <div>
                    <p className="font-bold text-gray-800">Call Us</p>
                    <p className="text-gray-500 text-sm">+91 98765 43210</p>
                    <p className="text-gray-400 text-xs mt-1">Mon - Sat, 9 AM to 6 PM</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 rounded-xl p-3 text-2xl">📍</div>
                  <div>
                    <p className="font-bold text-gray-800">Visit Us</p>
                    <p className="text-gray-500 text-sm">Hyderabad, Telangana, India</p>
                    <p className="text-gray-400 text-xs mt-1">By appointment only</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-green-100 rounded-xl p-3 text-2xl">💬</div>
                  <div>
                    <p className="font-bold text-gray-800">WhatsApp</p>
                    <p className="text-gray-500 text-sm">+91 98765 43210</p>
                    <p className="text-gray-400 text-xs mt-1">Quick responses on WhatsApp</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              {success ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
                  <div className="text-5xl mb-4">✅</div>
                  <h3 className="text-xl font-bold text-teal-700 mb-2">Message Sent!</h3>
                  <p className="text-gray-500 mb-6">Thank you for contacting us. We'll get back to you within 24 hours.</p>
                  <button
                    onClick={() => {
                      setSuccess(false);
                      setName("");
                      setEmail("");
                      setSubject("");
                      setMessage("");
                    }}
                    className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-5">
                  <h2 className="text-xl font-bold text-gray-800 mb-2">Send a Message</h2>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Manohar Reddy"
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="purchase">Purchase Help</option>
                      <option value="architect">Join as Architect</option>
                      <option value="refund">Refund Request</option>
                      <option value="technical">Technical Support</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Write your message here..."
                      required
                      rows={5}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition"
                  >
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
