// utils/settingsCalculations.js - 系统设置相关业务逻辑

/**
 * 编号生成器
 * 根据配置的规则生成各种单据编号
 */
class NumberGenerator {
  /**
   * 生成下一个编号
   * @param {Object} rule - 编号规则
   * @param {string} rule.prefix - 前缀
   * @param {number} rule.length - 总长度
   * @param {number} rule.currentNumber - 当前编号
   * @param {boolean} rule.hasCheckDigit - 是否有校验位
   * @param {string} rule.resetPeriod - 重置周期
   * @returns {Object} 包含新编号和更新后的当前编号
   */
  static generateNext(rule) {
    const { prefix, length, currentNumber, hasCheckDigit, resetPeriod } = rule;
    
    // 检查是否需要重置编号
    let nextNumber = currentNumber + 1;
    if (this.shouldReset(resetPeriod)) {
      nextNumber = 1;
    }

    // 计算数字部分长度
    const digitLength = length - prefix.length - (hasCheckDigit ? 1 : 0);
    
    // 生成数字部分
    const numberPart = nextNumber.toString().padStart(digitLength, '0');
    
    // 生成基础编号
    let fullNumber = prefix + numberPart;
    
    // 添加校验位
    if (hasCheckDigit) {
      const checkDigit = this.calculateCheckDigit(fullNumber);
      fullNumber += checkDigit;
    }

    return {
      number: fullNumber,
      nextCurrentNumber: nextNumber
    };
  }

  /**
   * 检查是否需要重置编号
   * @param {string} resetPeriod - 重置周期
   * @returns {boolean}
   */
  static shouldReset(resetPeriod) {
    if (!resetPeriod) return false;

    const now = new Date();
    const lastReset = this.getLastResetDate(resetPeriod);
    
    switch (resetPeriod) {
      case 'yearly':
        return now.getFullYear() > lastReset.getFullYear();
      case 'monthly':
        return now.getMonth() > lastReset.getMonth() || 
               now.getFullYear() > lastReset.getFullYear();
      case 'daily':
        return now.toDateString() !== lastReset.toDateString();
      default:
        return false;
    }
  }

  /**
   * 获取上次重置日期
   * @param {string} resetPeriod - 重置周期
   * @returns {Date}
   */
  static getLastResetDate(resetPeriod) {
    // 这里应该从数据库或缓存中获取上次重置日期
    // 简化实现，返回当前日期
    return new Date();
  }

  /**
   * 计算校验位（使用模10算法）
   * @param {string} number - 编号
   * @returns {string} 校验位
   */
  static calculateCheckDigit(number) {
    let sum = 0;
    let alternate = false;
    
    // 从右到左遍历数字
    for (let i = number.length - 1; i >= 0; i--) {
      const digit = parseInt(number.charAt(i));
      
      if (alternate) {
        const doubled = digit * 2;
        sum += doubled > 9 ? doubled - 9 : doubled;
      } else {
        sum += digit;
      }
      
      alternate = !alternate;
    }
    
    return ((10 - (sum % 10)) % 10).toString();
  }

  /**
   * 验证编号格式
   * @param {string} number - 编号
   * @param {Object} rule - 编号规则
   * @returns {boolean}
   */
  static validateNumber(number, rule) {
    const { prefix, length, hasCheckDigit } = rule;
    
    // 检查长度
    if (number.length !== length) return false;
    
    // 检查前缀
    if (!number.startsWith(prefix)) return false;
    
    // 检查校验位
    if (hasCheckDigit) {
      const numberWithoutCheck = number.slice(0, -1);
      const expectedCheck = this.calculateCheckDigit(numberWithoutCheck);
      const actualCheck = number.slice(-1);
      return expectedCheck === actualCheck;
    }
    
    return true;
  }
}

/**
 * 权限计算器
 * 处理用户权限和角色相关的计算
 */
