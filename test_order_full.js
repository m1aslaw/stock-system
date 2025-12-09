const axios = require('axios');

async function testOrder() {
    const baseURL = 'http://localhost:4000';
    try {
        // 1. Login
        console.log('Logging in...');
        const loginRes = await axios.post(`${baseURL}/api/auth/login`, {
            email: 'admin@maslaw',
            password: '1850'
        });
        const token = loginRes.data.token;
        console.log('Got token:', token ? 'Yes' : 'No');

        // 2. Get Product
        const prodRes = await axios.get(`${baseURL}/api/products`);
        const product = prodRes.data[0];
        if (!product) throw new Error('No products found');
        console.log('Using product:', product.name);

        // 2.5 Update Stock
        console.log('Restocking...');
        await axios.put(`${baseURL}/api/admin/products/${product._id}`, {
            stock: 100
        }, { headers: { Authorization: `Bearer ${token}` } });
        console.log('Restocked!');

        // 3. Place Order
        console.log('Placing order...');
        const orderRes = await axios.post(`${baseURL}/api/orders`, {
            items: [{ productId: product._id, qty: 1 }],
            deliveryLocation: 'Test Location',
            paymentDetails: 'Test Payment'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Order Response:', orderRes.data);

    } catch (e) {
        console.error('Test Failed:', e.response?.data || e.message);
    }
}

testOrder();
