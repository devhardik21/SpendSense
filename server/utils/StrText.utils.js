//StrText.utils.js
export const StructuredPdfText = function (fullText) {
    // splitting the text and making them basically an array out of it 
    const TextArr = fullText.trim().split(/(?=\d{2}-\d{2}-\d{4})/g);
    let records = [];

    for (const line of TextArr) {
        const part = line.split(/\s{2,}/);
        if (part.length === 4) {
            // destructuring the array and getting the variables as date = ; 
            let [date, description, type, amount] = part;
            // removing all the symbols and all from the amount part 
            amount = parseFloat(amount.replace(/[^0-9.]/g, ''));

            records.push({date , description , type , amount: isNaN(amount) ? 0 :amount }) ;
        }
    }

    return records ;

}