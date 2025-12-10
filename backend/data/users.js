const bcrypt = require('bcryptjs');

const users = [
    {
        name: 'Admin User',
        email: 'admin@majisa',
        password: 'majisa2254',
        role: 'admin',
    },
    {
        name: 'Priya Sharma',
        email: 'priya@gmail.com',
        password: 'password123',
        role: 'customer',
    },
    {
        name: 'Ramesh Soni',
        email: 'ramesh@majisa.com',
        password: 'password123',
        role: 'goldsmith',
        phone: '+91 98765 12345',
        specialization: 'Antique Jewellery',
        status: 'Active',
        activeOrders: 2,
        completedOrders: 45
    },
    {
        name: 'Suresh Verma',
        email: 'suresh@majisa.com',
        password: 'password123',
        role: 'goldsmith',
        phone: '+91 98765 67890',
        specialization: 'Diamond Setting',
        status: 'Active',
        activeOrders: 0,
        completedOrders: 32
    },
    {
        name: 'Rajesh Jain',
        email: 'vendor@majisa.com',
        password: 'password123',
        role: 'vendor',
        businessName: 'Majisa Jewellers',
        phone: '+91 98765 43210',
        gst: '27ABCDE1234F1Z5',
        city: 'Mumbai',
        status: 'Approved'
    },
    {
        name: 'Amit Shah',
        email: 'amit@royalgems.com',
        password: 'password123',
        role: 'vendor',
        businessName: 'Royal Gems',
        phone: '+91 98765 98765',
        gst: '07ABCDE1234F1Z5',
        city: 'Delhi',
        status: 'Pending'
    }
];

module.exports = users;
