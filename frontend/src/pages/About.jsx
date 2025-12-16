import React from 'react';
import SEO from '../components/common/SEO';

const About = () => {
    return (
        <div className="bg-white">
            <SEO title="Our Story" description="Majisa Jewellers - Crafting timeless legacy since 1995." />
            {/* Hero Section */}
            <div className="relative bg-primary-900 text-white py-24">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">Our Legacy of Excellence</h1>
                    <p className="text-lg text-primary-100 max-w-2xl mx-auto">
                        Crafting timeless jewellery pieces since 1995, Majisa Jewellers represents the perfect blend of tradition and modernity.
                    </p>
                </div>
            </div>

            {/* Story Section */}
            <div className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div>
                        <img
                            src="https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&q=80&w=800"
                            alt="Jewellery Making"
                            className="rounded-xl shadow-lg"
                        />
                    </div>
                    <div className="space-y-6">
                        <h2 className="text-3xl font-serif font-bold text-gray-900">The Art of Craftsmanship</h2>
                        <p className="text-gray-600 leading-relaxed">
                            At Majisa Jewellers, every piece tells a story. Our journey began over two decades ago with a simple vision: to create jewellery that celebrates the beauty of life's most precious moments.
                        </p>
                        <p className="text-gray-600 leading-relaxed">
                            We take pride in our team of master artisans who bring centuries-old techniques to life, ensuring that each creation is not just an accessory, but a work of art to be cherished for generations.
                        </p>
                        <div className="grid grid-cols-3 gap-6 pt-6">
                            <div>
                                <h3 className="text-3xl font-bold text-primary-600">25+</h3>
                                <p className="text-sm text-gray-500">Years Experience</p>
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold text-primary-600">50k+</h3>
                                <p className="text-sm text-gray-500">Happy Customers</p>
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold text-primary-600">100%</h3>
                                <p className="text-sm text-gray-500">Certified Purity</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Values Section */}
            <div className="bg-gray-50 py-16">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-serif font-bold text-gray-900">Our Core Values</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { title: 'Purity', desc: 'We guarantee 100% certified gold and diamonds in every piece.' },
                            { title: 'Transparency', desc: 'Honest pricing and clear breakdown of metal and stone charges.' },
                            { title: 'Innovation', desc: 'Blending traditional designs with contemporary aesthetics.' }
                        ].map((value, idx) => (
                            <div key={idx} className="bg-white p-8 rounded-xl shadow-sm text-center">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h3>
                                <p className="text-gray-600">{value.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
