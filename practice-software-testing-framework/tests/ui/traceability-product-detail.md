# Product Detail AC Traceability (Batch 2)

| Test ID | Test Name | User Story | AC IDs Covered |
|---|---|---|---|
| PD-001 | PD-AC1 product detail shows primary product information | Product Detail | AC1 |
| PD-002 | PD-AC2 discount product detail displays original and discounted pricing when applicable | Product Detail | AC2 |
| PD-003 | PD-AC3 quantity selector is visible with default quantity 1 | Product Detail | AC3 |
| PD-004 | PD-AC4 clicking plus increases quantity by 1 | Product Detail | AC4 |
| PD-005 | PD-AC5+AC6 clicking minus decreases quantity but not below 1 | Product Detail | AC5, AC6 |
| PD-006 | PD-AC7 manual quantity entry clamps between 1 and 999999999 | Product Detail | AC7 |
| PD-007 | PD-AC8 add to cart adds selected quantity and shows success message | Product Detail | AC8 |
| PD-008 | PD-AC9 out-of-stock product disables add-to-cart and shows out-of-stock message | Product Detail | AC9 |
| PD-009 | PD-AC10 rental product shows duration slider and updates total price | Product Detail | AC10 |
| PD-010 | PD-AC11+AC12+AC13 add to favorites handles unauthorized, success, and duplicate scenarios | Product Detail | AC11, AC12, AC13 |
| PD-011 | PD-AC14 related products section is displayed | Product Detail | AC14 |

## Notes
- Tests are environment-agnostic and use relative navigation so they run in `ui-prod` and `ui-local`.
- Dataset-dependent paths (discount, out-of-stock, rental) use guarded skips when prerequisites are not present.