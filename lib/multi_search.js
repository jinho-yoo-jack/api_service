const multisearch = (keyword, mapIndexQuery) => {
    let multiBody = [];
    for (let [key, value] of mapIndexQuery) {
        let _index = {'index' : 'v1-'+key};
        let _body = value;

        multiBody.push(_index);
        multiBody.push(_body);
    }

    return multiBody;
}

module.exports = multisearch;