class PermissionCalculator {
  /**
   * 计算用户的有效权限
   * @param {Array} userRoles - 用户角色列表
   * @returns {Set} 权限集合
   */
  static calculateUserPermissions(userRoles) {
    const permissions = new Set();
    
    userRoles.forEach(userRole => {
      if (userRole.role && userRole.role.permissions) {
        userRole.role.permissions.forEach(rolePermission => {
          const permission = rolePermission.permission;
          const permissionKey = `${permission.module}:${permission.action}:${permission.resource}`;
          permissions.add(permissionKey);
        });
      }
    });
    
    return permissions;
  }

  /**
   * 检查用户是否有特定权限
   * @param {Set} userPermissions - 用户权限集合
   * @param {string} module - 模块
   * @param {string} action - 操作
   * @param {string} resource - 资源
   * @returns {boolean}
   */
  static hasPermission(userPermissions, module, action, resource) {
    const permissionKey = `${module}:${action}:${resource}`;
    return userPermissions.has(permissionKey) || 
           userPermissions.has(`${module}:*:*`) ||
           userPermissions.has('*:*:*');
  }

  /**
   * 获取用户可访问的模块列表
   * @param {Set} userPermissions - 用户权限集合
   * @returns {Array} 模块列表
   */
  static getAccessibleModules(userPermissions) {
    const modules = new Set();
    
    userPermissions.forEach(permission => {
      const [module] = permission.split(':');
      if (module !== '*') {
        modules.add(module);
      }
    });
    
    return Array.from(modules);
  }

  /**
   * 检查角色权限冲突
   * @param {Array} roles - 角色列表
   * @returns {Array} 冲突列表
   */
  static checkRoleConflicts(roles) {
    const conflicts = [];
    const permissionMap = new Map();
    
    roles.forEach(role => {
      role.permissions?.forEach(rolePermission => {
        const permission = rolePermission.permission;
        const key = `${permission.module}:${permission.resource}`;
        
        if (permissionMap.has(key)) {
          const existing = permissionMap.get(key);
          if (existing.action !== permission.action) {
            conflicts.push({
              resource: key,
              roles: [existing.roleName, role.name],
              actions: [existing.action, permission.action]
            });
          }
        } else {
          permissionMap.set(key, {
            action: permission.action,
            roleName: role.name
          });
        }
      });
    });
    
    return conflicts;
  }
}

/**
 * 审批流程计算器
 * 处理审批工作流相关的计算
 */
class ApprovalCalculator {
  /**
   * 计算下一个审批步骤
   * @param {Object} workflow - 工作流配置
   * @param {number} currentStep - 当前步骤
   * @param {string} currentStatus - 当前状态
   * @returns {Object} 下一步骤信息
   */
  static getNextStep(workflow, currentStep, currentStatus) {
    if (currentStatus === 'APPROVED') {
      const nextStep = workflow.steps.find(step => step.stepOrder === currentStep + 1);
      return nextStep ? {
        stepOrder: nextStep.stepOrder,
        roleId: nextStep.roleId,
        isRequired: nextStep.isRequired
      } : null;
    }
    
    return null;
  }

  /**
   * 检查审批是否完成
   * @param {Object} workflow - 工作流配置
   * @param {Array} actions - 审批操作记录
   * @returns {boolean}
   */
  static isApprovalComplete(workflow, actions) {
    const requiredSteps = workflow.steps.filter(step => step.isRequired);
    const approvedSteps = actions.filter(action => action.status === 'APPROVED');
    
    return requiredSteps.every(step => 
      approvedSteps.some(action => action.stepOrder === step.stepOrder)
    );
  }

  /**
   * 计算审批进度
   * @param {Object} workflow - 工作流配置
   * @param {Array} actions - 审批操作记录
   * @returns {Object} 进度信息
   */
  static calculateProgress(workflow, actions) {
    const totalSteps = workflow.steps.length;
    const completedSteps = actions.filter(action => 
      action.status === 'APPROVED' || action.status === 'REJECTED'
    ).length;
    
    return {
      total: totalSteps,
      completed: completedSteps,
      percentage: totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0,
      isComplete: this.isApprovalComplete(workflow, actions)
    };
  }

  /**
   * 获取待审批人员
   * @param {Object} workflow - 工作流配置
   * @param {number} currentStep - 当前步骤
   * @returns {Array} 审批人员列表
   */
  static getPendingApprovers(workflow, currentStep) {
    const step = workflow.steps.find(s => s.stepOrder === currentStep);
    return step ? [step.roleId] : [];
  }
}

