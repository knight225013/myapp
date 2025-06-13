const express = require('express');
const router = express.Router();

// 导入控制器
const invoiceController = require('../controllers/invoiceController');
const paymentController = require('../controllers/paymentController');
const payableController = require('../controllers/payableController');
const statementController = require('../controllers/statementController');
const reportController = require('../controllers/reportController');
const exchangeRateController = require('../controllers/exchangeRateController');
const creditController = require('../controllers/creditController');
const billingController = require('../controllers/billingController');

// 发票管理路由
router.get('/invoices', invoiceController.getInvoices);
router.post('/invoices', invoiceController.createInvoice);
router.get('/invoices/:id', invoiceController.getInvoice);
router.put('/invoices/:id', invoiceController.updateInvoice);
router.delete('/invoices/:id', invoiceController.deleteInvoice);
router.post('/invoices/:id/approve', invoiceController.approveInvoice);
router.post('/invoices/:id/send', invoiceController.sendInvoice);
router.post('/invoices/:id/void', invoiceController.voidInvoice);
router.post('/invoices/:id/credit-note', invoiceController.createCreditNote);
router.get('/invoices/:id/pdf', invoiceController.generateInvoicePDF);

// 自动计费路由
router.post('/billing/auto-generate', billingController.autoGenerateBilling);
router.get('/billing/rules', billingController.getBillingRules);
router.post('/billing/rules', billingController.createBillingRule);
router.put('/billing/rules/:id', billingController.updateBillingRule);

// 付款管理路由
router.get('/payments', paymentController.getPayments);
router.post('/payments', paymentController.createPayment);
router.get('/payments/:id', paymentController.getPayment);
router.put('/payments/:id', paymentController.updatePayment);
router.post('/payments/:id/allocate', paymentController.allocatePayment);
router.get('/payments/advances/:customerId', paymentController.getAdvancePayments);

// 应付账款路由
router.get('/payables', payableController.getPayables);
router.post('/payables', payableController.createPayable);
router.get('/payables/:id', payableController.getPayable);
router.put('/payables/:id', payableController.updatePayable);
router.post('/payables/:id/approve', payableController.approvePayable);
router.post('/payables/:id/pay', payableController.payPayable);
router.post('/payables/match-costs', payableController.matchCosts);

// 对账单路由
router.get('/statements', statementController.getStatements);
router.post('/statements', statementController.createStatement);
router.get('/statements/:id', statementController.getStatement);
router.post('/statements/:id/send', statementController.sendStatement);
router.post('/statements/:id/confirm', statementController.confirmStatement);
router.get('/statements/:id/pdf', statementController.generateStatementPDF);

// 汇率管理路由
router.get('/exchange-rates', exchangeRateController.getExchangeRates);
router.post('/exchange-rates', exchangeRateController.createExchangeRate);
router.put('/exchange-rates/:id', exchangeRateController.updateExchangeRate);
router.post('/exchange-rates/fetch', exchangeRateController.fetchLatestRates);
router.get('/exchange-rates/convert', exchangeRateController.convertCurrency);

// 信用管理路由
router.get('/credits', creditController.getCustomerCredits);
router.post('/credits', creditController.createCustomerCredit);
router.put('/credits/:id', creditController.updateCustomerCredit);
router.post('/credits/:id/block', creditController.blockCustomer);
router.post('/credits/:id/unblock', creditController.unblockCustomer);
router.get('/credits/alerts', creditController.getCreditAlerts);

// 财务报表路由
router.get('/reports/dashboard', reportController.getDashboard);
router.get('/reports/aging', reportController.getAgingReport);
router.get('/reports/profit-loss', reportController.getProfitLossReport);
router.get('/reports/cash-flow', reportController.getCashFlowReport);
router.get('/reports/balance-sheet', reportController.getBalanceSheetReport);
router.post('/reports/export', reportController.exportReport);

// 搜索路由
router.get('/search', require('../controllers/searchController').searchFinance);

module.exports = router; 