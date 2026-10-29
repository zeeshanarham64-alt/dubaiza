import { useEffect, useState } from 'react'
import './App.css'
import ChatPage from './ChatPage.jsx'
import { io } from 'socket.io-client'
import {
  ArrowRight,
  BriefcaseBusiness,
  CarFront,
  Check,
  ChevronDown,
  Eye,
  EyeOff,
  Heart,
  House,
  Lock,
  Maximize2,
  Minimize2,
  User,
  Mail,
  MapPin,
  MessageCircle,
  Palette,
  Phone,
  Plus,
  Search,
  Smartphone,
  Sofa,
  Sparkles,
  Tag,
  UsersRound,
  Wrench,
  X,
} from 'lucide-react'

const categories = ['All', 'Motors', 'Property', 'Jobs', 'Electronics', 'Furniture & Garden', 'Mobile Phones', 'Services', 'Classifieds', 'Community']
const categoryMenus = {
  Motors: ['Cars for Sale', 'Motorcycles', 'Auto Accessories & Parts', 'Heavy Vehicles', 'Boats & Watercraft', 'Number Plates'],
  Property: ['Apartments for Rent', 'Villas for Sale', 'Commercial Properties', 'Rooms for Rent', 'Short Term & Monthly', 'Off-Plan Projects'],
  Jobs: ['Accounting & Finance', 'Engineering & Tech', 'Sales & Marketing', 'Customer Service', 'Hospitality & Retail', 'Driver & Logistics'],
  Electronics: ['Laptops & Computers', 'Home Appliances', 'TV & Audio Systems', 'Cameras & Optics', 'Gaming & Consoles', 'Smart Home Tech'],
  'Furniture & Garden': ['Living Room Furniture', 'Bedroom Sets', 'Dining & Kitchen', 'Outdoor & Garden', 'Home Decor & Rugs', 'Office Furniture'],
  'Mobile Phones': ['iPhones', 'Samsung Galaxy', 'Tablets & iPads', 'Smart Watches', 'Mobile Accessories', 'Headphones & Earbuds'],
  Services: ['Home Cleaning & Maid', 'Movers & Packers', 'AC Maintenance & Repair', 'Plumbing & Electrical', 'Web & Digital Services', 'Tutors & Classes'],
  Classifieds: ['Watches & Luxury', 'Jewelry & Accessories', 'Musical Instruments', 'Sports & Fitness', 'Baby & Kids', 'Books & Hobbies'],
  Community: ['Local Events', 'Sports Activities', 'Freelancers Available', 'Lost & Found', 'Community Announcements', 'Car Lift & Ride Share'],
}
const servicesMegaMenu = [
  {
    title: 'Movers and Removals',
    items: ['Deep Cleaning', 'Movers and Packers', 'Storage Services', 'Pest Control'],
  },
  {
    title: 'Home Services',
    items: ['Cleaning Services', 'AC Repair', 'Plumbing Services', 'Electrical Services'],
  },
  {
    title: 'Automotive Services',
    items: ['Car Repair', 'Car Wash', 'Tire Services', 'Breakdown Assistance'],
  },
  {
    title: 'Personal Services',
    items: ['Beauty & Salon', 'Massage & Spa', 'Personal Trainers', 'Tutors', 'Photography'],
  },
  {
    title: 'Business Services',
    items: ['Accounting', 'Legal Services', 'Web Design', 'Marketing & SEO', 'IT Support'],
  },
]
const popularServiceTags = ['Maids & Cleaning', 'Movers & Packers', 'Web Development', 'Repairs', 'Tutoring']
const cities = ['All Cities', 'Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman']
const categoryIcons = {
  Motors: CarFront,
  Property: House,
  Jobs: BriefcaseBusiness,
  Electronics: Smartphone,
  'Furniture & Garden': Sofa,
  'Mobile Phones': Smartphone,
  Services: Wrench,
  Classifieds: Tag,
  Community: UsersRound,
}

const themes = [
  { id: 'ruby', name: 'Ruby', accent: '#d92d3a', dark: '#b4232f', soft: '#fdebed' },
  { id: 'coral', name: 'Coral', accent: '#e4573d', dark: '#bd3d2b', soft: '#fcebe7' },
  { id: 'orange', name: 'Orange', accent: '#d97706', dark: '#9a4d07', soft: '#fff1db' },
  { id: 'gold', name: 'Gold', accent: '#a77b00', dark: '#795900', soft: '#fff6d2' },
  { id: 'lime', name: 'Lime', accent: '#548b27', dark: '#3d6a1d', soft: '#edf5e5' },
  { id: 'emerald', name: 'Emerald', accent: '#16865d', dark: '#106647', soft: '#e5f5ed' },
  { id: 'teal', name: 'Teal', accent: '#0f8585', dark: '#086565', soft: '#e3f4f2' },
  { id: 'sky', name: 'Sky', accent: '#0f80b7', dark: '#0b6090', soft: '#e5f3fb' },
  { id: 'blue', name: 'Blue', accent: '#3467c2', dark: '#274e96', soft: '#e8eefc' },
  { id: 'indigo', name: 'Indigo', accent: '#5a5fc7', dark: '#42479a', soft: '#ebebfa' },
  { id: 'violet', name: 'Violet', accent: '#7a4eb1', dark: '#5d398b', soft: '#f2ebf8' },
  { id: 'magenta', name: 'Magenta', accent: '#c03d83', dark: '#943164', soft: '#f9e8f1' },
]

const navItems = [
  { label: 'Home', icon: '⌂' },
  { label: 'Search', icon: '⌕' },
  { label: 'Chat', icon: '◌' },
  { label: 'Profile', icon: '◩' },
]

const mobileNavItems = [
  { label: 'Home', icon: '⌂' },
  { label: 'Search', icon: '⌕' },
  { label: 'Sell', icon: '+' },
  { label: 'Chat', icon: '◌' },
  { label: 'Profile', icon: '◩' },
]

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80';
const CATEGORY_FALLBACKS = {
  Motors: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=900&q=80',
  Property: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=900&q=80',
  Jobs: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=900&q=80',
  Electronics: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80',
  'Furniture & Garden': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80',
  'Mobile Phones': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80',
  Services: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=900&q=80',
  Classifieds: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80',
  Community: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=900&q=80',
};

