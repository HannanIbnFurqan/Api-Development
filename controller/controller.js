import  Stock from '../schema/stockSchema.js'

const highest_volume = async (req, res) => {
    console.log("query = ",req.query)
    const { start_date, end_date, symbol } = req.query;
    const query = { date: { $gte: new Date(start_date), $lte: new Date(end_date) }};
    if (symbol) query.symbol = symbol;

    const result = await Stock.find(query).sort({ volume: -1 }).limit(1);
    res.json({ highest_volume: result[0] });
}

const average_close = async (req, res) => {
    const { start_date, end_date, symbol } = req.query;
    const query = { date: { $gte: new Date(start_date), $lte: new Date(end_date) }, symbol };

    const result = await Stock.aggregate([
        { $match: query },
        { $group: { _id: null, average_close: { $avg: "$close" } } }
    ]);
    res.json({ average_close: result[0]?.average_close || 0 });
}

const average_vwap = async (req, res) => {
    const { start_date, end_date, symbol } = req.query;
    const query = { date: { $gte: new Date(start_date), $lte: new Date(end_date) }};
    if (symbol) query.symbol = symbol;

    const result = await Stock.aggregate([
        { $match: query },
        { $group: { _id: null, average_vwap: { $avg: "$vwap" } } }
    ]);
    res.json({ average_vwap: result[0]?.average_vwap || 0 });
}

export  {highest_volume, average_close, average_vwap}