/**
 * 仓库策略计算器
 * 处理仓库出入库策略相关的计算
 */
class WarehouseStrategyCalculator {
  /**
   * 根据FIFO策略选择库位
   * @param {Array} locations - 可用库位列表
   * @param {Array} inventory - 库存记录
   * @returns {Object} 推荐库位
   */
  static selectLocationFIFO(locations, inventory) {
    // 按入库时间排序，选择最早入库的库位
    const sortedInventory = inventory
      .filter(item => item.quantity > 0)
      .sort((a, b) => new Date(a.inboundDate) - new Date(b.inboundDate));
    
    return sortedInventory.length > 0 ? sortedInventory[0].location : locations[0];
  }

  /**
   * 根据LIFO策略选择库位
   * @param {Array} locations - 可用库位列表
   * @param {Array} inventory - 库存记录
   * @returns {Object} 推荐库位
   */
  static selectLocationLIFO(locations, inventory) {
    // 按入库时间排序，选择最晚入库的库位
    const sortedInventory = inventory
      .filter(item => item.quantity > 0)
      .sort((a, b) => new Date(b.inboundDate) - new Date(a.inboundDate));
    
    return sortedInventory.length > 0 ? sortedInventory[0].location : locations[0];
  }

  /**
   * 计算安全库存预警
   * @param {Object} warehouse - 仓库配置
   * @param {Array} inventory - 当前库存
   * @returns {Array} 预警列表
   */
  static calculateSafetyStockAlerts(warehouse, inventory) {
    const alerts = [];
    const settings = warehouse.settings;
    
    if (!settings) return alerts;
    
    inventory.forEach(item => {
      if (item.quantity <= settings.safetyStockLevel) {
        alerts.push({
          productId: item.productId,
          currentQuantity: item.quantity,
          safetyLevel: settings.safetyStockLevel,
          shortfall: settings.safetyStockLevel - item.quantity,
          severity: item.quantity === 0 ? 'critical' : 'warning'
        });
      }
    });
    
    return alerts;
  }

  /**
   * 计算补货建议
   * @param {Object} warehouse - 仓库配置
   * @param {Array} inventory - 当前库存
   * @param {Array} salesHistory - 销售历史
   * @returns {Array} 补货建议
   */
  static calculateReplenishmentSuggestions(warehouse, inventory, salesHistory) {
    const suggestions = [];
    const settings = warehouse.settings;
    
    if (!settings || !settings.autoReorder) return suggestions;
    
    inventory.forEach(item => {
      if (item.quantity <= settings.reorderPoint) {
        // 计算建议补货数量
        const avgDailySales = this.calculateAverageDailySales(item.productId, salesHistory);
        const leadTimeDays = 7; // 假设7天交货期
        const suggestedQuantity = Math.max(
          settings.maxStockLevel - item.quantity,
          avgDailySales * leadTimeDays + settings.safetyStockLevel
        );
        
        suggestions.push({
          productId: item.productId,
          currentQuantity: item.quantity,
          suggestedQuantity,
          reorderPoint: settings.reorderPoint,
          priority: item.quantity === 0 ? 'urgent' : 'normal'
        });
      }
    });
    
    return suggestions;
  }

  /**
   * 计算平均日销量
   * @param {string} productId - 产品ID
   * @param {Array} salesHistory - 销售历史
   * @returns {number} 平均日销量
   */
  static calculateAverageDailySales(productId, salesHistory) {
    const productSales = salesHistory.filter(sale => sale.productId === productId);
    const totalQuantity = productSales.reduce((sum, sale) => sum + sale.quantity, 0);
    const days = Math.max(1, productSales.length);
    
    return totalQuantity / days;
  }
}

/**
 * 自定义字段验证器
 * 处理自定义字段的验证逻辑
 */
