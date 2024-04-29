const Expense = require("./models/expense")
const expenseCategory = require("./models/expenseCategory")
const moment = require("moment")

function generateRandomColorPair() {
    // Generate each color component
    const r = Math.floor(Math.random() * 256); // Red: 0-255
    const g = Math.floor(Math.random() * 256); // Green: 0-255
    const b = Math.floor(Math.random() * 256); // Blue: 0-255
    const a = 0.2; // Alpha: fixed at 0.2
    // return `rgba(${r}, ${g}, ${b}, ${a})`;
    const solidColor = `rgba(${r}, ${g}, ${b})`;
    const opacityColor = `rgba(${r}, ${g}, ${b}, ${a})`;
    return { solidColor, opacityColor }
}

function generateColorList(list) {
    const solidColors = []
    const opacityColors = []

    list.forEach(() => {
        const { solidColor, opacityColor } = generateRandomColorPair()
        solidColors.push(solidColor)
        opacityColors.push(opacityColor)
    })

    return { solidColors, opacityColors }
}


exports.getCategorySums = async (userId) => {
    const categories = await expenseCategory.find({})
    const categoryNames = categories.map(c => c.name)
    const sums = await Promise.all(categories.map(async (category) => {
        const total = await Expense.aggregate([
            { $match: { category: category._id, userId } },
            { $group: { _id: null, totalAmount: { $sum: "$amount" } } }
        ])
        return total[0] ? total[0].totalAmount : 0
    }))
    // const colors = categories.map(() => generateRandomColor());
    const { solidColors, opacityColors } = generateColorList(categories)
    return { categoryNames, sums, solidColors, opacityColors }
}

exports.getMonthlyExpenses = async (userId) => {
    try {
        const results = await Expense.aggregate([
            { $match: { userId } },
            {
                $group: {
                    _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
                    totalAmount: { $sum: '$amount' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // Prepare labels (month names) and data (total expenses) for the chart
        const labels = results.map(result => moment({ month: result._id.month - 1 }).format('MMMM YYYY'));
        const data = results.map(result => result.totalAmount);

        return { labels, data };
    } catch (err) {
        console.error('Error fetching expenses:', err);
        throw err;
    }
}