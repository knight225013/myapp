// 财务系统核心业务逻辑

/**
 * 多币种汇率转换
 */
class CurrencyConverter {
  constructor(exchangeRates) {
    this.rates = exchangeRates;
  }

  // 获取汇率
  getExchangeRate(fromCurrency, toCurrency, date = new Date()) {
    if (fromCurrency === toCurrency) return 1;

    const rateKey = `${fromCurrency}_${toCurrency}`;
    const reverseKey = `${toCurrency}_${fromCurrency}`;

    let rate = this.rates[rateKey];
    if (!rate && this.rates[reverseKey]) {
      rate = 1 / this.rates[reverseKey];
    }

    if (!rate) {
      throw new Error(`未找到 ${fromCurrency} 到 ${toCurrency} 的汇率`);
    }

    return rate;
  }

  // 货币转换
  convert(amount, fromCurrency, toCurrency, date = new Date()) {
    const rate = this.getExchangeRate(fromCurrency, toCurrency, date);
    return {
      originalAmount: amount,
      convertedAmount: amount * rate,
      exchangeRate: rate,
      fromCurrency,
      toCurrency,
      conversionDate: date
    };
  }

  // 批量转换
  convertMultiple(amounts, targetCurrency) {
    return amounts.map(item => ({
      ...item,
      converted: this.convert(item.amount, item.currency, targetCurrency)
    }));
  }
}

/**
 * 预付款抵扣计算
 */
class PaymentAllocationCalculator {
  // 计算预付款抵扣
  static calculateAllocation(advancePayments, invoices) {
    const allocations = [];
    let remainingAdvance = [...advancePayments];

    const sortedInvoices = invoices.sort((a, b) => 
      new Date(a.dueDate) - new Date(b.dueDate)
    );

    for (const invoice of sortedInvoices) {
      let remainingInvoiceAmount = invoice.balanceAmount;

      for (let i = 0; i < remainingAdvance.length && remainingInvoiceAmount > 0; i++) {
        const advance = remainingAdvance[i];
        
        if (advance.availableAmount <= 0) continue;

        const allocationAmount = Math.min(
          remainingInvoiceAmount,
          advance.availableAmount
        );

        if (allocationAmount > 0) {
          allocations.push({
            invoiceId: invoice.id,
            paymentId: advance.id,
            amount: allocationAmount,
            currency: invoice.currency
          });

          remainingInvoiceAmount -= allocationAmount;
          advance.availableAmount -= allocationAmount;
        }
      }
    }

    return {
      allocations,
      totalAllocated: allocations.reduce((sum, alloc) => sum + alloc.amount, 0),
      remainingAdvanceBalance: remainingAdvance.reduce(
        (sum, advance) => sum + advance.availableAmount, 0
      )
    };
  }

  // 撤销抵扣
  static reverseAllocation(allocation) {
    return {
      invoiceId: allocation.invoiceId,
      paymentId: allocation.paymentId,
      amount: -allocation.amount,
      currency: allocation.currency,
      type: 'REVERSAL',
      originalAllocationId: allocation.id
    };
  }
}

/**
 * 账龄分析计算
 */
class AgingAnalysisCalculator {
  static calculateAging(receivables, asOfDate = new Date()) {
    const agingBuckets = {
      current: { label: '当前', min: 0, max: 0, amount: 0, count: 0 },
      days1to30: { label: '1-30天', min: 1, max: 30, amount: 0, count: 0 },
      days31to60: { label: '31-60天', min: 31, max: 60, amount: 0, count: 0 },
      days61to90: { label: '61-90天', min: 61, max: 90, amount: 0, count: 0 },
      over90: { label: '90天以上', min: 91, max: Infinity, amount: 0, count: 0 }
    };

    receivables.forEach(receivable => {
      const daysOverdue = Math.floor(
        (asOfDate - new Date(receivable.dueDate)) / (1000 * 60 * 60 * 24)
      );

      let bucket = 'current';
      if (daysOverdue > 90) bucket = 'over90';
      else if (daysOverdue > 60) bucket = 'days61to90';
      else if (daysOverdue > 30) bucket = 'days31to60';
      else if (daysOverdue > 0) bucket = 'days1to30';

      agingBuckets[bucket].amount += receivable.balanceAmount;
      agingBuckets[bucket].count += 1;
    });

    const totalAmount = Object.values(agingBuckets)
      .reduce((sum, bucket) => sum + bucket.amount, 0);

    // 计算百分比
    Object.values(agingBuckets).forEach(bucket => {
      bucket.percentage = totalAmount > 0 ? (bucket.amount / totalAmount) * 100 : 0;
    });

    return {
      buckets: agingBuckets,
      totalAmount,
      totalCount: receivables.length,
      overdueAmount: agingBuckets.days1to30.amount + 
                    agingBuckets.days31to60.amount + 
                    agingBuckets.days61to90.amount + 
                    agingBuckets.over90.amount
    };
  }
}