class CustomFieldValidator {
  /**
   * 验证字段值
   * @param {Object} field - 字段配置
   * @param {any} value - 字段值
   * @returns {Object} 验证结果
   */
  static validateValue(field, value) {
    const result = { isValid: true, errors: [] };
    
    // 检查必填
    if (field.isRequired && (value === null || value === undefined || value === '')) {
      result.isValid = false;
      result.errors.push(`${field.fieldLabel}为必填字段`);
      return result;
    }
    
    // 如果值为空且非必填，跳过其他验证
    if (!value && !field.isRequired) {
      return result;
    }
    
    // 类型验证
    switch (field.fieldType) {
      case 'NUMBER':
        if (isNaN(Number(value))) {
          result.isValid = false;
          result.errors.push(`${field.fieldLabel}必须是数字`);
        }
        break;
        
      case 'BOOLEAN':
        if (typeof value !== 'boolean' && value !== 'true' && value !== 'false') {
          result.isValid = false;
          result.errors.push(`${field.fieldLabel}必须是布尔值`);
        }
        break;
        
      case 'DATE':
        if (!this.isValidDate(value)) {
          result.isValid = false;
          result.errors.push(`${field.fieldLabel}必须是有效日期`);
        }
        break;
        
      case 'DATETIME':
        if (!this.isValidDateTime(value)) {
          result.isValid = false;
          result.errors.push(`${field.fieldLabel}必须是有效日期时间`);
        }
        break;
        
      case 'ENUM':
        const options = JSON.parse(field.options || '[]');
        if (!options.includes(value)) {
          result.isValid = false;
          result.errors.push(`${field.fieldLabel}必须是预定义选项之一`);
        }
        break;
        
      case 'JSON':
        try {
          JSON.parse(value);
        } catch (e) {
          result.isValid = false;
          result.errors.push(`${field.fieldLabel}必须是有效的JSON格式`);
        }
        break;
    }
    
    // 自定义验证规则
    if (field.validation) {
      try {
        const validationRules = JSON.parse(field.validation);
        const customResult = this.applyCustomValidation(value, validationRules, field.fieldLabel);
        if (!customResult.isValid) {
          result.isValid = false;
          result.errors.push(...customResult.errors);
        }
      } catch (e) {
        console.error('自定义验证规则解析失败:', e);
      }
    }
    
    return result;
  }

  /**
   * 检查是否为有效日期
   * @param {any} value - 值
   * @returns {boolean}
   */
  static isValidDate(value) {
    const date = new Date(value);
    return date instanceof Date && !isNaN(date);
  }

  /**
   * 检查是否为有效日期时间
   * @param {any} value - 值
   * @returns {boolean}
   */
  static isValidDateTime(value) {
    return this.isValidDate(value);
  }

  /**
   * 应用自定义验证规则
   * @param {any} value - 值
   * @param {Object} rules - 验证规则
   * @param {string} fieldLabel - 字段标签
   * @returns {Object} 验证结果
   */
  static applyCustomValidation(value, rules, fieldLabel) {
    const result = { isValid: true, errors: [] };
    
    // 长度验证
    if (rules.minLength && value.length < rules.minLength) {
      result.isValid = false;
      result.errors.push(`${fieldLabel}长度不能少于${rules.minLength}个字符`);
    }
    
    if (rules.maxLength && value.length > rules.maxLength) {
      result.isValid = false;
      result.errors.push(`${fieldLabel}长度不能超过${rules.maxLength}个字符`);
    }
    
    // 数值范围验证
    if (rules.min !== undefined && Number(value) < rules.min) {
      result.isValid = false;
      result.errors.push(`${fieldLabel}不能小于${rules.min}`);
    }
    
    if (rules.max !== undefined && Number(value) > rules.max) {
      result.isValid = false;
      result.errors.push(`${fieldLabel}不能大于${rules.max}`);
    }
    
    // 正则表达式验证
    if (rules.pattern) {
      const regex = new RegExp(rules.pattern);
      if (!regex.test(value)) {
        result.isValid = false;
        result.errors.push(`${fieldLabel}格式不正确`);
      }
    }
    
    return result;
  }
}

module.exports = {
  NumberGenerator,
  PermissionCalculator,
  ApprovalCalculator,
  WarehouseStrategyCalculator,
  CustomFieldValidator
}; 