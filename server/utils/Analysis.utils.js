//analysis.utils.js
import dayjs from "dayjs";
export const TextAnalysis = function (data) {
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

    for (const transaction of data) {
        if (transaction.type == 'Debit') {
            expense += transaction.amount;
        } else {
            credited += transaction.amount;
        }
    }

    return { expense, credited };
}

const TransactionAnalysis = (data) => {
    const categoryMap = {
        Food: ["zomato", "swiggy", "dominos", "mcdonalds", "kfc", "pizza hut", "ubereats", "foodpanda"],
        Transport: ["uber", "ola", "rapido", "redbus", "blablacar", "shuttle", "meru"],
        Subscription: ["netflix", "spotify", "prime", "hotstar", "zee5", "youtube premium", "apple music", "gaana", "wynk"],
        Rent: ["rent", "pg", "hostel", "lease", "accommodation"],
        Shopping: ["amazon", "flipkart", "myntra", "meesho", "ajio", "snapdeal", "nykaa", "tata cliq"],
        Utilities: ["electricity", "water", "gas", "wifi", "internet", "broadband", "recharge", "postpaid", "mobile recharge"],
        Travel: ["makemytrip", "irctc", "goibibo", "indigo", "airindia", "vistara", "cleartrip", "expedia", "booking.com", "oyo", "airbnb"],
        Groceries: ["bigbasket", "grofers", "dmart", "reliance fresh", "nature's basket", "spencer", "more supermarket"],
        Education: ["udemy", "coursera", "byjus", "unacademy", "skillshare", "edx", "khan academy", "testbook", "coaching", "college", "fees"],
        Medical: ["pharmeasy", "1mg", "netmeds", "apollo", "medlife", "hospital", "clinic", "doctor", "diagnostic", "medicine", "pharmacy"],
        Fitness: ["cultfit", "fitpass", "gym", "yoga", "healthifyme", "myfitnesspal", "fittr"],
        Entertainment: ["bookmyshow", "pvr", "inox", "cinema", "eventbrite", "concert", "festival"],
        Donations: ["donation", "ngo", "charity", "giveindia", "crowdfunding", "relief fund"],
        Investment: ["groww", "zerodha", "upstox", "coin", "sip", "mutual fund", "nse", "bse", "stocks", "trading", "demat"],
        Bills: ["electricity bill", "water bill", "gas bill", "phone bill", "broadband bill", "credit card bill", "utility bill"],
        EMI: ["emi", "loan", "repayment", "credit", "hdfc emi", "bajaj finance", "sbi loan", "axis emi"],
        Insurance: ["lic", "policybazaar", "insurance", "hdfc life", "sbi life", "premium", "term plan"],
        Salary: ["salary", "credited by", "neft salary", "salary from", "monthly salary"],
        Cash: ["atm", "cash withdrawal", "withdrawn", "self withdrawal"],
        BankCharges: ["imps charge", "neft charge", "sms charge", "bank charge", "service charge", "penalty"],
       
    };
    
    const CategoryWiseAmount = {
        Food: 0,
        Transport: 0,
        Subscription: 0,
        Rent: 0,
        Shopping: 0,
        Utilities: 0,
        Travel: 0,
        Groceries:0 ,
        Education:0 ,
        Medical:0 ,
        Fitness: 0,
        Entertainment:0 ,
        Donations:0,
        Investment:0 ,
        Bills: 0,
        EMI: 0,
        Insurance:0 ,
        Salary: 0,
        Cash:0 ,
        BankCharges: 0,
        Others:0
    }
    // for (const [category, values] of Object.entries(categoryMap)) {
    //     values.some(keyword => {
    //         if (keyword.includes(LowerDesc)) {
    //             return category;
    //         }
    //         return 'Others';
    //     })
    // }
    for (const element of data) {
        let found = false;
        const description = element.description.toLowerCase();
        // apne ['zomato','swiggy'] wle se match krane ke liye check ! 
        for (const [category, values] of Object.entries(categoryMap)) {

            if (values.some((keyword) => description.includes(keyword))) {
                CategoryWiseAmount[category] += element.amount ;
                found = true ;
                break ;
            }
        }
        // agar match nahi hua toh yaha aajao
        if (found==false) {
            CategoryWiseAmount.Others += element.amount ;
        }

    }

    return CategoryWiseAmount ;
}


const MonthlyAnalysis = (data) => {
    const monthly = {};

    data.forEach(element => {
        if (element.type === 'Debit') {
            const month = dayjs(element.date).format("YYYY-MM");
            monthly[month] = (monthly[month] || 0) + element.amount;
        }
    });

    return monthly;
};