/**
 * 规则驱动的自动计费
 */
class AutoBillingEngine {
  constructor(billingRules) {
    this.rules = billingRules;
  }

  // 计算运单费用
  calculateShipmentCharges(shipment) {
    const charges = [];
    
    // 获取适用的计费规则
    const applicableRules = this.rules.filter(rule => 
      this.isRuleApplicable(rule, shipment)
    );

    for (const rule of applicableRules) {
      const charge = this.applyRule(rule, shipment);
      if (charge.amount > 0) {
        charges.push(charge);
      }
    }

    return {
      charges,
      subtotal: charges.reduce((sum, charge) => sum + charge.amount, 0),
      currency: shipment.currency || 'CNY'
    };
  }

  // 检查规则是否适用
  isRuleApplicable(rule, shipment) {
    // 检查生效日期
    if (rule.effectiveDate && new Date(rule.effectiveDate) > new Date()) {
      return false;
    }

    // 检查过期日期
    if (rule.expiryDate && new Date(rule.expiryDate) < new Date()) {
      return false;
    }

    // 检查渠道匹配
    if (rule.channelId && rule.channelId !== shipment.channelId) {
      return false;
    }

    // 检查条件匹配
    if (rule.conditions) {
      return this.evaluateConditions(rule.conditions, shipment);
    }

    return true;
  }

  // 应用计费规则
  applyRule(rule, shipment) {
    let amount = 0;
    let quantity = 1;
    let unitPrice = parseFloat(rule.baseRate);

    switch (rule.unitType) {
      case 'per_kg':
        quantity = parseFloat(shipment.weight) || 0;
        amount = quantity * unitPrice;
        break;

      case 'per_cbm':
        // 计算体积重量
        const volumeWeight = this.calculateVolumeWeight(shipment);
        quantity = Math.max(parseFloat(shipment.weight) || 0, volumeWeight);
        amount = quantity * unitPrice;
        break;

      case 'per_shipment':
        quantity = 1;
        amount = unitPrice;
        break;

      case 'percentage':
        const baseValue = parseFloat(shipment.declaredValue) || 0;
        amount = baseValue * (unitPrice / 100);
        quantity = baseValue;
        break;

      case 'tiered':
        amount = this.calculateTieredRate(rule, shipment);
        break;
    }

    // 应用最小/最大费用限制
    if (rule.minCharge && amount < parseFloat(rule.minCharge)) {
      amount = parseFloat(rule.minCharge);
    }
    if (rule.maxCharge && amount > parseFloat(rule.maxCharge)) {
      amount = parseFloat(rule.maxCharge);
    }

    return {
      ruleId: rule.id,
      chargeTypeId: rule.chargeTypeId,
      description: rule.chargeType?.name || '费用',
      quantity,
      unitPrice,
      amount,
      currency: rule.currency
    };
  }

  // 计算体积重量
  calculateVolumeWeight(shipment) {
    const { length = 0, width = 0, height = 0 } = shipment;
    return (parseFloat(length) * parseFloat(width) * parseFloat(height)) / 5000;
  }

  // 计算阶梯费率
  calculateTieredRate(rule, shipment) {
    const tiers = rule.conditions?.tiers || [];
    const weight = parseFloat(shipment.weight) || 0;
    
    let totalAmount = 0;
    let remainingWeight = weight;

    for (const tier of tiers) {
      if (remainingWeight <= 0) break;

      const tierWeight = Math.min(remainingWeight, tier.maxWeight - tier.minWeight);
      totalAmount += tierWeight * tier.rate;
      remainingWeight -= tierWeight;
    }

    return totalAmount;
  }

  // 评估条件
  evaluateConditions(conditions, shipment) {
    // 简化的条件评估逻辑
    if (conditions.minWeight && parseFloat(shipment.weight) < conditions.minWeight) {
      return false;
    }
    if (conditions.maxWeight && parseFloat(shipment.weight) > conditions.maxWeight) {
      return false;
    }
    if (conditions.countries && !conditions.countries.includes(shipment.country)) {
      return false;
    }
    return true;
  }
}

/**
 * 财务报表计算
 */
class FinancialReportCalculator {
  // 计算利润表
  static calculateProfitLoss(transactions, startDate, endDate) {
    const revenue = transactions
      .filter(t => t.type === 'REVENUE' && 
                  t.date >= startDate && 
                  t.date <= endDate)
      .reduce((sum, t) => sum + t.amount, 0);

    const costs = transactions
      .filter(t => t.type === 'COST' && 
                  t.date >= startDate && 
                  t.date <= endDate)
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter(t => t.type === 'EXPENSE' && 
                  t.date >= startDate && 
                  t.date <= endDate)
      .reduce((sum, t) => sum + t.amount, 0);

    const grossProfit = revenue - costs;
    const netProfit = grossProfit - expenses;

    return {
      revenue,
      costs,
      grossProfit,
      grossProfitMargin: revenue > 0 ? (grossProfit / revenue) * 100 : 0,
      expenses,
      netProfit,
      netProfitMargin: revenue > 0 ? (netProfit / revenue) * 100 : 0
    };
  }

