# Checkout Sign-In AC Traceability (Batch 5)

| Test ID | Test Name | User Story | AC IDs Covered |
|---|---|---|---|
| CS-001 | CS-AC1 guest sees login step after proceeding from cart | Checkout – Sign In | AC1 |
| CS-002 | CS-AC2 checkout login step shows email, password and submit controls | Checkout – Sign In | AC2 |
| CS-003 | CS-AC3 totp challenge appears for totp-enabled accounts when applicable | Checkout – Sign In | AC3 |
| CS-004 | CS-AC4 valid checkout login authenticates and allows moving to billing step | Checkout – Sign In | AC4 |
| CS-005 | CS-AC5 already logged-in user sees signed-in message and can proceed | Checkout – Sign In | AC5 |

## Notes
- AC3 is conditionally validated only when TOTP challenge is present for the selected account.
- Account lockout handling uses fallback seeded credentials and guarded skips.