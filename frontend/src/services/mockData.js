// Mock Data Service

export const PRODUCTS = [
    {
        id: 1,
        name: 'Royal Antique Gold Necklace',
        category: 'Necklaces',
        metal: 'Gold',
        purity: '22k',
        weight: '45.500 g',
        price: 245000,
        image: 'https://images.unsplash.com/photo-1599643478518-17488fbbcd75?auto=format&fit=crop&q=80&w=500',
        isNew: true,
        description: 'Handcrafted antique necklace with intricate temple design.'
    },
    {
        id: 2,
        name: 'Diamond Solitaire Ring',
        category: 'Rings',
        metal: 'Gold',
        purity: '18k',
        weight: '5.200 g',
        price: 85000,
        image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=500',
        isNew: false,
        description: 'Classic solitaire diamond ring set in 18k gold.'
    },
    {
        id: 3,
        name: 'Traditional Gold Jhumka',
        category: 'Earrings',
        metal: 'Gold',
        purity: '22k',
        weight: '15.800 g',
        price: 98000,
        image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=500',
        isNew: true,
        description: 'Traditional heavy jhumkas perfect for weddings.'
    },
    {
        id: 4,
        name: 'Temple Design Bangle',
        category: 'Bangles',
        metal: 'Gold',
        purity: '22k',
        weight: '25.500 g',
        price: 155000,
        image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=500',
        isNew: false,
        description: 'Intricate temple design bangle with goddess motifs.'
    },
    {
        id: 5,
        name: 'Silver Anklets (Payal)',
        category: 'Anklets',
        metal: 'Silver',
        purity: '92.5',
        weight: '30.000 g',
        price: 4500,
        image: 'https://images.unsplash.com/photo-1630019852942-f89202989a51?auto=format&fit=crop&q=80&w=500',
        isNew: false,
        description: 'Simple and elegant silver anklets for daily wear.'
    },
    {
        id: 6,
        name: 'Platinum Band',
        category: 'Rings',
        metal: 'Platinum',
        purity: '950',
        weight: '8.500 g',
        price: 42000,
        image: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&q=80&w=500',
        isNew: true,
        description: 'Modern platinum band for men.'
    },
];

export const ORDERS = [
    {
        id: 'ORD-241125-01',
        date: '2024-11-25',
        customer: 'Priya Sharma',
        vendorId: 'VND024',
        items: [
            { productId: 1, name: 'Royal Antique Gold Necklace', quantity: 1, price: 245000 }
        ],
        total: 245000,
        status: 'Pending', // Pending, Accepted, In Process, Completed, Dispatched, Delivered
        goldsmithId: null
    },
    {
        id: 'ORD-241124-05',
        date: '2024-11-24',
        customer: 'Amit Patel',
        vendorId: 'VND024',
        items: [
            { productId: 3, name: 'Traditional Gold Jhumka', quantity: 2, price: 98000 }
        ],
        total: 196000,
        status: 'In Process',
        goldsmithId: 'gld1'
    },
    {
        id: 'ORD-241120-12',
        date: '2024-11-20',
        customer: 'Sneha Gupta',
        vendorId: 'VND001',
        items: [
            { productId: 5, name: 'Silver Anklets', quantity: 1, price: 4500 }
        ],
        total: 4500,
        status: 'Completed',
        goldsmithId: 'gld1'
    }
];

export const GOLDSMITHS = [
    {
        id: 'gld1',
        name: 'Ramesh Soni',
        email: 'ramesh@majisa.com',
        phone: '+91 98765 12345',
        specialization: 'Antique Jewellery',
        status: 'Active',
        activeOrders: 2,
        completedOrders: 45
    },
    {
        id: 'gld2',
        name: 'Suresh Verma',
        email: 'suresh@majisa.com',
        phone: '+91 98765 67890',
        specialization: 'Diamond Setting',
        status: 'Active',
        activeOrders: 0,
        completedOrders: 32
    },
];

export const VENDORS = [
    {
        id: 'VND024',
        name: 'Rajesh Jain',
        businessName: 'Majisa Jewellers',
        email: 'vendor@majisa.com',
        phone: '+91 98765 43210',
        gst: '27ABCDE1234F1Z5',
        city: 'Mumbai',
        status: 'Approved'
    },
    {
        id: 'VND025',
        name: 'Amit Shah',
        businessName: 'Royal Gems',
        email: 'amit@royalgems.com',
        phone: '+91 98765 98765',
        gst: '07ABCDE1234F1Z5',
        city: 'Delhi',
        status: 'Pending'
    },
];
