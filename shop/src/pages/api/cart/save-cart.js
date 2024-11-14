import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method === 'POST') {
    const cartData = req.body;


    const filePath = path.join(process.cwd(), 'src/data', 'cart.json');


    try {
      fs.writeFileSync(filePath, JSON.stringify(cartData, null, 2), 'utf8');
      res.status(200).json({ message: 'Cart data saved successfully!' });
    }
    catch (error) {
      res.status(500).json({ error: 'Failed to save cart data' });
    }
  }
  else {
    res.status(405).json({ error: 'Only POST method is allowed' });
  }
};
