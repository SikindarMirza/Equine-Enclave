// In-memory data store for riders
// In production, this would be replaced with a database

const morningBatches = [
  {
    name: 'Batch 1',
    time: '6:00 AM - 7:30 AM',
    riders: [
      { id: 1, name: 'Aanya Sharma', age: 14, phone: '+91 98765 43210', email: 'aanya.s@email.com', activeClasses: 28, level: 'intermediate', joinedDate: '2024-03-15', feesPaid: true },
      { id: 2, name: 'Rohan Kapoor', age: 16, phone: '+91 98765 43211', email: 'rohan.k@email.com', activeClasses: 32, level: 'advanced', joinedDate: '2023-11-20', feesPaid: true },
      { id: 3, name: 'Priya Malhotra', age: 12, phone: '+91 98765 43212', email: 'priya.m@email.com', activeClasses: 14, level: 'beginner', joinedDate: '2025-01-10', feesPaid: false },
      { id: 4, name: 'Arjun Singh', age: 15, phone: '+91 98765 43213', email: 'arjun.s@email.com', activeClasses: 26, level: 'intermediate', joinedDate: '2024-06-22', feesPaid: true },
      { id: 5, name: 'Meera Patel', age: 13, phone: '+91 98765 43214', email: 'meera.p@email.com', activeClasses: 18, level: 'beginner', joinedDate: '2025-02-05', feesPaid: false },
    ]
  },
  {
    name: 'Batch 2',
    time: '7:30 AM - 9:00 AM',
    riders: [
      { id: 6, name: 'Kabir Verma', age: 17, phone: '+91 98765 43215', email: 'kabir.v@email.com', activeClasses: 30, level: 'advanced', joinedDate: '2023-08-14', feesPaid: true },
      { id: 7, name: 'Ishaan Reddy', age: 14, phone: '+91 98765 43216', email: 'ishaan.r@email.com', activeClasses: 22, level: 'intermediate', joinedDate: '2024-04-18', feesPaid: true },
      { id: 8, name: 'Tara Gupta', age: 11, phone: '+91 98765 43217', email: 'tara.g@email.com', activeClasses: 12, level: 'beginner', joinedDate: '2025-03-01', feesPaid: false },
      { id: 9, name: 'Vikram Joshi', age: 16, phone: '+91 98765 43218', email: 'vikram.j@email.com', activeClasses: 35, level: 'advanced', joinedDate: '2023-09-25', feesPaid: true },
      { id: 10, name: 'Ananya Kumar', age: 13, phone: '+91 98765 43219', email: 'ananya.k@email.com', activeClasses: 20, level: 'intermediate', joinedDate: '2024-07-30', feesPaid: false },
    ]
  },
  {
    name: 'Batch 3',
    time: '9:00 AM - 10:30 AM',
    riders: [
      { id: 11, name: 'Siddharth Rao', age: 15, phone: '+91 98765 43220', email: 'siddharth.r@email.com', activeClasses: 27, level: 'intermediate', joinedDate: '2024-02-12', feesPaid: true },
      { id: 12, name: 'Nisha Agarwal', age: 12, phone: '+91 98765 43221', email: 'nisha.a@email.com', activeClasses: 15, level: 'beginner', joinedDate: '2025-01-28', feesPaid: false },
      { id: 13, name: 'Aarav Mehta', age: 18, phone: '+91 98765 43222', email: 'aarav.m@email.com', activeClasses: 40, level: 'advanced', joinedDate: '2023-05-17', feesPaid: true },
      { id: 14, name: 'Diya Iyer', age: 14, phone: '+91 98765 43223', email: 'diya.i@email.com', activeClasses: 24, level: 'intermediate', joinedDate: '2024-08-09', feesPaid: true },
      { id: 15, name: 'Karan Bhatia', age: 16, phone: '+91 98765 43224', email: 'karan.b@email.com', activeClasses: 29, level: 'advanced', joinedDate: '2023-12-03', feesPaid: false },
    ]
  }
];

