import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method === 'GET') {
    const filePath = path.join(process.cwd(), 'src/data', 'cart.json');
    try {
      const fileData = fs.readFileSync(filePath, 'utf8');
      const cartData = JSON.parse(fileData);
      res.status(200).json(cartData);
    } catch (error) {
      res.status(500).json({ error: 'Failed to load cart data' });
    }
  } else {
    res.status(405).json({ error: 'Only GET method is allowed' });
  }
}
