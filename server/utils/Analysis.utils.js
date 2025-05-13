import dayjs from "dayjs";
export const TextAnalysis = function (data) {
    console.log("Starting analysis with", data.length, "records");
    
    // Check data validity
    if (!Array.isArray(data) || data.length === 0) {
        console.warn("Warning: Invalid or empty data array passed to TextAnalysis");
        return {
            MoneyRecord: { expense: 0, credited: 0 },
            TransactionType: getEmptyCategoryMap(),
            MonthlyBreakdown: {}
        };
    }
    
    const MoneyRecord = DebitCreditAnalysis(data);
    const TransactionType = TransactionAnalysis(data);
    const MonthlyBreakdown = MonthlyAnalysis(data);

    return {
        MoneyRecord,
        TransactionType,
        MonthlyBreakdown
    };
}

const DebitCreditAnalysis = (data) => {
    let expense = 0;
    let credited = 0;
    let unknownTypes = 0;

    console.log("Analyzing debits and credits...");
    
    for (const transaction of data) {
        // Debug transaction type
        // console.log(`Transaction: ${transaction.amount} - Type: ${transaction.type}`);
        
        if (transaction.type === 'Debit' || transaction.type === 'debit') {
            expense += transaction.amount;
        } else if (transaction.type === 'Credit'|| transaction.type === 'credit') {
            credited += transaction.amount;
        } else {
            unknownTypes++;
            console.warn(`Unknown transaction type: ${transaction.type}`);
        }
    }
    
    if (unknownTypes > 0) {
        console.warn(`Found ${unknownTypes} transactions with unknown types`);
    }

    return { expense, credited };
}

// Helper function to get empty category map
const getEmptyCategoryMap = () => {
    return {
        Food: 0,
        Transport: 0,
        Subscription: 0,
        Rent: 0,
        Shopping: 0,
        Utilities: 0,
        Travel: 0,
        Groceries: 0,
        Education: 0,
        Medical: 0,
        Fitness: 0,
        Entertainment: 0,
        Donations: 0,
        Investment: 0,
        Bills: 0,
        EMI: 0,
        Insurance: 0,
        Salary: 0,
        Cash: 0,
        BankCharges: 0,
        Others: 0
    };
};

const TransactionAnalysis = (data) => {
    const categoryMap = {
        Food: ["zomato", "swiggy", "dominos", "mcdonalds", "kfc", "pizza hut", "ubereats", "foodpanda", "restaurant", "cafe"],
        Transport: ["uber", "ola", "rapido", "redbus", "blablacar", "shuttle", "meru", "fuel", "petrol", "diesel", "gas", "metro", "bus", "train"],
        Subscription: ["netflix", "spotify", "prime", "hotstar", "zee5", "youtube premium", "apple music", "gaana", "wynk", "subscription"],
        Rent: ["rent", "pg", "hostel", "lease", "accommodation"],
        Shopping: ["amazon", "flipkart", "myntra", "meesho", "ajio", "snapdeal", "nykaa", "tata cliq", "purchase", "buy", "store"],
        Utilities: ["electricity", "water", "gas", "wifi", "internet", "broadband", "recharge", "postpaid", "mobile recharge", "bill payment"],
        Travel: ["makemytrip", "irctc", "goibibo", "indigo", "airindia", "vistara", "cleartrip", "expedia", "booking.com", "oyo", "airbnb", "flight", "hotel"],
        Groceries: ["bigbasket", "grofers", "dmart", "reliance fresh", "nature's basket", "spencer", "more supermarket", "grocery", "supermarket"],
        Education: ["udemy", "coursera", "byjus", "unacademy", "skillshare", "edx", "khan academy", "testbook", "coaching", "college", "fees", "school"],
        Medical: ["pharmeasy", "1mg", "netmeds", "apollo", "medlife", "hospital", "clinic", "doctor", "diagnostic", "medicine", "pharmacy", "medical"],
        Fitness: ["cultfit", "fitpass", "gym", "yoga", "healthifyme", "myfitnesspal", "fittr", "fitness"],
        Entertainment: ["bookmyshow", "pvr", "inox", "cinema", "eventbrite", "concert", "festival", "movie"],
        Donations: ["donation", "ngo", "charity", "giveindia", "crowdfunding", "relief fund", "donate"],
        Investment: ["groww", "zerodha", "upstox", "coin", "sip", "mutual fund", "nse", "bse", "stocks", "trading", "demat", "investment"],
        Bills: ["electricity bill", "water bill", "gas bill", "phone bill", "broadband bill", "credit card bill", "utility bill"],
        EMI: ["emi", "loan", "repayment", "credit", "hdfc emi", "bajaj finance", "sbi loan", "axis emi", "installment"],
        Insurance: ["lic", "policybazaar", "insurance", "hdfc life", "sbi life", "premium", "term plan"],
        Salary: ["salary", "credited by", "neft salary", "salary from", "monthly salary", "income", "payday"],
        Cash: ["atm", "cash withdrawal", "withdrawn", "self withdrawal", "cash"],
        BankCharges: ["imps charge", "neft charge", "sms charge", "bank charge", "service charge", "penalty", "fee", "annual charge"],
    };
    
    console.log("Analyzing transaction categories...");
    const CategoryWiseAmount = getEmptyCategoryMap();
    
    let categorized = 0;
    let uncategorized = 0;
    
    for (const element of data) {
        // Skip non-debit transactions for category analysis if needed
        // if (element.type !== 'Debit') continue;
        
        let found = false;
        const description = (element.description || "").toLowerCase();
        
        // Skip empty descriptions
        if (!description) {
            uncategorized++;
            CategoryWiseAmount.Others += element.amount;
            continue;
        }
        
        // Debug the description
        console.log(`Categorizing: ${description} (Amount: ${element.amount})`);
        
        // Try to match with categories
        for (const [category, values] of Object.entries(categoryMap)) {
            if (values.some((keyword) => description.includes(keyword))) {
                CategoryWiseAmount[category] += element.amount;
                categorized++;
                found = true;
                console.log(`  - Matched category: ${category}`);
                break;
            }
        }
        
        // If no match found, add to Others
        if (!found) {
            uncategorized++;
            CategoryWiseAmount.Others += element.amount;
        }
    }
    
    console.log(`Categorized ${categorized} transactions, ${uncategorized} remained uncategorized`);
    
    return CategoryWiseAmount;
}

const MonthlyAnalysis = (data) => {
    const monthly = {};
    console.log("Analyzing monthly breakdown...");

    data.forEach(element => {
        if (element.type === 'Debit' ||element.type === 'debit') {
            // Check if date is valid
            if (!element.date) {
                console.warn("Transaction with missing date:", element);
                return;
            }
            
            try {
                const month = dayjs(element.date).format("YYYY-MM");
                if (month === "Invalid Date") {
                    console.warn(`Invalid date format: ${element.date}`);
                    return;
                }
                
                monthly[month] = (monthly[month] || 0) + element.amount;
                console.log(`Added ${element.amount} to month ${month}`);
            } catch (err) {
                console.error(`Error processing date ${element.date}:`, err);
            }
        }
    });

    return monthly;
};