  // 计算现金流
  static calculateCashFlow(payments, startDate, endDate) {
    const inflows = payments
      .filter(p => p.type === 'INFLOW' && 
                  p.date >= startDate && 
                  p.date <= endDate)
      .reduce((sum, p) => sum + p.amount, 0);

    const outflows = payments
      .filter(p => p.type === 'OUTFLOW' && 
                  p.date >= startDate && 
                  p.date <= endDate)
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      inflows,
      outflows,
      netCashFlow: inflows - outflows
    };
  }
}

/**
 * 信用风险评估
 */
class CreditRiskAssessment {
  // 计算客户信用评分
  static calculateCreditScore(customer, paymentHistory, currentReceivables) {
    let score = 100; // 基础分数

    // 付款历史评分 (40%)
    const paymentScore = this.calculatePaymentScore(paymentHistory);
    score = score * 0.6 + paymentScore * 0.4;

    // 当前逾期情况 (30%)
    const overdueScore = this.calculateOverdueScore(currentReceivables);
    score = score * 0.7 + overdueScore * 0.3;

    // 客户规模和稳定性 (20%)
    const stabilityScore = this.calculateStabilityScore(customer);
    score = score * 0.8 + stabilityScore * 0.2;

    // 行业风险 (10%)
    const industryScore = this.calculateIndustryScore(customer.industry);
    score = score * 0.9 + industryScore * 0.1;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  static calculatePaymentScore(paymentHistory) {
    if (!paymentHistory.length) return 50;

    const onTimePayments = paymentHistory.filter(p => p.daysLate <= 0).length;
    const latePayments = paymentHistory.filter(p => p.daysLate > 0).length;
    const avgDaysLate = paymentHistory.reduce((sum, p) => sum + Math.max(0, p.daysLate), 0) / paymentHistory.length;

    let score = 100;
    score -= (latePayments / paymentHistory.length) * 50; // 迟付比例扣分
    score -= Math.min(avgDaysLate * 2, 30); // 平均迟付天数扣分

    return Math.max(0, score);
  }

  static calculateOverdueScore(receivables) {
    const totalAmount = receivables.reduce((sum, r) => sum + r.amount, 0);
    if (totalAmount === 0) return 100;

    const overdueAmount = receivables
      .filter(r => new Date(r.dueDate) < new Date())
      .reduce((sum, r) => sum + r.amount, 0);

    const overdueRatio = overdueAmount / totalAmount;
    return Math.max(0, 100 - overdueRatio * 100);
  }

  static calculateStabilityScore(customer) {
    let score = 70; // 基础分数

    // 合作时长
    const cooperationMonths = customer.cooperationMonths || 0;
    score += Math.min(cooperationMonths / 12 * 10, 20);

    // 交易频率
    const monthlyTransactions = customer.monthlyTransactions || 0;
    score += Math.min(monthlyTransactions * 2, 10);

    return Math.min(100, score);
  }

  static calculateIndustryScore(industry) {
    const industryRisk = {
      'manufacturing': 80,
      'retail': 70,
      'technology': 85,
      'logistics': 75,
      'finance': 90,
      'healthcare': 85,
      'default': 70
    };

    return industryRisk[industry] || industryRisk.default;
  }

  // 推荐信用额度
  static recommendCreditLimit(customer, creditScore, monthlyVolume) {
    const baseLimit = monthlyVolume * 2; // 基础额度为月均交易量的2倍
    const scoreMultiplier = creditScore / 100;
    const recommendedLimit = baseLimit * scoreMultiplier;

    // 设置最小和最大限制
    const minLimit = 10000; // 最小1万
    const maxLimit = 5000000; // 最大500万

    return {
      recommendedLimit: Math.max(minLimit, Math.min(maxLimit, recommendedLimit)),
      baseLimit,
      scoreMultiplier,
      creditScore,
      riskLevel: this.getRiskLevel(creditScore)
    };
  }

  static getRiskLevel(creditScore) {
    if (creditScore >= 80) return 'LOW';
    if (creditScore >= 60) return 'MEDIUM';
    return 'HIGH';
  }
}

module.exports = {
  CurrencyConverter,
  PaymentAllocationCalculator,
  AgingAnalysisCalculator,
  AutoBillingEngine,
  FinancialReportCalculator,
  CreditRiskAssessment
}; 