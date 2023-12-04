const paginate = (items, page = 1, limit = 15) => {
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const totalItems = items.length;
    const totalPages = Math.ceil(totalItems / limit);
    const currentPage = page > totalPages ? totalPages : page;
    const currentItems = items.slice(startIndex, endIndex);
    return {
        currentPage,
        totalPages,
        limit,
        startIndex,
        endIndex,
        totalItems,
        currentItems,
    };
};

module.exports = paginate;