const cards = [
  // --- MOTORS ---
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=900&q=80',
    badge: 'Featured',
    category: 'Motors',
    time: '2 hours ago',
    title: '2023 Tesla Model Y Performance - GCC Specs',
    location: 'Dubai Marina',
    price: 'AED 210,000',
    info: ['2023', '15,000 km', 'Autopilot'],
    city: 'Dubai',
    description: 'GCC specifications, white interior, single owner, carefully maintained in Dubai Marina.',
    accent: 'featured',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=900&q=80',
    badge: 'Verified',
    category: 'Motors',
    time: 'Today',
    title: '2022 Toyota Land Cruiser GXR Twin Turbo',
    location: 'Al Barsha',
    price: 'AED 285,000',
    info: ['2022', '42,000 km', 'Dealer Service'],
    city: 'Dubai',
    description: 'Flawless condition Land Cruiser with full agency service history and warranty.',
    accent: 'featured',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=900&q=80',
    badge: 'Great Deal',
    category: 'Motors',
    time: 'Yesterday',
    title: '2023 Nissan Patrol Platinum V8 - Low Mileage',
    location: 'Khalifa City',
    price: 'AED 315,000',
    info: ['2023', '18,500 km', 'V8 5.6L'],
    city: 'Abu Dhabi',
    description: 'Top-tier Platinum trim with rear entertainment, cooling seats and diamond leather.',
    accent: 'new',
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=900&q=80',
    badge: 'New',
    category: 'Motors',
    time: '2 days ago',
    title: '2024 BMW 5 Series 530i M-Sport Package',
    location: 'Al Majaz',
    price: 'AED 229,000',
    info: ['2024', '8,000 km', 'Warranty 2029'],
    city: 'Sharjah',
    description: 'Nearly brand new executive saloon with BMW live cockpit professional and head-up display.',
    accent: 'new',
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80',
    badge: 'Hot',
    category: 'Motors',
    time: '3 hours ago',
    title: '2023 Porsche 911 Carrera S - Mint Condition',
    location: 'Downtown Dubai',
    price: 'AED 520,000',
    info: ['2023', '6,200 km', 'Sport Chrono'],
    city: 'Dubai',
    description: 'Pristine 911 Carrera S with Sports Exhaust, 20/21 RS Spyder wheels and Bose surround.',
    accent: 'hot',
  },
  {
    id: 6,
    image: 'https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&w=900&q=80',
    badge: 'Premium',
    category: 'Motors',
    time: 'Today',
    title: '2022 Mercedes-AMG G63 - Night Package GCC',
    location: 'Palm Jumeirah',
    price: 'AED 890,000',
    info: ['2022', '22,000 km', 'GCC Specs'],
    city: 'Dubai',
    description: 'G63 finished in Obsidian Black with red interior, carbon fiber trim, and full Gargash service.',
    accent: 'premium',
  },

  // --- PROPERTY ---
  {
    id: 7,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=80',
    badge: 'Premium',
    category: 'Property',
    time: 'Today',
    title: 'Luxury 2BR Apartment with Panoramic Sea View',
    location: 'Palm Jumeirah',
    price: 'AED 185,000 / yr',
    info: ['2 Beds', '3 Baths', '1,650 sqft'],
    city: 'Dubai',
    description: 'Sun-drenched luxury living on the Palm with private beach access, pool and concierge.',
    accent: 'premium',
  },
  {
    id: 8,
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=900&q=80',
    badge: 'Featured',
    category: 'Property',
    time: 'Just now',
    title: 'Modern 4BR Villa with Private Pool & Garden',
    location: 'Dubai Hills Estate',
    price: 'AED 6,200,000',
    info: ['4 Beds', '5 Baths', '4,800 sqft'],
    city: 'Dubai',
    description: 'Newly constructed contemporary villa overlooking the golf course with landscaped garden.',
    accent: 'featured',
  },
  {
    id: 9,
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80',
    badge: 'Great Deal',
    category: 'Property',
    time: '4 hours ago',
    title: 'Furnished Studio near Burj Khalifa & Metro',
    location: 'Downtown Dubai',
    price: 'AED 85,000 / yr',
    info: ['Studio', '1 Bath', '520 sqft'],
    city: 'Dubai',
    description: 'Chic designer studio with high ROI, walking distance to Dubai Mall and Opera district.',
    accent: 'new',
  },
  {
    id: 10,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80',
    badge: 'Hot',
    category: 'Property',
    time: 'Today',
    title: '5BR Waterfront Penthouse with Private Terrace',
    location: 'Dubai Marina',
    price: 'AED 14,500,000',
    info: ['5 Beds', '6 Baths', '7,200 sqft'],
    city: 'Dubai',
    description: 'Extraordinary duplex penthouse with private rooftop plunge pool and 360 yacht views.',
    accent: 'hot',
  },
  {
    id: 11,
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=900&q=80',
    badge: 'Verified',
    category: 'Property',
    time: 'Yesterday',
    title: 'Spacious 3BR Sea View Apartment - Gate Tower',
    location: 'Al Reem Island',
    price: 'AED 120,000 / yr',
    info: ['3 Beds', '4 Baths', '2,100 sqft'],
    city: 'Abu Dhabi',
    description: 'High floor apartment in Abu Dhabi with Olympic swimming pool, gym, and retail podium.',
    accent: 'new',
  },

  // --- JOBS ---
  {
    id: 12,
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80',
    badge: 'Hiring',
    category: 'Jobs',
    time: 'Today',
    title: 'Lead Product Designer (UI/UX) - Hybrid',
    location: 'Dubai Internet City',
    price: 'AED 22,000 / mo',
    info: ['Full time', 'Hybrid', 'Fintech'],
    city: 'Dubai',
    description: 'Design world-class mobile experiences for a premier regional payment & commerce app.',
    accent: 'new',
  },
  {
    id: 13,
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=900&q=80',
    badge: 'Hiring',
    category: 'Jobs',
    time: 'Today',
    title: 'Senior Full Stack Engineer (React & Node.js)',
    location: 'DIFC, Dubai',
    price: 'AED 28,000 / mo',
    info: ['Full time', 'On-site', 'Visa Included'],
    city: 'Dubai',
    description: 'Build robust cloud applications with cutting-edge microservices architecture.',
    accent: 'featured',
  },
  {
    id: 14,
    image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=900&q=80',
    badge: 'Urgent',
    category: 'Jobs',
    time: 'Yesterday',
    title: 'Digital Marketing & Performance Manager',
    location: 'Business Bay',
    price: 'AED 18,000 / mo',
    info: ['Full time', 'E-commerce'],
    city: 'Dubai',
    description: 'Lead paid social, Google ads, and growth initiatives for high-volume retail brand.',
    accent: 'hot',
  },
  {
    id: 15,
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=900&q=80',
    badge: 'Hiring',
    category: 'Jobs',
    time: '2 days ago',
    title: 'Executive Assistant to Managing Director',
    location: 'Downtown Dubai',
    price: 'AED 16,000 / mo',
    info: ['Full time', 'Corporate'],
    city: 'Dubai',
    description: 'Provide high-level administrative support, travel scheduling, and executive coordination.',
    accent: 'new',
  },
  {
    id: 16,
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=900&q=80',
    badge: 'High Earning',
    category: 'Jobs',
    time: 'Today',
    title: 'Real Estate Property Consultant (Licensed)',
    location: 'Dubai Marina',
    price: 'AED 12,000 + Comm',
    info: ['RERA Broker', 'Commission'],
    city: 'Dubai',
    description: 'Join top real estate brokerage with abundant qualified leads and luxury portfolio.',
    accent: 'premium',
  },

  // --- ELECTRONICS ---
  {
    id: 17,
    image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=900&q=80',
    badge: 'Hot',
    category: 'Electronics',
    time: '3 hours ago',
    title: 'Gaming PC Setup RTX 4090 24GB + i9 14900K',
    location: 'Downtown Dubai',
    price: 'AED 13,500',
    info: ['RTX 4090', '64GB RAM', '2TB NVMe'],
    city: 'Dubai',
    description: 'High-end liquid cooled gaming rig with 240Hz monitor and mechanical keyboard.',
    accent: 'hot',
  },
  {
    id: 18,
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80',
    badge: 'Like New',
    category: 'Electronics',
    time: '5 hours ago',
    title: 'Sony Alpha A7 IV Camera + 24-70mm GM Lens',
    location: 'Business Bay',
    price: 'AED 8,900',
    info: ['33 MP', '4K 60p', 'With Box'],
    city: 'Dubai',
    description: 'Barely used mirrorless camera with low shutter count, original box, and UV filter.',
    accent: 'new',
  },
  {
    id: 19,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80',
    badge: 'Premium',
    category: 'Electronics',
    time: 'Today',
    title: 'Apple MacBook Pro 16" M3 Max 36GB / 1TB',
    location: 'DIFC, Dubai',
    price: 'AED 11,200',
    info: ['M3 Max', 'Space Black', 'AppleCare+'],
    city: 'Dubai',
    description: 'Pristine Space Black MacBook Pro with AppleCare+ valid until 2026. Battery 100%.',
    accent: 'premium',
  },
  {
    id: 20,
    image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=900&q=80',
    badge: 'DJ Gear',
    category: 'Electronics',
    time: 'Yesterday',
    title: 'Pioneer CDJ-3000 Professional DJ Multi Player',
    location: 'Dubai Marina',
    price: 'AED 8,500',
    info: ['Pro DJ', '9" Touch Screen'],
    city: 'Dubai',
    description: 'Studio kept Pioneer flagship player in spotless condition with power cable and decksaver.',
    accent: 'featured',
  },
  {
    id: 21,
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=900&q=80',
    badge: 'Smart TV',
    category: 'Electronics',
    time: '2 days ago',
    title: 'LG C3 65" 4K OLED evo Smart Cinema TV',
    location: 'Jumeirah Village Circle',
    price: 'AED 4,600',
    info: ['65 Inch', '120Hz', 'Dolby Vision'],
    city: 'Dubai',
    description: 'Stunning OLED picture quality with HDMI 2.1 ports for PS5 / Xbox. Zero burn-in.',
    accent: 'new',
  },

  // --- FURNITURE & GARDEN ---
  {
    id: 22,
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80',
    badge: 'Like New',
    category: 'Furniture & Garden',
    time: 'Today',
    title: 'Scandinavian 3-Seater Fabric Sofa with Ottoman',
    location: 'Jumeirah Village Circle',
    price: 'AED 2,200',
    info: ['3 seats', 'Beige', 'Pickup available'],
    city: 'Dubai',
    description: 'Neutral minimalist sofa with deep feather cushions and stain-resistant fabric.',
    accent: 'new',
  },
  {
    id: 23,
    image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=900&q=80',
    badge: 'Solid Wood',
    category: 'Furniture & Garden',
    time: 'Yesterday',
    title: 'Solid Oak Wood 8-Seater Dining Table + Chairs',
    location: 'Arabian Ranches',
    price: 'AED 3,800',
    info: ['8 Seater', 'Solid Oak', 'Includes Chairs'],
    city: 'Dubai',
    description: 'Handcrafted solid oak dining table with 8 comfortable leather-cushioned dining chairs.',
    accent: 'featured',
  },
  {
    id: 24,
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
    badge: 'Bedroom',
    category: 'Furniture & Garden',
    time: 'Today',
    title: 'King Size Velvet Upholstered Bed + Mattress',
    location: 'Dubai Hills',
    price: 'AED 2,900',
    info: ['King Size', 'Grey Velvet', 'Storage'],
    city: 'Dubai',
    description: 'Luxurious grey velvet tufted bed frame with hydraulic storage and medical mattress.',
    accent: 'new',
  },
  {
    id: 25,
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=900&q=80',
    badge: 'Outdoor',
    category: 'Furniture & Garden',
    time: '3 days ago',
    title: 'Weatherproof Rattan Patio Lounge Set',
    location: 'Palm Jumeirah',
    price: 'AED 1,950',
    info: ['5 Pieces', 'Weatherproof', 'Glass Table'],
    city: 'Dubai',
    description: 'All-weather UV protected rattan patio furniture with washable waterproof cushions.',
    accent: 'new',
  },
  {
    id: 26,
    image: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&w=900&q=80',
    badge: 'Ergonomic',
    category: 'Furniture & Garden',
    time: 'Today',
    title: 'Herman Miller Aeron Ergonomic Office Chair',
    location: 'Business Bay',
    price: 'AED 3,100',
    info: ['Size B', 'PostureFit SL', 'Graphite'],
    city: 'Dubai',
    description: 'Genuine Herman Miller Aeron chair in excellent condition with full lumbar adjustment.',
    accent: 'featured',
  },

  // --- MOBILE PHONES ---
  {
    id: 27,
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=900&q=80',
    badge: 'Unlocked',
    category: 'Mobile Phones',
    time: '1 hour ago',
    title: 'iPhone 15 Pro Max 256GB - Natural Titanium',
    location: 'Business Bay',
    price: 'AED 3,650',
    info: ['256 GB', 'Battery 98%', 'Full Box'],
    city: 'Dubai',
    description: 'Factory unlocked iPhone 15 Pro Max with original invoice and Apple warranty.',
    accent: 'new',
  },
  {
    id: 28,
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=900&q=80',
    badge: 'Flagship',
    category: 'Mobile Phones',
    time: 'Today',
    title: 'Samsung Galaxy S24 Ultra 512GB Titanium Black',
    location: 'Dubai Marina',
    price: 'AED 3,400',
    info: ['512 GB', 'S-Pen', 'Dual SIM'],
    city: 'Dubai',
    description: 'Galaxy AI flagship phone with S-Pen, 100x zoom camera, and pristine screen.',
    accent: 'featured',
  },
  {
    id: 29,
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=900&q=80',
    badge: 'Pro Tablet',
    category: 'Mobile Phones',
    time: 'Yesterday',
    title: 'Apple iPad Pro 12.9" M2 256GB + Magic Keyboard',
    location: 'Downtown Dubai',
    price: 'AED 3,850',
    info: ['12.9 Inch', 'M2 Chip', 'Cellular'],
    city: 'Dubai',
    description: 'Top configuration iPad Pro with liquid retina XDR display and black Magic Keyboard.',
    accent: 'premium',
  },
  {
    id: 30,
    image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=900&q=80',
    badge: 'Smart Watch',
    category: 'Mobile Phones',
    time: '2 days ago',
    title: 'Apple Watch Ultra 2 49mm Titanium - Ocean Band',
    location: 'DIFC, Dubai',
    price: 'AED 2,300',
    info: ['49mm', 'Cellular', 'Titanium'],
    city: 'Dubai',
    description: 'Rugged titanium Apple Watch Ultra 2 with fast charger, box and blue ocean band.',
    accent: 'hot',
  },
  {
    id: 31,
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=900&q=80',
    badge: 'Great Deal',
    category: 'Mobile Phones',
    time: 'Today',
    title: 'Google Pixel 8 Pro 128GB - Bay Blue Unlocked',
    location: 'Al Nahda',
    price: 'AED 2,150',
    info: ['128 GB', 'Bay Blue', '5G Dual SIM'],
    city: 'Sharjah',
    description: 'Camera powerhouse with Google Tensor G3, beautiful blue finish, and pristine glass.',
    accent: 'new',
  },

  // --- SERVICES ---
  {
    id: 32,
    image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=900&q=80',
    badge: 'Verified',
    category: 'Services',
    time: 'Today',
    title: 'Professional Deep Home Cleaning & Sanitization',
    location: 'Dubai Marina',
    price: 'AED 180',
    info: ['2 Cleaners', 'Eco Supplies', 'Insured'],
    city: 'Dubai',
    description: 'Experienced vetted cleaners equipped with German vacuums and hospital-grade sanitizers.',
    accent: 'featured',
  },
  {
    id: 33,
    image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=900&q=80',
    badge: 'Top Rated',
    category: 'Services',
    time: 'Today',
    title: 'Villa & Apartment Movers and Packers with Trucks',
    location: 'All UAE',
    price: 'AED 650',
    info: ['Full Packing', 'Dismantling', 'Fixing'],
    city: 'Dubai',
    description: 'Safe furniture moving, bubble wrap packing, carpenter dismantling, and reassembly.',
    accent: 'new',
  },
  {
    id: 34,
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=900&q=80',
    badge: 'Emergency',
    category: 'Services',
    time: 'Available 24/7',
    title: 'AC Duct Cleaning & Emergency Repair Services',
    location: 'Downtown Dubai',
    price: 'AED 150',
    info: ['Gas Refill', 'Thermostat', 'Fast Arrival'],
    city: 'Dubai',
    description: 'Quick 30-minute arrival across Dubai for AC breakdown, water leak, and coil cleaning.',
    accent: 'hot',
  },
  {
    id: 35,
    image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=900&q=80',
    badge: 'Educator',
    category: 'Services',
    time: 'Today',
    title: 'Private Math & Science Tutor (IB / IGCSE / SAT)',
    location: 'Dubai Hills',
    price: 'AED 200 / hr',
    info: ['10+ Yrs Exp', 'In-Person / Zoom'],
    city: 'Dubai',
    description: 'British certified teacher offering proven grade-improvement tutoring across key curricula.',
    accent: 'new',
  },
  {
    id: 36,
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80',
    badge: 'Agency',
    category: 'Services',
    time: 'Today',
    title: 'Custom Website Design & Mobile App Development',
    location: 'Business Bay',
    price: 'AED 2,500',
    info: ['E-commerce', 'Mobile App', 'SEO Ready'],
    city: 'Dubai',
    description: 'Complete digital agency solutions: high-converting Shopify stores, Webflow, and React apps.',
    accent: 'new',
  },

  // --- CLASSIFIEDS ---
  {
    id: 37,
    image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80',
    badge: 'Luxury',
    category: 'Classifieds',
    time: 'Today',
    title: 'Rolex Submariner Date 41mm - 2024 Unworn',
    location: 'DIFC, Dubai',
    price: 'AED 48,000',
    info: ['2024 Model', 'Box & Papers', 'Green Card'],
    city: 'Dubai',
    description: '100% authentic unworn 126610LN Submariner with full links, white tag, and warranty booklet.',
    accent: 'featured',
  },
  {
    id: 38,
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80',
    badge: 'Hot',
    category: 'Classifieds',
    time: 'Yesterday',
    title: 'Audemars Piguet Royal Oak Offshore Chronograph',
    location: 'Downtown Dubai',
    price: 'AED 115,000',
    info: ['42mm', 'Full Set', 'Ceramic Bezel'],
    city: 'Dubai',
    description: 'Spectacular luxury timepiece with rubber strap, sapphire crystal, and manufacture movement.',
    accent: 'hot',
  },
  {
    id: 39,
    image: 'https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?auto=format&fit=crop&w=900&q=80',
    badge: 'Music',
    category: 'Classifieds',
    time: 'Today',
    title: 'Gibson Les Paul Standard 60s Electric Guitar',
    location: 'Al Barsha',
    price: 'AED 7,400',
    info: ['Iced Tea Burst', 'Hard Case Included'],
    city: 'Dubai',
    description: 'American made Les Paul in mint condition with Burstbucker pickups and original hardshell case.',
    accent: 'new',
  },
  {
    id: 40,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80',
    badge: 'Designer',
    category: 'Classifieds',
    time: '2 days ago',
    title: 'Louis Vuitton Horizon 55 Rolling Cabin Luggage',
    location: 'Palm Jumeirah',
    price: 'AED 9,200',
    info: ['Cabin Size', 'Monogram Canvas', 'Lock'],
    city: 'Dubai',
    description: 'Classic Marc Newson designed 4-wheel suitcase with dust bag, lock keys, and receipt.',
    accent: 'premium',
  },
  {
    id: 41,
    image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=900&q=80',
    badge: 'Cycling',
    category: 'Classifieds',
    time: 'Today',
    title: 'Specialized S-Works Tarmac SL7 Road Bike',
    location: 'Dubai Creek',
    price: 'AED 14,000',
    info: ['Size 54', 'Shimano Di2', 'Carbon'],
    city: 'Dubai',
    description: 'Pro peloton racing bike with Roval carbon wheels and electronic shifting. Flawless.',
    accent: 'new',
  },

  // --- COMMUNITY ---
  {
    id: 42,
    image: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=900&q=80',
    badge: 'Free',
    category: 'Community',
    time: 'This Saturday',
    title: 'Dubai Creek Saturday Sunrise Cycling Ride',
    location: 'Dubai Creek Harbour',
    price: 'Free Event',
    info: ['Saturday 6:00 AM', 'All levels', 'Coffee stop'],
    city: 'Dubai',
    description: 'Social group ride around the creek waterfront with a relaxed café stop. Bring your helmet.',
    accent: 'new',
  },
  {
    id: 43,
    image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=900&q=80',
    badge: 'Sports',
    category: 'Community',
    time: 'Weekly',
    title: 'Weekend Social Padel League - Doubles Match',
    location: 'Al Quoz, Dubai',
    price: 'AED 60 / person',
    info: ['Courts Booked', 'Balls Included'],
    city: 'Dubai',
    description: 'Friendly competitive matches for intermediate and advanced padel players every Friday evening.',
    accent: 'featured',
  },
  {
    id: 44,
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=900&q=80',
    badge: 'Wellness',
    category: 'Community',
    time: 'Sundays',
    title: 'Sunset Beach Yoga & Sound Healing Circle',
    location: 'Kite Beach',
    price: 'AED 50',
    info: ['Sunset 5:30 PM', 'Tibetan Bowls'],
    city: 'Dubai',
    description: 'Rejuvenating beach yoga session with certified instructor followed by sound bath meditation.',
    accent: 'new',
  },
  {
    id: 45,
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=900&q=80',
    badge: 'Networking',
    category: 'Community',
    time: 'Thursday evening',
    title: 'Dubai Tech Founders & Angel Investor Meetup',
    location: 'In5 Tech, Knowledge Park',
    price: 'Free RSVP',
    info: ['6:30 PM', 'Pitch Session', 'Networking'],
    city: 'Dubai',
    description: 'Connect with local startup founders, software engineers, and venture capital investors.',
    accent: 'hot',
  },
];

