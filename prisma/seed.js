const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Urban Furniture Database Seeding ---');

  // 1. Chart of Accounts
  console.log('Seeding Chart of Accounts...');
  const accountsData = [
    { code: '1000', name: 'Cash in Hand', type: 'ASSET' },
    { code: '1010', name: 'Bank Account - HDFC', type: 'ASSET' },
    { code: '1100', name: 'Debtors / Accounts Receivable', type: 'ASSET' },
    { code: '1200', name: 'Inventory / Stock A/c', type: 'ASSET' },
    { code: '2000', name: 'Creditors / Accounts Payable', type: 'LIABILITY' },
    { code: '2100', name: 'Output GST / Tax Payable', type: 'LIABILITY' },
    { code: '2110', name: 'Input GST / Tax Credit Paid', type: 'ASSET' },
    { code: '3000', name: 'Capital / Owner Equity', type: 'EQUITY' },
    { code: '4000', name: 'Sales Income', type: 'INCOME' },
    { code: '5000', name: 'Purchases Expense', type: 'EXPENSE' },
    { code: '5100', name: 'Operating Expenses', type: 'EXPENSE' },
    { code: '5200', name: 'Other Expenses', type: 'OTHER_EXPENSE' },
  ];

  const accounts = {};
  for (const acc of accountsData) {
    accounts[acc.code] = await prisma.account.upsert({
      where: { code: acc.code },
      update: { name: acc.name, type: acc.type },
      create: acc,
    });
  }

  // 2. Journals
  console.log('Seeding Journals...');
  const journalsData = [
    {
      name: 'Customer Invoices / Sales Journal',
      code: 'INV',
      type: 'SALES',
      defaultDebitAccountId: accounts['1100'].id,
      defaultCreditAccountId: accounts['4000'].id,
    },
    {
      name: 'Vendor Bills / Purchase Journal',
      code: 'BILL',
      type: 'PURCHASE',
      defaultDebitAccountId: accounts['5000'].id,
      defaultCreditAccountId: accounts['2000'].id,
    },
    {
      name: 'Bank Journal',
      code: 'BNK',
      type: 'BANK',
      defaultDebitAccountId: accounts['1010'].id,
      defaultCreditAccountId: accounts['1010'].id,
    },
    {
      name: 'Cash Journal',
      code: 'CSH',
      type: 'CASH',
      defaultDebitAccountId: accounts['1000'].id,
      defaultCreditAccountId: accounts['1000'].id,
    },
    {
      name: 'General / Miscellaneous Journal',
      code: 'MISC',
      type: 'GENERAL',
      defaultDebitAccountId: null,
      defaultCreditAccountId: null,
    },
  ];

  for (const j of journalsData) {
    await prisma.journal.upsert({
      where: { code: j.code },
      update: j,
      create: j,
    });
  }

  // 3. Product Categories
  console.log('Seeding Product Categories...');
  const categoriesList = ['Chairs', 'Tables', 'Sofas', 'Dining', 'Office Furniture'];
  const categories = {};
  for (const catName of categoriesList) {
    categories[catName] = await prisma.productCategory.upsert({
      where: { name: catName },
      update: {},
      create: { name: catName, description: `${catName} category` },
    });
  }

  // 4. Products
  console.log('Seeding Products...');
  const productsData = [
    {
      name: 'Office Chair',
      type: 'GOODS',
      salesPrice: 5000.0,
      costPrice: 3000.0,
      categoryId: categories['Office Furniture'].id,
    },
    {
      name: 'Wooden Table',
      type: 'GOODS',
      salesPrice: 12000.0,
      costPrice: 8000.0,
      categoryId: categories['Tables'].id,
    },
    {
      name: '3-Seater Fabric Sofa',
      type: 'GOODS',
      salesPrice: 25000.0,
      costPrice: 15000.0,
      categoryId: categories['Sofas'].id,
    },
    {
      name: 'Dining Table 6-Seater',
      type: 'GOODS',
      salesPrice: 28000.0,
      costPrice: 18000.0,
      categoryId: categories['Dining'].id,
    },
    {
      name: 'Ergonomic Desk Chair',
      type: 'GOODS',
      salesPrice: 8500.0,
      costPrice: 5200.0,
      categoryId: categories['Chairs'].id,
    },
  ];

  for (const prod of productsData) {
    const existing = await prisma.product.findFirst({ where: { name: prod.name } });
    if (!existing) {
      await prisma.product.create({ data: prod });
    }
  }

  // 5. Contacts
  console.log('Seeding Contacts...');
  const contactsData = [
    {
      name: 'Azure Furniture',
      type: 'VENDOR',
      email: 'vendor@azurefurniture.com',
      mobile: '+91 9876543210',
      street: '42 Industrial Area, Phase 2',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      pincode: '400013',
    },
    {
      name: 'Rahul Sharma',
      type: 'VENDOR',
      email: 'rahul.sharma@example.com',
      mobile: '+91 9090090909',
      street: '15 Civil Lines',
      city: 'Delhi',
      state: 'Delhi',
      country: 'India',
      pincode: '110054',
    },
    {
      name: 'Nimesh Pathak',
      type: 'CUSTOMER',
      email: 'nimesh.pathak@example.com',
      mobile: '+91 9820098200',
      street: '78 Satellite Road',
      city: 'Ahmedabad',
      state: 'Gujarat',
      country: 'India',
      pincode: '380015',
    },
    {
      name: 'Joey Wills',
      type: 'CUSTOMER',
      email: 'joey.wills@example.com',
      mobile: '+91 8080080808',
      street: '22 Indiranagar 100ft Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      pincode: '560038',
    },
  ];

  const contacts = {};
  for (const c of contactsData) {
    contacts[c.name] = await prisma.contact.upsert({
      where: { email: c.email },
      update: c,
      create: c,
    });
  }

  // 6. Users (Admin, Accountant, Contact User)
  console.log('Seeding Users...');
  const adminPassword = await bcrypt.hash('Admin@123456', 10);
  const accountantPassword = await bcrypt.hash('Account@123456', 10);
  const userPassword = await bcrypt.hash('User@123456', 10);

  // Admin
  await prisma.user.upsert({
    where: { loginId: 'admin' },
    update: { passwordHash: adminPassword },
    create: {
      loginId: 'admin',
      name: 'Administrator',
      email: 'admin@urbanfurniture.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  // Accountant
  await prisma.user.upsert({
    where: { loginId: 'accountant' },
    update: { passwordHash: accountantPassword },
    create: {
      loginId: 'accountant',
      name: 'Invoicing User (Accountant)',
      email: 'accountant@urbanfurniture.com',
      passwordHash: accountantPassword,
      role: 'ACCOUNTANT',
      status: 'ACTIVE',
    },
  });

  // Contact User for Nimesh Pathak
  await prisma.user.upsert({
    where: { loginId: 'nimesh' },
    update: { passwordHash: userPassword, contactId: contacts['Nimesh Pathak'].id },
    create: {
      loginId: 'nimesh',
      name: 'Nimesh Pathak',
      email: 'nimesh.pathak@example.com',
      passwordHash: userPassword,
      role: 'CONTACT_USER',
      contactId: contacts['Nimesh Pathak'].id,
      status: 'ACTIVE',
    },
  });

  // 7. Analytic Accounts
  console.log('Seeding Analytic Accounts...');
  const analyticsData = [
    { name: 'Furniture Operations', type: 'EXPENSE' },
    { name: 'Project 1', type: 'EXPENSE' },
    { name: 'Corporate Commercial Sales', type: 'INCOME' },
  ];

  const analytics = {};
  for (const an of analyticsData) {
    analytics[an.name] = await prisma.analyticAccount.upsert({
      where: { name: an.name },
      update: { type: an.type },
      create: an,
    });
  }

  // 8. Demo Budget
  console.log('Seeding Demo Budget...');
  const existingBudget = await prisma.budget.findFirst({
    where: { name: 'January 2026 Operations' },
  });

  if (!existingBudget) {
    await prisma.budget.create({
      data: {
        name: 'January 2026 Operations',
        startDate: new Date('2026-01-01T00:00:00Z'),
        endDate: new Date('2026-01-31T23:59:59Z'),
        responsibleId: contacts['Rahul Sharma'].id,
        analyticAccountId: analytics['Furniture Operations'].id,
        type: 'EXPENSE',
        committedAmount: 200000.0,
        status: 'CONFIRMED',
        notes: 'Monthly furniture procurement & maintenance budget',
      },
    });
  }

  console.log('--- Urban Furniture Database Seeding Completed Successfully! ---');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
