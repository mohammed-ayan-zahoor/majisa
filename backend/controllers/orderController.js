const Order = require('../models/Order');
const sendEmail = require('../utils/sendEmail');
const { addEmailToQueue } = require('../queues/emailQueue');
const { createNotification } = require('./notificationController');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
    const {
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
    } = req.body;

    if (orderItems && orderItems.length === 0) {
        res.status(400).send('No order items');
        return;
    } else {
        const order = new Order({
            orderItems,
            user: req.user._id,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
        });

        const createdOrder = await order.save();

        // Increment Sales Count for each product
        for (const item of orderItems) {
            await Product.findByIdAndUpdate(item.product, { $inc: { sales: Number(item.qty) || 1 } });
        }

        // Create Admin Notification
        await createNotification(
            'info',
            'New Order Received',
            `Order #${createdOrder._id} received from ${req.user.name}`
        );

        // Send Email Notification
        try {
            // Email to Vendor
            if (req.user.email) {
                await addEmailToQueue({
                    email: req.user.email,
                    subject: `Order Confirmation - #${createdOrder._id}`,
                    message: `
                        <h1>Order Received</h1>
                        <p>Hi ${req.user.name},</p>
                        <p>We have received your order. Order ID: ${createdOrder._id}</p>
                        <p>We will notify you once it is processed.</p>
                    `
                });
            }

            // Email to Admin (Optional: sends to the sender/admin email)
            const adminEmail = process.env.EMAIL_FROM || process.env.EMAIL_USERNAME;
            if (adminEmail) {
                await addEmailToQueue({
                    email: adminEmail,
                    subject: `New Order Received - #${createdOrder._id}`,
                    message: `
                        <h1>New Order Alert</h1>
                        <p>Vendor: ${req.user.name} (${req.user.businessName})</p>
                        <p>Order ID: ${createdOrder._id}</p>
                    `
                });
            }

        } catch (error) {
            console.error('Order Email Logic Error:', error);
            // We don't want to fail the order creation just because email failed
        }

        const populatedOrder = await createdOrder.populate('user', 'id name businessName email username');
        res.status(201).json(populatedOrder);
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
    const order = await Order.findById(req.params.id).populate(
        'user',
        'id name businessName email username'
    );

    if (order) {
        res.json(order);
    } else {
        res.status(404).send('Order not found');
    }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
            id: req.body.id,
            status: req.body.status,
            update_time: req.body.update_time,
            email_address: req.body.payer.email_address,
        };

        const updatedOrder = await order.save();

        res.json(updatedOrder);
    } else {
        res.status(404).send('Order not found');
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
    const { status, goldsmithId } = req.body;
    const order = await Order.findById(req.params.id);

    if (order) {
        if (status) order.status = status;
        if (goldsmithId) order.goldsmith = goldsmithId;

        const updatedOrder = await order.save();
        const populatedOrder = await updatedOrder.populate('user', 'id name businessName email username');
        res.json(populatedOrder);
    } else {
        res.status(404).send('Order not found');
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
    let query = { user: req.user._id };
    if (req.user.role === 'goldsmith') {
        query = { goldsmith: req.user._id };
    }
    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json(orders);
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
    const orders = await Order.find({}).populate('user', 'id name businessName email username').sort({ createdAt: -1 });
    res.json(orders);
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
const deleteOrder = async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        await order.deleteOne();
        res.json({ message: 'Order removed' });
    } else {
        res.status(404).send('Order not found');
    }
};

// @desc    Report an issue with an order
// @route   PUT /api/orders/:id/report
// @access  Private (Goldsmith/Vendor)
const reportOrderIssue = async (req, res) => {
    const { issue } = req.body;
    const order = await Order.findById(req.params.id);

    if (order) {
        // Create Admin Notification
        await createNotification(
            'error',
            'Order Issue Reported',
            `Issue reported for Order #${order._id} by ${req.user.name}: ${issue}`
        );

        res.json({ message: 'Issue reported to admin' });
    } else {
        res.status(404).send('Order not found');
    }
};

module.exports = {
    addOrderItems,
    getOrderById,
    updateOrderToPaid,
    updateOrderStatus,
    getMyOrders,
    getOrders,
    deleteOrder,
    reportOrderIssue,
};
