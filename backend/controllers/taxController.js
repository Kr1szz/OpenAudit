const db = require('../config/db');
exports.calculateTax = async (req, res) => {
    console.log(req.body);
    const { annualIncome = 0, investments = 0, otherDeductions = 0, rentPaid = 0 } = req.body;
    const safeParse = (val) => {
        const parsed = parseFloat(val);
        return isNaN(parsed) ? 0 : parsed;
    };
    // Convert strings to numbers (just in case)
    const income = safeParse(annualIncome);
    const inv80c = safeParse(investments); // Max limit is usually 1.5L
    const other = safeParse(otherDeductions);
    const rent = safeParse(rentPaid);

    try {
        // --- 2. CALCULATE OLD REGIME ---

        // Assumption: Basic Salary is 50% of Gross Income
        const basicSalary = income * 0.5;
        const hraReceived = basicSalary * 0.4;

        // HRA Exemption Logic (Min of 3 rules):
        // 1. Actual HRA Received
        // 2. Rent Paid - 10% of Basic
        // 3. 40% of Basic
        const rentMinusBasic = rent - (basicSalary * 0.1);
        const hraExemption = Math.max(0, Math.min(hraReceived, rentMinusBasic, basicSalary * 0.4));

        // Deductions
        const standardDeductionOld = 50000;
        // Total Taxable Income (Old) = Income - (Standard + 80C + HRA + Other)
        const taxableIncomeOld = Math.max(0, income - standardDeductionOld - inv80c - hraExemption - other);

        // Calculate Tax Amount (Old Regime Slabs)
        let oldTax = 0;
        if (taxableIncomeOld > 1000000) {
            oldTax += (taxableIncomeOld - 1000000) * 0.30; // 30% above 10L
            oldTax += 112500; // Tax for the first 10L
        } else if (taxableIncomeOld > 500000) {
            oldTax += (taxableIncomeOld - 500000) * 0.20; // 20% between 5-10L
            oldTax += 12500; // Tax for first 5L
        } else if (taxableIncomeOld > 250000) {
            oldTax += (taxableIncomeOld - 250000) * 0.05; // 5% between 2.5-5L
        }

        // --- 3. CALCULATE NEW REGIME (FY 2025-26 Rules) ---

        const standardDeductionNew = 75000;
        const taxableIncomeNew = Math.max(0, income - standardDeductionNew); // No 80C, No HRA

        // New Regime Slabs (Approximate FY25)
        // 0-3L: Nil, 3-7L: 5%, 7-10L: 10%, 10-12L: 15%, 12-15L: 20%, 15L+: 30%
        let newTax = 0;
        let tempIncome = taxableIncomeNew;

        if (tempIncome > 1500000) {
            newTax += (tempIncome - 1500000) * 0.30;
            tempIncome = 1500000;
        }
        if (tempIncome > 1200000) {
            newTax += (tempIncome - 1200000) * 0.20;
            tempIncome = 1200000;
        }
        if (tempIncome > 1000000) {
            newTax += (tempIncome - 1000000) * 0.15;
            tempIncome = 1000000;
        }
        if (tempIncome > 700000) {
            newTax += (tempIncome - 700000) * 0.10;
            tempIncome = 700000;
        }
        if (tempIncome > 300000) {
            newTax += (tempIncome - 300000) * 0.05;
        }
        // Rebate under 87A (New Regime): No tax if income <= 7L
        if (taxableIncomeNew <= 700000) newTax = 0;


        // --- 4. SAVE TO DATABASE ---
        // We save the one that is LOWER (Better for the user)
        const finalTax = Math.min(oldTax, newTax);
        const savings = Math.abs(oldTax - newTax);
        const recommendation = oldTax < newTax ? "Old Regime" : "New Regime";
        const newRecord = await db.query(
            `INSERT INTO transactions (user_id, financial_year, annualIncome, investments_80c, rent_paid, calculated_old_tax, calculated_new_tax, final_tax, savings, recommendation) 
             VALUES ($1, '2025-2026', $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [req.user.id, income, inv80c, rent, oldTax, newTax, finalTax, savings, recommendation]
        );
        // --- 5. SEND RESULT ---
        res.json({
            message: "Calculation Complete",
            oldRegime: {
                taxableIncome: taxableIncomeOld,
                tax: oldTax
            },
            newRegime: {
                taxableIncome: taxableIncomeNew,
                tax: newTax
            },
            recommendation,
            savedRecord: newRecord.rows[0]
        });

    } catch (err) {
        res.status(500).send("Calculation Error");
    }
};

exports.getHistory = async (req, res) => {
    try {
        const user = req.user;
        const result = await db.query("SELECT * FROM transactions WHERE user_id=$1 ORDER BY created_at DESC", [user.id]);
        res.json({
            history: result.rows
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Error retrieving history");
    }
};