const db = require('../config/db');
exports.calculateTax = async (req, res) => {
    console.log(req.body);
    const { annualIncome = 0, investments = 0, otherDeductions = 0, rentPaid = 0, includeReceipts = false } = req.body;
    const safeParse = (val) => {
        const parsed = parseFloat(val);
        return isNaN(parsed) ? 0 : parsed;
    };
    // Convert strings to numbers (just in case)
    let income = safeParse(annualIncome);
    let inv80c = safeParse(investments); // Max limit is usually 1.5L
    let other = safeParse(otherDeductions);
    let rent = safeParse(rentPaid);
    const userId = req.user.id;

    try {
        if (includeReceipts) {
            // Aggregate valid receipts for deductions
            const receiptsResp = await db.query(
                "SELECT category, sum(amount) as total FROM receipts WHERE user_id = $1 AND is_flagged = false GROUP BY category",
                [userId]
            );
            
            receiptsResp.rows.forEach(row => {
                const cat = (row.category || '').toLowerCase();
                const amount = parseFloat(row.total) || 0;
                
                if (cat.includes('medical') || cat.includes('health') || cat.includes('education')) {
                    other += amount;
                } else if (cat.includes('investment') || cat.includes('insurance') || cat.includes('pf') || cat.includes('80c')) {
                    inv80c += amount;
                } else if (cat.includes('rent')) {
                    rent += amount;
                }
            });
        }

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


        const finalTax = Math.min(oldTax, newTax);
        const savings = Math.abs(oldTax - newTax);
        const recommendation = oldTax < newTax ? "Old Regime" : "New Regime";
        
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
            finalTax,
            savings,
            usedVariables: { income, investments: inv80c, otherDeductions: other, rentPaid: rent }
        });

    } catch (err) {
        res.status(500).send("Calculation Error");
    }
};

exports.saveTax = async (req, res) => {
    try {
        const user = req.user;
        const {
            annualIncome = 0,
            investments = 0,
            otherDeductions = 0,
            rentPaid = 0,
            includeReceipts = false
        } = req.body;

        // Recalculate tax to ensure consistency
        const safeParse = (val) => {
            const parsed = parseFloat(val);
            return isNaN(parsed) ? 0 : parsed;
        };

        let income = safeParse(annualIncome);
        let inv80c = safeParse(investments);
        let other = safeParse(otherDeductions);
        let rent = safeParse(rentPaid);

        if (includeReceipts) {
            const receiptsResp = await db.query(
                "SELECT category, sum(amount) as total FROM receipts WHERE user_id = $1 AND is_flagged = false GROUP BY category",
                [user.id]
            );

            receiptsResp.rows.forEach(row => {
                const cat = (row.category || '').toLowerCase();
                const amount = parseFloat(row.total) || 0;

                if (cat.includes('medical') || cat.includes('health') || cat.includes('education')) {
                    other += amount;
                } else if (cat.includes('investment') || cat.includes('insurance') || cat.includes('pf') || cat.includes('80c')) {
                    inv80c += amount;
                } else if (cat.includes('rent')) {
                    rent += amount;
                }
            });
        }

        // Old Regime
        const basicSalary = income * 0.5;
        const hraReceived = basicSalary * 0.4;
        const rentMinusBasic = rent - (basicSalary * 0.1);
        const hraExemption = Math.max(0, Math.min(hraReceived, rentMinusBasic, basicSalary * 0.4));
        const standardDeductionOld = 50000;
        const taxableIncomeOld = Math.max(0, income - standardDeductionOld - inv80c - hraExemption - other);

        let oldTax = 0;
        if (taxableIncomeOld > 1000000) {
            oldTax += (taxableIncomeOld - 1000000) * 0.30;
            oldTax += 112500;
        } else if (taxableIncomeOld > 500000) {
            oldTax += (taxableIncomeOld - 500000) * 0.20;
            oldTax += 12500;
        } else if (taxableIncomeOld > 250000) {
            oldTax += (taxableIncomeOld - 250000) * 0.05;
        }

        // New Regime
        const standardDeductionNew = 75000;
        const taxableIncomeNew = Math.max(0, income - standardDeductionNew);

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
        if (taxableIncomeNew <= 700000) newTax = 0;

        const finalTax = Math.min(oldTax, newTax);
        const savings = Math.abs(oldTax - newTax);
        const recommendation = oldTax < newTax ? "Old Regime" : "New Regime";

        const result = await db.query(
            `INSERT INTO transactions (
                user_id,
                annualIncome,
                investments_80C,
                other_deductions,
                rent_paid,
                calculated_old_tax,
                calculated_new_tax,
                final_tax,
                savings,
                recommendation
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *`,
            [
                user.id,
                income,
                inv80c,
                other,
                rent,
                oldTax,
                newTax,
                finalTax,
                savings,
                recommendation
            ]
        );

        res.json({
            message: 'Tax analysis saved successfully',
            transaction: result.rows[0],
            record: result.rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error saving tax analysis');
    }
};

exports.getHistory = async (req, res) => {
    try {
        const user = req.user;
        const result = await db.query("SELECT * FROM transactions WHERE user_id=$1 ORDER BY created_at DESC", [user.id]);
        console.log(result.rows);
        res.json({
            history: result.rows
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Error retrieving history");
    }
};

exports.deleteTax = async (req, res) => {
    try {
        const user = req.user;
        const { id } = req.params;

        const result = await db.query("DELETE FROM transactions WHERE id=$1 AND user_id=$2 RETURNING *", [id, user.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Transaction not found or not authorized' });
        }

        res.json({
            message: 'Tax analysis deleted successfully',
            deleted: result.rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error deleting tax analysis');
    }
};

exports.clearHistory = async (req, res) => {
    try {
        const user = req.user;

        const result = await db.query("DELETE FROM transactions WHERE user_id=$1", [user.id]);

        res.json({
            message: 'All tax history cleared successfully',
            deletedCount: result.rowCount
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error clearing tax history');
    }
};
