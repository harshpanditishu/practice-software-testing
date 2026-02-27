# Checkout Cart Review AC Traceability (Batch 4)

| Test ID | Test Name | User Story | AC IDs Covered |
|---|---|---|---|
| CR-001 | CR-AC1 cart table shows item, quantity, price, total and actions columns | Checkout – Cart Review | AC1 |
| CR-002 | CR-AC2 updating cart quantity recalculates totals and confirms update | Checkout – Cart Review | AC2 |
| CR-003 | CR-AC3 delete item removes it from cart and updates totals | Checkout – Cart Review | AC3 |
| CR-004 | CR-AC4 empty cart shows empty message | Checkout – Cart Review | AC4 |
| CR-005 | CR-AC5 proceed advances to next checkout step when cart has items | Checkout – Cart Review | AC5 |
| CR-006 | CR-AC6 discount badge and original/discounted prices are shown for discounted cart item when applicable | Checkout – Cart Review | AC6 |
| CR-007 | CR-AC7 combined rental + non-rental cart applies additional discount when applicable | Checkout – Cart Review | AC7 |
| CR-008 | CR-AC8 removing either rental or non-rental items removes combined discount when applicable | Checkout – Cart Review | AC8 |

## Notes
- AC6–AC8 are guarded by environment data and pricing-rule visibility in the cart UI.
