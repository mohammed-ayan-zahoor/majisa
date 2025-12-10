import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate form submission
        toast.success('Message sent successfully! We will get back to you soon.');
        setFormData({ name: '', email: '', subject: '', message: '' });
    };

    return (
        <div className="bg-white">
            {/* Header */}
            <div className="bg-primary-900 text-white py-16 text-center">
                <h1 className="text-4xl font-serif font-bold mb-4">Get in Touch</h1>
                <p className="text-primary-100">We'd love to hear from you. Visit us or send us a message.</p>
            </div>

            <div className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* Contact Info */}
                    <div className="space-y-8">
                        <div className="bg-gray-50 p-8 rounded-xl">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Contact Information</h3>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <MapPin className="text-primary-600 mt-1" />
                                    <div>
                                        <h4 className="font-medium text-gray-900">Visit Our Store</h4>
                                        <p className="text-gray-600">123, Gold Market Road,<br />Zaveri Bazaar, Mumbai - 400002</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <Phone className="text-primary-600 mt-1" />
                                    <div>
                                        <h4 className="font-medium text-gray-900">Call Us</h4>
                                        <p className="text-gray-600">+91 98765 43210</p>
                                        <p className="text-gray-600">+91 22 1234 5678</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <Mail className="text-primary-600 mt-1" />
                                    <div>
                                        <h4 className="font-medium text-gray-900">Email Us</h4>
                                        <p className="text-gray-600">info@majisajewellers.com</p>
                                        <p className="text-gray-600">support@majisajewellers.com</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <Clock className="text-primary-600 mt-1" />
                                    <div>
                                        <h4 className="font-medium text-gray-900">Opening Hours</h4>
                                        <p className="text-gray-600">Mon - Sat: 10:00 AM - 8:30 PM</p>
                                        <p className="text-gray-600">Sunday: Closed</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-2xl font-serif font-bold text-gray-900 mb-6">Send us a Message</h3>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="How can we help?"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                                    <textarea
                                        rows="5"
                                        required
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="Write your message here..."
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full md:w-auto bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Send size={20} />
                                    Send Message
                                </button>
                            </form>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Contact;