const eveningBatches = [
  {
    name: 'Batch 1',
    time: '4:00 PM - 5:30 PM',
    riders: [
      { id: 16, name: 'Riya Desai', age: 13, phone: '+91 98765 43225', email: 'riya.d@email.com', activeClasses: 16, level: 'beginner', joinedDate: '2025-02-20', feesPaid: true },
      { id: 17, name: 'Aditya Nair', age: 17, phone: '+91 98765 43226', email: 'aditya.n@email.com', activeClasses: 38, level: 'advanced', joinedDate: '2023-07-11', feesPaid: true },
      { id: 18, name: 'Pooja Saxena', age: 15, phone: '+91 98765 43227', email: 'pooja.s@email.com', activeClasses: 26, level: 'intermediate', joinedDate: '2024-05-06', feesPaid: false },
      { id: 19, name: 'Rahul Choudhury', age: 14, phone: '+91 98765 43228', email: 'rahul.c@email.com', activeClasses: 21, level: 'intermediate', joinedDate: '2024-09-14', feesPaid: true },
      { id: 20, name: 'Sneha Pillai', age: 12, phone: '+91 98765 43229', email: 'sneha.p@email.com', activeClasses: 10, level: 'beginner', joinedDate: '2025-03-08', feesPaid: false },
    ]
  },
  {
    name: 'Batch 2',
    time: '5:30 PM - 7:00 PM',
    riders: [
      { id: 21, name: 'Nikhil Menon', age: 16, phone: '+91 98765 43230', email: 'nikhil.m@email.com', activeClasses: 33, level: 'advanced', joinedDate: '2023-10-22', feesPaid: true },
      { id: 22, name: 'Kavya Shah', age: 13, phone: '+91 98765 43231', email: 'kavya.s@email.com', activeClasses: 19, level: 'intermediate', joinedDate: '2024-06-15', feesPaid: true },
      { id: 23, name: 'Harsh Trivedi', age: 15, phone: '+91 98765 43232', email: 'harsh.t@email.com', activeClasses: 28, level: 'intermediate', joinedDate: '2024-03-28', feesPaid: false },
      { id: 24, name: 'Simran Kaur', age: 11, phone: '+91 98765 43233', email: 'simran.k@email.com', activeClasses: 8, level: 'beginner', joinedDate: '2025-01-05', feesPaid: true },
      { id: 25, name: 'Dev Pandey', age: 18, phone: '+91 98765 43234', email: 'dev.p@email.com', activeClasses: 45, level: 'advanced', joinedDate: '2023-06-19', feesPaid: true },
    ]
  },
  {
    name: 'Batch 3',
    time: '7:00 PM - 8:30 PM',
    riders: [
      { id: 26, name: 'Zara Khan', age: 14, phone: '+91 98765 43235', email: 'zara.k@email.com', activeClasses: 23, level: 'intermediate', joinedDate: '2024-04-02', feesPaid: false },
      { id: 27, name: 'Yash Oberoi', age: 17, phone: '+91 98765 43236', email: 'yash.o@email.com', activeClasses: 31, level: 'advanced', joinedDate: '2023-08-30', feesPaid: true },
      { id: 28, name: 'Aditi Bhatt', age: 12, phone: '+91 98765 43237', email: 'aditi.b@email.com', activeClasses: 11, level: 'beginner', joinedDate: '2025-02-14', feesPaid: false },
      { id: 29, name: 'Vihaan Khanna', age: 15, phone: '+91 98765 43238', email: 'vihaan.k@email.com', activeClasses: 26, level: 'intermediate', joinedDate: '2024-07-21', feesPaid: true },
      { id: 30, name: 'Anvi Sinha', age: 13, phone: '+91 98765 43239', email: 'anvi.s@email.com', activeClasses: 17, level: 'beginner', joinedDate: '2025-03-12', feesPaid: false },
    ]
  }
];

// Counter for generating unique IDs
let nextId = 31;

module.exports = {
  morningBatches,
  eveningBatches,
  getNextId: () => nextId++
};

