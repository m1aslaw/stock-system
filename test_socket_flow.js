const io = require('socket.io-client');
const axios = require('axios');

const baseURL = 'http://localhost:4000';
const socket = io(baseURL);

async function testFlow() {
    console.log('Testing Socket Flow...');

    // 1. Listen for events
    socket.on('connect', () => console.log('Socket Connected'));

    let myOrderId = null;

    socket.on('orderStatusChanged', (data) => {
        console.log('>>> RECEIVED SOCKET EVENT:', data);
        if (data.orderId === myOrderId) {
            console.log('✅ SUCCESS: Verified event received for my order!');
            process.exit(0);
        } else {
            console.log('Received event for another order:', data.orderId);
        }
    });

    // 2. Login & Place Order
    try {
        console.log('Logging in...');
        const loginRes = await axios.post(`${baseURL}/api/auth/login`, {
            email: 'admin@maslaw',
            password: '1850'
        });
        const token = loginRes.data.token;

        // Get Product
        const prodRes = await axios.get(`${baseURL}/api/products`);
        const product = prodRes.data[0];

        // Ensure stock
        await axios.put(`${baseURL}/api/admin/products/${product._id}`, { stock: 100 }, { headers: { Authorization: `Bearer ${token}` } });

        console.log('Placing order...');
        const orderRes = await axios.post(`${baseURL}/api/orders`, {
            items: [{ productId: product._id, qty: 1 }],
            deliveryLocation: 'Test Loc',
            paymentDetails: 'TestPay'
        }, { headers: { Authorization: `Bearer ${token}` } });

        myOrderId = orderRes.data.order._id;
        console.log('Order Placed. ID:', myOrderId);

        // 3. Admin Verify
        console.log('Verifying order in 2 seconds...');
        setTimeout(async () => {
            await axios.put(`${baseURL}/api/admin/orders/${myOrderId}/verify`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Verification Request Sent.');
        }, 2000);

    } catch (e) {
        console.error('Test Failed:', e.message);
        process.exit(1);
    }
}

testFlow();
