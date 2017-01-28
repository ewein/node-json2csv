import async from 'async';

/**
 * Convert an object to array
 * @param obj
 * @param callback
 * @private
 */
function _convertObjectToArray(obj, callback) {
    const arr = [];
    async.each(Object.keys(obj), (key, done) => {
        arr.push(obj[key]);
        done(null);
    }, (err) => {
        callback(err, arr);
    });
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
 * @param data
 * @param callback
 * @private
 */
function _convertToCSVBlock(data, callback) {
    let csv = '';
    if (data.showTitle !== undefined && data.showTitle) {
        csv += `${data.title}\r\n`;
    }

    if (data.showHeaders === undefined || data.showHeaders) {
        csv += data.headers.join(',');
    }

    if (!(data.body instanceof Array)) {
        _convertObjectToArray(data.body, (err, arr) => {
            csv += `\r\n${_convertArrayToCSV(arr)}\r\n\r\n`;
            callback(err, csv);
        });

        return;
    }

    async.each(data.body, (row, next) => {
        if (row instanceof Array) {
            csv += `\r\n${_convertArrayToCSV(row)}`;
            next(null);
        } else {
            _convertObjectToArray(row, (err, arr) => {
                csv += `\r\n${_convertArrayToCSV(arr)}`;
                next(err);
            });
        }
    }, (err) => {
        csv += '\r\n\r\n';
        callback(err, csv);
    });
}

/**
 * Convert json data to csv file
 * @param data
 * @param callback
 * @private
 */
export default (data, callback) => {
    let response = '';
    async.each(data, (json, next) => {
        _convertToCSVBlock(json, (err, csv) => {
            response += csv;
            next(err);
        });
    }, (err) => {
        callback(err, response);
    });
};