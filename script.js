// Глобальные переменные
let currentExpression = '';
let currentResult = '0';
let history = [];
let lastResult = null;

// Загрузка истории из localStorage при старте
function loadHistory() {
    const saved = localStorage.getItem('calculator_history');
    if (saved) {
        history = JSON.parse(saved);
        renderHistory();
    }
}

// Сохранение истории в localStorage
function saveHistory() {
    localStorage.setItem('calculator_history', JSON.stringify(history));
}

function appendNumber(num) {
    if (currentExpression === '0' || lastResult !== null) {
        currentExpression = num;
        lastResult = null;
    } else {
        currentExpression += num;
    }
    updateDisplay();
}

function appendOperator(op) {
    if (currentExpression === '') return;
    
    // Заменяем последний оператор, если он уже есть
    if (['+', '-', '*', '/'].includes(currentExpression.slice(-1))) {
        currentExpression = currentExpression.slice(0, -1) + op;
    } else {
        currentExpression += op;
    }
    
    lastResult = null;
    updateDisplay();
}

function clearAll() {
    currentExpression = '';
    currentResult = '0';
    lastResult = null;
    updateDisplay();
}

function clearEntry() {
    if (currentExpression.length > 0) {
        currentExpression = currentExpression.slice(0, -1);
        updateDisplay();
    }
}

function calculate() {
    if (currentExpression === '') return;
    
    try {
        // Заменяем операторы для правильного вычисления
        let expr = currentExpression
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/−/g, '-');
        
        // Проверяем на деление на ноль
        if (expr.includes('/0')) {
            throw new Error('Деление на ноль невозможно');
        }
        
        // Безопасное вычисление через Function
        const result = new Function('return ' + expr)();
        
        if (!isFinite(result)) {
            throw new Error('Результат не является числом');
        }
        
        currentResult = formatNumber(result);
        lastResult = result;
        
        // Добавляем в историю
        addToHistory(currentExpression, currentResult);
        
        updateDisplay();
        
    } catch (error) {
        currentResult = 'Ошибка: ' + (error.message || 'Некорректное выражение');
        updateDisplay();
    }
}

function formatNumber(num) {
    // Форматирование числа с учетом десятичных знаков
    if (num % 1 === 0) {
        return num.toString();
    } else {
        return parseFloat(num.toFixed(10)).toString();
    }
}

function updateDisplay() {
    document.getElementById('expression').textContent = currentExpression || '';
    document.getElementById('result').textContent = currentResult;
    document.getElementById('result').className = currentResult.includes('Ошибка') ? 'result error' : 'result';
}

function copyResult() {
    if (currentResult === '0' || currentResult.includes('Ошибка')) return;
    
    navigator.clipboard.writeText(currentResult).then(() => {
        showToast('Результат скопирован в буфер обмена');
    }).catch(() => {
        showToast('Ошибка при копировании');
    });
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function addToHistory(expression, result) {
    const historyItem = {
        expression: expression,
        result: result,
        timestamp: new Date().toLocaleString('ru-RU')
    };
    
    history.unshift(historyItem);
    
    // Ограничиваем историю 20 записями
    if (history.length > 20) {
        history = history.slice(0, 20);
    }
    
    saveHistory();
    renderHistory();
}

function renderHistory() {
    const historyList = document.getElementById('history-list');
    
    if (history.length === 0) {
        historyList.innerHTML = '<div style="text-align: center; color: #6c757d; padding: 20px;">История пуста</div>';
        return;
    }
    
    historyList.innerHTML = history.map(item => `
        <div class="history-item" onclick="restoreExpression('${item.expression}')">
            <div class="history-expression">${item.expression}</div>
            <div class="history-result">${item.result}</div>
            <div class="history-time">${item.timestamp}</div>
        </div>
    `).join('');
}

function restoreExpression(expression) {
    currentExpression = expression;
    lastResult = null;
    updateDisplay();
}

function clearHistory() {
    if (confirm('Вы уверены, что хотите очистить всю историю?')) {
        history = [];
        saveHistory();
        renderHistory();
    }
}

// Обработка клавиатуры
document.addEventListener('keydown', (e) => {
    if (e.key >= '0' && e.key <= '9') {
        appendNumber(e.key);
    } else if (e.key === '.') {
        appendNumber('.');
    } else if (e.key === '+') {
        appendOperator('+');
    } else if (e.key === '-') {
        appendOperator('-');
    } else if (e.key === '*') {
        appendOperator('*');
    } else if (e.key === '/') {
        e.preventDefault();
        appendOperator('/');
    } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        calculate();
    } else if (e.key === 'Backspace') {
        e.preventDefault();
        clearEntry();
    } else if (e.key === 'Escape') {
        e.preventDefault();
        clearAll();
    }
});

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    loadHistory();
    updateDisplay();
}); 