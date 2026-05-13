
import { Order } from '../types';

export const MOCK_ORDERS: Order[] = [
  {
    id: 'MM-7829',
    date: '2024-05-15T14:30:00Z',
    status: 'delivered',
    total: 350.00,
    items: [
      {
        productId: '4',
        name: 'ACARA SEVERO MTZ',
        quantity: 1,
        price: 250.00,
        image: ''
      },
      {
        productId: '113',
        name: 'Tucunaré Amarelo Pequeno',
        quantity: 2,
        price: 40.00,
        image: ''
      }
    ],
    trackingCode: 'BR123456789'
  },
  {
    id: 'MM-8102',
    date: '2024-05-20T09:15:00Z',
    status: 'shipped',
    total: 1200.00,
    items: [
      {
        productId: '62',
        name: 'MOREIA BORNEO PYTHON SPINY EEL',
        quantity: 1,
        price: 1200.00,
        image: ''
      }
    ],
    trackingCode: 'BR987654321'
  },
  {
    id: 'MM-8255',
    date: '2024-05-22T16:45:00Z',
    status: 'processing',
    total: 48.00,
    items: [
      {
        productId: '7',
        name: 'Alevino Bagre Pirarara',
        quantity: 1,
        price: 48.00,
        image: ''
      }
    ]
  }
];
