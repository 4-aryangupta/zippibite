require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Restaurant = require('./models/Restaurant');
const MenuItem = require('./models/MenuItem');

const IMG = (id) =>
  `https://images.unsplash.com/photo-${id}?w=400&q=80&auto=format&fit=crop`;

const RESTAURANTS = [
  {
    name: 'Bukhara',
    description: 'India\'s most iconic North-West Frontier cuisine restaurant. Famous for Dal Bukhara and Sikandari Raan.',
    cuisine: ['North Indian', 'Mughlai'],
    heroImage: IMG('1574653853027-5382a3d23a15'),
    logoImage: IMG('1574653853027-5382a3d23a15'),
    rating: 4.8,
    deliveryTime: '40-50 min',
    minOrder: 499,
    packagingCharge: 40,
    isSponsored: true,
    address: { fullAddress: 'ITC Maurya, Diplomatic Enclave', city: 'Delhi', pincode: '110021' },
    categories: ['Starters', 'Breads', 'Mains', 'Dal', 'Beverages'],
    items: [
      { name: 'Dal Bukhara', description: 'Whole black lentils slow-cooked overnight on a tandoor', price: 650, category: 'Dal', isVeg: true, isBestseller: true, image: IMG('1546069901-22af8c961fe2') },
      { name: 'Sikandari Raan', description: 'Whole leg of baby lamb marinated in 100 spices', price: 1800, category: 'Mains', isVeg: false, isBestseller: true, image: IMG('1529692236671-f1f6cf9683ba') },
      { name: 'Murgh Bukhara', description: 'Whole chicken marinated overnight in yogurt and spices', price: 980, category: 'Mains', isVeg: false, image: IMG('1598515214211-89d3c73ae83b') },
      { name: 'Tandoori Jhinga', description: 'Tiger prawns marinated in carom seeds and grilled in tandoor', price: 1100, category: 'Starters', isVeg: false, image: IMG('1565557623262-b51531673812') },
      { name: 'Roomali Roti', description: 'Thin handkerchief bread, baked on inverted iron wok', price: 80, category: 'Breads', isVeg: true, image: IMG('1574071318508-1cdbab80d002') },
      { name: 'Garlic Naan', description: 'Leavened bread with garlic and butter, baked in tandoor', price: 120, category: 'Breads', isVeg: true, isBestseller: true, image: IMG('1574073526975-5baf2a44d21f') },
      { name: 'Seekh Kebab', description: 'Minced lamb kebabs with fresh herbs and spices', price: 580, category: 'Starters', isVeg: false, image: IMG('1599487488170-d11ec9c172f0') },
      { name: 'Mango Lassi', description: 'Thick yogurt-based mango drink', price: 180, category: 'Beverages', isVeg: true, image: IMG('1560717789-1ac81845b1aa') },
      { name: 'Paneer Tikka', description: 'Cottage cheese cubes marinated in spiced yogurt and grilled', price: 420, category: 'Starters', isVeg: true, isBestseller: true, image: IMG('1567188040149-e97bc50b3b81') },
      { name: 'Butter Chicken', description: 'Tender chicken cooked in a rich tomato-butter gravy', price: 650, category: 'Mains', isVeg: false, isBestseller: true, image: IMG('1599487488170-d11ec9c172f0') },
    ],
  },
  {
    name: 'Behrouz Biryani',
    description: 'Royal biryanis from the Mughal kitchens. Every biryani is a culinary masterpiece.',
    cuisine: ['Biryani', 'Mughlai'],
    heroImage: IMG('1633321702599-82e3d4d9b628'),
    rating: 4.6,
    deliveryTime: '30-40 min',
    minOrder: 299,
    packagingCharge: 30,
    isSponsored: true,
    address: { fullAddress: 'Multiple Outlets', city: 'Mumbai', pincode: '400001' },
    categories: ['Biryani', 'Kebabs', 'Sides', 'Desserts', 'Beverages'],
    items: [
      { name: 'Hamedan Chicken Biryani', description: 'Slow-cooked chicken in aromatic saffron rice with rose water', price: 349, category: 'Biryani', isVeg: false, isBestseller: true, image: IMG('1633321702599-82e3d4d9b628') },
      { name: 'Dum Mutton Biryani', description: 'Tender mutton pieces in long-grain basmati dum-cooked', price: 449, category: 'Biryani', isVeg: false, isBestseller: true, image: IMG('1563379091329-fdcf08dfe3b0') },
      { name: 'Zafrani Paneer Biryani', description: 'Royal vegetarian biryani with saffron-infused cottage cheese', price: 299, category: 'Biryani', isVeg: true, image: IMG('1567188040149-e97bc50b3b81') },
      { name: 'Lucknowi Biryani', description: 'Light, fragrant biryani in the Awadhi style', price: 379, category: 'Biryani', isVeg: false, image: IMG('1546069901-22af8c961fe2') },
      { name: 'Seekh Kebab Platter', description: 'Juicy minced mutton kebabs with mint chutney', price: 280, category: 'Kebabs', isVeg: false, image: IMG('1599487488170-d11ec9c172f0') },
      { name: 'Saffron Phirni', description: 'Traditional ground rice pudding with saffron and cardamom', price: 130, category: 'Desserts', isVeg: true, image: IMG('1565557623262-b51531673812') },
      { name: 'Raita', description: 'Chilled yogurt with cucumber and spices', price: 79, category: 'Sides', isVeg: true, isBestseller: true, image: IMG('1560717789-1ac81845b1aa') },
      { name: 'Shahi Tukda', description: 'Fried bread soaked in sugar syrup topped with rabri and nuts', price: 150, category: 'Desserts', isVeg: true, image: IMG('1574073526975-5baf2a44d21f') },
      { name: 'Rose Sharbat', description: 'Chilled rose-flavored drink with basil seeds', price: 99, category: 'Beverages', isVeg: true, image: IMG('1560717789-1ac81845b1aa') },
    ],
  },
  {
    name: 'Barbeque Nation',
    description: 'India\'s favourite casual dining chain. Live grills at your table for an unforgettable experience.',
    cuisine: ['Grills', 'BBQ', 'Indian'],
    heroImage: IMG('1529692236671-f1f6cf9683ba'),
    rating: 4.5,
    deliveryTime: '35-45 min',
    minOrder: 399,
    packagingCharge: 35,
    isSponsored: false,
    address: { fullAddress: 'HSR Layout', city: 'Bangalore', pincode: '560102' },
    categories: ['Veg Starters', 'Non-Veg Starters', 'Mains', 'Breads', 'Desserts'],
    items: [
      { name: 'Crispy Corn', description: 'Corn tossed with butter, herbs and lemon', price: 199, category: 'Veg Starters', isVeg: true, isBestseller: true, image: IMG('1565557623262-b51531673812') },
      { name: 'Chicken Wings BBQ', description: 'Smoky chicken wings glazed with house BBQ sauce', price: 329, category: 'Non-Veg Starters', isVeg: false, isBestseller: true, image: IMG('1598515214211-89d3c73ae83b') },
      { name: 'Cajun Spiced Mushrooms', description: 'Button mushrooms with cajun spice and garlic butter', price: 249, category: 'Veg Starters', isVeg: true, image: IMG('1574071318508-1cdbab80d002') },
      { name: 'Tandoori Chicken', description: 'Half chicken marinated in classical tandoor spices', price: 399, category: 'Non-Veg Starters', isVeg: false, image: IMG('1529692236671-f1f6cf9683ba') },
      { name: 'Paneer Tikka Masala', description: 'Grilled cottage cheese in spiced tomato gravy', price: 299, category: 'Mains', isVeg: true, isBestseller: true, image: IMG('1567188040149-e97bc50b3b81') },
      { name: 'Kadhai Chicken', description: 'Chicken cooked in iron wok with whole spices', price: 349, category: 'Mains', isVeg: false, image: IMG('1599487488170-d11ec9c172f0') },
      { name: 'Butter Naan', description: 'Soft leavened bread with butter', price: 89, category: 'Breads', isVeg: true, image: IMG('1574073526975-5baf2a44d21f') },
      { name: 'Gulab Jamun', description: 'Soft milk-solid dumplings soaked in rose sugar syrup', price: 149, category: 'Desserts', isVeg: true, isBestseller: true, image: IMG('1574073526975-5baf2a44d21f') },
      { name: 'Brownie with Ice Cream', description: 'Warm chocolate brownie with vanilla ice cream', price: 199, category: 'Desserts', isVeg: true, image: IMG('1563379091329-fdcf08dfe3b0') },
    ],
  },
  {
    name: 'Saravana Bhavan',
    description: 'The world-famous South Indian vegetarian restaurant chain. Authentic taste, pure tradition.',
    cuisine: ['South Indian', 'Vegetarian'],
    heroImage: IMG('1546069901-22af8c961fe2'),
    rating: 4.4,
    deliveryTime: '25-35 min',
    minOrder: 149,
    packagingCharge: 15,
    isSponsored: false,
    address: { fullAddress: 'Pondy Bazaar', city: 'Chennai', pincode: '600017' },
    categories: ['Dosas', 'Idli & Vada', 'Rice', 'Tiffin', 'Beverages'],
    items: [
      { name: 'Masala Dosa', description: 'Crispy rice crepe filled with spiced potato filling, served with sambar and chutneys', price: 129, category: 'Dosas', isVeg: true, isBestseller: true, image: IMG('1546069901-22af8c961fe2') },
      { name: 'Ghee Podi Dosa', description: 'Crispy dosa smeared in ghee and spiced lentil powder', price: 149, category: 'Dosas', isVeg: true, isBestseller: true, image: IMG('1574071318508-1cdbab80d002') },
      { name: 'Rava Dosa', description: 'Thin, lacy semolina crepe with cashews and green chillies', price: 139, category: 'Dosas', isVeg: true, image: IMG('1546069901-22af8c961fe2') },
      { name: 'Idli Sambar (3 Pcs)', description: 'Steamed rice cakes served with sambar and three chutneys', price: 99, category: 'Idli & Vada', isVeg: true, isBestseller: true, image: IMG('1563379091329-fdcf08dfe3b0') },
      { name: 'Medu Vada', description: 'Crispy lentil doughnuts with coconut chutney', price: 99, category: 'Idli & Vada', isVeg: true, image: IMG('1574071318508-1cdbab80d002') },
      { name: 'Curd Rice', description: 'Cooked rice mixed with yogurt, tempered with mustard and curry leaves', price: 119, category: 'Rice', isVeg: true, image: IMG('1567188040149-e97bc50b3b81') },
      { name: 'Lemon Rice', description: 'Fluffy rice tossed with lemon juice, turmeric and peanuts', price: 129, category: 'Rice', isVeg: true, image: IMG('1546069901-22af8c961fe2') },
      { name: 'Filter Coffee', description: 'South Indian decoction coffee with frothy milk', price: 69, category: 'Beverages', isVeg: true, isBestseller: true, image: IMG('1560717789-1ac81845b1aa') },
      { name: 'Pongal', description: 'Soft rice and lentil porridge tempered in ghee with pepper', price: 119, category: 'Tiffin', isVeg: true, image: IMG('1574073526975-5baf2a44d21f') },
    ],
  },
  {
    name: 'Mainland China',
    description: 'India\'s premier Chinese dining experience. Authentic flavours and premium ambience.',
    cuisine: ['Chinese', 'Asian'],
    heroImage: IMG('1563379091329-fdcf08dfe3b0'),
    rating: 4.3,
    deliveryTime: '30-40 min',
    minOrder: 299,
    packagingCharge: 25,
    isSponsored: false,
    address: { fullAddress: 'Park Street', city: 'Kolkata', pincode: '700016' },
    categories: ['Dim Sum', 'Soups', 'Starters', 'Mains', 'Noodles & Rice', 'Desserts'],
    items: [
      { name: 'Chicken Dim Sum (6 pcs)', description: 'Steamed chicken dumplings with ginger soy dipping sauce', price: 299, category: 'Dim Sum', isVeg: false, isBestseller: true, image: IMG('1563379091329-fdcf08dfe3b0') },
      { name: 'Veg Crystal Dim Sum', description: 'Translucent steamed dumplings with mixed vegetable filling', price: 249, category: 'Dim Sum', isVeg: true, image: IMG('1574073526975-5baf2a44d21f') },
      { name: 'Hot & Sour Soup', description: 'Classic Chinese soup with vegetables, tofu and crispy noodles', price: 199, category: 'Soups', isVeg: true, isBestseller: true, image: IMG('1565557623262-b51531673812') },
      { name: 'Crispy Chilli Chicken', description: 'Battered chicken tossed in spicy chilli sauce', price: 349, category: 'Starters', isVeg: false, isBestseller: true, image: IMG('1598515214211-89d3c73ae83b') },
      { name: 'Kung Pao Prawn', description: 'Prawns stir-fried with chillis, peanuts and vegetables', price: 449, category: 'Mains', isVeg: false, image: IMG('1565557623262-b51531673812') },
      { name: 'Chicken Hakka Noodles', description: 'Stir-fried Hakka noodles with chicken and vegetables', price: 299, category: 'Noodles & Rice', isVeg: false, isBestseller: true, image: IMG('1563379091329-fdcf08dfe3b0') },
      { name: 'Veg Fried Rice', description: 'Wok-tossed fried rice with mixed vegetables and soy', price: 249, category: 'Noodles & Rice', isVeg: true, image: IMG('1546069901-22af8c961fe2') },
      { name: 'Chocolate Dim Sum', description: 'Sweet steamed dumplings with chocolate filling', price: 199, category: 'Desserts', isVeg: true, image: IMG('1574073526975-5baf2a44d21f') },
      { name: 'Paneer Manchurian', description: 'Crispy paneer balls in spicy Manchurian sauce', price: 299, category: 'Starters', isVeg: true, image: IMG('1567188040149-e97bc50b3b81') },
    ],
  },
  {
    name: 'Theobroma',
    description: 'Mumbai\'s beloved patisserie. World-class pastries, artisan breads and signature brownies.',
    cuisine: ['Bakery', 'Desserts', 'Cafe'],
    heroImage: IMG('1565557623262-b51531673812'),
    rating: 4.7,
    deliveryTime: '20-30 min',
    minOrder: 199,
    packagingCharge: 20,
    isSponsored: true,
    address: { fullAddress: 'Colaba Causeway', city: 'Mumbai', pincode: '400005' },
    categories: ['Cakes & Pastries', 'Brownies', 'Breads & Croissants', 'Cookies', 'Beverages'],
    items: [
      { name: 'Signature Brownie', description: 'The original Theobroma brownie — dense, fudgy, legendary', price: 149, category: 'Brownies', isVeg: true, isBestseller: true, image: IMG('1565557623262-b51531673812') },
      { name: 'Nutella Brownie', description: 'Classic brownie swirled with Nutella', price: 179, category: 'Brownies', isVeg: true, isBestseller: true, image: IMG('1574071318508-1cdbab80d002') },
      { name: 'Tiramisu', description: 'Italian classic with espresso-soaked savoiardi and mascarpone', price: 369, category: 'Cakes & Pastries', isVeg: true, image: IMG('1563379091329-fdcf08dfe3b0') },
      { name: 'Lemon Meringue Tart', description: 'Buttery pastry shell with lemon curd and toasted meringue', price: 299, category: 'Cakes & Pastries', isVeg: true, image: IMG('1574073526975-5baf2a44d21f') },
      { name: 'Butter Croissant', description: 'Flaky, layered French croissant with fresh butter', price: 119, category: 'Breads & Croissants', isVeg: true, isBestseller: true, image: IMG('1574071318508-1cdbab80d002') },
      { name: 'Chocolate Chip Cookie', description: 'Large, chewy cookies loaded with dark chocolate chips', price: 89, category: 'Cookies', isVeg: true, image: IMG('1565557623262-b51531673812') },
      { name: 'Hazelnut Latte', description: 'Espresso with hazelnut syrup and steamed milk', price: 219, category: 'Beverages', isVeg: true, image: IMG('1560717789-1ac81845b1aa') },
      { name: 'Belgian Chocolate Cake (slice)', description: 'Rich Belgian chocolate layer cake', price: 329, category: 'Cakes & Pastries', isVeg: true, isBestseller: true, image: IMG('1574073526975-5baf2a44d21f') },
      { name: 'Cold Brew', description: 'Smooth, slow-steeped cold brew coffee', price: 199, category: 'Beverages', isVeg: true, image: IMG('1560717789-1ac81845b1aa') },
    ],
  },
  {
    name: 'Farzi Cafe',
    description: 'Modern Indian bistro — molecular gastronomy meets Indian street food. Expect the unexpected.',
    cuisine: ['Modern Indian', 'Fusion'],
    heroImage: IMG('1574653853027-5382a3d23a15'),
    rating: 4.5,
    deliveryTime: '35-45 min',
    minOrder: 399,
    packagingCharge: 30,
    isSponsored: false,
    address: { fullAddress: 'Cyber Hub', city: 'Gurugram', pincode: '122002' },
    categories: ['Small Plates', 'Mains', 'Chaat', 'Burgers', 'Desserts', 'Cocktails'],
    items: [
      { name: 'Butter Chicken Pao', description: 'Street-style pao stuffed with slow-cooked butter chicken', price: 349, category: 'Small Plates', isVeg: false, isBestseller: true, image: IMG('1599487488170-d11ec9c172f0') },
      { name: 'Paper Dosa Taco', description: 'Crispy dosa shell with potato filling and pico de gallo', price: 299, category: 'Small Plates', isVeg: true, isBestseller: true, image: IMG('1546069901-22af8c961fe2') },
      { name: 'Dhaba Style Lamb Chops', description: 'Marinated lamb chops charred on a live grill, pickled onions', price: 850, category: 'Mains', isVeg: false, image: IMG('1529692236671-f1f6cf9683ba') },
      { name: 'Gol Gappa Shots', description: 'Molecular gol gappas with shots of imli water', price: 249, category: 'Chaat', isVeg: true, isBestseller: true, image: IMG('1563379091329-fdcf08dfe3b0') },
      { name: 'Keema Pav Burger', description: 'Farzi take on a classic — spiced keema in brioche bun', price: 389, category: 'Burgers', isVeg: false, image: IMG('1598515214211-89d3c73ae83b') },
      { name: 'Mishti Doi Cheesecake', description: 'Bengali sweet yogurt reimagined as a New York cheesecake', price: 359, category: 'Desserts', isVeg: true, isBestseller: true, image: IMG('1565557623262-b51531673812') },
      { name: 'Dal Makhani Risotto', description: 'Italian technique meets Indian soul — silky and indulgent', price: 549, category: 'Mains', isVeg: true, image: IMG('1546069901-22af8c961fe2') },
      { name: 'Kokum Cooler', description: 'Kokum, lime and mint — a Goan coastal refresher', price: 199, category: 'Cocktails', isVeg: true, image: IMG('1560717789-1ac81845b1aa') },
    ],
  },
  {
    name: 'Punjab Grill',
    description: 'Premium Punjabi dining — rich flavours of the land of five rivers, served with old-school warmth.',
    cuisine: ['Punjabi', 'North Indian'],
    heroImage: IMG('1529692236671-f1f6cf9683ba'),
    rating: 4.4,
    deliveryTime: '30-40 min',
    minOrder: 349,
    packagingCharge: 25,
    isSponsored: false,
    address: { fullAddress: 'Select Citywalk', city: 'Delhi', pincode: '110017' },
    categories: ['Starters', 'Grills', 'Mains', 'Breads', 'Desserts'],
    items: [
      { name: 'Amritsari Kulcha', description: 'Crispy stuffed Amritsari kulcha with chole and butter', price: 199, category: 'Breads', isVeg: true, isBestseller: true, image: IMG('1574073526975-5baf2a44d21f') },
      { name: 'Patiala Chicken', description: 'Rich chicken curry in Patiala-style spice blend', price: 499, category: 'Mains', isVeg: false, isBestseller: true, image: IMG('1599487488170-d11ec9c172f0') },
      { name: 'Sarson da Saag & Makki di Roti', description: 'Classic Punjabi mustard greens with corn flatbread', price: 349, category: 'Mains', isVeg: true, isBestseller: true, image: IMG('1546069901-22af8c961fe2') },
      { name: 'Malai Tikka', description: 'Chicken tikka marinated in cream, cashew and cardamom', price: 429, category: 'Starters', isVeg: false, image: IMG('1598515214211-89d3c73ae83b') },
      { name: 'Tandoori Soya Chaap', description: 'Marinated soya chaap grilled in tandoor, served with mint chutney', price: 299, category: 'Grills', isVeg: true, image: IMG('1567188040149-e97bc50b3b81') },
      { name: 'Black Dal Makhani', description: 'Overnight-simmered black lentils finished with cream and butter', price: 349, category: 'Mains', isVeg: true, image: IMG('1574071318508-1cdbab80d002') },
      { name: 'Gajar Halwa', description: 'Slow-cooked carrot pudding with desi ghee, khoya and nuts', price: 189, category: 'Desserts', isVeg: true, isBestseller: true, image: IMG('1574073526975-5baf2a44d21f') },
      { name: 'Patiala Peg Mocktail', description: 'Ginger, lemon and mint cooler in a large Patiala glass', price: 179, category: 'Desserts', isVeg: true, image: IMG('1560717789-1ac81845b1aa') },
    ],
  },
  {
    name: 'Haldiram\'s',
    description: 'India\'s most loved snack and sweets brand. Authentic Indian mithai and namkeen since 1937.',
    cuisine: ['Snacks', 'Sweets', 'Indian'],
    heroImage: IMG('1574073526975-5baf2a44d21f'),
    rating: 4.3,
    deliveryTime: '20-30 min',
    minOrder: 149,
    packagingCharge: 10,
    isSponsored: false,
    address: { fullAddress: 'Connaught Place', city: 'Delhi', pincode: '110001' },
    categories: ['Sweets', 'Namkeen', 'Chaat', 'Meals', 'Beverages'],
    items: [
      { name: 'Kaju Katli (250g)', description: 'Premium cashew fudge — a timeless Indian mithai', price: 349, category: 'Sweets', isVeg: true, isBestseller: true, image: IMG('1574073526975-5baf2a44d21f') },
      { name: 'Aloo Bhujia (400g)', description: 'Crispy potato crisps in besan batter with spices', price: 149, category: 'Namkeen', isVeg: true, isBestseller: true, image: IMG('1565557623262-b51531673812') },
      { name: 'Raj Kachori', description: 'Large kachori filled with potato, chutney and yogurt', price: 99, category: 'Chaat', isVeg: true, image: IMG('1563379091329-fdcf08dfe3b0') },
      { name: 'Pani Puri (8 pcs)', description: 'Crispy hollow puris filled with spiced water and potato', price: 79, category: 'Chaat', isVeg: true, isBestseller: true, image: IMG('1574071318508-1cdbab80d002') },
      { name: 'Special Thali', description: 'Dal, two sabzis, rice, roti, papad, pickle and dessert', price: 299, category: 'Meals', isVeg: true, isBestseller: true, image: IMG('1546069901-22af8c961fe2') },
      { name: 'Gulab Jamun (6 pcs)', description: 'Soft milk dumplings in rose-flavored sugar syrup', price: 129, category: 'Sweets', isVeg: true, image: IMG('1574073526975-5baf2a44d21f') },
      { name: 'Mango Shake', description: 'Thick, creamy mango milkshake with Alphonso mangoes', price: 119, category: 'Beverages', isVeg: true, image: IMG('1560717789-1ac81845b1aa') },
      { name: 'Samosa (2 pcs)', description: 'Crispy pastry stuffed with spiced potato and peas', price: 49, category: 'Snacks', isVeg: true, isBestseller: true, image: IMG('1574071318508-1cdbab80d002') },
    ],
  },
  {
    name: 'Smoke House Deli',
    description: 'Modern European deli with handcrafted sandwiches, wood-fired pizzas and artisan coffee.',
    cuisine: ['Continental', 'European', 'Cafe'],
    heroImage: IMG('1598515214211-89d3c73ae83b'),
    rating: 4.4,
    deliveryTime: '30-40 min',
    minOrder: 299,
    packagingCharge: 25,
    isSponsored: false,
    address: { fullAddress: 'Khan Market', city: 'Delhi', pincode: '110003' },
    categories: ['Sandwiches', 'Pizzas', 'Salads', 'Mains', 'Desserts', 'Coffee'],
    items: [
      { name: 'Smoked Chicken Club', description: 'Triple-decker with smoked chicken, bacon, lettuce and tomato', price: 399, category: 'Sandwiches', isVeg: false, isBestseller: true, image: IMG('1598515214211-89d3c73ae83b') },
      { name: 'Margherita Wood-Fired Pizza', description: 'San Marzano tomatoes, fresh mozzarella and basil', price: 449, category: 'Pizzas', isVeg: true, isBestseller: true, image: IMG('1574653853027-5382a3d23a15') },
      { name: 'Caesar Salad', description: 'Romaine lettuce, parmesan, croutons, classic Caesar dressing', price: 349, category: 'Salads', isVeg: false, image: IMG('1567188040149-e97bc50b3b81') },
      { name: 'Pasta Aglio e Olio', description: 'Spaghetti with slow-cooked garlic, EVOO and chilli', price: 379, category: 'Mains', isVeg: true, image: IMG('1563379091329-fdcf08dfe3b0') },
      { name: 'Braised Lamb Shank', description: 'Slow-braised lamb in red wine with rosemary mash', price: 849, category: 'Mains', isVeg: false, image: IMG('1529692236671-f1f6cf9683ba') },
      { name: 'Warm Brownie Sundae', description: 'Dark chocolate brownie with vanilla bean ice cream and caramel', price: 299, category: 'Desserts', isVeg: true, isBestseller: true, image: IMG('1565557623262-b51531673812') },
      { name: 'Flat White', description: 'Espresso ratio coffee with velvety steamed micro-foam', price: 189, category: 'Coffee', isVeg: true, image: IMG('1560717789-1ac81845b1aa') },
      { name: 'Truffle Mushroom Pizza', description: 'Mushrooms, truffle oil, mozzarella and thyme', price: 549, category: 'Pizzas', isVeg: true, image: IMG('1574653853027-5382a3d23a15') },
    ],
  },
  {
    name: 'Social',
    description: 'Where work meets play. Eclectic menus, craft cocktails and a space that\'s always buzzing.',
    cuisine: ['Fusion', 'Continental', 'Indian'],
    heroImage: IMG('1574653853027-5382a3d23a15'),
    rating: 4.3,
    deliveryTime: '25-35 min',
    minOrder: 299,
    packagingCharge: 20,
    isSponsored: false,
    address: { fullAddress: 'Hauz Khas Village', city: 'Delhi', pincode: '110016' },
    categories: ['Small Plates', 'Burgers & Wraps', 'Asian', 'Mains', 'Desserts'],
    items: [
      { name: 'Nachos 2.0', description: 'Loaded nachos with pulled chicken, jalapeños, sour cream and guac', price: 349, category: 'Small Plates', isVeg: false, isBestseller: true, image: IMG('1598515214211-89d3c73ae83b') },
      { name: 'Philly Cheesesteak', description: 'Pulled beef, caramelized onions and molten cheese in a hoagie', price: 429, category: 'Burgers & Wraps', isVeg: false, isBestseller: true, image: IMG('1599487488170-d11ec9c172f0') },
      { name: 'Bombay Frankie', description: 'Mumbai-style roti wrap with paneer and chaat masala', price: 249, category: 'Burgers & Wraps', isVeg: true, image: IMG('1574073526975-5baf2a44d21f') },
      { name: 'Spicy Tuna Rolls (8 pcs)', description: 'Fresh tuna with sriracha mayo in nori rolls', price: 499, category: 'Asian', isVeg: false, image: IMG('1565557623262-b51531673812') },
      { name: 'Truffle Mac & Cheese', description: 'Creamy elbow pasta with truffle, four-cheese blend', price: 449, category: 'Mains', isVeg: true, isBestseller: true, image: IMG('1563379091329-fdcf08dfe3b0') },
      { name: 'Espresso Martini Tiramisu', description: 'Tiramisu with espresso martini jelly and dark cocoa', price: 329, category: 'Desserts', isVeg: true, image: IMG('1574073526975-5baf2a44d21f') },
      { name: 'Social Cola Float', description: 'House-made cola with vanilla ice cream float', price: 179, category: 'Desserts', isVeg: true, image: IMG('1560717789-1ac81845b1aa') },
      { name: 'Kimchi Fried Rice', description: 'Wok rice with kimchi, edamame and sesame oil', price: 359, category: 'Asian', isVeg: false, image: IMG('1546069901-22af8c961fe2') },
    ],
  },
  {
    name: 'Haji Ali Juice Centre',
    description: 'Mumbai\'s iconic juice bar since 1958. Freshly extracted juices and thick, creamy faloodas.',
    cuisine: ['Beverages', 'Juices', 'Desserts'],
    heroImage: IMG('1560717789-1ac81845b1aa'),
    rating: 4.6,
    deliveryTime: '15-25 min',
    minOrder: 99,
    packagingCharge: 10,
    isSponsored: false,
    address: { fullAddress: 'Haji Ali Dargah Road, Mahalaxmi', city: 'Mumbai', pincode: '400034' },
    categories: ['Fresh Juices', 'Faloodas', 'Milkshakes', 'Smoothies', 'Cold Drinks'],
    items: [
      { name: 'Mango Juice (Large)', description: 'Fresh Alphonso mango, no water, no sugar added', price: 149, category: 'Fresh Juices', isVeg: true, isBestseller: true, image: IMG('1560717789-1ac81845b1aa') },
      { name: 'Rose Falooda', description: 'Rose syrup, basil seeds, vermicelli, ice cream and chilled milk', price: 189, category: 'Faloodas', isVeg: true, isBestseller: true, image: IMG('1574073526975-5baf2a44d21f') },
      { name: 'Kesar Pista Falooda', description: 'Saffron-infused falooda with pistachio ice cream', price: 229, category: 'Faloodas', isVeg: true, image: IMG('1563379091329-fdcf08dfe3b0') },
      { name: 'Chikoo Shake', description: 'Thick sapodilla milkshake, a Mumbai classic', price: 139, category: 'Milkshakes', isVeg: true, isBestseller: true, image: IMG('1560717789-1ac81845b1aa') },
      { name: 'Pomegranate Juice', description: 'Fresh pomegranate seeds cold-pressed', price: 169, category: 'Fresh Juices', isVeg: true, image: IMG('1560717789-1ac81845b1aa') },
      { name: 'Watermelon Mint Juice', description: 'Chilled watermelon with fresh mint and a pinch of black salt', price: 99, category: 'Fresh Juices', isVeg: true, image: IMG('1560717789-1ac81845b1aa') },
      { name: 'Mango Smoothie', description: 'Alphonso mango blended with yogurt and cardamom', price: 159, category: 'Smoothies', isVeg: true, image: IMG('1574073526975-5baf2a44d21f') },
      { name: 'Masala Chaas', description: 'Spiced buttermilk with cumin, ginger and green chilli', price: 79, category: 'Cold Drinks', isVeg: true, image: IMG('1560717789-1ac81845b1aa') },
    ],
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Clear existing
  await Promise.all([
    User.deleteMany({}),
    Restaurant.deleteMany({}),
    MenuItem.deleteMany({}),
  ]);
  console.log('🧹 Cleared existing data');

  // Create admin
  const adminPassword = await bcrypt.hash('Admin@123', 12);
  await User.create({
    name: 'ZippBite Admin',
    email: 'admin@zippbite.com',
    phone: '9999999999',
    passwordHash: 'Admin@123', // will be hashed by pre-save hook
    role: 'admin',
  });
  console.log('👑 Admin created: admin@zippbite.com / Admin@123');

  // Seed restaurants + menu items
  for (const r of RESTAURANTS) {
    const { items, ...restaurantData } = r;
    const restaurant = await Restaurant.create(restaurantData);

    const menuItems = items.map((item, i) => ({
      ...item,
      restaurantId: restaurant._id,
      sortOrder: i,
    }));
    await MenuItem.insertMany(menuItems);
    console.log(`🍽️  Seeded: ${restaurant.name} (${items.length} items)`);
  }

  console.log('\n✅ Seed complete!');
  console.log(`   📊 ${RESTAURANTS.length} restaurants, ${RESTAURANTS.reduce((s, r) => s + r.items.length, 0)} menu items`);
  console.log('   👑 Admin: admin@zippbite.com / Admin@123');
  process.exit(0);
}

seed().catch(err => { console.error('❌ Seed failed:', err); process.exit(1); });