const projects = [
  {
    id: 'project-1',
    image:
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80',
    badge: 'Off Plan',
    category: 'Property',
    time: 'Just now',
    title: 'Palm Jebel Ali Villas - Phase 1',
    location: 'Palm Jebel Ali',
    price: 'AED18,000,000',
    city: 'Dubai',
    info: [],
  },
  {
    id: 'project-2',
    image:
      'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=900&q=80',
    badge: 'New Launch',
    category: 'Property',
    time: 'Today',
    title: 'Emaar Beachfront - Seapoint',
    location: 'Dubai Harbour',
    price: 'AED7,400,000',
    city: 'Dubai',
    info: [],
  },
]

function readStored(key, fallback) {
  try {
    const value = window.localStorage.getItem(key)
    return value === null ? fallback : JSON.parse(value)
  } catch {
    return fallback
  }
}

function useStoredState(key, fallback) {
  const [value, setValue] = useState(() => readStored(key, fallback))

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Keep the app usable when browser storage is unavailable or full.
    }
  }, [key, value])

  return [value, setValue]
}

function ListingCard({ item, saved, onToggleSaved, onMessage, onDelete, compact = false }) {
  const [imgError, setImgError] = useState(false);
  const displayImage = imgError || !item.image ? (CATEGORY_FALLBACKS[item.category] || FALLBACK_IMAGE) : item.image;

  return (
    <article className={`listing-card ${compact ? 'compact-card' : ''}`}>
      <div className="listing-image">
        <img
          src={displayImage}
          alt={item.title}
          className="listing-card-img"
          loading="lazy"
          onError={() => setImgError(true)}
        />
        <span className={`badge ${item.accent || 'new'} ${item.accent === 'premium' ? 'premium' : ''}`}>{item.badge || 'New'}</span>
        <button
          type="button"
          className={`favorite ${saved ? 'is-saved' : ''}`}
          aria-label={saved ? `Remove ${item.title} from saved listings` : `Save ${item.title}`}
          aria-pressed={saved}
          onClick={() => onToggleSaved(item.id)}
        >
          {saved ? '♥' : '♡'}
        </button>
        <div className="card-actions">
          <button type="button" onClick={() => onMessage(item)}>Message seller</button>
        </div>
      </div>
      <div className="listing-body">
        <div className="listing-head">
          <span className="category">{item.category}</span>
          <span className="time-info">◔ {item.time || 'Just now'}</span>
        </div>
        <h3>{item.title}</h3>
        {item.info?.length > 0 && (
          <div className="meta-row">
            {item.info.map((meta) => <span className="meta-item" key={meta}>{meta}</span>)}
          </div>
        )}
        {item.description && <p className="listing-description">{item.description}</p>}
        <div className="listing-footer">
          <strong>{item.price}</strong>
          <span className="mini-location"><span aria-hidden="true">⌖</span>{item.location}</span>
        </div>
        {onDelete && <button type="button" className="text-action delete-listing" onClick={() => onDelete(item.id)}>Delete listing</button>}
      </div>
    </article>
  )
}


