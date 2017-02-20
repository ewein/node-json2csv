import async from 'async';

/**
 * Convert an object to array
 * @param obj
 * @private
 */
function _convertObjectToArray(obj) {
    return Object.keys(obj).map(key => obj[key])
}

/**
 * Convert an array to a csv string
 * @param arr
 */
function _convertArrayToCSV(arr) {
    return arr.join(',').replace(/\r?\n/g, ' ');
}

/**
 * Convert a json object to csv block
 * @param csv
 * @param data
 * @param callback
 * @private
 */
function _convertToCSVBlock(csv, data, callback) {
    if (data.showTitle !== undefined && data.showTitle) {
        csv += `${data.title}\r\n`;
    }

    if (data.showHeaders === undefined || data.showHeaders) {
        csv += data.headers.join(',');
    }

    if (!(data.body instanceof Array)) {
        const arr = _convertObjectToArray(data.body);
        process.nextTick(() => {
            csv += `\r\n${_convertArrayToCSV(arr)}\r\n\r\n`;
            callback(null);
        });

        return;
    }

    async.each(data.body, (row, next) => {
        if (row instanceof Array) {
            csv += `\r\n${_convertArrayToCSV(row)}`;
            next(null);
            return;
        }

        const arr = _convertObjectToArray(data.body);
        process.nextTick(() => {
            csv += `\r\n${_convertArrayToCSV(arr)}`;
            next(null);
        });
    }, (err) => {
        csv += '\r\n\r\n';
        callback(err);
    });
}

/**
 * Convert json data to csv file
 * @param data
 * @param callback
 * @private
 */
export default (data, callback) => {
    let csv = '';
    async.each(data, (json, next) => {
        _convertToCSVBlock(csv, json, next);
    }, (err) => {
        callback(err, csv);
    });
};