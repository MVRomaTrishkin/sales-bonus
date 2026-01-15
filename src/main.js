/**
 * Функция для расчета выручки
 * @param purchase запись о покупке
 * @param _product карточка товара
 * @returns {number}
 */
function calculateSimpleRevenue(purchase, _product) {
    const { discount, sale_price, quantity } = purchase;
    let newDiscount = 1 - (discount / 100);
    return(sale_price * quantity * newDiscount)
   // @TODO: Расчет выручки от операции
}

/**
 * Функция для расчета бонусовvvvvv
 * @param index порядковый номер в отсортированном массиве
 * @param total общее число продавцов
 * @param seller карточка продавца
 * @returns {number}
 */
function calculateBonusByProfit(index, total, seller) {
    if (index === 0) {
        return seller.profit * 0.15;
    } else if (index === 1 || index === 2) {
        return seller.profit * 0.10;
    } else if (index === total - 1) {
        return 0;
    } else {
        return seller.profit * 0.05;
    }
}
/**
 * Функция для анализа данных продаж
 * @param data
 * @param options
 * @returns {{revenue, top_products, bonus, name, sales_count, profit, seller_id}[]}
 */
function analyzeSalesData(data, options) {
    if(!data
        || !Array.isArray(data.sellers)
        || data.sellers.length === 0
        || data.purchase_records.length === 0
    ) {
         throw new Error('Некорректные входные данные');
    }

    const { calculateRevenue, calculateBonus } = options;

    if (!calculateRevenue || !calculateBonus) {
        throw new Error('Чего-то не хватает');
    }

    if (!typeof options === "object") {
        throw new Error('Некорректные входные данные');
    }

    const sellerStats = data.sellers.map(sel=>({
        id: sel.id,
        name: `${sel.first_name} ${sel.last_name}`,
        revenue: 0,
        profit: 0,
        sales_count: 0,
        products_sold: {}
    }))

    const sellerIndex  = Object.fromEntries(sellerStats.map(item => [item.id, item]))
    const productIndex  = Object.fromEntries(data.products.map(el => [el.sku, el]))

    data.purchase_records.forEach((record)  => {
        const seller = sellerIndex[record.seller_id];
        seller.sales_count +=1;
        record.revenue += (record.total_amount - record.total_discount);

        record.items.forEach((item) => {
            const product = productIndex[item.sku];
            let cost = product.purchase_price * item.quantity;
            seller.revenue += calculateSimpleRevenue(item, product)
            item.revenue = calculateSimpleRevenue(item, product)
            seller.profit += item.revenue - cost;
             

            if (!seller.products_sold[item.sku]) {
                seller.products_sold[item.sku] = 0;
            }
            seller.products_sold[item.sku] += item.quantity
        })
    })

    let newSellerStats = sellerStats.sort((a, b) => b.profit -  a.profit )
    
    newSellerStats.forEach((el, index) => {
        el.bonus =  calculateBonusByProfit(index, sellerStats.length, el);
        el.top_products = Object.entries(el.products_sold).map(elemet => ({sku: elemet[0], quantity: elemet[1]})).sort((a, b) => b.quantity - a.quantity).slice(0, 10);
    })
    let newSeller = newSellerStats.map(seller => ({
        seller_id: seller.id,
        name: seller.name,
        revenue: +seller.revenue.toFixed(2),
        profit: +seller.profit.toFixed(2),
        sales_count: +seller.sales_count,
        top_products: seller.top_products,
        bonus: +seller.bonus.toFixed(2)
    }))
    return newSeller
}

    // @TODO: Проверка входных данных

    // @TODO: Проверка наличия опций
    
    // @TODO: Подготовка промежуточных данных для сбора статистики

    // @TODO: Индексация продавцов и товаров для быстрого доступа

    // @TODO: Расчет выручки и прибыли для каждого продавца

    // @TODO: Сортировка продавцов по прибыли

    // @TODO: Назначение премий на основе ранжирования

    // @TODO: Подготовка итоговой коллекции с нужными полями
