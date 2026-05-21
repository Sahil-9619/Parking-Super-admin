import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import crypto from "crypto";

const prisma = new PrismaClient();
const hash = (pw) => bcrypt.hashSync(pw, 10);
const qr = () => `QR_${crypto.randomBytes(16).toString("hex")}`;

// AES-256 encrypt helper (matches crypto.service.js)
const ENC_KEY = process.env.ENCRYPTION_KEY || "12345678901234567890123456789012";
function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENC_KEY), iv);
  let enc = cipher.update(text);
  enc = Buffer.concat([enc, cipher.final()]);
  return iv.toString("hex") + ":" + enc.toString("hex");
}

async function main() {
  console.log("🧹 Cleaning database...");
  await prisma.subscription.deleteMany();
  await prisma.review.deleteMany();
  await prisma.addonBooking.deleteMany();
  await prisma.customAddon.deleteMany();
  await prisma.dispute.deleteMany();
  await prisma.walletTxn.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.payout.deleteMany();
  await prisma.pricingRule.deleteMany();
  await prisma.parkingSlot.deleteMany();
  await prisma.parking.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.ownerProfile.deleteMany();
  await prisma.systemSetting.deleteMany();
  await prisma.user.deleteMany();

  // ═══════════════════════════════════════════════════════════
  // 1. SYSTEM SETTINGS
  // ═══════════════════════════════════════════════════════════
  console.log("⚙️  Seeding system settings...");
  await prisma.systemSetting.create({
    data: {
      key: "platform_settings",
      value: { platformCommissionRate: 0.15, cancellationFeeRate: 0.05, overstayPenaltyRate: 1.5 },
      description: "Global fee, commission, and penalty rates",
    },
  });

  // ═══════════════════════════════════════════════════════════
  // 2. USERS — 1 Super Admin, 3 Owners, 5 Drivers
  // ═══════════════════════════════════════════════════════════
  console.log("👤 Seeding users...");
  const superAdmin = await prisma.user.create({
    data: { name: "ParkPal Admin", email: "admin@parkpal.com", phone: "9000000001", passwordHash: hash("Admin@123"), userType: "admin", adminRole: "super_admin", walletBalance: 0, status: "active" },
  });

  const owner1 = await prisma.user.create({
    data: { name: "Rajesh Sharma", email: "rajesh@metropark.in", phone: "9100000001", passwordHash: hash("Owner@123"), userType: "owner", walletBalance: 25000, status: "active" },
  });
  const owner2 = await prisma.user.create({
    data: { name: "Priya Enterprises", email: "priya@priyaparking.com", phone: "9100000002", passwordHash: hash("Owner@123"), userType: "owner", walletBalance: 18000, status: "active" },
  });
  const owner3 = await prisma.user.create({
    data: { name: "Delhi Municipal Corp", email: "parking@dmc.gov.in", phone: "9100000003", passwordHash: hash("Owner@123"), userType: "owner", walletBalance: 50000, status: "active" },
  });

  const drivers = [];
  const driverData = [
    { name: "Amit Kumar", email: "amit@gmail.com", phone: "9200000001", bal: 2500 },
    { name: "Sneha Patel", email: "sneha@gmail.com", phone: "9200000002", bal: 1800 },
    { name: "Vikram Singh", email: "vikram@gmail.com", phone: "9200000003", bal: 3200 },
    { name: "Neha Gupta", email: "neha@gmail.com", phone: "9200000004", bal: 900 },
    { name: "Rohit Verma", email: "rohit@gmail.com", phone: "9200000005", bal: 4500 },
  ];
  for (const d of driverData) {
    const u = await prisma.user.create({
      data: { name: d.name, email: d.email, phone: d.phone, passwordHash: hash("Driver@123"), userType: "driver", walletBalance: d.bal, status: "active" },
    });
    drivers.push(u);
  }

  // ═══════════════════════════════════════════════════════════
  // 3. OWNER PROFILES (KYC with encrypted bank details)
  // ═══════════════════════════════════════════════════════════
  console.log("🏢 Seeding owner profiles...");
  await prisma.ownerProfile.create({
    data: { userId: owner1.id, ownerType: "commercial", bankAccount: encrypt("1234567890123456"), bankIfsc: encrypt("HDFC0001234"), accountHolderName: "Rajesh Sharma", gstNumber: "07AABCU9603R1ZM", aadharNumber: "123456789012", panNumber: "ABCDE1234F", verificationStatus: "approved" },
  });
  await prisma.ownerProfile.create({
    data: { userId: owner2.id, ownerType: "society", bankAccount: encrypt("9876543210987654"), bankIfsc: encrypt("ICIC0002345"), accountHolderName: "Priya Enterprises Pvt Ltd", gstNumber: "27AADCB2230M1ZT", aadharNumber: "234567890123", panNumber: "BCDEF2345G", verificationStatus: "approved" },
  });
  await prisma.ownerProfile.create({
    data: { userId: owner3.id, ownerType: "municipality", bankAccount: encrypt("5555666677778888"), bankIfsc: encrypt("SBIN0003456"), accountHolderName: "Delhi Municipal Corporation", gstNumber: "07AAAGD0001A1ZR", aadharNumber: "345678901234", panNumber: "CDEFG3456H", verificationStatus: "pending" },
  });

  // ═══════════════════════════════════════════════════════════
  // 3.1 SUBSCRIPTIONS
  // ═══════════════════════════════════════════════════════════
  console.log("🎟️  Seeding subscriptions...");
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  await prisma.subscription.createMany({
    data: [
      { userId: drivers[0].id, plan: "premium", status: "active", startDate: new Date(), endDate: thirtyDaysFromNow, price: 499 },
      { userId: drivers[1].id, plan: "pro", status: "active", startDate: new Date(), endDate: thirtyDaysFromNow, price: 999 },
      { userId: drivers[2].id, plan: "basic", status: "expired", startDate: thirtyDaysAgo, endDate: new Date(), price: 199 },
      { userId: owner1.id, plan: "pro", status: "active", startDate: new Date(), endDate: thirtyDaysFromNow, price: 1999 },
      { userId: owner2.id, plan: "premium", status: "cancelled", startDate: thirtyDaysAgo, endDate: thirtyDaysFromNow, price: 999 },
    ]
  });

  // ═══════════════════════════════════════════════════════════
  // 4. VEHICLES
  // ═══════════════════════════════════════════════════════════
  console.log("🚗 Seeding vehicles...");
  const vehicleRows = [
    { userId: drivers[0].id, vehicleType: "car", regNumber: "DL-01-AB-1234", isActive: true },
    { userId: drivers[0].id, vehicleType: "bike", regNumber: "DL-01-CD-5678", isActive: false },
    { userId: drivers[1].id, vehicleType: "car", regNumber: "MH-02-EF-9012", isActive: true },
    { userId: drivers[2].id, vehicleType: "commercial", regNumber: "HR-26-GH-3456", isActive: true },
    { userId: drivers[3].id, vehicleType: "bike", regNumber: "UP-16-IJ-7890", isActive: true },
    { userId: drivers[4].id, vehicleType: "car", regNumber: "KA-05-KL-2345", isActive: true },
  ];
  for (const v of vehicleRows) await prisma.vehicle.create({ data: v });

  // ═══════════════════════════════════════════════════════════
  // 5. PARKING LOTS (with PostGIS location)
  // ═══════════════════════════════════════════════════════════
  console.log("🅿️  Seeding parking lots...");
  const parkingData = [
    { ownerId: owner1.id, name: "Metro Mall Parking", type: "commercial", address: "Sector 18, Noida, UP 201301", lat: 28.5706, lng: 77.3219, open: "06:00", close: "23:00", is24: false, addons: ["car_wash", "ev_charging"], status: "active" },
    { ownerId: owner1.id, name: "Rajesh Tower Basement", type: "commercial", address: "Connaught Place, New Delhi 110001", lat: 28.6315, lng: 77.2167, open: "00:00", close: "23:59", is24: true, addons: ["car_wash"], status: "active" },
    { ownerId: owner2.id, name: "Green Valley Society Parking", type: "society", address: "Andheri West, Mumbai 400053", lat: 19.1364, lng: 72.8296, open: "07:00", close: "22:00", is24: false, addons: ["tyre_inflation"], status: "active" },
    { ownerId: owner2.id, name: "Priya Business Hub", type: "commercial", address: "BKC, Mumbai 400051", lat: 19.0654, lng: 72.8697, open: "00:00", close: "23:59", is24: true, addons: ["car_wash", "ev_charging", "tyre_inflation"], status: "active" },
    { ownerId: owner3.id, name: "DMC Public Parking Zone A", type: "municipality", address: "Chandni Chowk, Delhi 110006", lat: 28.6506, lng: 77.2303, open: "08:00", close: "20:00", is24: false, addons: [], status: "pending" },
  ];

  const parkings = [];
  for (const p of parkingData) {
    const parking = await prisma.parking.create({
      data: { ownerId: p.ownerId, name: p.name, parkingType: p.type, address: p.address, latitude: p.lat, longitude: p.lng, openTime: p.open, closeTime: p.close, is24hr: p.is24, addonsEnabled: p.addons, status: p.status, photos: ["https://placehold.co/800x400/1a1a2e/e94560?text=" + encodeURIComponent(p.name)] },
    });
    await prisma.$executeRawUnsafe(`UPDATE parkings SET location = ST_SetSRID(ST_MakePoint(${p.lng}, ${p.lat}), 4326) WHERE id = '${parking.id}'`);
    parkings.push(parking);
  }

  // ═══════════════════════════════════════════════════════════
  // 6. PARKING SLOTS & PRICING RULES
  // ═══════════════════════════════════════════════════════════
  console.log("🎰 Seeding slots & pricing...");
  const slotConfig = [
    { idx: 0, slots: [{ vt: "car", total: 80, avail: 72 }, { vt: "bike", total: 120, avail: 105 }] },
    { idx: 1, slots: [{ vt: "car", total: 50, avail: 45 }, { vt: "bike", total: 60, avail: 58 }, { vt: "commercial", total: 10, avail: 8 }] },
    { idx: 2, slots: [{ vt: "car", total: 30, avail: 28 }, { vt: "bike", total: 40, avail: 38 }] },
    { idx: 3, slots: [{ vt: "car", total: 100, avail: 85 }, { vt: "bike", total: 150, avail: 140 }, { vt: "commercial", total: 20, avail: 15 }] },
    { idx: 4, slots: [{ vt: "car", total: 200, avail: 200 }, { vt: "bike", total: 300, avail: 300 }] },
  ];
  const priceConfig = [
    { idx: 0, prices: [{ vt: "car", wd: 60, we: 80 }, { vt: "bike", wd: 20, we: 30 }] },
    { idx: 1, prices: [{ vt: "car", wd: 100, we: 120 }, { vt: "bike", wd: 30, we: 40 }, { vt: "commercial", wd: 150, we: 180 }] },
    { idx: 2, prices: [{ vt: "car", wd: 40, we: 50 }, { vt: "bike", wd: 15, we: 20 }] },
    { idx: 3, prices: [{ vt: "car", wd: 80, we: 100 }, { vt: "bike", wd: 25, we: 35 }, { vt: "commercial", wd: 120, we: 150 }] },
    { idx: 4, prices: [{ vt: "car", wd: 30, we: 40 }, { vt: "bike", wd: 10, we: 15 }] },
  ];

  for (const sc of slotConfig) {
    for (const s of sc.slots) {
      await prisma.parkingSlot.create({ data: { parkingId: parkings[sc.idx].id, vehicleType: s.vt, totalSlots: s.total, availableSlots: s.avail } });
    }
  }
  for (const pc of priceConfig) {
    for (const p of pc.prices) {
      await prisma.pricingRule.create({ data: { parkingId: parkings[pc.idx].id, vehicleType: p.vt, weekdayPrice: p.wd, weekendPrice: p.we, peakRules: { peakHours: ["09:00-11:00", "17:00-20:00"], multiplier: 1.5 } } });
    }
  }

  // ═══════════════════════════════════════════════════════════
  // 7. CUSTOM ADD-ON SERVICES
  // ═══════════════════════════════════════════════════════════
  console.log("🧼 Seeding custom add-ons...");
  const addons = [];
  const addonData = [
    { pIdx: 0, name: "Premium Car Wash", desc: "Full exterior + interior deep clean with foam wash", price: 299, image: "https://placehold.co/400x300/0f3460/e94560?text=Car+Wash" },
    { pIdx: 0, name: "EV Fast Charging", desc: "60kW DC fast charger, charges 80% in 45 mins", price: 150, image: "https://placehold.co/400x300/0f3460/16c79a?text=EV+Charge" },
    { pIdx: 1, name: "Valet Parking", desc: "Professional valet driver parks your car", price: 200, image: "https://placehold.co/400x300/0f3460/e2d810?text=Valet" },
    { pIdx: 1, name: "Interior Detailing", desc: "Dashboard polish, seat cleaning, fragrance", price: 499, image: "https://placehold.co/400x300/0f3460/11999e?text=Detailing" },
    { pIdx: 3, name: "Tyre Pressure Check", desc: "Digital pressure check for all 4 tyres", price: 50, image: "https://placehold.co/400x300/0f3460/e94560?text=Tyre+Check" },
    { pIdx: 3, name: "Windshield Cleaning", desc: "Streak-free nano-coat windshield treatment", price: 120, image: "https://placehold.co/400x300/0f3460/16c79a?text=Windshield" },
  ];
  for (const a of addonData) {
    const addon = await prisma.customAddon.create({
      data: { parkingId: parkings[a.pIdx].id, name: a.name, description: a.desc, price: a.price, image: a.image, isActive: true },
    });
    addons.push(addon);
  }

  // ═══════════════════════════════════════════════════════════
  // 8. BOOKINGS (mix of statuses)
  // ═══════════════════════════════════════════════════════════
  console.log("📋 Seeding bookings...");
  const now = new Date();
  const h = (hrs) => new Date(now.getTime() + hrs * 3600000);
  const ago = (hrs) => new Date(now.getTime() - hrs * 3600000);
  const commRate = 0.15;

  const bookingData = [
    { uIdx: 0, pIdx: 0, vt: "car", start: ago(5), end: ago(2), status: "completed", gross: 180, checkin: ago(5), checkout: ago(2) },
    { uIdx: 1, pIdx: 0, vt: "bike", start: ago(3), end: ago(1), status: "completed", gross: 40, checkin: ago(3), checkout: ago(1) },
    { uIdx: 2, pIdx: 1, vt: "commercial", start: ago(8), end: ago(4), status: "completed", gross: 600, checkin: ago(8), checkout: ago(4) },
    { uIdx: 0, pIdx: 1, vt: "car", start: ago(1), end: h(2), status: "active", gross: 300, checkin: ago(1), checkout: null },
    { uIdx: 3, pIdx: 2, vt: "bike", start: h(1), end: h(4), status: "confirmed", gross: 45, checkin: null, checkout: null },
    { uIdx: 4, pIdx: 3, vt: "car", start: h(2), end: h(5), status: "confirmed", gross: 240, checkin: null, checkout: null },
    { uIdx: 1, pIdx: 3, vt: "bike", start: ago(24), end: ago(21), status: "cancelled", gross: 75, checkin: null, checkout: null },
    { uIdx: 2, pIdx: 0, vt: "car", start: ago(48), end: ago(45), status: "completed", gross: 180, checkin: ago(48), checkout: ago(44.5) },
    { uIdx: 4, pIdx: 1, vt: "car", start: ago(72), end: ago(69), status: "completed", gross: 300, checkin: ago(72), checkout: ago(69) },
    { uIdx: 3, pIdx: 2, vt: "car", start: ago(12), end: ago(9), status: "completed", gross: 120, checkin: ago(12), checkout: ago(9) },
  ];

  const bookings = [];
  for (const b of bookingData) {
    const comm = b.gross * commRate;
    const booking = await prisma.booking.create({
      data: {
        userId: drivers[b.uIdx].id, parkingId: parkings[b.pIdx].id, vehicleType: b.vt,
        startTime: b.start, endTime: b.end, grossAmount: b.gross, commission: comm,
        ownerShare: b.gross - comm, totalCharged: b.gross, status: b.status,
        checkinAt: b.checkin, checkoutAt: b.checkout, qrToken: qr(),
        overstayAmount: b.checkout && b.checkout > b.end ? 50 : 0,
      },
    });
    bookings.push(booking);
  }

  // ═══════════════════════════════════════════════════════════
  // 9. ADD-ON BOOKINGS
  // ═══════════════════════════════════════════════════════════
  console.log("🛎️  Seeding add-on bookings...");
  const addonBookingData = [
    { bIdx: 0, aIdx: 0, name: "Premium Car Wash", amount: 299, status: "completed" },
    { bIdx: 0, aIdx: 1, name: "EV Fast Charging", amount: 150, status: "completed" },
    { bIdx: 3, aIdx: 2, name: "Valet Parking", amount: 200, status: "in_progress" },
    { bIdx: 5, aIdx: 4, name: "Tyre Pressure Check", amount: 50, status: "pending" },
    { bIdx: 8, aIdx: 3, name: "Interior Detailing", amount: 499, status: "completed" },
  ];
  for (const ab of addonBookingData) {
    await prisma.addonBooking.create({
      data: {
        bookingId: bookings[ab.bIdx].id, customAddonId: addons[ab.aIdx].id,
        addonName: ab.name, amount: ab.amount, commission: ab.amount * commRate,
        ownerShare: ab.amount * (1 - commRate), status: ab.status,
      },
    });
  }

  // ═══════════════════════════════════════════════════════════
  // 10. WALLET TRANSACTIONS
  // ═══════════════════════════════════════════════════════════
  console.log("💰 Seeding wallet transactions...");
  const txnData = [
    { uIdx: 0, type: "credit", amount: 5000, ref: null, refType: "topup", desc: "Wallet top-up via UPI", balAfter: 5000 },
    { uIdx: 0, type: "debit", amount: 180, ref: bookings[0].id, refType: "booking", desc: "Parking booking at Metro Mall", balAfter: 4820 },
    { uIdx: 0, type: "debit", amount: 449, ref: bookings[0].id, refType: "addon", desc: "Add-on: Car Wash + EV Charging", balAfter: 4371 },
    { uIdx: 0, type: "debit", amount: 300, ref: bookings[3].id, refType: "booking", desc: "Parking booking at Rajesh Tower", balAfter: 2500 },
    { uIdx: 1, type: "credit", amount: 3000, ref: null, refType: "topup", desc: "Wallet top-up via Paytm", balAfter: 3000 },
    { uIdx: 1, type: "debit", amount: 40, ref: bookings[1].id, refType: "booking", desc: "Parking booking at Metro Mall", balAfter: 2960 },
    { uIdx: 1, type: "refund", amount: 71.25, ref: bookings[6].id, refType: "cancellation_refund", desc: "Cancellation refund (5% fee deducted)", balAfter: 1800 },
    { uIdx: 2, type: "credit", amount: 5000, ref: null, refType: "topup", desc: "Wallet top-up via Net Banking", balAfter: 5000 },
    { uIdx: 2, type: "debit", amount: 600, ref: bookings[2].id, refType: "booking", desc: "Commercial parking at Rajesh Tower", balAfter: 3200 },
    { uIdx: 4, type: "credit", amount: 6000, ref: null, refType: "topup", desc: "Wallet top-up via UPI", balAfter: 6000 },
    { uIdx: 4, type: "debit", amount: 799, ref: bookings[8].id, refType: "booking", desc: "Parking + Interior Detailing at Rajesh Tower", balAfter: 4500 },
  ];
  for (const t of txnData) {
    await prisma.walletTxn.create({
      data: { userId: drivers[t.uIdx].id, type: t.type, amount: t.amount, referenceId: t.ref, referenceType: t.refType, description: t.desc, balanceAfter: t.balAfter },
    });
  }

  // ═══════════════════════════════════════════════════════════
  // 11. PAYOUTS
  // ═══════════════════════════════════════════════════════════
  console.log("🏦 Seeding payouts...");
  await prisma.payout.create({
    data: { ownerId: owner1.id, weekStart: ago(168), weekEnd: ago(1), grossAmount: 1560, commission: 234, netAmount: 1326, disputeHold: 0, finalPayout: 1326, status: "transferred", utrNumber: "UTR20260510001", processedAt: ago(24) },
  });
  await prisma.payout.create({
    data: { ownerId: owner2.id, weekStart: ago(168), weekEnd: ago(1), grossAmount: 920, commission: 138, netAmount: 782, disputeHold: 50, finalPayout: 732, status: "pending" },
  });

  // ═══════════════════════════════════════════════════════════
  // 12. DISPUTES
  // ═══════════════════════════════════════════════════════════
  console.log("⚠️  Seeding disputes...");
  await prisma.dispute.create({
    data: { bookingId: bookings[7].id, raisedById: drivers[2].id, raisedByType: "driver", reason: "Overcharged for overstay", description: "I was charged overstay penalty but I left on time. The gate sensor was malfunctioning.", status: "open" },
  });
  await prisma.dispute.create({
    data: { bookingId: bookings[2].id, raisedById: drivers[2].id, raisedByType: "driver", reason: "Parking lot gate was locked", description: "The exit gate was jammed for 30 minutes after my booking ended. I had to wait.", status: "resolved", resolution: "partial_refund", refundAmount: 100, adminNote: "Verified CCTV footage. Gate malfunction confirmed. Partial refund approved.", resolvedAt: ago(48) },
  });

  // ═══════════════════════════════════════════════════════════
  // 13. REVIEWS
  // ═══════════════════════════════════════════════════════════
  console.log("⭐ Seeding reviews...");
  const reviewData = [
    { bIdx: 0, rIdx: 0, targetId: parkings[0].id, targetType: "parking", rating: 5, comment: "Excellent parking facility! Clean and well-maintained. Car wash was superb." },
    { bIdx: 1, rIdx: 1, targetId: parkings[0].id, targetType: "parking", rating: 4, comment: "Good parking space. Bike area could be better organized." },
    { bIdx: 2, rIdx: 2, targetId: parkings[1].id, targetType: "parking", rating: 3, comment: "Decent but the commercial vehicle ramp is too steep." },
    { bIdx: 8, rIdx: 4, targetId: parkings[1].id, targetType: "parking", rating: 5, comment: "Love the interior detailing service! My car looks brand new." },
    { bIdx: 9, rIdx: 3, targetId: parkings[2].id, targetType: "parking", rating: 4, comment: "Society parking is convenient. Affordable rates." },
    { bIdx: 0, rIdx: 0, targetId: addons[0].id, targetType: "addon", rating: 5, comment: "Best car wash I have ever got at a parking lot!" },
  ];
  for (const r of reviewData) {
    await prisma.review.create({
      data: { bookingId: bookings[r.bIdx].id, reviewerId: drivers[r.rIdx].id, targetId: r.targetId, targetType: r.targetType, rating: r.rating, comment: r.comment },
    });
  }

  // Update avg ratings for parkings
  await prisma.parking.update({ where: { id: parkings[0].id }, data: { avgRating: 4.5 } });
  await prisma.parking.update({ where: { id: parkings[1].id }, data: { avgRating: 4.0 } });
  await prisma.parking.update({ where: { id: parkings[2].id }, data: { avgRating: 4.0 } });

  console.log("\n✅ ════════════════════════════════════════════");
  console.log("   SEEDER COMPLETED SUCCESSFULLY!");
  console.log("   ════════════════════════════════════════════");
  console.log(`   👑 1 Super Admin    (admin@parkpal.com / Admin@123)`);
  console.log(`   🏢 3 Owners         (Owner@123)`);
  console.log(`   🚗 5 Drivers        (Driver@123)`);
  console.log(`   🅿️  5 Parking Lots`);
  console.log(`   🧼 6 Custom Add-ons`);
  console.log(`   📋 10 Bookings`);
  console.log(`   💰 11 Wallet Transactions`);
  console.log(`   🏦 2 Payouts`);
  console.log(`   ⚠️  2 Disputes (1 open, 1 resolved)`);
  console.log(`   ⭐ 6 Reviews`);
  console.log("   ════════════════════════════════════════════\n");
}

main()
  .catch((e) => { console.error("❌ Seeder failed:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
