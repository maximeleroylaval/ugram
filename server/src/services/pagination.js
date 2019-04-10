exports.formatPages = (array, page, perPage) => {
    if (array === undefined || array === null || Object.keys(array).length === 0) {
        return [];
    }
    if (perPage == undefined) {
        perPage = Object.keys(array).length;
        if (perPage > 20)
            perPage = 20;
    }
    if (page == undefined || page < 0) {
        page = 0;
    }
    return array.slice(page * perPage, (page + 1) * perPage);
}

exports.getPages = (array, perPage) => {
    if (array === undefined || array === null || Object.keys(array).length === 0) {
        return 0;
    }
    if (perPage == undefined || perPage <= 0) {
        perPage = Object.keys(array).length;
        if (perPage > 20)
            perPage = 20;
    }
    const pages = Math.round(Object.keys(array).length / perPage);
    if (Object.keys(array).length % perPage !== 0) {
        return pages + 1;
    }
    return pages;
}

exports.formatPagination = (array, page, perPage) => {
    return {
        items : this.formatPages(array, page, perPage),
        totalPages: this.getPages(array, perPage),
        totalEntries: Object.keys(array).length
    };
}