function DubaiZALogo({ size = 38, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`dubaiza-emblem ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="dzGradBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f43f5e" />
          <stop offset="45%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#991b1b" />
        </linearGradient>
        <linearGradient id="dzGradGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="40%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id="dzGradFacet" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <filter id="dzGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#dc2626" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* Ruby Luxury Rounded Shield */}
      <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#dzGradBg)" filter="url(#dzGlow)" />
      <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#dzGradFacet)" />
      <rect x="4.5" y="4.5" width="55" height="55" rx="15.5" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />

      {/* Dubai Burj Sail Architecture D Monogram */}
      <path
        d="M20 16C20 14.8954 20.8954 14 22 14H28C36.8366 14 44 21.1634 44 30C44 34.2 42.4 38.0 39.8 40.9L32.2 49.2C31.4 50.1 30.2 50.5 29.1 50.3C27.9 50.1 27 49.1 27 47.9V22H22C20.8954 22 20 21.1046 20 20V16Z"
        fill="#ffffff"
      />
      {/* Sail Cutout */}
      <path
        d="M27 21H30C35.5228 21 40 25.4772 40 31C40 34.5 38.2 37.6 35.5 39.4L27 48.6V21Z"
        fill="url(#dzGradBg)"
      />
      {/* UAE Golden Falcon Wing Curve */}
      <path
        d="M27 22C31.5 22 36.5 25 38 30C35 28 31 27 27 27V22Z"
        fill="url(#dzGradGold)"
      />
      {/* 4-point Diamond Star */}
      <path
        d="M44 14L45.2 18L49 19.2L45.2 20.4L44 24.5L42.8 20.4L39 19.2L42.8 18L44 14Z"
        fill="url(#dzGradGold)"
      />
    </svg>
  )
}

function App() {
  const inviteChatId = new URLSearchParams(window.location.search).get('chat')
  const [activePage, setActivePage] = useState(inviteChatId ? 'Chat' : 'Home')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedCity, setSelectedCity] = useState('All Cities')
  const [menuOpen, setMenuOpen] = useState(false)
  const [openCategoryMenu, setOpenCategoryMenu] = useState(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [modalExpanded, setModalExpanded] = useState(false)
  const [authView, setAuthView] = useState('login')
  const [authMode, setAuthMode] = useState('email')
  const [showPassword, setShowPassword] = useState(false)
  const [authFormData, setAuthFormData] = useState({ name: '', identifier: '', password: '' })
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [themeMenuOpen, setThemeMenuOpen] = useState(false)
  const [themeId, setThemeId] = useStoredState('dubaiza-theme', 'ruby')
  const [savedIds, setSavedIds] = useStoredState('dubaiza-saved', [])
  const [userListings, setUserListings] = useStoredState('dubaiza-listings', [])
  const [backendListings, setBackendListings] = useState([])
  const [apiConnected, setApiConnected] = useState(false)
  const [profile, setProfile] = useStoredState('dubaiza-profile', { name: '', email: '' })
  const [conversations, setConversations] = useStoredState('dubaiza-chat-rooms-v2', [])
  const [activeConversationId, setActiveConversationId] = useState(inviteChatId)
  const [chatServiceError, setChatServiceError] = useState('')
  const theme = themes.find((option) => option.id === themeId) || themes[0]

  // Full-Stack backend sync on mount
  useEffect(() => {
    let active = true

    async function loadBackendData() {
      try {
        const [listingsRes, favoritesRes] = await Promise.allSettled([
          fetch('/api/listings'),
          fetch('/api/favorites'),
        ])

        if (listingsRes.status === 'fulfilled' && listingsRes.value.ok) {
          const data = await listingsRes.value.json()
          if (active && Array.isArray(data.listings) && data.listings.length > 0) {
            setBackendListings(data.listings)
            setApiConnected(true)
          }
        }

        if (favoritesRes.status === 'fulfilled' && favoritesRes.value.ok) {
          const favData = await favoritesRes.value.json()
          if (active && Array.isArray(favData.favorites) && favData.favorites.length > 0) {
            setSavedIds(favData.favorites)
          }
        }
      } catch (err) {
        console.warn('Backend API unreachable, using local fallback:', err)
      }
    }

    loadBackendData()

    // Real-time socket sync for new/deleted listings
    let socket
    try {
      socket = io({ path: '/socket.io', reconnectionAttempts: 3, timeout: 4000 })
      socket.on('listing:created', (newListing) => {
        if (!active) return
        setBackendListings((prev) => {
          if (prev.some((item) => item.id === newListing.id)) return prev
          return [newListing, ...prev]
        })
      })
      socket.on('listing:deleted', ({ id }) => {
        if (!active) return
        setBackendListings((prev) => prev.filter((item) => String(item.id) !== String(id)))
      })
    } catch {}

    return () => {
      active = false
      if (socket) socket.disconnect()
    }
  }, [])

  const currentCatalog = backendListings.length > 0 ? backendListings : cards
  const allListings = [...userListings, ...currentCatalog, ...projects]
  const homeListings = [...userListings, ...currentCatalog].filter((item) =>
    selectedCategory === 'All' || item.category === selectedCategory,
  )

  async function toggleSaved(id) {
    setSavedIds((current) =>
      current.includes(id) ? current.filter((savedId) => savedId !== id) : [...current, id]
    )
    try {
      await fetch(`/api/favorites/${id}`, { method: 'POST' })
    } catch {}
  }

  async function handleAuthSubmit(e) {
    if (e) e.preventDefault()
    setAuthError('')
    setAuthLoading(true)

    try {
      const endpoint = authView === 'register' ? '/api/auth/register' : '/api/auth/login'
      const payload = {
        name: authFormData.name || (authMode === 'email' ? authFormData.identifier.split('@')[0] : 'DubaiZA User'),
        [authMode === 'email' ? 'email' : 'phone']: authFormData.identifier,
        city: 'Dubai',
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Authentication failed')

      setProfile({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email || '',
        phone: data.user.phone || '',
        city: data.user.city || 'Dubai',
      })
      setShowAuthModal(false)
      setAuthFormData({ name: '', identifier: '', password: '' })
    } catch (err) {
      setAuthError(err.message || 'Could not sign in. Please try again.')
    } finally {
      setAuthLoading(false)
    }
  }

  async function startConversation(item) {
    const existing = conversations.find((conversation) => conversation.listingId === item.id)
    if (existing) {
      setActiveConversationId(existing.id)
    } else {
      try {
        setChatServiceError('')
        const response = await fetch('/api/chats', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            listingId: item.id,
            listingTitle: item.title,
            listingPrice: item.price,
          }),
        })
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Could not start the conversation')
        const conversation = {
          ...result.chat,
          name: result.chat.listingTitle,
          listing: result.chat.listingTitle,
          message: 'Conversation started',
          time: 'Now',
          messages: [],
        }
        setConversations((current) => [conversation, ...current])
        setActiveConversationId(conversation.id)
      } catch {
        setChatServiceError('Chat service is unavailable. Start the site with npm run dev:full and try again.')
      }
    }
    setActivePage('Chat')
  }

  async function publishListing(details) {
    let savedListing = null
    try {
      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(details),
      })
      if (response.ok) {
        const data = await response.json()
        savedListing = data.listing
      }
    } catch {}

    if (!savedListing) {
      savedListing = {
        ...details,
        id: `listing-${Date.now()}`,
        badge: 'New',
        accent: 'new',
        time: 'Just now',
        info: [details.city || 'Dubai', 'Verified Seller'],
        image: details.image || (details.category === 'Property'
          ? projects[0].image
          : details.category === 'Motors'
            ? cards[0].image
            : cards[3].image),
      }
    }

    setUserListings((current) => [savedListing, ...current])
    setBackendListings((current) => {
      if (current.some((item) => item.id === savedListing.id)) return current
      return [savedListing, ...current]
    })
    setSelectedCategory('All')
    setSelectedCity('All Cities')
    setSearchQuery('')
    setActivePage('Search')
  }

  async function deleteListing(id) {
    try {
      await fetch(`/api/listings/${id}`, { method: 'DELETE' })
    } catch {}
    setUserListings((current) => current.filter((listing) => listing.id !== id))
    setBackendListings((current) => current.filter((listing) => listing.id !== id))
  }

  return (
    <div
      className="page-shell"
      style={{
        '--theme-accent': theme.accent,
        '--theme-dark': theme.dark,
        '--theme-soft': theme.soft,
      }}
    >
      {showAuthModal && (
        <div
          className="auth-modal-backdrop"
          aria-modal="true"
          role="dialog"
          onClick={() => setShowAuthModal(false)}
        >
          <div
            className={`auth-modal-shell ${modalExpanded ? 'is-expanded' : 'is-compact'}`}
            onClick={(e) => e.stopPropagation()}
          >
            {modalExpanded && (
              <div className="auth-panel-left">
                <div className="auth-brand-row">
                  <DubaiZALogo size={48} />
                  <div className="auth-brand-info">
                    <span className="auth-brand-name">Dubai<span className="brand-accent-za">ZA</span></span>
                    <span className="auth-brand-tag">UAE Trusted Platform</span>
                  </div>
                </div>

                <div className="auth-left-copy">
                  <div className="auth-left-label">{authView === 'register' ? 'Join Community' : 'Verified Access'}</div>
                  <h2>{authView === 'register' ? 'Join DubaiZA' : 'Welcome Back'}</h2>
                  <p>Buy, sell, and connect with verified buyers and sellers across the UAE.</p>
                </div>

                <div className="auth-list">
                  <div className="auth-list-item">
                    <span className="auth-check"><Check size={16} strokeWidth={3} /></span>
                    <span>100% Verified UAE Sellers & Buyers</span>
                  </div>
                  <div className="auth-list-item">
                    <span className="auth-check"><Check size={16} strokeWidth={3} /></span>
                    <span>Real-time In-App WebSockets Chat</span>
                  </div>
                  <div className="auth-list-item">
                    <span className="auth-check"><Check size={16} strokeWidth={3} /></span>
                    <span>Instant Free Ad Publishing</span>
                  </div>
                </div>
              </div>
            )}

            <div className="auth-panel-right">
              <div className="auth-header-controls">
                <button
                  type="button"
                  className="auth-resize-toggle"
                  aria-label={modalExpanded ? 'Switch to compact view' : 'Switch to expanded view'}
                  title={modalExpanded ? 'Compact view' : 'Expand view'}
                  onClick={() => setModalExpanded((prev) => !prev)}
                >
                  {modalExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
                <button
                  type="button"
                  className="auth-close"
                  aria-label="Close dialog"
                  onClick={() => setShowAuthModal(false)}
                >
                  <X size={18} strokeWidth={2.4} />
                </button>
              </div>

              <div className="auth-content">
                <div className="auth-compact-brand">
                  <DubaiZALogo size={34} />
                  <span className="brand-text">Dubai<span className="brand-accent-za">ZA</span></span>
                </div>

                <div className="auth-view-switch" role="tablist" aria-label="Authentication view">
                  <button
                    type="button"
                    className={authView === 'login' ? 'active' : ''}
                    onClick={() => { setAuthView('login'); setAuthError('') }}
                  >
                    Log in
                  </button>
                  <button
                    type="button"
                    className={authView === 'register' ? 'active' : ''}
                    onClick={() => { setAuthView('register'); setAuthError('') }}
                  >
                    Register
                  </button>
                </div>

                <h3>{authView === 'register' ? 'Create your account' : 'Welcome back'}</h3>
                <p>{authView === 'register' ? 'Quick registration to start buying and selling across UAE.' : 'Sign in to access your listings and chats.'}</p>

                <button type="button" className="auth-provider auth-provider--google">
                  <span className="provider-icon provider-icon--google" aria-hidden="true">
                    <svg viewBox="0 0 24 24" role="img" aria-label="Google logo">
                      <path d="M21.35 11.1h-9.17v2.98h5.45c-.23 1.24-.92 2.29-1.96 2.99l3.16 2.45c1.84-1.7 2.9-4.21 2.9-7.42 0-.68-.07-1.32-.19-1.95Z" fill="#4285F4"/>
                      <path d="M12.18 22c2.65 0 4.88-.88 6.5-2.38l-3.16-2.45c-.88.59-2 .94-3.34.94-2.57 0-4.74-1.74-5.52-4.08H.09v2.57A10 10 0 0 0 12.18 22Z" fill="#34A853"/>
                      <path d="M6.66 18.99A6.02 6.02 0 0 1 6.08 15V12.43H2.83A9.99 9.99 0 0 0 2 12c0 1.62.39 3.14 1.08 4.5l3.58 2.49Z" fill="#FBBC05"/>
                      <path d="M12.18 4.8c1.42 0 2.69.49 3.69 1.45l2.75-2.68A9.99 9.99 0 0 0 2.83 9.57H6.08A6.02 6.02 0 0 1 12.18 4.8Z" fill="#EA4335"/>
                    </svg>
                  </span>
                  <span>Continue with Google</span>
                </button>

                <button type="button" className="auth-provider auth-provider--apple">
                  <span className="provider-icon provider-icon--apple" aria-hidden="true">
                    <svg viewBox="0 0 24 24" focusable="false">
                      <path fill="currentColor" d="M17.05 12.54c-.03-2.32 1.9-3.45 1.99-3.5a4.28 4.28 0 0 0-3.37-1.82c-1.42-.15-2.8.85-3.52.85-.74 0-1.86-.83-3.06-.81a4.5 4.5 0 0 0-3.79 2.31c-1.64 2.83-.42 6.99 1.15 9.28.78 1.12 1.69 2.37 2.88 2.33 1.16-.05 1.6-.74 3-.74 1.39 0 1.79.74 3.01.71 1.25-.02 2.04-1.13 2.79-2.26a9.23 9.23 0 0 0 1.27-2.59 4.03 4.03 0 0 1-2.35-3.76ZM14.75 5.72A4.15 4.15 0 0 0 15.7 2.7a4.21 4.21 0 0 0-2.73 1.41 3.94 3.94 0 0 0-.98 2.91c1.03.08 2.08-.52 2.76-1.3Z" />
                    </svg>
                  </span>
                  <span>Continue with Apple</span>
                </button>

                <div className="auth-divider">
                  <span>OR CONTINUE WITH</span>
                </div>

                <div className="auth-tabs" role="tablist" aria-label="Authentication method">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={authMode === 'email'}
                    className={authMode === 'email' ? 'active' : ''}
                    onClick={() => setAuthMode('email')}
                  >
                    <Mail size={15} />
                    <span>Email</span>
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={authMode === 'phone'}
                    className={authMode === 'phone' ? 'active' : ''}
                    onClick={() => setAuthMode('phone')}
                  >
                    <Phone size={15} />
                    <span>Phone</span>
                  </button>
                </div>

                <form onSubmit={handleAuthSubmit}>
                  {authView === 'register' && (
                    <label className="auth-field">
                      <span>FULL NAME</span>
                      <div className="auth-input-wrap">
                        <User size={17} />
                        <input
                          type="text"
                          required
                          placeholder="e.g. Tariq Al Hashimi"
                          value={authFormData.name}
                          onChange={(e) => setAuthFormData((prev) => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                    </label>
                  )}

                  <label className="auth-field">
                    <span>{authMode === 'email' ? 'EMAIL ADDRESS' : 'PHONE NUMBER'}</span>
                    <div className="auth-input-wrap">
                      {authMode === 'email' ? <Mail size={17} /> : <Phone size={17} />}
                      <input
                        type={authMode === 'email' ? 'email' : 'tel'}
                        required
                        placeholder={authMode === 'email' ? 'name@example.com' : '+971 50 123 4567'}
                        value={authFormData.identifier}
                        onChange={(e) => setAuthFormData((prev) => ({ ...prev, identifier: e.target.value }))}
                      />
                    </div>
                  </label>

                  <label className="auth-field">
                    <span>PASSWORD</span>
                    <div className="auth-input-wrap auth-input-wrap--password">
                      <Lock size={17} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter password"
                        value={authFormData.password}
                        onChange={(e) => setAuthFormData((prev) => ({ ...prev, password: e.target.value }))}
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        onClick={() => setShowPassword((open) => !open)}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </label>

                  {authError && (
                    <p style={{ color: '#ef4444', fontSize: '0.82rem', margin: '4px 0 8px', fontWeight: 600 }}>
                      {authError}
                    </p>
                  )}

                  {authView === 'login' ? (
                    <div className="auth-row">
                      <label className="auth-checkbox">
                        <input type="checkbox" defaultChecked />
                        <span>Remember me</span>
                      </label>
                      <button type="button" className="auth-forgot">Forgot Password?</button>
                    </div>
                  ) : (
                    <label className="auth-checkbox auth-checkbox--full">
                      <input type="checkbox" defaultChecked />
                      <span>I agree to Terms & Privacy Policy.</span>
                    </label>
                  )}

                  <button type="submit" className="auth-submit" disabled={authLoading}>
                    <span>{authLoading ? 'Connecting...' : (authView === 'register' ? 'Create Account' : 'Log In')}</span>
                    <ArrowRight size={18} />
                  </button>
                </form>

                <p className="auth-footer-copy">
                  {authView === 'register' ? 'Already have an account?' : 'New to DubaiZA?'}{' '}
                  <button
                    type="button"
                    className="auth-inline-link"
                    onClick={() => {
                      setAuthView(authView === 'register' ? 'login' : 'register')
                      setAuthError('')
                    }}
                  >
                    {authView === 'register' ? 'Log in' : 'Create account'}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {menuOpen && (
        <div className="mobile-drawer-backdrop" onClick={() => setMenuOpen(false)}>
          <aside className="mobile-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-header">
              <div className="brand" onClick={() => { setActivePage('Home'); setMenuOpen(false) }}>
                <DubaiZALogo size={38} />
                <div className="brand-text-wrap">
                  <span className="brand-text" style={{ color: '#111827' }}>Dubai<span className="brand-accent-za">ZA</span></span>
                  <span className="brand-subtext">UAE Marketplace</span>
                </div>
              </div>
              <button
                type="button"
                className="mobile-drawer-close"
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
              >
                <X size={22} />
              </button>
            </div>

            {profile.name ? (
              <div className="mobile-drawer-auth mobile-drawer-auth--user">
                <div className="mobile-user-row" onClick={() => { setActivePage('Profile'); setMenuOpen(false) }}>
                  <div className="mobile-user-avatar">{profile.name.charAt(0).toUpperCase()}</div>
                  <div className="mobile-user-details">
                    <strong>{profile.name}</strong>
                    <p>{profile.email || profile.phone || 'Verified UAE Member'}</p>
                  </div>
                </div>
                <div className="mobile-drawer-auth-buttons">
                  <button
                    type="button"
                    className="mobile-auth-btn mobile-auth-btn--primary"
                    onClick={() => { setActivePage('Profile'); setMenuOpen(false) }}
                  >
                    My Account
                  </button>
                  <button
                    type="button"
                    className="mobile-auth-btn mobile-auth-btn--secondary"
                    onClick={() => { setProfile({ name: '', email: '' }); setMenuOpen(false) }}
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="mobile-drawer-auth">
                <div className="mobile-drawer-auth-copy">
                  <strong>Welcome to DubaiZA</strong>
                  <p>Buy, sell & connect with verified UAE users</p>
                </div>
                <div className="mobile-drawer-auth-buttons">
                  <button
                    type="button"
                    className="mobile-auth-btn mobile-auth-btn--primary"
                    onClick={() => { setAuthView('login'); setShowAuthModal(true); setMenuOpen(false) }}
                  >
                    Log in
                  </button>
                  <button
                    type="button"
                    className="mobile-auth-btn mobile-auth-btn--secondary"
                    onClick={() => { setAuthView('register'); setShowAuthModal(true); setMenuOpen(false) }}
                  >
                    Register
                  </button>
                </div>
              </div>
            )}

            <div className="mobile-drawer-status-pill">
              <span className="status-dot">●</span>
              <span>Full-Stack API Live • {currentCatalog.length} Listings</span>
            </div>

            <div className="mobile-drawer-post">
              <button
                type="button"
                className="mobile-drawer-post-btn"
                onClick={() => { setActivePage('Sell'); setMenuOpen(false) }}
              >
                <Plus size={20} strokeWidth={3} />
                <span>Post an Ad for Free</span>
              </button>
            </div>

            <nav className="mobile-drawer-nav">
              <span className="mobile-drawer-heading">Navigation</span>
              <button
                type="button"
                className={`mobile-drawer-nav-item ${activePage === 'Home' ? 'active' : ''}`}
                onClick={() => { setActivePage('Home'); setMenuOpen(false) }}
              >
                <House size={18} />
                <span>Home</span>
              </button>
              <button
                type="button"
                className={`mobile-drawer-nav-item ${activePage === 'Search' ? 'active' : ''}`}
                onClick={() => { setActivePage('Search'); setMenuOpen(false) }}
              >
                <Search size={18} />
                <span>Browse All Listings</span>
              </button>
              <button
                type="button"
                className={`mobile-drawer-nav-item ${activePage === 'Chat' ? 'active' : ''}`}
                onClick={() => { setActivePage('Chat'); setMenuOpen(false) }}
              >
                <MessageCircle size={18} />
                <span>Messages & Chat</span>
                {conversations.length > 0 && <span className="drawer-badge">{conversations.length}</span>}
              </button>
              <button
                type="button"
                className={`mobile-drawer-nav-item ${activePage === 'Profile' ? 'active' : ''}`}
                onClick={() => { setActivePage('Profile'); setMenuOpen(false) }}
              >
                <UsersRound size={18} />
                <span>Profile & Saved Ads</span>
                {savedIds.length > 0 && <span className="drawer-badge">{savedIds.length}</span>}
              </button>
            </nav>

            <div className="mobile-drawer-categories">
              <span className="mobile-drawer-heading">Explore Categories</span>
              <div className="mobile-drawer-category-grid">
                {categories.slice(1).map((cat) => {
                  const Icon = categoryIcons[cat] || Tag
                  return (
                    <button
                      key={cat}
                      type="button"
                      className="mobile-drawer-cat-btn"
                      onClick={() => {
                        setSelectedCategory(cat)
                        setActivePage('Search')
                        setMenuOpen(false)
                      }}
                    >
                      <Icon size={16} />
                      <span>{cat}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="mobile-drawer-themes">
              <span className="mobile-drawer-heading">Theme Color</span>
              <div className="mobile-drawer-theme-options">
                {themes.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`mobile-drawer-theme-dot ${themeId === option.id ? 'active' : ''}`}
                    style={{ background: option.accent }}
                    title={option.name}
                    onClick={() => setThemeId(option.id)}
                  />
                ))}
              </div>
            </div>

            <div className="mobile-drawer-footer">
              <span>🇦🇪 United Arab Emirates • English</span>
            </div>
          </aside>
        </div>
      )}

      <div className="utility-bar">
        <div className="utility-links">
          <button type="button" onClick={() => setActivePage('Home')}>About DubaiZA</button>
          <button type="button" onClick={() => setActivePage('Sell')}>Advertising</button>
          <button type="button" onClick={() => setActivePage('Sell')}>Business</button>
        </div>
        <div className="utility-locale"><span>EN</span><ChevronDown size={13} /><span>UAE</span><ChevronDown size={13} /></div>
      </div>

      <header className="topbar">
        <button className="brand" type="button" aria-label="DubaiZA home" onClick={() => { setActivePage('Home'); setMenuOpen(false) }}>
          <DubaiZALogo size={38} />
          <div className="brand-text-wrap">
            <span className="brand-text">Dubai<span className="brand-accent-za">ZA</span></span>
            <span className="brand-subtext">Verified UAE</span>
          </div>
        </button>

        <nav className={`site-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Main navigation">
          {(menuOpen ? mobileNavItems : navItems).map((item) => (
            <button
              key={item.label}
              type="button"
              className={`nav-item ${activePage === item.label ? 'active' : ''}`}
              aria-current={activePage === item.label ? 'page' : undefined}
              onClick={() => {
                setActivePage(item.label)
                setMenuOpen(false)
              }}
            >
              <span className="nav-icon" aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="header-actions">
          <div className="header-icon-group" aria-label="Messages and favourites">
            <button className="header-icon-action has-badge" type="button" aria-label="Messages" onClick={() => setActivePage('Chat')}>
              <MessageCircle size={22} strokeWidth={2.2} />
              <span className="header-icon-badge">1</span>
            </button>
            <button className="header-icon-action has-badge" type="button" aria-label="Saved listings" onClick={() => setActivePage('Profile')}>
              <Heart size={22} strokeWidth={2.2} />
              <span className="header-icon-badge alt">2</span>
            </button>
          </div>

          <div className="header-auth-actions" aria-label="Login or register">
            <button type="button" className="header-auth-link active" onClick={() => { setAuthView('login'); setShowAuthModal(true) }}>Log in</button>
            <button type="button" className="header-auth-link" onClick={() => { setAuthView('register'); setShowAuthModal(true) }}>Register</button>
          </div>

          <button
            type="button"
            className="post-ad-button"
            onClick={() => setActivePage('Sell')}
          >
            <Plus size={18} strokeWidth={2.8} />
            <span>Post an Ad</span>
          </button>

          <div className="theme-picker" aria-label="Choose accent color">
            <button
              type="button"
              className="theme-button"
              onClick={() => setThemeMenuOpen((open) => !open)}
              aria-label="Change theme color"
            >
              <span className="theme-swatch" style={{ background: theme.accent }} />
              <span>Theme</span>
            </button>

            {themeMenuOpen && (
              <div className="theme-menu" role="menu" aria-label="Color themes">
                {themes.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`theme-option ${themeId === option.id ? 'selected' : ''}`}
                    onClick={() => {
                      setThemeId(option.id)
                      setThemeMenuOpen(false)
                    }}
                    role="menuitemradio"
                    aria-checked={themeId === option.id}
                  >
                    <span className="theme-option-swatch" style={{ background: option.accent }} />
                    <span>{option.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            className="menu-button"
            type="button"
            aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      <nav className="category-nav" aria-label="Browse categories">
        {categories.slice(1).map((cat) => {
          const subItems = categoryMenus[cat] || []
          const isOpen = openCategoryMenu === cat
          return (
            <div
              key={cat}
              className={`category-menu-item ${isOpen ? 'open' : ''}`}
              onMouseEnter={() => setOpenCategoryMenu(cat)}
              onMouseLeave={() => setOpenCategoryMenu(null)}
            >
              <button
                type="button"
                className={`category-nav-link ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => {
                  setSelectedCategory(cat)
                  setActivePage('Search')
                  setOpenCategoryMenu(isOpen ? null : cat)
                }}
                aria-expanded={isOpen}
              >
                <span>{cat}</span>
                <ChevronDown size={13} className={`cat-arrow ${isOpen ? 'rotated' : ''}`} />
              </button>

              {isOpen && subItems.length > 0 && (
                <div className="category-dropdown" role="menu">
                  <div className="category-dropdown-header">
                    <strong>{cat}</strong>
                    <button
                      type="button"
                      className="category-dropdown-view-all"
                      onClick={() => {
                        setSelectedCategory(cat)
                        setSearchQuery('')
                        setActivePage('Search')
                        setOpenCategoryMenu(null)
                      }}
                    >
                      View All →
                    </button>
                  </div>
                  <div className="category-dropdown-grid">
                    {subItems.map((sub) => (
                      <button
                        key={sub}
                        type="button"
                        className="category-dropdown-item"
                        onClick={() => {
                          setSelectedCategory(cat)
                          setSearchQuery(sub)
                          setActivePage('Search')
                          setOpenCategoryMenu(null)
                        }}
                      >
                        <span className="cat-sub-bullet">•</span>
                        <span>{sub}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </nav>

      <main className="content">
        {activePage === 'Home' ? (
          <>
        <section className="hero-panel" aria-label="Marketplace search">
          <div className="hero-image" aria-hidden="true" />
          <div className="hero-overlay" aria-hidden="true" />

          <div className="hero-content">
            <div className="hero-copy">
              <span className="hero-market-badge">UAE&apos;S #1 AUTO MARKET</span>
              <h1>Find your dream car<br /><span>driven by passion.</span></h1>
            </div>

            <div className="market-search-panel">
              <form
                className="search-bar"
                role="search"
                onSubmit={(event) => {
                  event.preventDefault()
                  setActivePage('Search')
                }}
              >
                <div className="search-field search-primary">
                  <Search className="search-icon" size={22} aria-hidden="true" />
                  <input
                    type="text"
                    placeholder="Search make, model, or keyword..."
                    aria-label="Search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                  />
                </div>

                <div className="search-field search-location">
                  <MapPin className="search-icon" size={20} aria-hidden="true" />
                  <select
                    aria-label="Select city"
                    value={selectedCity}
                    onChange={(event) => setSelectedCity(event.target.value)}
                  >
                    {cities.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                  <ChevronDown className="caret" size={18} aria-hidden="true" />
                </div>

                <button type="submit" className="search-button">
                  Search
                </button>
              </form>
            </div>
          </div>
        </section>

        <section className="listing-section" aria-label="Trending listings">
          <div className="section-header">
            <div className="section-title-wrap">
              <span className="section-icon">☰</span>
              <h2>Trending Today</h2>
            </div>
            <button
              type="button"
              className="view-all-projects"
              onClick={() => {
                setSelectedCategory('All')
                setActivePage('Search')
              }}
            >
              View All
            </button>
          </div>

          <div className="cards-grid">
            {homeListings.length ? homeListings.map((item) => (
              <ListingCard
                key={item.id}
                item={item}
                saved={savedIds.includes(item.id)}
                onToggleSaved={toggleSaved}
                onMessage={startConversation}
              />
            )) : <div className="empty-state"><h2>No listings in this category</h2><p>Choose another category or browse all listings.</p></div>}
          </div>
        </section>

        <section className="listing-section" aria-label="New project listings">
          <div className="section-header project-header">
            <div className="section-title-wrap">
              <span className="section-icon">✦</span>
              <h2>New Projects Launching</h2>
            </div>
            <button
              type="button"
              className="view-all-projects"
              onClick={() => {
                setSelectedCategory('Property')
                setActivePage('Search')
              }}
            >View All Projects</button>
          </div>

          <div className="cards-grid compact-grid">
            {projects.map((item) => (
              <ListingCard
                key={item.id}
                item={{ ...item, accent: 'premium' }}
                compact
                saved={savedIds.includes(item.id)}
                onToggleSaved={toggleSaved}
                onMessage={startConversation}
              />
            ))}
          </div>
        </section>

        <section className="job-banner" aria-label="Job seekers">
          <div className="job-icon">◍</div>
          <div className="job-copy">
            <p className="job-label">Job Seekers</p>
            <h3>Find your dream job</h3>
            <p>Browse thousands of job vacancies from top companies in the UAE.</p>
          </div>
          <button
            type="button"
            className="job-button"
            onClick={() => {
              setSelectedCategory('Jobs')
              setActivePage('Search')
            }}
          >Explore Jobs</button>
        </section>
          </>
        ) : activePage === 'Search' ? (
          <SearchPage
            listings={allListings}
            query={searchQuery}
            setQuery={setSearchQuery}
            category={selectedCategory}
            setCategory={setSelectedCategory}
            city={selectedCity}
            setCity={setSelectedCity}
            savedIds={savedIds}
            onToggleSaved={toggleSaved}
            onMessage={startConversation}
          />
        ) : activePage === 'Sell' ? (
          <SellPage onPublish={publishListing} />
        ) : activePage === 'Chat' ? (
          <ChatPage
            conversations={conversations}
            setConversations={setConversations}
            activeId={activeConversationId}
            setActiveId={setActiveConversationId}
            senderName={profile.name || 'Guest'}
            serviceError={chatServiceError}
          />
        ) : (
          <ProfilePage
            profile={profile}
            onSaveProfile={setProfile}
            savedListings={allListings.filter((item) => savedIds.includes(item.id))}
            myListings={userListings}
            onToggleSaved={toggleSaved}
            onDeleteListing={deleteListing}
            onMessage={startConversation}
            onLogout={() => setProfile({ name: '', email: '' })}
          />
        )}
      </main>

      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        <button
          type="button"
          className={`mobile-nav-item ${activePage === 'Home' ? 'active' : ''}`}
          onClick={() => setActivePage('Home')}
          aria-label="Home page"
        >
          <div className="nav-icon-wrapper">
            <House size={22} strokeWidth={activePage === 'Home' ? 2.5 : 1.9} />
            {activePage === 'Home' && <span className="nav-active-dot" />}
          </div>
          <span className="nav-label">Home</span>
        </button>

        <button
          type="button"
          className={`mobile-nav-item ${activePage === 'Search' ? 'active' : ''}`}
          onClick={() => setActivePage('Search')}
          aria-label="Search listings"
        >
          <div className="nav-icon-wrapper">
            <Search size={22} strokeWidth={activePage === 'Search' ? 2.5 : 1.9} />
            {activePage === 'Search' && <span className="nav-active-dot" />}
          </div>
          <span className="nav-label">Search</span>
        </button>

        <button
          type="button"
          className={`mobile-nav-item sell-item ${activePage === 'Sell' ? 'active' : ''}`}
          onClick={() => setActivePage('Sell')}
          aria-label="Post an ad"
        >
          <div className="sell-bubble-glow">
            <div className="mobile-nav-bubble">
              <Plus size={26} strokeWidth={3} />
            </div>
          </div>
          <span className="nav-label sell-label">Sell</span>
        </button>

        <button
          type="button"
          className={`mobile-nav-item ${activePage === 'Chat' ? 'active' : ''}`}
          onClick={() => setActivePage('Chat')}
          aria-label="Live Chat"
        >
          <div className="nav-icon-wrapper">
            <MessageCircle size={22} strokeWidth={activePage === 'Chat' ? 2.5 : 1.9} />
            {activePage === 'Chat' && <span className="nav-active-dot" />}
          </div>
          <span className="nav-label">Chat</span>
        </button>

        <button
          type="button"
          className={`mobile-nav-item ${activePage === 'Profile' ? 'active' : ''}`}
          onClick={() => setActivePage('Profile')}
          aria-label="User Profile"
        >
          <div className="nav-icon-wrapper">
            <User size={22} strokeWidth={activePage === 'Profile' ? 2.5 : 1.9} />
            {activePage === 'Profile' && <span className="nav-active-dot" />}
          </div>
          <span className="nav-label">Profile</span>
        </button>
      </nav>

      <footer className="site-footer">
        <div className="footer-top-columns">
          <div className="footer-col">
            <div className="brand footer-brand" onClick={() => setActivePage('Home')}>
              <DubaiZALogo size={36} />
              <div className="brand-text-wrap">
                <span className="brand-text">Dubai<span className="brand-accent-za">ZA</span></span>
                <span className="brand-subtext">The UAE Marketplace</span>
              </div>
            </div>
            <p className="footer-desc">
              The UAE&apos;s leading classifieds marketplace. Buy, sell, and find cars, properties, jobs, tech, and services across Dubai, Abu Dhabi, and the Emirates.
            </p>
            <div className="footer-app-badges">
              <span className="app-badge"> App Store</span>
              <span className="app-badge">▶ Google Play</span>
            </div>
          </div>

          <div className="footer-col">
            <h4>Popular Categories</h4>
            <ul>
              <li><button type="button" onClick={() => { setSelectedCategory('Motors'); setActivePage('Search') }}>Motors & Cars</button></li>
              <li><button type="button" onClick={() => { setSelectedCategory('Property'); setActivePage('Search') }}>Property for Sale & Rent</button></li>
              <li><button type="button" onClick={() => { setSelectedCategory('Jobs'); setActivePage('Search') }}>Jobs in UAE</button></li>
              <li><button type="button" onClick={() => { setSelectedCategory('Electronics'); setActivePage('Search') }}>Electronics & Tech</button></li>
              <li><button type="button" onClick={() => { setSelectedCategory('Furniture & Garden'); setActivePage('Search') }}>Furniture & Home</button></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Trending Locations</h4>
            <ul>
              <li><button type="button" onClick={() => { setSelectedCity('Dubai'); setActivePage('Search') }}>Dubai Marina</button></li>
              <li><button type="button" onClick={() => { setSelectedCity('Dubai'); setActivePage('Search') }}>Downtown Dubai</button></li>
              <li><button type="button" onClick={() => { setSelectedCity('Dubai'); setActivePage('Search') }}>Palm Jumeirah</button></li>
              <li><button type="button" onClick={() => { setSelectedCity('Abu Dhabi'); setActivePage('Search') }}>Abu Dhabi City</button></li>
              <li><button type="button" onClick={() => { setSelectedCity('Sharjah'); setActivePage('Search') }}>Sharjah Waterfront</button></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Support & Safety</h4>
            <ul>
              <li><button type="button" onClick={() => setActivePage('Home')}>Help Center</button></li>
              <li><button type="button" onClick={() => setActivePage('Home')}>Safety Tips</button></li>
              <li><button type="button" onClick={() => setActivePage('Home')}>Terms of Use</button></li>
              <li><button type="button" onClick={() => setActivePage('Home')}>Privacy Policy</button></li>
              <li><button type="button" onClick={() => { setAuthView('login'); setShowAuthModal(true) }}>Seller Verification</button></li>
            </ul>
          </div>
        </div>

        <div className="footer-inner">
          <span>DubaiZA <span className="footer-muted">UAE marketplace</span></span>
          <div className="footer-actions">
            <button type="button" onClick={() => setActivePage('Search')}>Browse listings</button>
            <button type="button" onClick={() => setActivePage('Sell')}>Post a listing</button>
          </div>
          <span className="footer-muted">Listings and profile details are saved on this device.</span>
        </div>
      </footer>
    </div>
  )
}

function SearchPage({ listings, query, setQuery, category, setCategory, city, setCity, savedIds, onToggleSaved, onMessage }) {
  const normalizedQuery = query.trim().toLowerCase()
  const matchingCards = listings.filter((item) => {
    const matchesQuery = !normalizedQuery || `${item.title} ${item.category} ${item.location} ${item.city} ${item.description || ''}`.toLowerCase().includes(normalizedQuery)
    const matchesCategory = category === 'All' || item.category === category
    const matchesCity = city === 'All Cities' || item.city === city
    return matchesQuery && matchesCategory && matchesCity
  })

  return (
    <section className="app-page" aria-labelledby="search-title">
      <div className="page-heading">
        <p className="page-eyebrow">DubaiZA marketplace</p>
        <h1 id="search-title">Find your next thing.</h1>
        <p>Explore cars, homes, electronics, and more from sellers across the UAE.</p>
      </div>
      <div className="page-search" role="search">
        <span aria-hidden="true">⌕</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search listings, categories, or locations"
          aria-label="Search listings"
        />
      </div>
      <div className="search-filters">
        <label>Category
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            {categories.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label>Location
          <select value={city} onChange={(event) => setCity(event.target.value)}>
            {cities.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
      </div>
      <div className="section-header search-results-heading">
        <h2>{query ? `${matchingCards.length} matching listings` : 'Popular listings'}</h2>
        <span>{city}</span>
      </div>
      {matchingCards.length ? (
        <div className="cards-grid">
          {matchingCards.map((item) => (
            <ListingCard
              key={item.id}
              item={item}
              saved={savedIds.includes(item.id)}
              onToggleSaved={onToggleSaved}
              onMessage={onMessage}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h2>No listings found</h2>
          <p>Try another search, or clear the search field to browse popular listings.</p>
        </div>
      )}
    </section>
  )
}

function SellPage({ onPublish }) {
  const [image, setImage] = useState('')
  const [imageError, setImageError] = useState('')

  function handleImageChange(event) {
    const file = event.currentTarget.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
      setImageError('Choose an image smaller than 5 MB.')
      event.currentTarget.value = ''
      return
    }

    setImageError('')
    const reader = new FileReader()
    reader.onerror = () => setImageError('That image could not be read. Try another file.')
    reader.onload = () => {
      const preview = new Image()
      preview.onerror = () => setImageError('That image could not be opened. Try another file.')
      preview.onload = () => {
        const scale = Math.min(1, 1200 / Math.max(preview.width, preview.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(preview.width * scale)
        canvas.height = Math.round(preview.height * scale)
        canvas.getContext('2d').drawImage(preview, 0, 0, canvas.width, canvas.height)
        setImage(canvas.toDataURL('image/jpeg', 0.78))
      }
      preview.src = reader.result
    }
    reader.readAsDataURL(file)
  }

  function handleSubmit(event) {
    event.preventDefault()
    const values = Object.fromEntries(new FormData(event.currentTarget))
    values.price = `AED${Number(values.price).toLocaleString()}`
    values.image = image
    onPublish(values)
  }

  return (
    <section className="app-page" aria-labelledby="sell-title">
      <div className="page-heading">
        <p className="page-eyebrow">Sell on DubaiZA</p>
        <h1 id="sell-title">Create a listing</h1>
        <p>Share the details buyers need to find your item.</p>
      </div>
      <form className="form-panel" onSubmit={handleSubmit}>
        <label>
          Listing title
          <input name="title" required maxLength="90" placeholder="e.g. 2022 Toyota Land Cruiser" />
        </label>
        <div className="form-row">
          <label>
            Category
            <select name="category" defaultValue="" required>
              <option value="" disabled>Select a category</option>
              {categories.slice(1).map((category) => <option key={category}>{category}</option>)}
            </select>
          </label>
          <label>
            Price (AED)
            <input name="price" type="number" min="1" step="1" required placeholder="0" />
          </label>
        </div>
        <div className="form-row">
          <label>City
            <select name="city" defaultValue="Dubai">{cities.slice(1).map((city) => <option key={city}>{city}</option>)}</select>
          </label>
          <label>Area
            <input name="location" required maxLength="80" placeholder="e.g. Dubai Marina" />
          </label>
        </div>
        <label>
          Description
          <textarea name="description" rows="5" maxLength="1000" required placeholder="Tell buyers what makes it special" />
        </label>
        <label>Photo (optional)
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </label>
        {imageError && <p className="form-error" role="alert">{imageError}</p>}
        {image && <img className="upload-preview" src={image} alt="Listing preview" />}
        <button className="search-button form-submit" type="submit">Publish listing</button>
        <p className="form-footnote">Your listing is stored in this browser and will appear in Search.</p>
      </form>
    </section>
  )
}

function ProfilePage({ profile, onSaveProfile, savedListings, myListings, onToggleSaved, onDeleteListing, onMessage, onLogout }) {
  const [name, setName] = useState(profile.name)
  const [email, setEmail] = useState(profile.email)
  const [notice, setNotice] = useState('')
  return (
    <section className="app-page profile-page" aria-labelledby="profile-title">
      <div className="page-heading">
        <p className="page-eyebrow">Your DubaiZA account</p>
        <h1 id="profile-title">{profile.name ? `Hello, ${profile.name}.` : 'Your profile'}</h1>
        <p>Manage your profile, live listings, and saved items across devices.</p>
      </div>
      <form
        className="form-panel profile-form"
        onSubmit={(event) => {
          event.preventDefault()
          onSaveProfile({ ...profile, name, email })
          setNotice('Profile updated and saved to account.')
        }}
      >
        <h2>Profile details</h2>
        <label>Name<input value={name} onChange={(event) => setName(event.target.value)} required maxLength="60" placeholder="Your name" /></label>
        <label>Email address<input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required placeholder="you@example.com" /></label>
        <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
          <button className="search-button form-submit" type="submit" style={{ flex: 1 }}>Save profile</button>
          {profile.name && onLogout && (
            <button
              type="button"
              className="search-button"
              style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', cursor: 'pointer' }}
              onClick={onLogout}
            >
              Sign out
            </button>
          )}
        </div>
        {notice && <p className="form-notice" role="status">{notice}</p>}
        <p className="form-footnote">Connected to DubaiZA Full-Stack backend.</p>
      </form>
      <section className="profile-list-section">
        <h2>Saved listings <span>{savedListings.length}</span></h2>
        {savedListings.length ? <div className="cards-grid">{savedListings.map((item) => (
          <ListingCard key={item.id} item={item} saved onToggleSaved={onToggleSaved} onMessage={onMessage} />
        ))}</div> : <p className="profile-empty">Listings you save will appear here.</p>}
      </section>
      <section className="profile-list-section">
        <h2>Your listings <span>{myListings.length}</span></h2>
        {myListings.length ? <div className="cards-grid">{myListings.map((item) => (
          <ListingCard key={item.id} item={item} saved={savedListings.some((saved) => saved.id === item.id)} onToggleSaved={onToggleSaved} onMessage={onMessage} onDelete={onDeleteListing} />
        ))}</div> : <p className="profile-empty">Listings you publish from Sell will appear here.</p>}
      </section>
    </section>
  )
}

export default App
